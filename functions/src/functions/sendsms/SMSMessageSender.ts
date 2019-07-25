import { FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";

import { Log } from "../../Log";

export class SMSMessageSender {
    public static async sendSMS(phoneNumber: string, message: string, db: FirebaseFirestore.Firestore) {
        const result = "sending is pending";
        await SMSMessageSender.recordSMSSendinStatus(phoneNumber, message, db, result);
        return result;
    }

    private static async recordSMSSendinStatus(
        phoneNumber: string,
        message: string,
        db: FirebaseFirestore.Firestore,
        result: any,
    ) {
        const collectionName = FirestoreCollections.SENT_SMS_MESSAGES_COLLECTION_KEY;
        try {
            const resultRecord = {
                phoneNumber,
                message,
                result,
                timestamp: admin.firestore.Timestamp.now().seconds,
            };
            await db.collection(collectionName).add(resultRecord);
        } catch (error) {
            Log.log().warn("SMSMessageSender: could not record sms sending status", error);
        }
    }
}
