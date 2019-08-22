import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type AdviceDoesNotExistError = LocalizedFirebaseFunctionsError<typeof AdviceDoesNotExistError.type>;

export namespace AdviceDoesNotExistError {
    export const type = "advice-does-not-error";

    const localizedMessage = {
        EN: "Advice does not exist",
        PL: "Ta porada nie istnieje",
    };

    export function make(advanced: string): AdviceDoesNotExistError {
        return LocalizedFirebaseFunctionsError.make({
            code: "unavailable",
            type,
            advanced,
            localizedMessage,
        });
    }
}
