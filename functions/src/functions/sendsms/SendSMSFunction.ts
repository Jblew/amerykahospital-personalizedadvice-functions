import { Advice, AdvicesManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";
import { Log } from "../../Log";

import { AdviceDeepLinkGenerator } from "./AdviceDeepLinkGenerator";
import { SMSMessageSender } from "./SMSMessageSender";

export class SendSMSFunction {
    private firestore: FirebaseFirestore.Firestore;
    private realtimeDb: admin.database.Database;
    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(firestore: FirebaseFirestore.Firestore, realtimeDb: admin.database.Database) {
        this.firestore = firestore;
        this.realtimeDb = realtimeDb;

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
            Log.log().info("Begin SendSMSFunction.functionHandler with data", data);
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
        await AuthHelper.assertAuthenticated(context);
        await AuthHelper.assertUserIsMedicalProfessional(context, this.firestore);
        await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);
    }

    private getAdviceIdFromData(data: { adviceId: string }): string {
        if (!data.adviceId) throw new Error("SendSMSFunction: malformed input data");
        return data.adviceId;
    }

    private async getAdvice(adviceId: string): Promise<Advice> {
        const advice = await AdvicesManager.getAdvice(adviceId, this.firestore as any);
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
        Log.log().info("Calling SMSMessageSender.sendSMS");
        return await SMSMessageSender.sendSMS(phoneNumber, message, this.firestore);
    }

    private async limitSMSApiCalls(phoneNumber: string) {
        await this.perPhoneNumberLimiter.rejectOnQuotaExceeded("p_" + phoneNumber);
    }

    private constructPerUserLimiter() {
        const conf = Config.sendSMS.limits.perUser;
        return FirebaseFunctionsRateLimiter.withRealtimeDbBackend(
            {
                name: "sendsms_per_user_limiter",
                maxCalls: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.realtimeDb,
        );
    }

    private constructPerPhoneNumberLimiter() {
        const conf = Config.sendSMS.limits.perPhone;
        return FirebaseFunctionsRateLimiter.withRealtimeDbBackend(
            {
                name: "sendsms_per_phone_limiter",
                maxCalls: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.realtimeDb,
        );
    }
}
