/* tslint:disable no-unused-expression no-console */

import { Advice, FIREBASE_CONFIG, SentSMSRepository } from "amerykahospital-personalizedadvice-core";

import { getSampleAdvice } from "../_test/common_mocks";
import { IntegrationTestsEnvironment } from "../_test/IntegrationTestsEnvironment";
import { _, expect, sinon } from "../_test/test_environment";
import { SMSApiAdapter } from "../adapters/SMSApiAdapter";
import { SMSApiAdapterMock } from "../adapters/SMSApiAdapterMock.test";
import TYPES from "../TYPES";

import { AdviceSMSSender } from "./AdviceSMSSender";

describe("AdviceSMSSender", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();
    let adviceSMSSender: AdviceSMSSender;
    let sampleAdvice: Advice;
    const smsApiAdapterMock = new SMSApiAdapterMock();

    beforeEach(async () => await env.prepareEach());
    beforeEach(() => {
        env.getContainer()
            .rebind<SMSApiAdapter>(TYPES.SMSApiAdapter)
            .toConstantValue(smsApiAdapterMock);
        adviceSMSSender = env.getContainer().get<AdviceSMSSender>(TYPES.AdviceSMSSender);
        sampleAdvice = getSampleAdvice();
        smsApiAdapterMock.sendMessage = sinon.spy();
    });
    afterEach(async () => await env.cleanupEach());

    it("Calls SMSApiAdapter.sendMessage", async () => {
        await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);
        expect((smsApiAdapterMock.sendMessage as sinon.SinonSpy).callCount).to.be.equal(1);
    });

    it("Calls SMSApiAdapter.sendMessage with correct phoneNumber", async () => {
        await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);
        expect((smsApiAdapterMock.sendMessage as sinon.SinonSpy).args[0][0]).to.be.equal(
            sampleAdvice.parentPhoneNumber,
        );
    });

    it("Includes advice deep link in the message", async () => {
        await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);
        const msg = (smsApiAdapterMock.sendMessage as sinon.SinonSpy).args[0][1];
        expect(msg).to.include(FIREBASE_CONFIG.dynamicLinksBaseUrl);
    });

    it("Includes medicalprofessional name in the message", async () => {
        await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);
        const msg = (smsApiAdapterMock.sendMessage as sinon.SinonSpy).args[0][1];
        expect(msg).to.include(sampleAdvice.medicalprofessionalName);
    });

    it("Returns sent sms id and the contents of the message", async () => {
        const { sentSMSId, message } = await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);
        expect(sentSMSId)
            .to.be.a("string")
            .with.length.gt(0);

        const msgSentToApiAdapter = (smsApiAdapterMock.sendMessage as sinon.SinonSpy).args[0][1];
        expect(message).to.be.equal(msgSentToApiAdapter);
    });

    it("Records successfully sent message in firestore", async () => {
        const { sentSMSId, message } = await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice);

        const sentSMSRepository = env.getContainer().get<SentSMSRepository>(TYPES.SentSMSRepository);
        const fetchedSentSMS = await sentSMSRepository.get(sentSMSId);
        expect(fetchedSentSMS!.message).to.be.equal(message);
    });

    it("Records sending error firestore", async () => {
        smsApiAdapterMock.sendMessage = () => {
            throw new Error("custom-error");
        };

        const { sentSMSId } = await adviceSMSSender.sendAdviceLinkSMS(sampleAdvice, false);

        const sentSMSRepository = env.getContainer().get<SentSMSRepository>(TYPES.SentSMSRepository);
        const fetchedSentSMS = await sentSMSRepository.get(sentSMSId);

        expect(fetchedSentSMS!.error)
            .to.be.a("string")
            .that.match(/custom-error/);
    });
});
