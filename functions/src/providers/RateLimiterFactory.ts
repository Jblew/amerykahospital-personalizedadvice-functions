import {
    FirebaseFunctionsRateLimiter,
    FirebaseFunctionsRateLimiterConfiguration,
} from "firebase-functions-rate-limiter";

export interface RateLimiterFactory {
    createRateLimiter(props: FirebaseFunctionsRateLimiterConfiguration): FirebaseFunctionsRateLimiter;
}
