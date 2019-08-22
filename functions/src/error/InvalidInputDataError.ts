import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type InvalidInputDataError = LocalizedFirebaseFunctionsError<typeof InvalidInputDataError.type>;

export namespace InvalidInputDataError {
    export const type = "invalid-input-data-error";

    const localizedMessage = {
        EN: "Invalid input data",
        PL: "Niepoprawne dane wejściowe",
    };

    export function make(advanced: string): InvalidInputDataError {
        return LocalizedFirebaseFunctionsError.make({
            code: "invalid-argument",
            type,
            advanced,
            localizedMessage,
        });
    }
}
