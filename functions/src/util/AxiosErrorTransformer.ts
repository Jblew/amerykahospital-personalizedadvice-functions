import * as _ from "lodash";

export class AxiosErrorTransformer {
    public static async wrap<T>(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (error.response) {
                const resp = error.response;
                if (resp.data && resp.data.error) {
                    const errData = resp.data.error;
                    throw new Error(errData.message || JSON.stringify(errData));
                }
                const msg =
                    "Response error: " +
                    error.name +
                    ", message: " +
                    error.message +
                    ", error response: " +
                    JSON.stringify(error.response.data);
                const errObject: any = new Error(msg);
                errObject.response = { status: _.get(error, "response.status", 0) };

                throw errObject;
            } else throw error;
        }
    }
}
