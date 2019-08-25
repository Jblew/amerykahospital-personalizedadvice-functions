import * as functions from "firebase-functions";

export interface AuthHelper {
    assertAuthenticated(context: functions.https.CallableContext): Promise<void>;
    assertUserHasRole(role: string, context: functions.https.CallableContext): Promise<void>;
}
