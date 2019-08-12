/* tslint:disable:max-classes-per-file no-console */
import * as functions from "firebase-functions";

import { _, expect } from "../_test/test_environment";

import { FunctionErrorWrapper } from "./FunctionErrorWrapper";

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
