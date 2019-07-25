// tslint:disable max-classes-per-file
import * as functions from "firebase-functions";
import * as smsapi from "smsapi";
import ChainedError from "typescript-chained-error";

import { Config } from "../Config";
import { Log } from "../Log";

export class SMSApiAdapter {
    private smsApi: smsapi;
    private test: boolean;

    public constructor(props: { test?: boolean }) {
        this.test = props.test || false;
        const smsapiToken = this.obtainToken();

        this.smsApi = new smsapi({
            oauth: {
                accessToken: smsapiToken,
            },
        });
    }

    public async sendMessage(phoneNumber: string, message: string): Promise<string> {
        Log.log().info("Begin SMSApi send", { phoneNumber, message });

        let result: smsapi.BatchSendResult;
        try {
            result = await this.buildQuery(phoneNumber, message).execute();
            Log.log().info("SMSApi response", result);
        } catch (error) {
            Log.log().info("SMSApi error", error);

            throw new SMSApiAdapter.SMSApiError("Could not send sms: " + JSON.stringify(error), error);
        }
        return this.processResult(result);
    }

    private buildQuery(phoneNumber: string, message: string): smsapi.MessageBuilder {
        const builder = this.smsApi.message
            .sms()
            .normalize()
            .from(Config.sms.fromName)
            .to(phoneNumber)
            .message(message);

        if (this.test) return builder.test();
        else return builder;
    }

    private processResult(result: smsapi.BatchSendResult): string {
        if ("error" in result) {
            throw new SMSApiAdapter.SMSApiError("Could not send sms: " + result.message);
        } else return `Sent ${result.count} messages`;
    }

    private obtainToken(): string {
        if (this.test) return "-test-token-";
        return functions.config().smsapi.oauthtoken;
    }
}

export namespace SMSApiAdapter {
    export class SMSApiError extends ChainedError {
        public constructor(message: string, cause?: Error) {
            super(message, cause);
        }
    }
}
