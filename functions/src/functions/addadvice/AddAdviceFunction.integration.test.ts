/* tslint:disable no-unused-expression no-console */
import {
    Advice,
    AdvicesManager,
    FirebaseFunctionDefinitions,
    PendingAdvice,
    RoleKey,
} from "amerykahospital-personalizedadvice-core";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as admin from "firebase-admin";
import * as _ from "lodash";
import "mocha";
import "reflect-metadata";

import { constructAuthorizationContext, getSamplePendingAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import TYPES from "../../TYPES";

import { AddAdviceFunctionFactory } from "./AddAdviceFunctionFactory";

chaiUse(chaiAsPromised);

describe("AddAdviceFunction", function() {
    const env = new IntegrationTestsEnvironment();
    let functionHandler: FirebaseFunctionDefinitions.AddAdvice.Function;

    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        functionHandler = env
            .getContainer()
            .get<AddAdviceFunctionFactory>(TYPES.AddAdviceFunctionFactory)
            .getFunctionHandler();
    });
    afterEach(async () => await env.cleanupEach());

    describe("authorization checking", () => {
        it("throws if user is not authenticated", async () => {
            const context = await constructAuthorizationContext({ authorized: false });
            await expect(functionHandler(getSamplePendingAdvice(), context)).to.eventually.be.rejectedWith(
                /Please authenticate/,
            );
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(functionHandler(getSamplePendingAdvice(), context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const context = await constructAuthorizationContext({
                authorized: true,
                role: RoleKey.medicalprofessional,
                roles: env.getContainer().get(TYPES.FirestoreRoles),
            });
            await expect(functionHandler(getSamplePendingAdvice(), context)).to.eventually.be.fulfilled;
        });
    });

    describe("Advice validation", () => {
        ["patientName", "medicalprofessionalName", "parentPhoneNumber", "advice"].forEach(fieldName =>
            it("Fails to add advice with missing field " + fieldName, async () => {
                const context = await constructAuthorizationContext({
                    authorized: true,
                    role: RoleKey.medicalprofessional,
                    roles: env.getContainer().get(TYPES.FirestoreRoles),
                });
                const advice = _.omit(getSamplePendingAdvice(), fieldName) as PendingAdvice;
                await expect(functionHandler(advice, context)).to.eventually.be.rejectedWith(/Error/);
            }),
        );

        it("Fails to add advice with already specified id", async () => {
            const context = await constructAuthorizationContext({
                authorized: true,
                role: RoleKey.medicalprofessional,
                roles: env.getContainer().get(TYPES.FirestoreRoles),
            });
            const advice = getSamplePendingAdvice();
            (advice as any).id = "some-uid";
            await expect(functionHandler(advice, context)).to.eventually.be.rejectedWith(
                /Error: You cannot specify id/,
            );
        });
    });

    describe("Added advice", function() {
        const pendingAdvice = getSamplePendingAdvice();
        let addedAdvice: Advice;
        beforeEach(async () => {
            const context = await constructAuthorizationContext({
                authorized: true,
                role: RoleKey.medicalprofessional,
                roles: env.getContainer().get(TYPES.FirestoreRoles),
            });
            const { adviceId } = await functionHandler(pendingAdvice, context);
            const firestore = env.getContainer().get<admin.firestore.Firestore>(TYPES.Firestore);
            addedAdvice = (await AdvicesManager.getAdvice(adviceId, firestore as any))!;
        });

        it("All fields are added correctly", () => {
            expect(addedAdvice.advice).to.be.equal(pendingAdvice.advice);
            expect(addedAdvice.medicalprofessionalName).to.be.equal(pendingAdvice.medicalprofessionalName);
            expect(addedAdvice.parentPhoneNumber).to.be.equal(pendingAdvice.parentPhoneNumber);
            expect(addedAdvice.patientName).to.be.equal(pendingAdvice.patientName);
        });

        it("Has actual timestamp", () => {
            expect(addedAdvice.timestamp).to.be.approximately(Date.now() / 1000, 5);
        });

        it("Has id assigned", () => {
            expect(addedAdvice.id)
                .to.be.a("string")
                .with.length.greaterThan(0);
        });
    });
});
