import { Advice, AdvicesManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { Config } from "../../Config";
import { AlmostUniqueShortIdGenerator } from "../../helpers/AlmostUniqueShortIdGenerator";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";

import { AdviceLinkSender } from "./AdviceLinkSender";

export class AddAdviceFunction {
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

    public getFunctionHandler(): FirebaseFunctionDefinitions.AddAdvice.Function {
        return (data: FirebaseFunctionDefinitions.AddAdvice.Input, context: functions.https.CallableContext) =>
            this.functionHandler(data, context);
    }

    private async functionHandler(
        data: FirebaseFunctionDefinitions.AddAdvice.Input,
        context: functions.https.CallableContext,
    ): Promise<FirebaseFunctionDefinitions.AddAdvice.Result> {
        return FunctionErrorWrapper.wrap(async () => {
            let log = "";
            await AuthHelper.assertAuthenticated(context);
            await AuthHelper.assertUserIsMedicalProfessional(context, this.db);
            await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);
            const advice = this.dataToAdvice(data);
            await this.perPhoneNumberLimiter.rejectOnQuotaExceeded("p_" + advice.parentPhoneNumber);
            const id = await this.obtainUniqueId();
            advice.id = id;
            await this.addAdvice(advice);
            await AdviceLinkSender.sendAdviceLinkToPatient(advice, this.db);

            log += "Advice added";
            return {
                log,
                adviceId: id,
            };
        });
    }

    private constructPerUserLimiter() {
        const conf = Config.addAdvice.limits.perUser;
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "addadvice_per_user_limiter",
                maxCallsPerPeriod: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.db,
        );
    }

    private constructPerPhoneNumberLimiter() {
        const conf = Config.addAdvice.limits.perPhone;
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "addadvice_per_phone_limiter",
                maxCallsPerPeriod: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.db,
        );
    }

    private dataToAdvice(data: any): Advice {
        if (data.id) throw new Error("You cannot specify id of an advice before it is added");
        Advice.validate({ ...data, id: "-allow-empty-id-" });
        return data as Advice;
    }

    private async obtainUniqueId(): Promise<string> {
        return AlmostUniqueShortIdGenerator.obtainUniqueId((id: string) =>
            AdvicesManager.adviceExists(id, this.db as any),
        );
    }

    private async addAdvice(advice: Advice) {
        await AdvicesManager.addAdvice(advice, this.db as any);
    }
}