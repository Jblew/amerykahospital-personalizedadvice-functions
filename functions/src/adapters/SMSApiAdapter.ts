import { LocalizedFirebaseFunctionsError } from "../error/LocalizedFirebaseFunctionsError";

export interface SMSApiAdapter {
    sendMessage(props: { phoneNumber: string; message: string; fromName: string }): Promise<string>;
}

export namespace SMSApiAdapter {
    export type SMSApiError = LocalizedFirebaseFunctionsError<typeof SMSApiError.type>;

    export namespace SMSApiError {
        export const type = "sms-api-error";

        const localizedMessage = {
            EN: "Error while sending SMS message",
            PL: "Wystąpił błąd podczas wysyłania wiadomości SMS",
        };

        export function make(advanced: string) {
            return LocalizedFirebaseFunctionsError.make({
                type,
                code: "unknown",
                advanced,
                localizedMessage,
            });
        }
    }
}
