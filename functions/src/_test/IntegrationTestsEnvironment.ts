// tslint:disable no-console
import * as firebase from "@firebase/testing";
import { Container } from "inversify";

import baseContainerFactory from "../inversify.config";
import TYPES from "../TYPES";

import firebaseTestAppFactory from "./FirebaseTestAppFactory";

export class IntegrationTestsEnvironment {
    private container: Container | undefined;

    public getContainer(): Container {
        return this.container!;
    }

    public prepareEach() {
        this.container = baseContainerFactory();
        this.container
            .rebind(TYPES.FirebaseAdminApp)
            .toDynamicValue(firebaseTestAppFactory)
            .inSingletonScope();
    }

    public async cleanupEach() {
        try {
            await Promise.all(firebase.apps().map(app => app.delete()));
        } catch (error) {
            console.warn("Warning: Error in firebase shutdown " + error);
        }
        this.container = undefined;
    }
}
