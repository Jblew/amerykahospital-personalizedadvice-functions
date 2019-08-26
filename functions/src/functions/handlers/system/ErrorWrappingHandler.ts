import * as functions from "firebase-functions";

import { SystemError } from "../../../error/SystemError";
import { Log } from "../../../Log";
import { UpstreamHandler } from "../UpstreamHandler";

export class ErrorWrappingHandler<INPUT_TYPE, RESULT_TYPE> implements UpstreamHandler<INPUT_TYPE, RESULT_TYPE> {
    private log = Log.tag("ErrorWrappingHandler");
    private upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>;

    public constructor(upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>) {
        this.upstreamHandler = upstreamHandler;
    }

    public async handle(data: INPUT_TYPE, context: functions.https.CallableContext): Promise<RESULT_TYPE> {
        return this.wrap(() => this.upstreamHandler.handle(data, context));
    }

    private async wrap<T>(fn: () => Promise<T>): Promise<T> {
        try {
            const res: T = await fn();
            return res;
        } catch (error) {
            if ("code" in error) throw error;
            else {
                // tslint:disable no-console
                this.log.error(error);
                throw SystemError.make(error);
            }
        }
    }
}
