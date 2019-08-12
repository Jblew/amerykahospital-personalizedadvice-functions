import { SMSApiAdapter } from "./SMSApiAdapter";

export class SMSApiAdapterMock implements SMSApiAdapter {
    public async sendMessage(phoneNumber: string, message: string): Promise<string> {
        throw new Error("Method mock");
    }
}
