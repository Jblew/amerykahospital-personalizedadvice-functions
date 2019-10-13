import { Handler, HeartbeatFunction } from "amerykahospital-personalizedadvice-businesslogic";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { ContextInjectingHandler } from "../handlers/ContextInjectingHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { HeartbeatFunctionHandler } from "./HeartbeatFunctionHandler";

interface HeartbeatFunctionHandlerPropTypes {
    uid: string;
}

@injectable()
export class HeartbeatFunctionHandlerFactory {
    private functionConfig = Config.heartbeat;

    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perUser);
    }

    public makeHandler(): Handler<HeartbeatFunction.Function> &
        SystemHandler<HeartbeatFunction.Input, HeartbeatFunction.Result> {
        const rawHandler = new HeartbeatFunctionHandler();

        const handlerWithContext = new ContextInjectingHandler<
            HeartbeatFunction.Input,
            HeartbeatFunctionHandlerPropTypes,
            HeartbeatFunction.Result
        >(context => ({ uid: context.auth!.uid }), rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: HeartbeatFunction.NAME }, authenticatedHandler);
    }
}
