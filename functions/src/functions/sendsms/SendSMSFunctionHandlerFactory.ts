import {
    AdviceRepository,
    Handler,
    SendSMSFunction,
    SentSMSRepository,
    SMSConfig,
} from "amerykahospital-personalizedadvice-businesslogic";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";
import FirestoreRoles from "firestore-roles";
import { inject, injectable } from "inversify";

import { DynamicLinksAdapter } from "../../adapters/DynamicLinksAdapter";
import { SMSApiAdapter } from "../../adapters/SMSApiAdapter";
import { Config } from "../../Config";
import { AuthHelper } from "../../helpers/auth/AuthHelper";
import { RateLimiterFactory } from "../../providers/RateLimiterFactory";
import { DeepLinkBuilder } from "../../settings";
import TYPES from "../../TYPES";
import { AuthenticatedFunctionHandler } from "../handlers/AuthenticatedFunctionHandler";
import { ContextInjectingHandler } from "../handlers/ContextInjectingHandler";
import { SystemHandler } from "../handlers/SystemHandler";

import { SendSMSFunctionHandler } from "./SendSMSFunctionHandler";

interface SendSMSFunctionHandlerPropTypes {
    uid: string;
}

@injectable()
export class SendSMSFunctionHandlerFactory {
    private functionConfig = Config.sendSMS;

    @inject(TYPES.AuthHelper)
    private authHelper!: AuthHelper;

    @inject(TYPES.AdviceRepository)
    private adviceRepository!: AdviceRepository;

    @inject(TYPES.FirestoreRoles)
    private roles!: FirestoreRoles;

    @inject(TYPES.SMSConfig)
    private smsConfig!: SMSConfig;

    @inject(TYPES.SentSMSRepository)
    private sentSMSRepository!: SentSMSRepository;

    @inject(TYPES.DynamicLinksAdapter)
    private dynamicLinksAdapter!: DynamicLinksAdapter;

    @inject(TYPES.SMSApiAdapter)
    private smsApiAdapter!: SMSApiAdapter;

    @inject(TYPES.DeepLinkBuilder)
    private deepLinkBuilder!: DeepLinkBuilder;

    private perPhoneNumberLimiter: FirebaseFunctionsRateLimiter;
    private perUserLimiter: FirebaseFunctionsRateLimiter;

    public constructor(@inject(TYPES.RateLimiterFactory) rateLimiterFactory: RateLimiterFactory) {
        this.perPhoneNumberLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perPhone);
        this.perUserLimiter = rateLimiterFactory.createRateLimiter(this.functionConfig.limits.perUser);
    }

    public makeHandler(): Handler<SendSMSFunction.Function> &
        SystemHandler<SendSMSFunction.Input, SendSMSFunction.Result> {
        const rawHandler = new SendSMSFunctionHandler({
            adviceRepository: this.adviceRepository,
            perPhoneNumberLimiter: this.perPhoneNumberLimiter,
            roles: this.roles,
            sentSMSRepository: this.sentSMSRepository,
            smsConfig: this.smsConfig,
            dynamicLinksAdapter: this.dynamicLinksAdapter,
            smsApiAdapter: this.smsApiAdapter,
            deepLinkBuilder: this.deepLinkBuilder,
        });

        const handlerWithContext = new ContextInjectingHandler<
            SendSMSFunction.Input,
            SendSMSFunctionHandlerPropTypes,
            SendSMSFunction.Result
        >(context => ({ uid: context.auth!.uid }), rawHandler);

        const authenticatedHandler = new AuthenticatedFunctionHandler({
            upstreamHandler: handlerWithContext,
            authHelper: this.authHelper,
            rateLimiter: this.perUserLimiter,
        });

        return new SystemHandler({ functionName: SendSMSFunction.NAME }, authenticatedHandler);
    }
}
