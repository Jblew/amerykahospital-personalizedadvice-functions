/* tslint:disable no-unused-expression no-console */
import { Advice, AdviceRepository, FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import TYPES from "../../TYPES";

import { ImportAdviceToUserFunctionFactory } from "./ImportAdviceToUserFunctionFactory";

describe("ImportAdviceToUserFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let functionHandler: FirebaseFunctionDefinitions.ImportAdviceToUser.Function;
    let adviceRepository: AdviceRepository;
    let sampleAdvice: Advice;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        functionHandler = env
            .getContainer()
            .get<ImportAdviceToUserFunctionFactory>(TYPES.ImportAdviceToUserFunctionFactory)
            .getFunctionHandler();

        adviceRepository = env.getContainer().get<AdviceRepository>(TYPES.AdviceRepository);
    });
    beforeEach(async () => {
        sampleAdvice = getSampleAdvice();
        await adviceRepository.addAdvice(sampleAdvice);
    });
    afterEach(async () => await env.cleanupEach());

    describe("authorization checking", () => {
        it("throws if user is not authenticated", async () => {
            const context = await constructAuthorizationContext({ authorized: false });

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /Please authenticate/,
            );
        });
    });

    describe("Advice importing", () => {
        it("Allows to import advice that is not imported yet", async () => {
            const context = await constructAuthorizationContext({ authorized: true });

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.fulfilled;
        });

        it("Sets advice uid to the calee's uid", async () => {
            const context = await constructAuthorizationContext({ authorized: true });

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            const fetchedAdvice = await adviceRepository.getAdvice(sampleAdvice.id);

            expect(fetchedAdvice!.uid).to.be.equal(context.auth!.uid);
        });

        it("Does not allow to import advice that is already imported", async () => {
            const context = await constructAuthorizationContext({ authorized: true });

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /This advice has been already imported/,
            );
        });
    });
});
