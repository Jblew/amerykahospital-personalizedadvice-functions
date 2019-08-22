import { Advice, AdviceRepository, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { AdviceSMSSender } from "../../advicesms/AdviceSMSSender";
import { Config } from "../../Config";
import { AdviceDoesNotExistError } from "../../error/AdviceDoesNotExistError";
import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { PerPhoneLimitExceededError } from "../../error/PerPhoneLimitExceededError";
import { PerUserLimitExceededError } from "../../error/PerUserLimitExceededError";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";
import { Log } from "../../Log";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";

@injectable()
export class SendSMSFunctionFactory {
    private log = Log.tag("SendSMSFunctionFactory");
    @inject(TYPES.AuthHelper) private authHelper!: AuthHelper;
    @inject(TYPES.AdviceRepository) private adviceRepository!: AdviceRepository;
    @inject(TYPES.AdviceSMSSender) private adviceSMSSender!: AdviceSMSSender;
    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.sendSMS.limits.perUser);
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(Config.sendSMS.limits.perPhone);
    }

    public getFunction(builder?: functions.FunctionBuilder): functions.Runnable<any> {
        return (builder || functions).https.onCall(this.getFunctionHandler());
    }

    public getFunctionHandler(): FirebaseFunctionDefinitions.SendSMS.Function {
        return (data: FirebaseFunctionDefinitions.SendSMS.Input, context: functions.https.CallableContext) =>
            this.functionHandler(data, context);
    }

    private async functionHandler(
        data: FirebaseFunctionDefinitions.SendSMS.Input,
        context: functions.https.CallableContext,
    ): Promise<FirebaseFunctionDefinitions.SendSMS.Result> {
        return FunctionErrorWrapper.wrap(async () => {
            this.log.info("Begin SendSMSFunction.functionHandler with data", data);
            await this.doChecks(context);
            const adviceId = this.getAdviceIdFromData(data);
            const advice = await this.getAdvice(adviceId);
            const { message, sentSMSId } = await this.sendSMS(advice);

            return {
                message,
                sentSMSId,
            };
        });
    }

    private async doChecks(context: functions.https.CallableContext) {
        await this.authHelper.assertAuthenticated(context);
        await this.authHelper.assertUserIsMedicalProfessional(context);
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

    private async sendSMS(advice: Advice): Promise<{ sentSMSId: string; message: string }> {
        await this.limitSMSApiCalls(advice.parentPhoneNumber);
        return await this.adviceSMSSender.sendAdviceLinkSMS(advice);
    }

    private async limitSMSApiCalls(phone: string) {
        await this.perUserLimiter.rejectOnQuotaExceededOrRecordUsage(`p_${phone}`, config =>
            PerPhoneLimitExceededError.make(config),
        );
    }
}
