import { Advice, AdviceRepository, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AdviceDoesNotExistError } from "../../error/AdviceDoesNotExistError";
import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { PerUserLimitExceededError } from "../../error/PerUserLimitExceededError";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";

import { AdviceAlreadyImportedError } from "./error/AdviceAlreadyImportedError";

@injectable()
export class ImportAdviceToUserFunctionFactory {
    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.importAdviceToUser.limits.perUser);
    }

    public getFunction(builder?: functions.FunctionBuilder): functions.Runnable<any> {
        return (builder || functions).https.onCall(this.getFunctionHandler());
    }

    public getFunctionHandler(): FirebaseFunctionDefinitions.ImportAdviceToUser.Function {
        return (data: FirebaseFunctionDefinitions.ImportAdviceToUser.Input, context: functions.https.CallableContext) =>
            this.functionHandler(data, context);
    }

    private async functionHandler(
        data: FirebaseFunctionDefinitions.ImportAdviceToUser.Input,
        context: functions.https.CallableContext,
    ): Promise<FirebaseFunctionDefinitions.ImportAdviceToUser.Result> {
        return FunctionErrorWrapper.wrap(async () => {
            await this.doChecks(context);
            const uid = (context.auth as { uid: string }).uid;
            const adviceId = this.getAdviceIdFromData(data);
            const advice = await this.getAdvice(adviceId);
            await this.assertAdviceNotImportedYet(advice);
            advice.uid = uid;
            await this.updateAdvice(advice);

            return { advice, log: "" };
        });
    }

    private async doChecks(context: functions.https.CallableContext) {
        await this.authHelper.assertAuthenticated(context);
        await this.limitPerUser((context.auth as { uid: string }).uid);
    }

    private async limitPerUser(uid: string) {
        await this.perUserLimiter.rejectOnQuotaExceededOrRecordUsage(`u_${uid}`, config =>
            PerUserLimitExceededError.make(config),
        );
    }

    private getAdviceIdFromData(data: { adviceId: string }): string {
        if (!data.adviceId) throw InvalidInputDataError.make("Missing adviceId");
        return data.adviceId;
    }

    private async getAdvice(adviceId: string): Promise<Advice> {
        const advice = await this.adviceRepository.getAdvice(adviceId);
        if (advice) {
            return advice;
        } else {
            throw AdviceDoesNotExistError.make(`Advice id "${adviceId}"`);
        }
    }

    private async assertAdviceNotImportedYet(advice: Advice) {
        if (advice.uid) throw AdviceAlreadyImportedError.make();
    }

    private async updateAdvice(advice: Advice) {
        await this.adviceRepository.addAdvice(advice);
    }
}
