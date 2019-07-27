// tslint:disable prefer-const
import { FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";

import { SMSApiAdapter } from "../../adapters/SMSApiAdapter";
import { Config } from "../../Config";
import { Log } from "../../Log";

export class SMSMessageSender {
    public static async sendSMS(
        phoneNumber: string,
        message: string,
        db: FirebaseFirestore.Firestore,
    ): Promise<string> {
        let result: string = "";
        let error: string = "";
        try {
            const adapter = new SMSApiAdapter({ from: Config.sms.fromName });
            result = await adapter.sendMessage(phoneNumber, message);
        } catch (error) {
            Log.log().info("SMSMessageSender sending error", error);

            error = error + "";
        }
        await SMSMessageSender.recordSMSSendinStatus({ phoneNumber, message, result, error }, db);

        if (error) throw new Error(error);

        return result || "";
    }

    private static async recordSMSSendinStatus(
        params: {
            phoneNumber: string;
            message: string;
            result: any;
            error?: string;
        },
        db: FirebaseFirestore.Firestore,
    ) {
        const collectionName = FirestoreCollections.SENT_SMS_MESSAGES_COLLECTION_KEY;
        const resultRecord = {
            ...params,
            timestamp: admin.firestore.Timestamp.now().seconds,
        };
        try {
            await db.collection(collectionName).add(resultRecord);
        } catch (error) {
            Log.log().warn("SMSMessageSender: could not record sms sending status", error, { record: resultRecord });
        }
    }
}
