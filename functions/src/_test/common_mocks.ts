import { Advice, PendingAdvice } from "amerykahospital-personalizedadvice-businesslogic";
import * as functions from "firebase-functions";
import FirestoreRoles, { AccountRecord } from "firestore-roles";
import * as uuid from "uuid/v4";

export async function constructAuthorizationContext(
    props: { authorized: false } | { authorized: true; role?: string; roles?: FirestoreRoles },
): Promise<functions.https.CallableContext> {
    if (!props.authorized) return { auth: {} } as functions.https.CallableContext;
    const account = await registerUserAndGrantRole({ uid: `uid_${uuid()}`, role: props.role, roles: props.roles });
    return {
        auth: {
            uid: account.uid,
        },
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

export async function registerUserAndGrantRole(props: {
    uid: string;
    role?: string;
    roles?: FirestoreRoles;
}): Promise<AccountRecord> {
    const account = getSampleAccount(props.uid);
    if (props.roles) {
        await props.roles!.registerUser(account);
    }
    if (props.role) {
        await props.roles!.enableRole(props.uid, props.role!);
    }
    return account;
}

export function getSamplePendingAdvice() {
    const advice: PendingAdvice = {
        patientName: "patient-" + uuid(),
        medicalprofessionalName: "medicalprofessional-" + uuid(),
        parentPhoneNumber: "123123123",
        advice: "advice-" + uuid(),
        evidenceHash: "randomevidencehash",
    };
    return advice;
}

export function getSampleAdvice() {
    const advice: Advice = {
        id: uuid(),
        patientName: "patient-" + uuid(),
        medicalprofessionalName: "medicalprofessional-" + uuid(),
        parentPhoneNumber: (Math.floor(Math.random() * 10 ** 9) + "").padStart(9, "0"),
        advice: "advice-" + uuid(),
        timestamp: Math.floor(Date.now() / 1000),
        evidenceHash: "randomevidencehash",
    };
    return advice;
}
