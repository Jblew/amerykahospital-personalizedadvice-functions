import * as functions from "firebase-functions";

import { AuthHelper } from "./AuthHelper";

export class AuthHelperMock implements AuthHelper {
    public async assertAuthenticated(context: functions.https.CallableContext) {
        throw new Error("This is a mock");
    }

    public async assertUserHasRole(role: string, context: functions.https.CallableContext) {
        throw new Error("This is a mock");
    }
}
