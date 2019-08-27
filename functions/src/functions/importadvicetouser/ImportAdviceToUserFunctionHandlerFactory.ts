// tslint:disable max-classes-per-file
import {
    AddAdviceFunction,
    AdviceRepository,
    Handler,
    ImportAdviceToUserFunction,
} from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import { inject, injectable } from "inversify";

import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { ContextInjectingHandler } from "../handlers/ContextInjectingHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { ImportAdviceToUserFunctionHandler } from "./ImportAdviceToUserFunctionHandler";

interface ImportAdviceToUserFunctionHandlerPropsType {
    uid: string;
}

@injectable()
export class ImportAdviceToUserFunctionHandlerFactory {
    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(Config.importAdviceToUser.limits.perUser);
    }

    public makeHandler(): Handler<ImportAdviceToUserFunction.Function> &
        SystemHandler<ImportAdviceToUserFunction.Input, ImportAdviceToUserFunction.Result> {
        const rawHandler = new ImportAdviceToUserFunctionHandler({
            adviceRepository: this.adviceRepository,
        });
        const handlerWithContext = new ContextInjectingHandler<
            ImportAdviceToUserFunction.Input,
            ImportAdviceToUserFunctionHandlerPropsType,
            ImportAdviceToUserFunction.Result
        >(context => ({ uid: context.auth!.uid }), rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: AddAdviceFunction.NAME }, authenticatedHandler);
    }
}
