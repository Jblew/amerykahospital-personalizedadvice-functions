import { SMSApiAdapter } from "./SMSApiAdapter";

export class SMSApiAdapterMock implements SMSApiAdapter {
    public async sendMessage(props: { phoneNumber: string; message: string; fromName: string }): Promise<string> {
        throw new Error("Method mock");
    }
}
