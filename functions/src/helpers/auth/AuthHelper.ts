import * as functions from "firebase-functions";

export interface AuthHelper {
    assertAuthenticated(context: functions.https.CallableContext): Promise<void>;
    assertUserIsMedicalProfessional(context: functions.https.CallableContext): Promise<void>;
}
