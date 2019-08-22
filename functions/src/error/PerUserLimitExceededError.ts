import { CallLimitExceededError } from "./CallLimitExceededError";

export namespace PerUserLimitExceededError {
    export const type = "per-user-limit-exceeded-error";

    const localizedMessage = {
        EN: "Limit of function calls per this user was exceeded",
        PL: "Przekroczono limit wywołań tej funkcji na użytkownika. Proszę spróbować za kilka minut",
    };

    export function make(limit: { maxCalls: number; periodSeconds: number }): CallLimitExceededError {
        return CallLimitExceededError.make(localizedMessage, limit);
    }
}
