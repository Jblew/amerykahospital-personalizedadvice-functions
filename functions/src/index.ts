// tslint:disable no-console no-string-literal
import {
    AddAdviceFunction,
    HeartbeatFunction,
    ImportAdviceToUserFunction,
    SendSMSFunction,
    ThankFunction,
} from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import "reflect-metadata";

import { backupFirestoreFunction } from "./functions/maintenance/BackupFirestoreFunction";
import { RunnableFunctionFactory } from "./functions/RunnableFunctionFactory";
import {
    resolveAddAdvice,
    resolveHeartbeat,
    resolveImportAdviceToUser,
    resolveSendSMS,
    resolveThank,
} from "./index_resolver";
import containerFactory from "./inversify.config";

const container = containerFactory();
const runtimeOpts = {
    timeoutSeconds: 10,
    memory: "1GB",
} as const;

exports[AddAdviceFunction.NAME] = RunnableFunctionFactory.make(
    functions.runWith(runtimeOpts),
    resolveAddAdvice(container),
);

exports[SendSMSFunction.NAME] = RunnableFunctionFactory.make(functions.runWith(runtimeOpts), resolveSendSMS(container));

exports[ImportAdviceToUserFunction.NAME] = RunnableFunctionFactory.make(
    functions.runWith(runtimeOpts),
    resolveImportAdviceToUser(container),
);

exports[HeartbeatFunction.NAME] = RunnableFunctionFactory.make(
    functions.runWith({ timeoutSeconds: 20, memory: "256MB" as const }),
    resolveHeartbeat(container),
);
exports[ThankFunction.NAME] = RunnableFunctionFactory.make(functions.runWith(runtimeOpts), resolveThank(container));

exports["backupfirestore"] = backupFirestoreFunction;
