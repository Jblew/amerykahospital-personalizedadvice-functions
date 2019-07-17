import { FirestoreCollections } from "amerykahospital-personalizedadvices-core";

export class AuthHelper {
    public static async isAuthenticatedMedicalProfessional(uid: string, db: firebase.firestore.Firestore) {
        const medicalprofessionalDoc = await db
            .collection(FirestoreCollections.MEDICALPROFESSIONAL_UIDS_COLLECTION)
            .doc(uid)
            .get();
        return !!medicalprofessionalDoc;
    }

    private constructor() {
        /* */
    }
}
