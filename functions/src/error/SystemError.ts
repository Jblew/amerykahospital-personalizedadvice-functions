import * as functions from "firebase-functions";
import { LocalizedError, LocalizedErrorFactory } from "localized-error";

export interface SystemError extends LocalizedError {
    details: {
        advanced: string;
        localizedMessage: {},
    };
}

export namespace SystemError {
    const localizedMessage = {
        EN: "Unexpected system error occured. Please contact the system administrator",
        PL: "Wystąpił błąd systemu. Proszę skontaktować się z administratorem",
    };

    export function make(error: Error): SystemError {
        const advanced = error.message;
        const unknownFirebaseError = new functions.https.HttpsError("unknown", localizedMessage.EN, { advanced });
        return LocalizedErrorFactory.make(unknownFirebaseError, localizedMessage) as SystemError;
    }
}
