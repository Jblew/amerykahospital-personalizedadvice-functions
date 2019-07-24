import { Advice, FirestoreCollections } from "amerykahospital-personalizedadvice-core";

import { AdviceDeepLinkGenerator } from "./AdviceDeepLinkGenerator";

export class AdviceLinkSender {
    public static async sendAdviceLinkToPatient(advice: Advice, firestore: FirebaseFirestore.Firestore) {
        const msg = await AdviceDeepLinkGenerator.generateDeepLinkMessage(advice);
        const sentMsg = {
            msg,
            advice,
        };
        await firestore.collection(FirestoreCollections.SENT_CODES_COLLECTION_KEY).add(sentMsg);
    }
}
