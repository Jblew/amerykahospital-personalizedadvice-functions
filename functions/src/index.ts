// tslint:disable no-console no-string-literal
import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import "reflect-metadata";

import { resolveAddAdvice, resolveImportAdviceToUser, resolveSendSMS } from "./index_resolver";
import containerFactory from "./inversify.config";

const container = containerFactory();
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = resolveAddAdvice(container);
exports[FirebaseFunctionDefinitions.SendSMS.NAME] = resolveSendSMS(container);
exports[FirebaseFunctionDefinitions.ImportAdviceToUser.NAME] = resolveImportAdviceToUser(container);


);
exports["test_rate_limiter_firestore"] = functions.https.onRequest(async (req, res) => {
    await rlimiterFirestore.rejectOnQuotaExceeded();
    res.send("OK");
});
