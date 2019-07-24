import { FIREBASE_CONFIG } from "amerykahospital-personalizedadvice-core";
import Axios from "axios";

import { AxiosErrorTransformer } from "../util/AxiosErrorTransformer";

export class DynamicLinksAdapter {
    public static buildLongDynamicLink(inAppLink: string): string {
        const url =
            FIREBASE_CONFIG.dynamicLinksBaseUrl + `?link=${inAppLink}` + `&apn=${FIREBASE_CONFIG.androidPackageName}`;
        return url;
    }

    public static async obtainShortUnguessableDynamicLinkFromFirebase(longDynamicLink: string): Promise<string> {
        const resp = await AxiosErrorTransformer.wrap(
            async () =>
                await Axios({
                    url: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + FIREBASE_CONFIG.apiKey,
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    data: {
                        longDynamicLink,
                        suffix: {
                            option: "UNGUESSABLE",
                        },
                    },
                }),
        );
        if (resp.status !== 200) throw new Error("Could not create dynamic link, status code = " + resp.status);
        return resp.data;
    }
}

export namespace DynamicLinksAdapter {}
