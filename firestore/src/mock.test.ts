import * as firebase from "@firebase/testing";
import { Advice, RoleKey, RolesConfig } from "amerykahospital-personalizedadvice-core";
import FirestoreRoles from "firestore-roles";
import * as fs from "fs";
import * as path from "path";
import * as uuid from "uuid/v4";

const firestoreRules = fs.readFileSync(path.resolve(__dirname, "../deploy.firestore.rules"), "utf8");

export async function mock(o: { clientAuth?: {} }) {
    const projectId = "unit-testing-" + Date.now();

    const clientAppConfig: any = { projectId };
    if (o.clientAuth) clientAppConfig.auth = o.clientAuth;
    const clientApp = firebase.initializeTestApp(clientAppConfig);
    const clientFirestore = clientApp.firestore();

    await firebase.loadFirestoreRules({
        projectId,
        rules: firestoreRules,
    });

    const adminApp = firebase.initializeAdminApp({ projectId });
    const adminFirestore = adminApp.firestore();

    function adminDoc(collection: string, doc: string) {
        return adminFirestore.collection(collection).doc(doc);
    }

    function clientDoc(collection: string, doc: string) {
        return clientFirestore.collection(collection).doc(doc);
    }

    const adminRoles = new FirestoreRoles(RolesConfig, adminFirestore);

    async function markAsMedicalProfessional(uid: string) {
        return adminRoles.enableRole(uid, RoleKey.medicalprofessional);
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
        advice: "advice-" + uuid(),
        timestamp: Date.now() / 1000,
    };
    if (uid) advice.uid = uid; // firebase catches the difference between undefined and nonexistent attr
    return advice;
}
