import {
    AddAdviceFunction,
    AdviceRepository,
    Handler,
} from "amerykahospital-personalizedadvice-businesslogic";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import FirestoreRoles from "firestore-roles";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { ContextInjectingHandler } from "../handlers/ContextInjectingHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { AddAdviceFunctionHandler } from "./AddAdviceFunctionHandler";

interface AddAdviceFunctionHandlerPropTypes {
    uid: string;
}

@injectable()
export class AddAdviceFunctionHandlerFactory {
    private functionConfig = Config.addAdvice;

    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    @inject(TYPES.FirestoreRoles)
    private roles!: FirestoreRoles;

    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;
    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perPhone);
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perUser);
    }

    public makeHandler(): Handler<AddAdviceFunction.Function> &
        SystemHandler<AddAdviceFunction.Input, AddAdviceFunction.Result> {
        const rawHandler = new AddAdviceFunctionHandler({
            adviceRepository: this.adviceRepository,
            perPhoneNumberLimiter: this.perPhoneNumberLimiter,
            roles: this.roles,
        });

        const handlerWithContext = new ContextInjectingHandler<
            AddAdviceFunction.Input,
            AddAdviceFunctionHandlerPropTypes,
            AddAdviceFunction.Result
        >(context => ({ uid: context.auth!.uid }), rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: AddAdviceFunction.NAME }, authenticatedHandler);
    }
}
