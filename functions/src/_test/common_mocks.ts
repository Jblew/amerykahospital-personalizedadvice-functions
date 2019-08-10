import FirestoreRoles, { AccountRecord } from "firestore-roles";

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
