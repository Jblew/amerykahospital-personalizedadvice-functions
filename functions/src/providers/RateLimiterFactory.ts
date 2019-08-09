import * as admin from "firebase-admin";
import {
    FirebaseFunctionsRateLimiter,
    FirebaseFunctionsRateLimiterConfiguration,
} from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import TYPES from "../TYPES";

@injectable()
export class RateLimiterFactory {
    @inject(TYPES.RealtimeDatabase) private realtimeDB!: admin.database.Database;

    public createRateLimiter(props: FirebaseFunctionsRateLimiterConfiguration): FirebaseFunctionsRateLimiter {
        return FirebaseFunctionsRateLimiter.withRealtimeDbBackend(props, this.realtimeDB);
    }
}
