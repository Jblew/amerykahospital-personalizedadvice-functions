import { Handler } from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { PerUserLimitExceededError } from "../../error/PerUserLimitExceededError";
import { AuthHelper } from "../../helpers/auth/AuthHelper";

type UpstreamHandler<INPUT_TYPE, RESULT_TYPE> = Handler<
    (data: INPUT_TYPE, context: functions.https.CallableContext) => Promise<RESULT_TYPE>
>;

export class AuthenticatedFunctionHandler<INPUT_TYPE, RESULT_TYPE> implements UpstreamHandler<INPUT_TYPE, RESULT_TYPE> {
    private authHelper: AuthHelper;
    private upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>;
    private requiredRole: string | undefined;
    private rateLimiter: FirebaseFunctionsRateLimiter;

    public constructor(p: {
        authHelper: AuthHelper;
        upstreamHandler: UpstreamHandler<INPUT_TYPE, RESULT_TYPE>;
        requiredRole?: string;
        rateLimiter: FirebaseFunctionsRateLimiter;
    }) {
        this.authHelper = p.authHelper;
        this.upstreamHandler = p.upstreamHandler;
        this.requiredRole = p.requiredRole;
        this.rateLimiter = p.rateLimiter;
    }

    public async handle(data: INPUT_TYPE, context: functions.https.CallableContext): Promise<RESULT_TYPE> {
        await this.authHelper.assertAuthenticated(context);
        await this.limitPerUser((context.auth as { uid: string }).uid);

        if (this.requiredRole) {
            await this.authHelper.assertUserHasRole(this.requiredRole, context);
        }

        return await this.upstreamHandler.handle(data, context);
    }

    private async limitPerUser(uid: string) {
        await this.rateLimiter.rejectOnQuotaExceededOrRecordUsage(uid, config =>
            PerUserLimitExceededError.make(config),
        );
    }
}
