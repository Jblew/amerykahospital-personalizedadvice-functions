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
import { SystemHandler } from "../handlers/SystemHandler";
import { UpstreamHandler } from "../handlers/UpstreamHandler";

import { ImportAdviceToUserFunctionHandler } from "./ImportAdviceToUserFunctionHandler";

type ContextAngosticUpstreamHandler<INPUT_TYPE, PROPS_TYPE, RESULT_TYPE> = Handler<
    (data: INPUT_TYPE, props: PROPS_TYPE) => Promise<RESULT_TYPE>
>;
interface ImportAdviceToUserFunctionHandlerPropsType {
    uid: string;
}
class ContextInjectingHandler<INPUT_TYPE, RESULT_TYPE> implements UpstreamHandler<INPUT_TYPE, RESULT_TYPE> {
    private upstreamHandler: ContextAngosticUpstreamHandler<
        INPUT_TYPE,
        ImportAdviceToUserFunctionHandlerPropsType,
        RESULT_TYPE
    >;

    public constructor(
        upstreamHandler: ContextAngosticUpstreamHandler<
            INPUT_TYPE,
            ImportAdviceToUserFunctionHandlerPropsType,
            RESULT_TYPE
        >,
    ) {
        this.upstreamHandler = upstreamHandler;
    }

    public async handle(data: INPUT_TYPE, context: functions.https.CallableContext): Promise<RESULT_TYPE> {
        return this.upstreamHandler.handle(data, { uid: context.auth!.uid });
    }
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
        const handlerWithContext = new ContextInjectingHandler(rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: AddAdviceFunction.NAME }, authenticatedHandler);
    }
}
