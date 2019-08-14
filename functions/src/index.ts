// tslint:disable no-console no-string-literal
import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import "reflect-metadata";

import { resolveAddAdvice, resolveImportAdviceToUser, resolveSendSMS } from "./index_resolver";
import containerFactory from "./inversify.config";
import TYPES from "./TYPES";

const container = containerFactory();
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = resolveAddAdvice(container);
exports[FirebaseFunctionDefinitions.SendSMS.NAME] = resolveSendSMS(container);
exports[FirebaseFunctionDefinitions.ImportAdviceToUser.NAME] = resolveImportAdviceToUser(container);

const rlimiterRealtimeDB = FirebaseFunctionsRateLimiter.withRealtimeDbBackend(
    {
        name: "rlimiterRealtimeDB",
        maxCalls: 2,
        periodSeconds: 30,
    },
    container.get(TYPES.RealtimeDatabase),
);
exports["test_rate_limiter_realtimedb"] = functions.https.onRequest(async (req, res) => {
    await rlimiterRealtimeDB.rejectOnQuotaExceeded();
    res.send("OK");
});

const rlimiterFirestore = FirebaseFunctionsRateLimiter.withFirestoreBackend(
    {
        name: "rlimiterFirestore",
        maxCalls: 2,
        periodSeconds: 30,
    },
    container.get(TYPES.Firestore),
);
exports["test_rate_limiter_firestore"] = functions.https.onRequest(async (req, res) => {
    await rlimiterFirestore.rejectOnQuotaExceeded();
    res.send("OK");
});
