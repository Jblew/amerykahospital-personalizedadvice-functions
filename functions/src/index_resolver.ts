import { Container } from "inversify";

import { AddAdviceFunctionHandlerFactory } from "./functions/addadvice/AddAdviceFunctionHandlerFactory";
import { SystemHandler } from "./functions/handlers/SystemHandler";
import { HeartbeatFunctionHandlerFactory } from "./functions/heartbeat/HeartbeatFunctionHandlerFactory";
import {
    ImportAdviceToUserFunctionHandlerFactory, //
} from "./functions/importadvicetouser/ImportAdviceToUserFunctionHandlerFactory";
import { SendSMSFunctionHandlerFactory } from "./functions/sendsms/SendSMSFunctionHandlerFactory";
import { ThankFunctionHandlerFactory } from "./functions/thank/ThankFunctionHandlerFactory";
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

export function resolveHeartbeat(container: Container): SystemHandler<any, any> {
    return container.get<HeartbeatFunctionHandlerFactory>(TYPES.HeartbeatFunctionHandlerFactory).makeHandler();
}

export function resolveThank(container: Container): SystemHandler<any, any> {
    return container.get<ThankFunctionHandlerFactory>(TYPES.ThankFunctionHandlerFactory).makeHandler();
}
