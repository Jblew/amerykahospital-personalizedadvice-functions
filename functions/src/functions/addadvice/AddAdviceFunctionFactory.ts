import {
    Advice,
    AdviceRepository,
    FirebaseFunctionDefinitions,
    PendingAdvice,
} from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { MissingPhoneNumberError } from "../../error/MissingPhoneNumberError";
import { PerPhoneLimitExceededError } from "../../error/PerPhoneLimitExceededError";
import { PerUserLimitExceededError } from "../../error/PerUserLimitExceededError";
import { AlmostUniqueShortIdGenerator } from "../../helpers/AlmostUniqueShortIdGenerator";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";

import { CannotSpecifyIdOnPendingAdviceError } from "./error/CannotSpecifyIdOnPendingAdviceError";

@injectable()
export class AddAdviceFunctionFactory {
    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.addAdvice.limits.perUser);
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(Config.addAdvice.limits.perPhone);
    }

    public getFunction(builder?: functions.FunctionBuilder): functions.Runnable<any> {
        return (builder || functions).https.onCall(this.getFunctionHandler());
    }

    public getFunctionHandler(): FirebaseFunctionDefinitions.AddAdvice.Function {
        return (data: FirebaseFunctionDefinitions.AddAdvice.Input, context: functions.https.CallableContext) =>
            this.functionHandler(data, context);
    }

    private async functionHandler(
        data: FirebaseFunctionDefinitions.AddAdvice.Input,
        context: functions.https.CallableContext,
    ): Promise<FirebaseFunctionDefinitions.AddAdvice.Result> {
        return FunctionErrorWrapper.wrap(async () => {
            await this.doChecks(data, context);
            const adviceId = await this.doAddAdvice(data, context);
            return {
                log: "",
                adviceId,
            };
        });
    }

    private async doChecks(data: PendingAdvice, context: functions.https.CallableContext) {
        await this.authHelper.assertAuthenticated(context);
        await this.authHelper.assertUserIsMedicalProfessional(context);
        await this.limitPerUser((context.auth as { uid: string }).uid);

        if (!data.parentPhoneNumber) throw InvalidInputDataError.make("Missing phone number");
        await this.limitPerPhone(data.parentPhoneNumber);
    }

    private async limitPerUser(uid: string) {
        await this.perUserLimiter.rejectOnQuotaExceededOrRecordUsage(`u_${uid}`, config =>
            PerUserLimitExceededError.make(config),
        );
    }

    private async limitPerPhone(phone: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceededOrRecordUsage(`p_${phone}`, config =>
            PerPhoneLimitExceededError.make(config),
        );
    }

    private async doAddAdvice(data: PendingAdvice, context: functions.https.CallableContext): Promise<string> {
        const pendingAdvice = this.dataToPendingAdvice(data);
        const id = await this.obtainUniqueId();
        const advice = this.pendingAdviceToAdvice(pendingAdvice, id);
        await this.addAdvice(advice);
        return id;
    }

    private dataToPendingAdvice(data: any): PendingAdvice {
        if (data.id) throw CannotSpecifyIdOnPendingAdviceError.make();
        try {
            PendingAdvice.validate(data);
        } catch (error) {
            throw InvalidInputDataError.make(error.message);
        }
        return data as PendingAdvice;
    }

    private async obtainUniqueId(): Promise<string> {
        return AlmostUniqueShortIdGenerator.obtainUniqueId((id: string) => this.adviceRepository.adviceExists(id));
    }

    private pendingAdviceToAdvice(pendingAdvice: PendingAdvice, id: string): Advice {
        return {
            ...pendingAdvice,
            id,
            timestamp: admin.firestore.Timestamp.now().seconds,
        };
    }

    private async addAdvice(advice: Advice) {
        await this.adviceRepository.addAdvice(advice);
    }
}
