import { Advice, FIREBASE_CONFIG } from "amerykahospital-personalizedadvice-core";

import { DynamicLinksAdapter } from "../../adapters/DynamicLinksAdapter";
import { i18n_pl } from "../../i18n_pl";
import { Log } from "../../Log";

export class AdviceDeepLinkGenerator {
    public static async obtainDeepLink(adviceId: string): Promise<string> {
        const inAppLink = `${FIREBASE_CONFIG.websiteBaseUrl}advice/${adviceId}`;
        const link = DynamicLinksAdapter.buildLongDynamicLink(inAppLink);
        return await DynamicLinksAdapter.obtainShortUnguessableDynamicLinkFromFirebase(link);
    }

    public static async generateDeepLinkMessage(advice: Advice): Promise<string> {
        const link = await AdviceDeepLinkGenerator.obtainDeepLink(advice.id);
        const msg = i18n_pl.adviceSMSText
            .replace("$medicalProfessionalName", advice.medicalprofessionalName)
            .replace("$link", link);
        Log.log().info("Sending message " + msg);
        return msg;
    }
}
