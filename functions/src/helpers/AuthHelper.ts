import { FirestoreCollections } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";

export class AuthHelper {
    public static async assertAuthenticated(context: functions.https.CallableContext) {
        if (!AuthHelper.isAuthenticated(context)) {
            throw new functions.https.HttpsError("permission-denied", "Please authenticate");
        }
    }

    public static async assertUserIsMedicalProfessional(
        context: functions.https.CallableContext,
        db: FirebaseFirestore.Firestore,
    ) {
        if (
            !context.auth ||
            !context.auth.uid ||
            !(await AuthHelper.isAuthenticatedMedicalProfessional(context.auth.uid, db))
        ) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "You must be a medical professional to access this function. Please contact system administrator",
            );
        }
    }

    private static isAuthenticated(
        context: functions.https.CallableContext,
    ): context is functions.https.CallableContext & { auth: { uid: string } } {
        return !!context.auth && !!context.auth.uid;
    }

    private static async isAuthenticatedMedicalProfessional(uid: string, db: FirebaseFirestore.Firestore) {
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
