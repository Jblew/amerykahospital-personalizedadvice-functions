import { CallLimitExceededError } from "./CallLimitExceededError";

export namespace PerPhoneLimitExceededError {
    const localizedMessage = {
        EN: "Limit of function calls per this phone number was exceeded",
        PL: "Przekroczono limit wywołań tej funkcji dla podanego numeru telefonu. Proszę spróbować za kilka minut",
    };

    export function make(limit: { maxCalls: number; periodSeconds: number }): CallLimitExceededError {
        return CallLimitExceededError.make(localizedMessage, limit);
    }
}
