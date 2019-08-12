import ChainedError from "typescript-chained-error";

export interface SMSApiAdapter {
    sendMessage(phoneNumber: string, message: string): Promise<string>;
}

export namespace SMSApiAdapter {
    export class SMSApiError extends ChainedError {
        public constructor(message: string, cause?: Error) {
            super(message, cause);
        }
    }
}
