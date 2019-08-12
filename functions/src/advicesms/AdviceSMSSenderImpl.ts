import { Advice, FIREBASE_CONFIG, PendingSentSMS, SentSMSRepository } from "amerykahospital-personalizedadvice-core";
import { inject, injectable } from "inversify";

import { DynamicLinksAdapter } from "../adapters/DynamicLinksAdapter";
import { SMSApiAdapter } from "../adapters/SMSApiAdapter";
import { i18n_pl } from "../i18n_pl";
import { Log } from "../Log";
import TYPES from "../TYPES";

import { AdviceSMSSender } from "./AdviceSMSSender";

@injectable()
export class AdviceSMSSenderImpl implements AdviceSMSSender {
    private log = Log.tag("AdviceSMSSenderImpl");
    @inject(TYPES.DynamicLinksAdapter) private dynamicLinksAdapter!: DynamicLinksAdapter;
    @inject(TYPES.SentSMSRepository) private sentSMSRepository!: SentSMSRepository;
    @inject(TYPES.SMSApiAdapter) private smsApiAdapter!: SMSApiAdapter;

    public async sendAdviceLinkSMS(
        advice: Advice,
        throwOnError: boolean = true,
    ): Promise<{ sentSMSId: string; message: string }> {
        const message = await this.generateDeepLinkMessage(advice);
        return await this.sendSMS(advice.parentPhoneNumber, message, throwOnError);
    }

    private async sendSMS(
        phoneNumber: string,
        message: string,
        throwOnError: boolean,
    ): Promise<{ sentSMSId: string; message: string }> {
        let caughtError: Error | undefined;
        let result: string = "";
        try {
            result = await this.smsApiAdapter.sendMessage(phoneNumber, message);
        } catch (error) {
            this.log.error("Error while sending sms", error);
            caughtError = error;
        }
        const sentSMSId = await this.addSentSMSToRegistry({
            phoneNumber,
            message,
            result: result || "-",
            ...(caughtError ? { error: caughtError.message } : {}),
        });

        if (caughtError && throwOnError) throw caughtError;

        return { sentSMSId, message };
    }

    private async obtainDeepLink(adviceId: string): Promise<string> {
        const inAppLink = `${FIREBASE_CONFIG.websiteBaseUrl}advice/${adviceId}`;
        const link = this.dynamicLinksAdapter.buildLongDynamicLink(inAppLink);
        return await this.dynamicLinksAdapter.obtainShortUnguessableDynamicLinkFromFirebase(link);
    }

    private async generateDeepLinkMessage(advice: Advice): Promise<string> {
        const link = await this.obtainDeepLink(advice.id);
        const msg = i18n_pl.adviceSMSText
            .replace("$medicalProfessionalName", advice.medicalprofessionalName)
            .replace("$link", link);

        this.log.info("Generated deep link message " + msg);
        return msg;
    }

    private async addSentSMSToRegistry(sentSMS: PendingSentSMS): Promise<string> {
        this.log.info("SMS sending result", JSON.stringify(sentSMS));
        const { id } = await this.sentSMSRepository.add(sentSMS);
        return id;
    }
}
