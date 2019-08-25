import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type MissingPermissionError = LocalizedFirebaseFunctionsError<typeof MissingPermissionError.type>;

export namespace MissingPermissionError {
    export const type = "missing-permission-error";

    export function make(requiredRole: string): MissingPermissionError {
        const localizedMessage = {
            EN: `You are missing the following permission: ${requiredRole}`,
            PL: `Musisz posiadać następujące uprawnienie: ${requiredRole}`,
        };

        return LocalizedFirebaseFunctionsError.make({
            code: "permission-denied",
            type,
            advanced: `Required role key: "${requiredRole}"`,
            localizedMessage,
        });
    }
}
