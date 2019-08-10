import { PendingAdvice } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import FirestoreRoles, { AccountRecord } from "firestore-roles";
import * as uuid from "uuid/v4";

export function constructAuthorizationContext(authorized: boolean): functions.https.CallableContext {
    return {
        auth: authorized
            ? {
                  uid: `uid_${uuid()}`,
              }
            : {},
    } as functions.https.CallableContext;
}

export function getSampleAccount(uid: string): AccountRecord {
    return {
        uid,
        displayName: `sample-account-${uid}`,
        email: `${uid}@sample.sample`,
        providerId: "google",
        photoURL: null,
        phoneNumber: null,
    };
}

export async function registerUserAndGrantRole(props: { uid: string; role: string; roles: FirestoreRoles }) {
    await props.roles.registerUser(getSampleAccount(props.uid));
    await props.roles.enableRole(props.uid, props.role);
}

export function getSamplePendingAdvice() {
    const advice: PendingAdvice = {
        patientName: "patient-" + uuid(),
        medicalprofessionalName: "medicalprofessional-" + uuid(),
        parentPhoneNumber: "123123123",
        advice: "advice-" + uuid(),
    };
    return advice;
}
