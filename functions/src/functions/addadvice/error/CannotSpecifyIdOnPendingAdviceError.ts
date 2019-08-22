import { LocalizedFirebaseFunctionsError } from "../../../error/LocalizedFirebaseFunctionsError";

export type CannotSpecifyIdOnPendingAdviceError = LocalizedFirebaseFunctionsError<
    typeof CannotSpecifyIdOnPendingAdviceError.type
>;

export namespace CannotSpecifyIdOnPendingAdviceError {
    export const type = "cannot-specify-id-on-pending-advice-error";

    const localizedMessage = {
        EN: "You cannot specify advice ID manually",
        PL: "Nie można ustawiać ręcznie ID porady",
    };

    export function make(): CannotSpecifyIdOnPendingAdviceError {
        return LocalizedFirebaseFunctionsError.make({
            code: "invalid-argument",
            type,
            advanced: "",
            localizedMessage,
        });
    }
}
