import * as functions from "firebase-functions";

import { SystemHandler } from "./handlers/SystemHandler";

export namespace RunnableFunctionFactory {
    export function make(
        builder: functions.FunctionBuilder | typeof import("firebase-functions"),
        handler: SystemHandler<any, any>,
    ): functions.Runnable<any> {
        return builder.https.onCall((data: any, context: functions.https.CallableContext) =>
            handler.handle(data, context),
        );
    }
}
