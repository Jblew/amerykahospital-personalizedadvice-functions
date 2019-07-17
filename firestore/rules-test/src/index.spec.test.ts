/* tslint:disable:max-classes-per-file no-console */
import * as firebase from "@firebase/testing";
import { Advice, FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import "mocha";
import * as uuid from "uuid/v4";

import { mock, sampleAdvice } from "./mock.test";

chaiUse(chaiAsPromised);

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
                const { adminDoc, clientDoc } = mock({ clientAuth: undefined });
                await adminDoc(collName, "doc").set(sampleAdvice(`user${uuid()}`));

                await expect(clientDoc(collName, "doc").get()).to.eventually.be.rejectedWith("false");
            });

            it("Is allowed when advice belongs to user", async () => {
                const uid = `user${uuid()}`;
                const { adminDoc, clientDoc } = mock({ clientAuth: { uid } });
                await adminDoc(collName, "doc").set(sampleAdvice(uid));

                await expect(clientDoc(collName, "doc").get()).to.eventually.be.fulfilled.and.be.an("object");
            });

            it("Is not allowed when advice belongs to different user", async () => {
                const { uid1, uid2 } = { uid1: `user${uuid()}`, uid2: `user${uuid()}` };
                const { adminDoc, clientDoc } = mock({ clientAuth: { uid: uid2 } });
                await adminDoc(collName, "doc").set(sampleAdvice(uid1));

                await expect(clientDoc(collName, "doc").get()).to.eventually.be.rejectedWith("false");
            });

            it("Is allowed when advice does not belong to a user and authenticated", async () => {
                const uid = `user${uuid()}`;
                const { adminDoc, clientDoc } = mock({ clientAuth: { uid } });
                await adminDoc(collName, "doc").set(sampleAdvice());

                await expect(clientDoc(collName, "doc").get()).to.eventually.be.fulfilled.and.be.an("object");
            });

            it("Is not allowed when advice does not belong to a user and not authenticated", async () => {
                const { adminDoc, clientDoc } = mock({ clientAuth: undefined });
                await adminDoc(collName, "doc").set(sampleAdvice(`user${uuid()}`));

                await expect(clientDoc(collName, "doc").get()).to.eventually.be.rejectedWith("false");
            });
        });

        describe("list", () => {
            it("Authenticated user can list own advices", async () => {
                const { uid1, uid2 } = { uid1: `user${uuid()}`, uid2: `user${uuid()}` };
                const adviceForU1 = sampleAdvice(uid1);
                const adviceForU2 = sampleAdvice(uid2);
                const { adminDoc, clientFirestore } = mock({ clientAuth: { uid: uid2 } });
                await adminDoc(collName, "adviceForU1").set(adviceForU1);
                await adminDoc(collName, "adviceForU2").set(adviceForU2);

                const advices = (await clientFirestore
                    .collection(collName)
                    .where("uid", "==", uid2)
                    .get()).docs.map(doc => doc.data() as Advice);

                expect(advices)
                    .to.be.an("array")
                    .with.length(1);
                expect(advices[0].advice).to.be.equal(adviceForU2.advice);
            });

            it("Medical professional can list all advices", async () => {
                const { uid1, uid2 } = { uid1: `user${uuid()}`, uid2: `user${uuid()}` };
                const adviceForU1 = sampleAdvice(uid1);
                const adviceForU2 = sampleAdvice(uid2);
                const pendingAdvice = sampleAdvice();
                const { adminDoc, clientFirestore, markAsMedicalProfessional, adminFirestore } = mock({
                    clientAuth: { uid: uid2 },
                });
                await adminDoc(collName, "adviceForU1").set(adviceForU1);
                await adminDoc(collName, "adviceForU2").set(adviceForU2);
                await adminDoc(collName, "pendingAdvice").set(pendingAdvice);
                await markAsMedicalProfessional(uid2);

                const advices = (await clientFirestore.collection(collName).get()).docs.map(
                    doc => doc.data() as Advice,
                );

                expect(advices)
                    .to.be.an("array")
                    .with.length(3);
            });

            it("Authenticated user cannot list pending advices", async () => {
                const uid = `user${uuid()}`;
                const pendingAdvice = sampleAdvice();
                const { adminDoc, clientFirestore } = mock({
                    clientAuth: { uid },
                });
                await adminDoc(collName, "pendingAdvice").set(pendingAdvice);

                expect(clientFirestore.collection(collName).get()).to.eventually.be.rejectedWith("false");
            });

            it("Non authenticated user can list nothing", async () => {
                const { adminFirestore, clientFirestore } = mock({ clientAuth: undefined });
                for (let i = 0; i < 5; i++) {
                    await adminFirestore
                        .collection(collName)
                        .doc(`doc${i}`)
                        .set(sampleAdvice());
                }

                await expect(clientFirestore.collection(collName).get()).to.eventually.be.rejectedWith("false");
            });
        });

        describe("create", () => {
            it("Is not allowed when user is not authenticated", async () => {
                const { clientFirestore } = mock({ clientAuth: undefined });

                await expect(
                    clientFirestore
                        .collection(collName)
                        .doc("doc")
                        .set({ da: "ta" }),
                ).to.eventually.be.rejectedWith("false");
            });

            it("Is not allowed when user is not medical professional but is authenticated", async () => {
                const uid = `user${uuid()}`;
                const { clientFirestore } = mock({ clientAuth: { uid } });

                await expect(
                    clientFirestore
                        .collection(collName)
                        .doc("doc")
                        .set({ da: "ta" }),
                ).to.eventually.be.rejectedWith("false");
            });

            it("Is allowed when user is a medical professional", async () => {
                const uid = `user${uuid()}`;
                const { clientFirestore, markAsMedicalProfessional } = mock({ clientAuth: { uid } });
                await markAsMedicalProfessional(uid);

                await expect(
                    clientFirestore
                        .collection(collName)
                        .doc("doc")
                        .set({ da: "ta" }),
                ).to.eventually.be.fulfilled;
            });
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
