/* tslint:disable no-unused-expression no-console */
import {
    Advice,
    AdviceRepository,
    FirebaseFunctionDefinitions,
    RoleKey,
} from "amerykahospital-personalizedadvice-core";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect, sinon } from "../../_test/test_environment";
import { AdviceSMSSenderMock } from "../../advicesms/AdviceSMSSenderMock.test";
import TYPES from "../../TYPES";

import { SendSMSFunctionFactory } from "./SendSMSFunctionFactory";

describe("SendSMSFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let functionHandler: FirebaseFunctionDefinitions.SendSMS.Function;
    const adviceSMSSenderMock: AdviceSMSSenderMock = new AdviceSMSSenderMock();
    let adviceRepository: AdviceRepository;
    let sampleAdvice: Advice;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        env.getContainer()
            .rebind(TYPES.AdviceSMSSender)
            .toConstantValue(adviceSMSSenderMock);
        functionHandler = env
            .getContainer()
            .get<SendSMSFunctionFactory>(TYPES.SendSMSFunctionFactory)
            .getFunctionHandler();

        adviceRepository = env.getContainer().get<AdviceRepository>(TYPES.AdviceRepository);
        adviceSMSSenderMock.sendAdviceLinkSMS = sinon.fake.resolves({ message: "message", sentSMSId: "sentSMSId" });
    });
    beforeEach(async () => {
        sampleAdvice = getSampleAdvice();
        await adviceRepository.addAdvice(sampleAdvice);
    });
    afterEach(async () => await env.cleanupEach());

    async function authenticatedAsMedicalProfessional() {
        return await constructAuthorizationContext({
            authorized: true,
            role: RoleKey.medicalprofessional,
            roles: env.getContainer().get(TYPES.FirestoreRoles),
        });
    }

    describe("authorization checking", () => {
        it("throws if user is not authenticated", async () => {
            const context = await constructAuthorizationContext({ authorized: false });

            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /Please authenticate/,
            );
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.rejectedWith(
                /You must be a medical professional/,
            );
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const context = await authenticatedAsMedicalProfessional();
            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.fulfilled;
        });
    });

    describe("SMS sending", () => {
        it("Calls adviceSMSSender.sendAdviceLinkSMS with proper advice", async () => {
            const context = await authenticatedAsMedicalProfessional();

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            const sendAdviceLinkSMSSpy = adviceSMSSenderMock.sendAdviceLinkSMS as sinon.SinonSpy;
            expect(sendAdviceLinkSMSSpy.callCount).to.be.equal(1);

            const advicePassedToSender = sendAdviceLinkSMSSpy.args[0][0] as Advice;
            expect(advicePassedToSender.id).to.be.equal(sampleAdvice.id);
            expect(advicePassedToSender.medicalprofessionalName).to.be.equal(sampleAdvice.medicalprofessionalName);
        });
    });
});
