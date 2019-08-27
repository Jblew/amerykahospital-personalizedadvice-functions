/* tslint:disable no-unused-expression no-console */

import * as functions from "firebase-functions";

import { _, expect, sinon } from "../../_test/test_environment";

import { SystemHandler } from "./SystemHandler";

describe("SystemHandler", function() {
    describe("handle", () => {
        class UpstreamHandler {
            public async handle(input: string, context: functions.https.CallableContext) {
                return "";
            }
        }

        function mock() {
            const upstreamHandler = new UpstreamHandler();
            const handler = new SystemHandler<string, string>({ functionName: "mock" }, upstreamHandler);
            return { handler, upstreamHandler };
        }

        it("Calls upstream handle", async () => {
            const { handler, upstreamHandler } = mock();
            upstreamHandler.handle = sinon.spy(upstreamHandler.handle);
            const input = "sample input";
            const context = { auth: { uid: "someuid" } };
            await handler.handle(input, context as any);

            expect((upstreamHandler.handle as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((upstreamHandler.handle as sinon.SinonSpy).firstCall.args[0]).to.be.equal(input);
            expect((upstreamHandler.handle as sinon.SinonSpy).firstCall.args[1]).to.be.equal(context);
        });
    });
});
