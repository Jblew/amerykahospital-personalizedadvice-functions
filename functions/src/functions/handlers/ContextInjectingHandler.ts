import { Handler } from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";

import { UpstreamHandler } from "./UpstreamHandler";

export class ContextInjectingHandler<INPUT_TYPE, PROPS_TYPE, RESULT_TYPE>
    implements UpstreamHandler<INPUT_TYPE, RESULT_TYPE> {
    private contextInjector: (context: functions.https.CallableContext) => PROPS_TYPE;
    private upstreamHandler: ContextInjectingHandler.ContextAngosticUpstreamHandler<
        INPUT_TYPE,
        PROPS_TYPE,
        RESULT_TYPE
    >;

    public constructor(
        contextInjector: (context: functions.https.CallableContext) => PROPS_TYPE,
        upstreamHandler: ContextInjectingHandler.ContextAngosticUpstreamHandler<INPUT_TYPE, PROPS_TYPE, RESULT_TYPE>,
    ) {
        this.contextInjector = contextInjector;
        this.upstreamHandler = upstreamHandler;
    }

    public async handle(data: INPUT_TYPE, context: functions.https.CallableContext): Promise<RESULT_TYPE> {
        return this.upstreamHandler.handle(data, this.contextInjector(context));
    }
}

export namespace ContextInjectingHandler {
    export type ContextAngosticUpstreamHandler<INPUT_TYPE, PROPS_TYPE, RESULT_TYPE> = Handler<
        (data: INPUT_TYPE, props: PROPS_TYPE) => Promise<RESULT_TYPE>
    >;
}
