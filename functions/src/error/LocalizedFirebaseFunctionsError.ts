import * as functions from "firebase-functions";
import { TransferableLocalizedError } from "localized-error";

export type LocalizedFirebaseFunctionsError<TYPE extends string> = TransferableLocalizedError<
    TYPE,
    functions.https.FunctionsErrorCode
>;

export namespace LocalizedFirebaseFunctionsError {
    export function make<TYPE extends string>(params: {
        type: TYPE;
        code: functions.https.FunctionsErrorCode;
        advanced: string;
        localizedMessage: { EN: string; [x: string]: string };
    }): LocalizedFirebaseFunctionsError<TYPE> {
        return TransferableLocalizedError.make(functions.https.HttpsError, params);
    }
}
