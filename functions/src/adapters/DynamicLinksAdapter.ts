import { FIREBASE_CONFIG } from "amerykahospital-personalizedadvice-core";
import Axios from "axios";
import { injectable } from "inversify";

import { Log } from "../Log";
import { AxiosErrorTransformer } from "../util/AxiosErrorTransformer";

@injectable()
export class DynamicLinksAdapter {
    private log = Log.tag("DynamicLinksAdapter");

    public buildLongDynamicLink(inAppLink: string): string {
        const url =
            FIREBASE_CONFIG.dynamicLinksBaseUrl + `?link=${inAppLink}` + `&apn=${FIREBASE_CONFIG.androidPackageName}`;
        return url;
    }

    public async obtainShortUnguessableDynamicLinkFromFirebase(longDynamicLink: string): Promise<string> {
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

        if (resp.data && resp.data.shortLink) {
            return resp.data.shortLink;
        } else {
            this.log.error("Malformed response from firebase dynamic links", resp.data);
            throw new Error("Malformed response from firebase dynamic links");
        }
    }
}
