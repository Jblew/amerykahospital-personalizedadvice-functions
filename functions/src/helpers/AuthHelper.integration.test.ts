/* tslint:disable no-unused-expression no-console */
import * as firebase from "@firebase/testing";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as functions from "firebase-functions";
import { Container } from "inversify";
import * as _ from "lodash";
import "mocha";
import "reflect-metadata";
import * as uuid from "uuid/v4";

import firebaseTestAppFactory from "../_test/FirebaseTestAppFactory";
import baseContainerFactory from "../inversify.config";
import TYPES from "../TYPES";

import { AuthHelper } from "./AuthHelper";
import { RoleKey } from "amerykahospital-personalizedadvice-core";
import { registerUserAndGrantRole } from "../_test/common_mocks";

chaiUse(chaiAsPromised);

export async function cleanupEach() {
    try {
        await Promise.all(firebase.apps().map(app => app.delete()));
    } catch (error) {
        console.warn("Warning: Error in firebase shutdown " + error);
    }
}

describe("AuthHelper", function() {
    let container: Container | undefined;

    beforeEach(() => {
        container = baseContainerFactory();
        container
            .rebind(TYPES.FirebaseAdminApp)
            .toDynamicValue(firebaseTestAppFactory)
            .inSingletonScope();
    });

    afterEach(() => {
        container = undefined;
    });
    afterEach(cleanupEach);

    function constructAuthorizationContext(authorized: boolean): functions.https.CallableContext {
        return {
            auth: authorized
                ? {
                      uid: `uid_${uuid()}`,
                  }
                : {},
        } as functions.https.CallableContext;
    }

    describe("assertAuthenticated", () => {
        it("does not throw if user is authenticated", async () => {
            const authHelper: AuthHelper = container!.get(TYPES.AuthHelper);
            const context = constructAuthorizationContext(true);
            await expect(authHelper.assertAuthenticated(context)).to.eventually.be.fulfilled;
        });

        it("throws if user is not authenticated", async () => {
            const authHelper: AuthHelper = container!.get(TYPES.AuthHelper);
            const context = constructAuthorizationContext(false);
            await expect(authHelper.assertAuthenticated(context)).to.eventually.be.rejectedWith(/Please authenticate/);
        });
    });

    describe("assertUserIsMedicalProfessional", () => {
        it("throws if user is not authenticated", async () => {
            const authHelper: AuthHelper = container!.get(TYPES.AuthHelper);
            const context = constructAuthorizationContext(false);
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const authHelper: AuthHelper = container!.get(TYPES.AuthHelper);
            const context = constructAuthorizationContext(true);
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const authHelper: AuthHelper = container!.get(TYPES.AuthHelper);
            const context = constructAuthorizationContext(true);
            await registerUserAndGrantRole({
                uid: context.auth!.uid,
                role: RoleKey.medicalprofessional,
                roles: container!.get(TYPES.FirestoreRoles),
            });
            await expect(authHelper.assertUserIsMedicalProfessional(context)).to.eventually.be.fulfilled;
        });
    });
});
