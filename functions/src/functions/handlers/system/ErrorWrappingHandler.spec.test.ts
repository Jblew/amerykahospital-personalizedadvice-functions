/* tslint:disable no-unused-expression no-console */

import * as functions from "firebase-functions";

import { _, expect, sinon } from "../../../_test/test_environment";
import { AdviceAlreadyImportedError } from "../../../error/AdviceAlreadyImportedError";

import { ErrorWrappingHandler } from "./ErrorWrappingHandler";

describe("ErrorWrappingHandler", function() {
    describe("handle", () => {
        class UpstreamHandler {
            public async handle(input: string, context: functions.https.CallableContext) {
                return input;
            }
        }

        it("Executes upstream handler", async () => {
            const upstream = new UpstreamHandler();
            upstream.handle = sinon.spy(upstream.handle);
            const ewh = new ErrorWrappingHandler(upstream);

            await ewh.handle("", {} as any);

            expect((upstream.handle as sinon.SinonSpy).callCount).to.be.equal(1);
        });

        it("Returns result value from upstream handler", async () => {
            const upstream = new UpstreamHandler();
            const ewh = new ErrorWrappingHandler(upstream);

            const resp = await ewh.handle("input-v", {} as any);

            expect(resp).to.be.equal("input-v");
        });

        it("Wraps classic error in SystemError", async () => {
            const sampleError = new Error("Some error");
            const upstream = new UpstreamHandler();
            upstream.handle = () => {
                throw sampleError;
            };
            const ewh = new ErrorWrappingHandler(upstream);

            await expect(ewh.handle("input-v", {} as any)).to.eventually.be.rejectedWith(/system error/);
        });

        it("Does not wrap firebase errors", async () => {
            const sampleError = AdviceAlreadyImportedError.make();
            const upstream = new UpstreamHandler();
            upstream.handle = () => {
                throw sampleError;
            };
            const ewh = new ErrorWrappingHandler(upstream);

            await expect(ewh.handle("input-v", {} as any)).to.eventually.be.rejectedWith(
                /advice has been already imported/,
            );
        });
    });
});
