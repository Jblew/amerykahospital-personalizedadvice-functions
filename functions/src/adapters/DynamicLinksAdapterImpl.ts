import Axios from "axios";
import { inject, injectable } from "inversify";

import { Log } from "../Log";
import { FirebaseConfig } from "../settings";
import TYPES from "../TYPES";
import { AxiosErrorTransformer } from "../util/AxiosErrorTransformer";

import { DynamicLinksAdapter } from "./DynamicLinksAdapter";

@injectable()
export class DynamicLinksAdapterImpl implements DynamicLinksAdapter {
    @inject(TYPES.FirebaseConfig)
    private firebaseConfig!: FirebaseConfig;

    private log = Log.tag("DynamicLinksAdapter");

    public async obtainShortUnguessableDynamicLinkFromFirebase(longDynamicLink: string): Promise<string> {
        const resp = await AxiosErrorTransformer.wrap(
            async () =>
                await Axios({
                    url: "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + this.firebaseConfig.apiKey,
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
