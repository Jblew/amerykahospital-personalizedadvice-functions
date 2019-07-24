/* tslint:disable:max-classes-per-file no-console */
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as functions from "firebase-functions";
import * as _ from "lodash";
import "mocha";

import { FunctionErrorWrapper } from "./FunctionErrorWrapper";

chaiUse(chaiAsPromised);

describe("FunctionErrorWrapper", () => {
    describe("wrap", () => {
        it("Wraps standard JS errors inside HttpsError", async () => {
            async function throwingFn() {
                const err = new Error("Some error");
                (err as any).identifyingProp = "v";
                throw err;
            }

            await expect(FunctionErrorWrapper.wrap(async () => throwingFn()))
                .to.eventually.be.rejectedWith("Error")
                .that.haveOwnProperty("code");
        });

        it("Rethrows HttpsError errors", async () => {
            async function throwingFn() {
                const err = new functions.https.HttpsError("unknown", "SomeHttpsError");

                (err as any).identifyingProp = "v";
                throw err;
            }

            await expect(FunctionErrorWrapper.wrap(async () => throwingFn()))
                .to.eventually.be.rejectedWith("SomeHttpsError")
                .that.haveOwnProperty("identifyingProp");
        });
    });
});
