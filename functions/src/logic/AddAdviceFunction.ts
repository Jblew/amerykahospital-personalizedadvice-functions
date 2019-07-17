import { Advice, AdvicesManager } from "amerykahospital-personalizedadvices-core";

export class AddAdviceFunction {
    public static async addAdvice(advice: Advice, db: firebase.firestore.Firestore) {
        Advice.validate(advice);

        await AdvicesManager.addAdvice(advice, db as any);
    }

    private constructor() {
        /* */
    }
}
