/* tslint:disable:max-classes-per-file no-console */
import { use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import "mocha";
import * as uuid from "uuid/v4";

import { SMSApiAdapter } from "./SMSApiAdapter";

chaiUse(chaiAsPromised);

function mock() {
    const adapter = new SMSApiAdapter({ test: true, from: "Test" });
    const phoneNumber = "508173995"; // (Math.floor(Math.random() * 1000000000) + "").padStart(9, "0");
    const message = `msg ${uuid()}`;
    return { adapter, phoneNumber, message };
}

describe("SMSApiAdapter", () => {
    it("Sends message without error", async () => {
        const { adapter, phoneNumber, message } = mock();

        await adapter.sendMessage(phoneNumber, message);
    });
});
