// tslint:disable member-ordering
import * as functions from "firebase-functions";

import { Log } from "../Log";

export class FunctionErrorWrapper {
    private static log = Log.tag("FunctionErrorWrapper");

    public static async wrap<T>(fn: () => Promise<T>): Promise<T> {
        try {
            const res: T = await fn();
            return res;
        } catch (error) {
            if ("code" in error) throw error;
            else {
                // tslint:disable no-console
                FunctionErrorWrapper.log.error(error);
                throw new functions.https.HttpsError("unknown", "" + error);
            }
        }
    }
}
