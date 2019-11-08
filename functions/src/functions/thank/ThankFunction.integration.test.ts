/* tslint:disable no-unused-expression no-console */
import { Advice, AdviceRepository, ThankFunction } from "amerykahospital-personalizedadvice-businesslogic";
import * as uuid from "uuid/v4";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect } from "../../_test/test_environment";
import { NotAuthenticatedError } from "../../error/NotAuthenticatedError";
import TYPES from "../../TYPES";

import { ThankFunctionHandlerFactory } from "./ThankFunctionHandlerFactory";

describe("ThankFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let functionHandler: ThankFunction.Function;
    let adviceRepository: AdviceRepository;
    let sampleAdvice: Advice;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        const handlerObj = env
            .getContainer()
            .get<ThankFunctionHandlerFactory>(TYPES.ThankFunctionHandlerFactory)
            .makeHandler();
        functionHandler = handlerObj.handle.bind(handlerObj);

        adviceRepository = env.getContainer().get<AdviceRepository>(TYPES.AdviceRepository);
    });
    beforeEach(async () => {
        sampleAdvice = getSampleAdvice();
        sampleAdvice.uid = `sampleAdvice_uid_${uuid()}`;
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

    describe("Thank incrementing", () => {
        it("Sets thank to 1 after first invocation", async () => {
            const context = await constructAuthorizationContext({ authorized: true, uid: sampleAdvice.uid });

            const result = await functionHandler({ adviceId: sampleAdvice.id }, context);

            await expect(result.newThanksCount).to.be.eq(1);
        });

        it("Increments after next invocations", async () => {
            const context = await constructAuthorizationContext({ authorized: true, uid: sampleAdvice.uid });

            const noOfInvocations = _.random(2, 5);
            for (let i = 0; i < noOfInvocations; i++) {
                await functionHandler({ adviceId: sampleAdvice.id }, context);
            }
            const advice = await adviceRepository.getAdvice(sampleAdvice.id);
            await expect(advice!.thanksCount).to.be.eq(noOfInvocations);
        });
    });
});
