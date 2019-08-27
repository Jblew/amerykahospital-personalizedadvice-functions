import { Container } from "inversify";

import { AddAdviceFunctionHandlerFactory } from "./functions/addadvice/AddAdviceFunctionHandlerFactory";
import { SystemHandler } from "./functions/handlers/SystemHandler";
import {
    ImportAdviceToUserFunctionHandlerFactory, //
} from "./functions/importadvicetouser/ImportAdviceToUserFunctionHandlerFactory";
import { SendSMSFunctionHandlerFactory } from "./functions/sendsms/SendSMSFunctionHandlerFactory";
import TYPES from "./TYPES";

export function resolveAddAdvice(container: Container): SystemHandler<any, any> {
    return container.get<AddAdviceFunctionHandlerFactory>(TYPES.AddAdviceFunctionHandlerFactory).makeHandler();
}

export function resolveSendSMS(container: Container): SystemHandler<any, any> {
    return container.get<SendSMSFunctionHandlerFactory>(TYPES.SendSMSFunctionHandlerFactory).makeHandler();
}

export function resolveImportAdviceToUser(container: Container): SystemHandler<any, any> {
    return container
        .get<ImportAdviceToUserFunctionHandlerFactory>(TYPES.ImportAdviceToUserFunctionHandlerFactory)
        .makeHandler();
}
