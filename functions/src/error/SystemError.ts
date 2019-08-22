import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type SystemError = LocalizedFirebaseFunctionsError<typeof SystemError.type>;

export namespace SystemError {
    export const type = "system-error";

    const localizedMessage = {
        EN: "Unexpected system error occured. Please contact the system administrator",
        PL: "Wystąpił błąd systemu. Proszę skontaktować się z administratorem",
    };

    export function make(error: Error): SystemError {
        return LocalizedFirebaseFunctionsError.make({
            code: "internal",
            type: "system-error",
            advanced: error.message,
            localizedMessage,
        });
    }
}
