/* tslint:disable:max-classes-per-file no-console */
import * as firebase from "@firebase/testing";
import { FirestoreCollections, Advice } from "amerykahospital-personalizedadvice-core";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import * as uuid from "uuid/v4";
import * as BluebirdPromise from "bluebird";
import "mocha";

chaiUse(chaiAsPromised);

function mock(o: { auth?: {} }) {
    const projectId = "unit-testing-" + Date.now();

    const clientAppConfig: any = { projectId };
    if (o.auth) clientAppConfig.auth = o.auth;
    const clientApp = firebase.initializeTestApp(clientAppConfig);
    const clientFirestore = clientApp.firestore();

    const adminApp = firebase.initializeAdminApp({ projectId });
    const adminFirestore = adminApp.firestore();
    return { projectId, clientApp, adminApp, clientFirestore, adminFirestore };
}

function sampleAdvice(uid?: string) {
    const advice: Advice = {
        id: uuid(),
        patientName: "patient-" + uuid(),
        medicalprofessionalName: "medicalprofessional-" + uuid(),
        parentPhoneNumber: "123123123",
        dateISO: new Date().toISOString(),
        advice: "advice-" + uuid(),
    };
    if (uid) advice.uid = uid; // firebase catches the difference between undefined and nonexistent attr
    return advice;
}

afterEach(async () => {
    try {
        await Promise.all(firebase.apps().map(app => app.delete()));
    } catch (error) {
        console.warn("Warning: Error in firebase shutdown " + error);
    }
});

describe("Firebase rules", () => {
    describe("Collection " + FirestoreCollections.ADVICES_COLLECTION_KEY, () => {
        const collName = FirestoreCollections.ADVICES_COLLECTION_KEY;
        describe("get", () => {
            it("Is not allowed when user is not authenticated", async () => {
                const { adminFirestore, clientFirestore } = mock({ auth: undefined });
                await adminFirestore
                    .collection(collName)
                    .doc("doc")
                    .set(sampleAdvice());

                await expect(
                    clientFirestore
                        .collection(collName)
                        .doc("doc")
                        .get(),
                ).to.eventually.be.rejectedWith("FirebaseError");
            });

            it.skip("Is allowed when advice belongs to user");
            it.skip("Is allowed when advice belongs to different user");
            it.skip("Is allowed when advice does not belong to a user and authenticated");
            it.skip("Is not allowed when advice does not belong to a user and not authenticated");
            it.skip("Is allowed when user is not authenticated");
        });

        describe("list", () => {
            it.skip("Lists only advices that belongs to a specific user");
            it.skip("Medical professional can list all advices");
            it.skip("Authenticated user can not list pending advices");
            it("Non authenticated user can not list anything", async () => {
                const { adminFirestore, clientFirestore } = mock({ auth: undefined });
                for (let i = 0; i < 5; i++) {
                    await adminFirestore
                        .collection(collName)
                        .doc(`doc${i}`)
                        .set(sampleAdvice());
                }

                await expect(clientFirestore.collection(collName).get()).to.eventually.be.rejectedWith("FirebaseError");
            });
        });

        describe("create", () => {
            it.skip("Is not allowed when user is not authenticated");
            it.skip("Is not allowed when user is not medical professional but is authenticated");
            it.skip("Is allowed when user is a medical professional");
        });

        describe("update", () => {
            it.skip("Is not allowed when user is not authenticated");
            it.skip("Is not allowed when user is not medical professional but is authenticated");
            it.skip("Is allowed when user is a medical professional");
            it.skip("Is not allowed when advice belongs to a user and authenticated");
            it.skip("Is allowed when advice does not belong to any user and authenticated");
        });
    });

    describe("Collection " + FirestoreCollections.MEDICALPROFESSIONAL_UIDS_COLLECTION, () => {
        it.skip("Everybody can list");
    });

    describe("Collection " + FirestoreCollections.SENT_CODES_COLLECTION_KEY, () => {
        /* */
    });
});
