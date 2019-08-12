/* tslint:disable no-unused-expression no-console */
import { AdviceManager, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import TYPES from "../../TYPES";

import { ImportAdviceToUserFunctionFactory } from "./ImportAdviceToUserFunctionFactory";

describe("ImportAdviceToUserFunction", function() {
    const env = new IntegrationTestsEnvironment();
    let functionHandler: FirebaseFunctionDefinitions.ImportAdviceToUser.Function;
    let adviceManager: AdviceManager;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        functionHandler = env
            .getContainer()
            .get<ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory)
            .getFunctionHandler();

        adviceManager = env.getContainer().get<AdviceManager>(TYPES.AdviceManager);
    });
    afterEach(async () => await env.cleanupEach());

    describe("authorization checking", () => {
        it("throws if user is not authenticated", async () => {
            const context = await constructAuthorizationContext({ authorized: false });
            const sampleAdvice = getSampleAdvice();
            await adviceManager.addAdvice(sampleAdvice);

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /Please authenticate/,
            );
        });
    });

    describe("Advice importing", () => {
        it("Allows to import advice that is not imported yet", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            const sampleAdvice = getSampleAdvice();
            await adviceManager.addAdvice(sampleAdvice);

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.fulfilled;
        });

        it("Sets advice uid to the calee's uid", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            const sampleAdvice = getSampleAdvice();
            await adviceManager.addAdvice(sampleAdvice);

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            const fetchedAdvice = await adviceManager.getAdvice(sampleAdvice.id);

            expect(fetchedAdvice!.uid).to.be.equal(context.auth!.uid);
        });

        it("Does not allow to import advice that is already imported", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            const sampleAdvice = getSampleAdvice();
            await adviceManager.addAdvice(sampleAdvice);

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /Advice has been already imported/,
            );
        });
    });
});
