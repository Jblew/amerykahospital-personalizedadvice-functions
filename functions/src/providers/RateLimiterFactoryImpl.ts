import * as admin from "firebase-admin";
import {
    FirebaseFunctionsRateLimiter,
    FirebaseFunctionsRateLimiterConfiguration,
} from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import TYPES from "../TYPES";

import { RateLimiterFactory } from "./RateLimiterFactory";

@injectable()
export class RateLimiterFactoryImpl implements RateLimiterFactory {
    @inject(TYPES.RealtimeDatabase) private realtimeDB!: admin.database.Database;

    public createRateLimiter(props: FirebaseFunctionsRateLimiterConfiguration): FirebaseFunctionsRateLimiter {
        return FirebaseFunctionsRateLimiter.withRealtimeDbBackend(props, this.realtimeDB);
    }
}
