// tslint:disable no-console
import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import "reflect-metadata";

import { resolveAddAdvice, resolveImportAdviceToUser, resolveSendSMS } from "./index_resolver";
import containerFactory from "./inversify.config";

const container = containerFactory();
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = resolveAddAdvice(container);
exports[FirebaseFunctionDefinitions.SendSMS.NAME] = resolveSendSMS(container);
exports[FirebaseFunctionDefinitions.ImportAdviceToUser.NAME] = resolveImportAdviceToUser(container);
