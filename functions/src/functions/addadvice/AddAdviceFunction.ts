import {
    Advice,
    AdvicesManager,
    FirebaseFunctionDefinitions,
    PendingAdvice,
} from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { Config } from "../../Config";
import { AlmostUniqueShortIdGenerator } from "../../helpers/AlmostUniqueShortIdGenerator";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";

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
            await this.doChecks(data, context);
            const adviceId = await this.doAddAdvice(data, context);

            return {
                log: "Advice added",
                adviceId,
            };
        });
    }

    private async doChecks(data: PendingAdvice, context: functions.https.CallableContext) {
        await AuthHelper.assertAuthenticated(context);
        await AuthHelper.assertUserIsMedicalProfessional(context, this.db);
        await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);

        if (!data.parentPhoneNumber) throw new Error("Missing phone number");
        await this.perPhoneNumberLimiter.rejectOnQuotaExceeded("p_" + data.parentPhoneNumber);
    }

    private async doAddAdvice(data: PendingAdvice, context: functions.https.CallableContext): Promise<string> {
        const pendingAdvice = this.dataToPendingAdvice(data);
        const id = await this.obtainUniqueId();
        const advice = this.pendingAdviceToAdvice(pendingAdvice, id);
        await this.addAdvice(advice);
        return id;
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

    private dataToPendingAdvice(data: any): PendingAdvice {
        if (data.id) throw new Error("You cannot specify id of an advice before it is added");
        PendingAdvice.validate(data);
        return data as PendingAdvice;
    }

    private async obtainUniqueId(): Promise<string> {
        return AlmostUniqueShortIdGenerator.obtainUniqueId((id: string) =>
            AdvicesManager.adviceExists(id, this.db as any),
        );
    }

    private pendingAdviceToAdvice(pendingAdvice: PendingAdvice, id: string): Advice {
        return {
            ...pendingAdvice,
            id,
            timestamp: admin.firestore.Timestamp.now().seconds,
        };
    }

    private async addAdvice(advice: Advice) {
        await AdvicesManager.addAdvice(advice, this.db as any);
    }
}
