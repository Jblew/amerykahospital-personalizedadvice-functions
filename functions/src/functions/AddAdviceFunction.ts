import { Advice, AdvicesManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { AuthHelper } from "../helpers/AuthHelper";

export class AddAdviceFunction {
    private db: FirebaseFirestore.Firestore;
    private perUserLimiter: FirebaseFunctionsRateLimiter;
    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;

    public constructor(db: FirebaseFirestore.Firestore) {
        this.db = db;

        this.perUserLimiter = this.constructPerUserLimiter();
        this.perPhoneNumberLimiter = this.constructPerPhoneNumberLimiter();
    }

    public getFunction(builder: functions.FunctionBuilder): functions.Runnable<any> {
        const handlerTypeGuarded: FirebaseFunctionDefinitions.AddAdvice.Function = this.functionHandler;
        return builder.https.onCall(handlerTypeGuarded);
    }

    private async functionHandler(
        data: FirebaseFunctionDefinitions.AddAdvice.Input,
        context: functions.https.CallableContext,
    ): Promise<FirebaseFunctionDefinitions.AddAdvice.Result> {
        let log = "";
        await AuthHelper.assertAuthenticated(context);
        await AuthHelper.assertUserIsMedicalProfessional(context, this.db);
        await this.perUserLimiter.rejectIfQuotaExceededOrRecordCall("u_" + (context.auth as { uid: string }).uid);
        const advice = this.dataToAdvice(data);
        await this.perPhoneNumberLimiter.rejectIfQuotaExceededOrRecordCall("p_" + advice.parentPhoneNumber);
        await this.addAdvice(data as Advice);

        log += "Advice added";
        return {
            log,
        };
    }

    private constructPerUserLimiter() {
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "addadvice_per_user_limiter",
                maxCallsPerPeriod: 2,
                periodSeconds: 60,
            },
            this.db,
        );
    }

    private constructPerPhoneNumberLimiter() {
        return new FirebaseFunctionsRateLimiter(
            {
                firebaseCollectionKey: "addadvice_per_phone_limiter",
                maxCallsPerPeriod: 3,
                periodSeconds: 60 * 60,
            },
            this.db,
        );
    }

    private dataToAdvice(data: any): Advice {
        Advice.validate(data);
        return data as Advice;
    }

    private async addAdvice(advice: Advice) {
        await AdvicesManager.addAdvice(advice, this.db as any);
    }
}
