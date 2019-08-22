/* tslint:disable no-unused-expression no-console */
import { RoleKey } from "amerykahospital-personalizedadvice-core";

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

    describe("assertUserIsMedicalProfessional", () => {
        it("throws if user is not authenticated", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: false });
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const authHelper: AuthHelper = env.getContainer().get(TYPES.AuthHelper);
            const context = await constructAuthorizationContext({ authorized: true });
            await registerUserAndGrantRole({
                uid: context.auth!.uid,
                role: RoleKey.medicalprofessional,
                roles: env.getContainer().get(TYPES.FirestoreRoles),
            });
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.fulfilled;
        });
    });
});