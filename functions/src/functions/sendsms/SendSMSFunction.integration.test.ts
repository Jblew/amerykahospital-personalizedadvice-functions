/* tslint:disable no-unused-expression no-console */
import { Advice, AdviceRepository, RoleKey, SendSMSFunction } from "amerykahospital-personalizedadvice-businesslogic";

import { constructAuthorizationContext, getSampleAdvice } from "../../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../../_test/IntegrationTestsEnvironment";
import { _, expect, sinon } from "../../_test/test_environment";
import { DynamicLinksAdapterMock } from "../../adapters/DynamicLinksAdapterMock.test";
import { SMSApiAdapterMock } from "../../adapters/SMSApiAdapterMock.test";
import { MissingPermissionError } from "../../error/MissingPermissionError";
import { NotAuthenticatedError } from "../../error/NotAuthenticatedError";
import TYPES from "../../TYPES";

import { SendSMSFunctionHandlerFactory } from "./SendSMSFunctionHandlerFactory";

describe("SendSMSFunction", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    const smsApiAdapterMock = new SMSApiAdapterMock();
    const dynamicLinksAdapterMock = new DynamicLinksAdapterMock();
    let functionHandler: SendSMSFunction.Function;
    let adviceRepository: AdviceRepository;
    let sampleAdvice: Advice;
    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        env.getContainer()
            .rebind(TYPES.SMSApiAdapter)
            .toConstantValue(smsApiAdapterMock);
        env.getContainer()
            .rebind(TYPES.DynamicLinksAdapter)
            .toConstantValue(dynamicLinksAdapterMock);
        const handlerObj = env
            .getContainer()
            .get<SendSMSFunctionHandlerFactory>(TYPES.SendSMSFunctionHandlerFactory)
            .makeHandler();
        functionHandler = handlerObj.handle.bind(handlerObj);

        adviceRepository = env.getContainer().get<AdviceRepository>(TYPES.AdviceRepository);
        smsApiAdapterMock.sendMessage = sinon.fake.resolves("Result");
        dynamicLinksAdapterMock.obtainShortUnguessableDynamicLinkFromFirebase = sinon.fake.resolves("Fake deep link");
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
            await expect(
                functionHandler({ adviceId: sampleAdvice.id }, context),
            ).to.eventually.be.rejected.with.satisfy(
                (e: NotAuthenticatedError) => e.details.type === NotAuthenticatedError.type,
            );
        });

        it("throws if user is authenticated but not a medical professional", async () => {
            const context = await constructAuthorizationContext({ authorized: true });
            await expect(
                functionHandler({ adviceId: sampleAdvice.id }, context),
            ).to.eventually.be.rejected.with.satisfy(
                (e: MissingPermissionError) => e.details.type === MissingPermissionError.type,
            );
        });

        it("does not throw if user is authenticated and a medical professional", async () => {
            const context = await authenticatedAsMedicalProfessional();
            await expect(functionHandler({ adviceId: sampleAdvice.id }, context)).to.eventually.be.fulfilled;
        });
    });

    describe("SMS sending", () => {
        it("Calls smsApiAdapterMock.sendMessage with proper phoneNumber", async () => {
            const context = await authenticatedAsMedicalProfessional();

            await functionHandler({ adviceId: sampleAdvice.id }, context);

            const sendAdviceLinkSMSSpy = smsApiAdapterMock.sendMessage as sinon.SinonSpy;
            expect(sendAdviceLinkSMSSpy.callCount).to.be.equal(1);

            const props = sendAdviceLinkSMSSpy.args[0][0] as {
                phoneNumber: string;
                message: string;
                fromName: string;
            };
            expect(props.phoneNumber).to.be.equal(sampleAdvice.parentPhoneNumber);
        });
    });
});
