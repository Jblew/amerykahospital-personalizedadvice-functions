/* tslint:disable no-unused-expression no-console */
import { Advice, AdviceRepository, ImportAdviceToUserFunction } from "amerykahospital-personalizedadvice-businesslogic";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import { AdviceAlreadyImportedError } from "../../error/AdviceAlreadyImportedError";
import { NotAuthenticatedError } from "../../error/NotAuthenticatedError";
import TYPES from "../../TYPES";

import { ImportAdviceToUserFunctionHandlerFactory } from "./ImportAdviceToUserFunctionHandlerFactory";

describe("ImportAdviceToUserFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let functionHandler: ImportAdviceToUserFunction.Function;
    let adviceRepository: AdviceRepository;
    let sampleAdvice: Advice;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        const handlerObj = env
            .getContainer()
            .get<ImportAdviceToUserFunctionHandlerFactory>(TYPES.ImportAdviceToUserFunctionHandlerFactory)
            .makeHandler();
        functionHandler = handlerObj.handle.bind(handlerObj);

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

            await expect(
                functionHandler({ adviceId: sampleAdvice.id }, context),
            ).to.eventually.be.rejected.with.satisfy(
                (e: NotAuthenticatedError) => e.details.type === NotAuthenticatedError.type,
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

            await expect(
                functionHandler({ adviceId: sampleAdvice.id }, context),
            ).to.eventually.be.rejected.with.satisfy(
                (e: AdviceAlreadyImportedError) => e.details.type === AdviceAlreadyImportedError.type,
            );
        });
    });
});
