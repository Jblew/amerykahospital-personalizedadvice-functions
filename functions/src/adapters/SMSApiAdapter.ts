// tslint:disable max-classes-per-file
import * as functions from "firebase-functions";
import ow from "ow";
import * as smsapi from "smsapi";
import ChainedError from "typescript-chained-error";

import { Log } from "../Log";

export class SMSApiAdapter {
    private smsApi: smsapi;
    private test: boolean;
    private from: string;

    public constructor(props: { test?: boolean; from: string }) {
        this.test = props.test || false;
        this.from = props.from;
        ow(this.test, "SMSApiAdapter.props.test", ow.boolean);
        ow(this.from, "SMSApiAdapter.props.from", ow.string);

        this.smsApi = this.constructApi();
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
            .from(this.from)
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

    private constructApi() {
        const smsapiToken = this.obtainToken();
        ow(smsapiToken, "SMSApiAdapter smsapiToken", ow.string);

        return new smsapi({
            oauth: {
                accessToken: smsapiToken,
            },
        });
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
