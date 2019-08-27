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
            if (typeof error === "undefined") {
                const undefinedErrorError = new Error("ErrorWrappingHandler got undefined error");
                this.log.error(undefinedErrorError);
                throw SystemError.make(undefinedErrorError);
            }

            this.log.error(error);
            if ("code" in error) {
                throw error;
            } else {
                throw SystemError.make(error);
            }
        }
    }
}
