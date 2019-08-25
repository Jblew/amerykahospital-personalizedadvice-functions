// tslint:disable member-ordering
import * as functions from "firebase-functions";
import { FirestoreRoles } from "firestore-roles";
import { inject, injectable } from "inversify";

import { MissingPermissionError } from "../../error/MissingPermissionError";
import { NotAuthenticatedError } from "../../error/NotAuthenticatedError";
import { TYPES } from "../../TYPES";

import { AuthHelper } from "./AuthHelper";

@injectable()
export class AuthHelperImpl implements AuthHelper {
    @inject(TYPES.FirestoreRoles)
    private roles!: FirestoreRoles;

    public async assertAuthenticated(context: functions.https.CallableContext) {
        if (!this.isAuthenticated(context)) {
            throw NotAuthenticatedError.make();
        }
    }

    public async assertUserHasRole(roleKey: string, context: functions.https.CallableContext) {
        const isAuthenticatedMP = context.auth && context.auth.uid && (await this.hasRole(roleKey, context.auth.uid));
        if (!isAuthenticatedMP) {
            throw MissingPermissionError.make(roleKey);
        }
    }

    private isAuthenticated(
        context: functions.https.CallableContext,
    ): context is functions.https.CallableContext & { auth: { uid: string } } {
        return !!context.auth && !!context.auth.uid;
    }

    private async hasRole(role: string, uid: string): Promise<boolean> {
        return await this.roles.hasRole(uid, role);
    }
}
