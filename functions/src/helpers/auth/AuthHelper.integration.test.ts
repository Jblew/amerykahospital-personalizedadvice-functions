/* tslint:disable no-unused-expression no-console */
import { RoleKey } from "amerykahospital-personalizedadvice-businesslogic";

import { constructAuthorizationContext, registerUserAndGrantRole } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import TYPES from "../../TYPES";

import { AuthHelper } from "./AuthHelper";

describe("AuthHelper", function() {
    this.timeout(4000);
    const env = new IntegrationTestsEnvironment();

    beforeEach(async () => await env.prepareEach());
    afterEach(async () => await env.cleanupEach());

    describe("assertAuthenticated", () => {
        it("does not throw if user is authenticated", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(authHelper.assertAuthenticated(context)).to.eventually.be.fulfilled;
        });

        it("throws if user is not authenticated", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: false });
            await expect(authHelper.assertAuthenticated(context)).to.eventually.be.rejectedWith(/Please authenticate/);
        });
    });

    describe(`assertUserHasRole(${RoleKey.medicalprofessional})`, () => {
        it("throws if user is not authenticated", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: false });
            await expect(
                authHelper.assertUserHasRole(RoleKey.medicalprofessional, context),
            ).to.eventually.be.rejectedWith(/You are missing the following role/);
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(
                authHelper.assertUserHasRole(RoleKey.medicalprofessional, context),
            ).to.eventually.be.rejectedWith(/You are missing the following role/);
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: true });
            await registerUserAndGrantRole({
                uid: context.auth!.uid,
                role: RoleKey.medicalprofessional,
                roles: env.getContainer().get(TYPES.FirestoreRoles),
            });
            await expect(authHelper.assertUserHasRole(RoleKey.medicalprofessional, context)).to.eventually.be.fulfilled;
        });
    });
});
