import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type NotAuthenticatedError = LocalizedFirebaseFunctionsError<typeof NotAuthenticatedError.type>;

export namespace NotAuthenticatedError {
    export const type = "not-authenticated-error";

    const localizedMessage = {
        EN: "Please authenticate",
        PL: "Proszę się zalogować",
    };

    export function make(): NotAuthenticatedError {
        return LocalizedFirebaseFunctionsError.make({
            code: "permission-denied",
            type,
            advanced: "",
            localizedMessage,
        });
    }
}
