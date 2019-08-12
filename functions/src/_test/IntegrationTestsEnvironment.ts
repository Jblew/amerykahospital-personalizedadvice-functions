// tslint:disable no-console max-classes-per-file
import * as firebase from "@firebase/testing";
import {
    FirebaseFunctionsRateLimiter,
    FirebaseFunctionsRateLimiterConfiguration,
} from "firebase-functions-rate-limiter";
import { Container, injectable } from "inversify";

import { SMSApiAdapter } from "../adapters/SMSApiAdapter";
import { SMSApiAdapterMock } from "../adapters/SMSApiAdapterMock.test";
import baseContainerFactory from "../inversify.config";
import { RateLimiterFactory } from "../providers/RateLimiterFactory";
import TYPES from "../TYPES";

import firebaseTestAppFactory from "./FirebaseTestAppFactory";

export class IntegrationTestsEnvironment {
    private container: Container | undefined;

    public getContainer(): Container {
        return this.container!;
    }

    public prepareEach() {
        this.container = this.buildContainer();
    }

    public async cleanupEach() {
        try {
            await Promise.all(firebase.apps().map(app => app.delete()));
        } catch (error) {
            console.warn("Warning: Error in firebase shutdown " + error);
        }
        this.container = undefined;
    }

    private buildContainer() {
        const container = baseContainerFactory();
        container
            .rebind(TYPES.FirebaseAdminApp)
            .toDynamicValue(firebaseTestAppFactory)
            .inSingletonScope();
        container
            .rebind<RateLimiterFactory>(TYPES.RateLimiterFactory)
            .to(MockRateLimiterFactory)
            .inSingletonScope();
        container.rebind<SMSApiAdapter>(TYPES.SMSApiAdapter).toConstantValue(new SMSApiAdapterMock());
        return container;
    }
}

@injectable()
class MockRateLimiterFactory implements RateLimiterFactory {
    public createRateLimiter(props: FirebaseFunctionsRateLimiterConfiguration): FirebaseFunctionsRateLimiter {
        return FirebaseFunctionsRateLimiter.mock({ name: props.name });
    }
}
