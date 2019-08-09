import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import "reflect-metadata";

import containerFactory from "./inversify.config";
import { Log } from "./Log";
import TYPES, * as t from "./TYPES";

Log.log().initialize();

const container = containerFactory();
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = container
    .get<t.AddAdviceFunctionFactory>(TYPES.AddAdviceFunctionFactory)
    .getFunction();

exports[FirebaseFunctionDefinitions.SendSMS.NAME] = container
    .get<t.SendSMSFunctionFactory>(TYPES.SendSMSFunctionFactory)
    .getFunction();

exports[FirebaseFunctionDefinitions.ImportAdviceToUser.NAME] = container
    .get<t.ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory)
    .getFunction();
