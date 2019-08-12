import { Advice } from "amerykahospital-personalizedadvice-core";

import { AdviceSMSSender } from "./AdviceSMSSender";

export class AdviceSMSSenderMock implements AdviceSMSSender {
    public async sendAdviceLinkSMS(advice: Advice): Promise<{ sentSMSId: string; message: string }> {
        throw new Error("Method mock");
    }
}
