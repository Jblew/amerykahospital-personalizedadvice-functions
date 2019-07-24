/* tslint:disable:max-classes-per-file no-console */
import * as FirebaseFunctionsTest from "firebase-functions-test";
import { Advice, FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import "mocha";
import * as uuid from "uuid/v4";

chaiUse(chaiAsPromised);

let currentFirebaseTest: { cleanup() };
function mock() {
    const firebaseTest = FirebaseFunctionsTest();
    currentFirebaseTest = firebaseTest;

    return {
        firebaseTest,
    };
}

afterEach(async () => {
    try {
        await currentFirebaseTest.cleanup();
    } catch (error) {
        console.warn("Warning: Error in firebase shutdown " + error);
    }
});

describe("Firebase functions", () => {
    describe("AddAdviceFunction", () => {});
});
