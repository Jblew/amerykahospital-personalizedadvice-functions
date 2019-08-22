import { LocalizedFirebaseFunctionsError } from "./LocalizedFirebaseFunctionsError";

export type CallLimitExceededError = LocalizedFirebaseFunctionsError<typeof CallLimitExceededError.type>;

export namespace CallLimitExceededError {
    export const type = "call-limit-exceeded-error";

    export function make(
        localizedMessage: { EN: string; [x: string]: string },
        limit: { maxCalls: number; periodSeconds: number },
    ): CallLimitExceededError {
        return LocalizedFirebaseFunctionsError.make({
            code: "resource-exhausted",
            type,
            advanced: `Limit is ${limit.maxCalls} per ${limit.periodSeconds} seconds`,
            localizedMessage,
        });
    }
}
