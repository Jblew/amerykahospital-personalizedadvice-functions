/* tslint:disable no-unused-expression no-console */
import {
    AddAdviceFunction,
    Advice,
    AdviceRepository,
    PendingAdvice,
    RoleKey,
} from "amerykahospital-personalizedadvice-businesslogic";

import { constructAuthorizationContext, getSamplePendingAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import TYPES from "../../TYPES";

import { AddAdviceFunctionHandlerFactory } from "./AddAdviceFunctionHandlerFactory";

describe("AddAdviceFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let functionHandler: AddAdviceFunction.Function;
    let adviceRepository: AdviceRepository;

    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        functionHandler = env
            .getContainer()
            .get<AddAdviceFunctionHandlerFactory>(TYPES.AddAdviceFunctionHandlerFactory)
            .makeHandler().handle;

        adviceRepository = env.getContainer().get<AdviceRepository>(TYPES.AdviceRepository);
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
                await expect(functionHandler(advice, context)).to.eventually.be.rejectedWith(/Invalid input data/);
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
                /You cannot specify advice ID manually/,
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
            addedAdvice = (await adviceRepository.getAdvice(adviceId))!;
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
