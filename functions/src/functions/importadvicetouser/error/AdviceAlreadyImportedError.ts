import { LocalizedFirebaseFunctionsError } from "../../../error/LocalizedFirebaseFunctionsError";

export type AdviceAlreadyImportedError = LocalizedFirebaseFunctionsError<typeof AdviceAlreadyImportedError.type>;

export namespace AdviceAlreadyImportedError {
    export const type = "advice-already-imported-error";

    const localizedMessage = {
        EN: "This advice was already imported",
        PL: "Zaimportowano już tą poradę",
    };

    export function make(): AdviceAlreadyImportedError {
        return LocalizedFirebaseFunctionsError.make({
            code: "unavailable",
            type,
            advanced: "",
            localizedMessage,
        });
    }
}
