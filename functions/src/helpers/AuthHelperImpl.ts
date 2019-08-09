// tslint:disable member-ordering
import { RoleKey } from "amerykahospital-personalizedadvice-core";
import * as functions from "firebase-functions";
import { FirestoreRoles } from "firestore-roles";
import { inject, injectable } from "inversify";

import { TYPES } from "../TYPES";

import { AuthHelper } from "./AuthHelper";

@injectable()
export class AuthHelperImpl implements AuthHelper {
    @inject(TYPES.FirestoreRoles)
    private roles!: FirestoreRoles;

    public async assertAuthenticated(context: functions.https.CallableContext) {
        if (!this.isAuthenticated(context)) {
            throw new functions.https.HttpsError("permission-denied", "Please authenticate");
        }
    }

    public async assertUserIsMedicalProfessional(context: functions.https.CallableContext) {
        const isAuthenticatedMP =
            context.auth && context.auth.uid && (await this.isAuthenticatedMedicalProfessional(context.auth.uid));
        if (!isAuthenticatedMP) {
            throw new functions.https.HttpsError(
                "permission-denied",
                "You must be a medical professional to access this function. Please contact system administrator",
            );
        }
    }

    private isAuthenticated(
        context: functions.https.CallableContext,
    ): context is functions.https.CallableContext & { auth: { uid: string } } {
        return !!context.auth && !!context.auth.uid;
    }

    private async isAuthenticatedMedicalProfessional(uid: string): Promise<boolean> {
        return await this.roles.hasRole(uid, RoleKey.medicalprofessional);
    }
}
