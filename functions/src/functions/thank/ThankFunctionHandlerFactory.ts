// tslint:disable max-classes-per-file
import {
    AdviceRepository,
    Handler,
    ThankFunction,
} from "amerykahospital-personalizedadvice-businesslogic";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { ContextInjectingHandler } from "../handlers/ContextInjectingHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { ThankFunctionHandler } from "./ThankFunctionHandler";

interface ThankFunctionHandlerPropsType {
    uid: string;
}

@injectable()
export class ThankFunctionHandlerFactory {
    private functionConfig = Config.thank;

    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perUser);
    }

    public makeHandler(): Handler<ThankFunction.Function> & SystemHandler<ThankFunction.Input, ThankFunction.Result> {
        const rawHandler = new ThankFunctionHandler({
            adviceRepository: this.adviceRepository,
        });
        const handlerWithContext = new ContextInjectingHandler<
            ThankFunction.Input,
            ThankFunctionHandlerPropsType,
            ThankFunction.Result
        >(context => ({ uid: context.auth!.uid }), rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: ThankFunction.NAME }, authenticatedHandler);
    }
}
