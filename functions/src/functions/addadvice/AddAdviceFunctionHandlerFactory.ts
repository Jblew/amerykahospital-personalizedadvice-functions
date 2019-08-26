import { AddAdviceFunction, AdviceRepository, Handler } from "amerykahospital-personalizedadvice-businesslogic";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { AddAdviceFunctionHandler } from "./AddAdviceFunctionHandler";

@injectable()
export class AddAdviceFunctionHandlerFactory {
    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;
    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(Config.addAdvice.limits.perPhone);
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.addAdvice.limits.perUser);
    }

    public makeHandler(): Handler<AddAdviceFunction.Function> {
        const rawHandler = new AddAdviceFunctionHandler({
            adviceRepository: this.adviceRepository,
            perPhoneNumberLimiter: this.perPhoneNumberLimiter,
        });

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: rawHandler,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: AddAdviceFunction.NAME }, authenticatedHandler);
    }
}
