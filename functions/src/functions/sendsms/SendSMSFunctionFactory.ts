import { Advice, AdviceManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { DynamicLinksAdapter } from "../../adapters/DynamicLinksAdapter";
import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";
import { Log } from "../../Log";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";

import { AdviceDeepLinkGenerator } from "./AdviceDeepLinkGenerator";
import { SMSMessageSender } from "./SMSMessageSender";

@injectable()
export class SendSMSFunctionFactory {
    private log = Log.tag("SendSMSFunctionFactory");
    @inject(TYPES.AuthHelper) private authHelper!: AuthHelper;
    @inject(TYPES.DynamicLinksAdapter) private dynamicLinksAdapter!: DynamicLinksAdapter;
    @inject(TYPES.AdviceManager) private adviceManager!: AdviceManager;

    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;
    private adviceDeepLinkGenerator: AdviceDeepLinkGenerator;
    private smsMessageSender: SMSMessageSender;

    public constructor(
        @inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory,
        @inject(TYPES.Firestore) firestore: admin.firestore.Firestore,
    ) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.sendSMS.limits.perUser);
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(Config.sendSMS.limits.perPhone);
        this.adviceDeepLinkGenerator = new AdviceDeepLinkGenerator(this.dynamicLinksAdapter);
        this.smsMessageSender = new SMSMessageSender(firestore);
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
            const message = await this.generateMessage(advice);
            const smsResult = await this.sendSMS(advice.parentPhoneNumber, message);

            return {
                message: "Sent " + message,
                smsResult,
            };
        });
    }

    private async doChecks(context: functions.https.CallableContext) {
        await this.authHelper.assertAuthenticated(context);
        await this.authHelper.assertUserIsMedicalProfessional(context);
        await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);
    }

    private getAdviceIdFromData(data: { adviceId: string }): string {
        if (!data.adviceId) throw new Error("SendSMSFunction: malformed input data");
        return data.adviceId;
    }

    private async getAdvice(adviceId: string): Promise<Advice> {
        const advice = await this.adviceManager.getAdvice(adviceId);
        if (advice) {
            return advice;
        } else {
            throw new Error("Advice " + adviceId + " does not exist");
        }
    }

    private async generateMessage(advice: Advice): Promise<string> {
        return await this.adviceDeepLinkGenerator.generateDeepLinkMessage(advice);
    }

    private async sendSMS(phoneNumber: string, message: string): Promise<string> {
        await this.limitSMSApiCalls(phoneNumber);
        this.log.info("Calling SMSMessageSender.sendSMS");
        return await this.smsMessageSender.sendSMS(phoneNumber, message);
    }

    private async limitSMSApiCalls(phoneNumber: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceeded("p_" + phoneNumber);
    }
}
