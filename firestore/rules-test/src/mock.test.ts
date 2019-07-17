import * as firebase from "@firebase/testing";
import { Advice, FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import * as uuid from "uuid/v4";

export function mock(o: { clientAuth?: {} }) {
    const projectId = "unit-testing-" + Date.now();

    const clientAppConfig: any = { projectId };
    if (o.clientAuth) clientAppConfig.auth = o.clientAuth;
    const clientApp = firebase.initializeTestApp(clientAppConfig);
    const clientFirestore = clientApp.firestore();

    const adminApp = firebase.initializeAdminApp({ projectId });
    const adminFirestore = adminApp.firestore();

    function adminDoc(collection: string, doc: string) {
        return adminFirestore.collection(collection).doc(doc);
    }

    function clientDoc(collection: string, doc: string) {
        return clientFirestore.collection(collection).doc(doc);
    }

    async function markAsMedicalProfessional(uid: string) {
        return adminFirestore
            .collection(FirestoreCollections.MEDICALPROFESSIONAL_UIDS_COLLECTION)
            .doc(uid)
            .set({ mp: true });
    }

    return {
        projectId,
        clientApp,
        adminApp,
        clientFirestore,
        adminFirestore,
        adminDoc,
        clientDoc,
        markAsMedicalProfessional,
    };
}

export function sampleAdvice(uid?: string) {
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
