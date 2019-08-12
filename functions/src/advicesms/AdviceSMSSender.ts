import { Advice } from "amerykahospital-personalizedadvice-core";

export interface AdviceSMSSender {
    sendAdviceLinkSMS(advice: Advice): Promise<{ sentSMSId: string; message: string }>;
}
