declare module "smsapi" {
    class smsapi {
        constructor(options: smsapi.Options);

        proxy(proxy: any): any;

        message: smsapi.MessageBuilder;
    }

    namespace smsapi {
        export interface Options {
            oauth?: {
                accessToken?: string;
            };
        }

        export class MessageBuilder {
            sms(): MessageBuilder;
            from(fromName: string): MessageBuilder;
            to(phoneNumber: string): MessageBuilder;
            message(msg: string): MessageBuilder;
            test(): MessageBuilder;
            execute(): Promise<BatchSendResult>;
        }

        export type BatchSendResult = BatchSendResultSuccess | BatchSendResultError;

        export interface BatchSendResultSuccess {
            count: number;
            list: BatchSendResultSuccess.EntityResult[];
        }

        export namespace BatchSendResultSuccess {
            export interface EntityResult {
                id: string;
                points: number;
                number: string;
                date_sent: number;
                submitted_number: number;
                status: string;
            }
        }

        export interface BatchSendResultError {
            invalid_numbers: BatchSendResultError.EntityResult[];
            error: number;
            message: string;
        }

        export namespace BatchSendResultError {
            export interface EntityResult {
                number: string;
                submitted_number: string;
                message: string;
            }
        }

        export class ActionAbstract {
            constructor(options: any, params: any);

            clear(): any;

            execute(): void;

            param(name: any, value: any): any;

            params(params: any): any;

            request(): any;
        }

        export class ActionFactoryAbstract {
            constructor(options: any);

            createAction(Action: any, arg: any, ...args: any[]): any;
        }

        export class AuthenticationAbstract {
            constructor(options: any);

            getGETParams(): any;

            getHeaders(): any;

            login(login: any, password: any): void;

            logout(): void;

            proxy(proxy: any): any;
        }

        export class ProxyAbstract {
            constructor();

            request(): void;
        }

        export class Request {
            constructor(options: any);

            auth(auth: any): any;

            data(data: any): any;

            delete(path: any): any;

            execute(): any;

            file(file: any): any;

            get(path: any): any;

            json(json: any): any;

            path(path: any): any;

            post(path: any): any;

            put(path: any): any;
        }
    }

    export = smsapi;
}
