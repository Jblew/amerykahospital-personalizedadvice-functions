import * as functions from "firebase-functions";
import { LocalizedError, LocalizedErrorFactory } from "localized-error";

export type LocalizedFirebaseFunctionsError<TYPE extends string> = Error &
    LocalizedError & {
        details: {
            type: TYPE;
            advanced: string;
        };
    };

export namespace LocalizedFirebaseFunctionsError {
    export function make<TYPE extends string>(params: {
        type: TYPE;
        code: functions.https.FunctionsErrorCode;
        advanced: string;
        localizedMessage: { EN: string; [x: string]: string };
    }): LocalizedFirebaseFunctionsError<TYPE> {
        const unknownFirebaseError = new functions.https.HttpsError(params.code, params.localizedMessage.EN, {
            type: params.type,
            advanced: params.advanced,
        });
        return LocalizedErrorFactory.make(
            unknownFirebaseError,
            params.localizedMessage,
        ) as LocalizedFirebaseFunctionsError<TYPE>;
    }
}
