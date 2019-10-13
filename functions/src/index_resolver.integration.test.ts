/* tslint:disable no-unused-expression no-console */
import { IntegrationTestsEnvironment } from "./_test/IntegrationTestsEnvironment";
import { expect } from "./_test/test_environment";
import { resolveAddAdvice, resolveHeartbeat, resolveImportAdviceToUser, resolveSendSMS } from "./index_resolver";

describe("index_resolver", function() {
    this.timeout(4000);

    const env = new IntegrationTestsEnvironment();

    beforeEach(async () => await env.prepareEach());
    afterEach(async () => await env.cleanupEach());

    it("AddAdvice is resolved properly", () => {
        const resolvedFunction = resolveAddAdvice(env.getContainer());
        expect(resolvedFunction).to.not.be.undefined;
    });

    it("SendSMS is resolved properly", () => {
        const resolvedFunction = resolveSendSMS(env.getContainer());
        expect(resolvedFunction).to.not.be.undefined;
    });

    it("ImportAdviceToUser is resolved properly", () => {
        const resolvedFunction = resolveImportAdviceToUser(env.getContainer());
        expect(resolvedFunction).to.not.be.undefined;
    });

    it("Heartbeat is resolved properly", () => {
        const resolvedFunction = resolveHeartbeat(env.getContainer());
        expect(resolvedFunction).to.not.be.undefined;
    });
});
