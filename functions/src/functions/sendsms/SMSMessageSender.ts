// tslint:disable prefer-const
import { FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";

import { SMSApiAdapter } from "../../adapters/SMSApiAdapter";
import { Config } from "../../Config";
import { Log } from "../../Log";

export class SMSMessageSender {
    private log = Log.tag("SMSMessageSender");
    private db: admin.firestore.Firestore;

    public constructor(db: admin.firestore.Firestore) {
        this.db = db;
    }

    public async sendSMS(phoneNumber: string, message: string): Promise<string> {
        let result: string = "";
        let error: string = "";
        try {
            const adapter = new SMSApiAdapter({ from: Config.sms.fromName });
            result = await adapter.sendMessage(phoneNumber, message);
        } catch (error) {
            this.log.info("SMSMessageSender sending error", error);

            error = error + "";
        }
        await this.recordSMSSendinStatus({ phoneNumber, message, result, error });

        if (error) throw new Error(error);

        return result || "";
    }

    private async recordSMSSendinStatus(params: { phoneNumber: string; message: string; result: any; error?: string }) {
        const collectionName = FirestoreCollections.SENT_SMS_MESSAGES_COLLECTION_KEY;
        const resultRecord = {
            ...params,
            timestamp: admin.firestore.Timestamp.now().seconds,
        };
        try {
            await this.db.collection(collectionName).add(resultRecord);
        } catch (error) {
            this.log.warn("SMSMessageSender: could not record sms sending status", error, { record: resultRecord });
        }
    }
}
