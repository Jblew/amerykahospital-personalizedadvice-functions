/* tslint:disable no-unused-expression no-console */

import { RoleKey } from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import FirebaseFunctionsRateLimiter from "firebase-functions-rate-limiter";

import { _, expect, sinon } from "../../_test/test_environment";
import { AuthHelperImpl } from "../../helpers/auth/AuthHelperImpl";

import { AuthenticatedFunctionHandler } from "./AuthenticatedFunctionHandler";

describe("AuthenticatedFunctionHandler", function() {
    describe("handle", () => {
        class UpstreamHandler {
            public async handle(input: string, context: functions.https.CallableContext) {
                return "";
            }
        }

        function mock(p: { requiredRole?: string }) {
            const authHelper = new AuthHelperImpl();
            const upstreamHandler = new UpstreamHandler();
            const rateLimiter = FirebaseFunctionsRateLimiter.mock();
            const handler = new AuthenticatedFunctionHandler<string, string>({
                authHelper,
                upstreamHandler,
                requiredRole: p.requiredRole,
                rateLimiter,
            });
            return { handler, authHelper, upstreamHandler, rateLimiter };
        }

        it("Throws on not authenticated", async () => {
            const { handler } = mock({});
            await expect(handler.handle("", { auth: { uid: undefined } } as any)).to.eventually.be.rejectedWith(
                /Please authenticate/,
            );
        });

        it("Calls upstream handle on authenticated", async () => {
            const { handler, upstreamHandler } = mock({});
            upstreamHandler.handle = sinon.spy(upstreamHandler.handle);
            await handler.handle("", { auth: { uid: "someuid" } } as any);

            expect((upstreamHandler.handle as sinon.SinonSpy).callCount).to.be.equal(1);
        });

        it("Performs role check when required role set", async () => {
            const { handler, authHelper } = mock({ requiredRole: RoleKey.medicalprofessional });
            authHelper.assertUserHasRole = sinon.spy();
            await handler.handle("", { auth: { uid: "someuid" } } as any);

            expect((authHelper.assertUserHasRole as sinon.SinonSpy).callCount).to.be.equal(1);
        });

        it("Does not perform role check when required role not set", async () => {
            const { handler, authHelper } = mock({});
            authHelper.assertUserHasRole = sinon.spy();
            await handler.handle("", { auth: { uid: "someuid" } } as any);

            expect((authHelper.assertUserHasRole as sinon.SinonSpy).callCount).to.be.equal(0);
        });

        it("Calls rateLimiter.rejectOnQuotaExceededOrRecordUsage with proper uid", async () => {
            const { handler, rateLimiter } = mock({});
            const uid = "someuid";
            rateLimiter.rejectOnQuotaExceededOrRecordUsage = sinon.spy();
            await handler.handle("", { auth: { uid } } as any);

            expect((rateLimiter.rejectOnQuotaExceededOrRecordUsage as sinon.SinonSpy).callCount).to.be.equal(1);
            expect((rateLimiter.rejectOnQuotaExceededOrRecordUsage as sinon.SinonSpy).firstCall.args[0]).to.be.equal(
                uid,
            );
        });
    });
});
