import { Advice, AdvicesManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/AuthHelper";
import { FunctionErrorWrapper } from "../../helpers/FunctionErrorWrapper";

export class ImportAdviceToUserFunction {
    private firestore: FirebaseFirestore.Firestore;
    private realtimeDb: admin.database.Database;
    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(firestore: FirebaseFirestore.Firestore, realtimeDb: admin.database.Database) {
        this.firestore = firestore;
        this.realtimeDb = realtimeDb;

        this.perUserLimiter = this.constructPerUserLimiter();
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

            return { advice };
        });
    }

    private async doChecks(context: functions.https.CallableContext) {
        await AuthHelper.assertAuthenticated(context);
        await AuthHelper.assertUserIsMedicalProfessional(context, this.firestore);
        await this.perUserLimiter.rejectOnQuotaExceeded("u_" + (context.auth as { uid: string }).uid);
    }

    private getAdviceIdFromData(data: { adviceId: string }): string {
        if (!data.adviceId) throw new Error("ImportAdviceToUserFunction: malformed input data");
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

    private async assertAdviceNotImportedYet(advice: Advice) {
        if (advice.uid) throw new Error("Advice has been already imported");
    }

    private async updateAdvice(advice: Advice) {
        await AdvicesManager.addAdvice(advice, this.firestore as any);
    }

    private constructPerUserLimiter() {
        const conf = Config.importAdviceToUser.limits.perUser;
        return FirebaseFunctionsRateLimiter.withRealtimeDbBackend(
            {
                name: "importadvicetouser_per_user_limiter",
                maxCalls: conf.calls,
                periodSeconds: conf.periodS,
            },
            this.realtimeDb,
        );
    }
}
