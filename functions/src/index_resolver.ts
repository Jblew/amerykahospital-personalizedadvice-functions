import { Runnable } from "firebase-functions";
import { Container } from "inversify";

import TYPES, * as t from "./TYPES";

export function resolveAddAdvice(container: Container): Runnable<any> {
    return container.get<t.AddAdviceFunctionFactory>(TYPES.AddAdviceFunctionFactory).getFunction();
}

export function resolveSendSMS(container: Container): Runnable<any> {
    return container.get<t.SendSMSFunctionFactory>(TYPES.SendSMSFunctionFactory).getFunction();
}

export function resolveImportAdviceToUser(container: Container): Runnable<any> {
    return container.get<t.ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory).getFunction();
}
