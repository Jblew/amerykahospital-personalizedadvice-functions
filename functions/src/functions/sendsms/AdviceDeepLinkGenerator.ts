import { Advice, FIREBASE_CONFIG } from "amerykahospital-personalizedadvice-core";

import { DynamicLinksAdapter } from "../../adapters/DynamicLinksAdapter";
import { i18n_pl } from "../../i18n_pl";
import { Log } from "../../Log";

export class AdviceDeepLinkGenerator {
    private log = Log.tag("AdviceDeepLinkGenerator");
    private dynamicLinksAdapter: DynamicLinksAdapter;

    public constructor(dynamicLinksAdapter: DynamicLinksAdapter) {
        this.dynamicLinksAdapter = dynamicLinksAdapter;
    }

    public async obtainDeepLink(adviceId: string): Promise<string> {
        const inAppLink = `${FIREBASE_CONFIG.websiteBaseUrl}advice/${adviceId}`;
        const link = this.dynamicLinksAdapter.buildLongDynamicLink(inAppLink);
        return await this.dynamicLinksAdapter.obtainShortUnguessableDynamicLinkFromFirebase(link);
    }

    public async generateDeepLinkMessage(advice: Advice): Promise<string> {
        const link = await this.obtainDeepLink(advice.id);
        const msg = i18n_pl.adviceSMSText
            .replace("$medicalProfessionalName", advice.medicalprofessionalName)
            .replace("$link", link);
        this.log.info("Sending message " + msg);
        return msg;
    }
}
