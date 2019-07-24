import * as functions from "firebase-functions";

export class FunctionErrorWrapper {
    public static async wrap<T>(fn: () => Promise<T>): Promise<T> {
        try {
            const res: T = await fn();
            return res;
        } catch (error) {
            if (error.name.indexOf("HttpsError") >= 0) throw error;
            else {
                // tslint:disable no-console
                console.error(error);
                throw new functions.https.HttpsError("unknown", "Unknown error: " + error);
            }
        }
    }
}
