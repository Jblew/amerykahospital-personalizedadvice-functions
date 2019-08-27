import {
    AdviceRepository,
    SendSMSFunctionAbstractHandler,
    SentSMSRepository,
    SMSConfig,
} from "amerykahospital-personalizedadvice-businesslogic";
import FirestoreRoles from "firestore-roles";

import { DynamicLinksAdapter } from "../../adapters/DynamicLinksAdapter";
import { SMSApiAdapter } from "../../adapters/SMSApiAdapter";
import { AdviceAlreadyImportedError } from "../../error/AdviceAlreadyImportedError";
import { AdviceDoesNotExistError } from "../../error/AdviceDoesNotExistError";
import { InvalidInputDataError } from "../../error/InvalidInputDataError";
import { MissingPermissionError } from "../../error/MissingPermissionError";

export class SendSMSFunctionHandler extends SendSMSFunctionAbstractHandler {
    private smsConfig: SMSConfig;
    private adviceRepository: AdviceRepository;
    private sentSMSRepository: SentSMSRepository;
    private roles: FirestoreRoles;
    private smsApiAdapter: SMSApiAdapter;
    private dynamicLinksAdapter: DynamicLinksAdapter;
    private deepLinkBuilder: (inAppLink: string) => string;

    public constructor(p: {
        adviceRepository: AdviceRepository;
        roles: FirestoreRoles;
        sentSMSRepository: SentSMSRepository;
        smsConfig: SMSConfig;
        dynamicLinksAdapter: DynamicLinksAdapter;
        smsApiAdapter: SMSApiAdapter;
        deepLinkBuilder: (inAppLink: string) => string;
    }) {
        super();
        this.adviceRepository = p.adviceRepository;
        this.roles = p.roles;
        this.sentSMSRepository = p.sentSMSRepository;
        this.smsConfig = p.smsConfig;
        this.smsApiAdapter = p.smsApiAdapter;
        this.dynamicLinksAdapter = p.dynamicLinksAdapter;
        this.deepLinkBuilder = p.deepLinkBuilder;
    }

    protected getAdviceRepository(): AdviceRepository {
        return this.adviceRepository;
    }

    protected makeInvalidInputDataError(p: { advanced: string }) {
        return InvalidInputDataError.make(p.advanced);
    }

    protected makeAdviceDoesNotExistError(p: { advanced: string }) {
        return AdviceDoesNotExistError.make(p.advanced);
    }

    protected makeAdviceAlreadyImportedError() {
        return AdviceAlreadyImportedError.make();
    }

    protected async userHasRole(p: { uid: string; role: string }): Promise<boolean> {
        return this.roles.hasRole(p.uid, p.role);
    }

    protected makeMissingRoleError(p: { role: string }) {
        return MissingPermissionError.make(p.role);
    }

    protected getSentSMSRepository() {
        return this.sentSMSRepository;
    }

    protected sendSMS(props: { phoneNumber: string; message: string; fromName: string }): Promise<any> {
        return this.smsApiAdapter.sendMessage(props);
    }

    protected async obtainDeepLink(adviceLink: string): Promise<string> {
        const deepLink = this.deepLinkBuilder(adviceLink);
        return this.dynamicLinksAdapter.obtainShortUnguessableDynamicLinkFromFirebase(deepLink);
    }

    protected getSMSConfig() {
        return this.smsConfig;
    }
}
