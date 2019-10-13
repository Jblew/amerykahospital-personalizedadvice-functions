// tslint:disable no-console no-string-literal
import {
    AddAdviceFunction,
    HeartbeatFunction,
    ImportAdviceToUserFunction,
    SendSMSFunction,
} from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import "reflect-metadata";

import { backupFirestoreFunction } from "./functions/maintenance/BackupFirestoreFunction";
import { RunnableFunctionFactory } from "./functions/RunnableFunctionFactory";
import { resolveAddAdvice, resolveHeartbeat, resolveImportAdviceToUser, resolveSendSMS } from "./index_resolver";
import containerFactory from "./inversify.config";

const container = containerFactory();

exports[AddAdviceFunction.NAME] = RunnableFunctionFactory.make(functions, resolveAddAdvice(container));

exports[SendSMSFunction.NAME] = RunnableFunctionFactory.make(functions, resolveSendSMS(container));

exports[ImportAdviceToUserFunction.NAME] = RunnableFunctionFactory.make(
    functions,
    resolveImportAdviceToUser(container),
);

exports[HeartbeatFunction.NAME] = RunnableFunctionFactory.make(functions, resolveHeartbeat(container));

exports["backupfirestore"] = backupFirestoreFunction;
