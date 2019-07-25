import { Advice, AdvicesManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";

import { AdviceDeepLinkGenerator } from "./AdviceDeepLinkGenerator";
import { SMSMessageSender } from "./SMSMessageSender";

export class SendSMSFunction {
    private db: FirebaseFirestore.Firestore;
    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(db: FirebaseFirestore.Firestore) {
        this.db = db;

        this.perUserLimiter = this.constructPerUserLimiter();
        this.perPhoneNumberLimiter = this.constructPerPhoneNumberLimiter();
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
            await this.doChecks(context);
            const adviceId = this.getAdviceIdFromData(data);
            const advice = await this.getAdvice(adviceId);
            const message = await this.generateMessage(advice);
            const smsResult = await this.sendSMS(advice.parentPhoneNumber, message);

            return {
                message,
                smsResult,
            };
        });
    }

    private async doChecks(context: functions.https.CallableContext) {
        await AuthHelper.assertAuthenticated(context);
        await AuthHelper.assertUserIsMedicalProfessional(context, this.db);
        await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);
    }

    private getAdviceIdFromData(data: { adviceId: string }): string {
        if (!data.adviceId) throw new Error("SendSMSFunction: malformed input data");
        return data.adviceId;
    }

    private async getAdvice(adviceId: string): Promise<Advice> {
        const advice = await AdvicesManager.getAdvice(adviceId, this.db as any);
        if (advice) {
            return advice;
        } else {
            throw new Error("Advice " + adviceId + " does not exist");
        }
    }

    private async generateMessage(advice: Advice): Promise<string> {
        return await AdviceDeepLinkGenerator.generateDeepLinkMessage(advice);
    }

    private async sendSMS(phoneNumber: string, message: string): Promise<string> {
        await this.limitSMSApiCalls(phoneNumber);
        return await SMSMessageSender.sendSMS(phoneNumber, message, this.db);
    }

    private async limitSMSApiCalls(phoneNumber: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceeded("p_" + phoneNumber);
    }

    private constructPerUserLimiter() {
        const conf = Config.sendSMS.limits.perUser;
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "sendsms_per_user_limiter",
                maxCallsPerPeriod: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.db,
        );
    }

    private constructPerPhoneNumberLimiter() {
        const conf = Config.sendSMS.limits.perPhone;
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "sendsms_per_phone_limiter",
                maxCallsPerPeriod: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.db,
        );
    }
}
