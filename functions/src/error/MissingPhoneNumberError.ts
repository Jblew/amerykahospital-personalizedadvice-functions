import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type MissingPhoneNumberError = LocalizedFirebaseFunctionsError<typeof MissingPhoneNumberError.type>;

export namespace MissingPhoneNumberError {
    export const type = "missing-phone-number-error";

    const localizedMessage = {
        EN: "The phone number is missing. Please provide it",
        PL: "Proszę podać numer telefonu",
    };

    export function make(
    ): MissingPhoneNumberError {
        return LocalizedFirebaseFunctionsError.make({
            code: "invalid-argument",
            type,
            advanced: "",
            localizedMessage,
        });
    }
}
