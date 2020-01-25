// tslint:disable no-console
import * as admin from "firebase-admin";
import * as inversify from "inversify";

import { FIREBASE_CONFIG } from "../settings";

console.log("Initialized admin app with credentials", FIREBASE_CONFIG);
export default (context: inversify.interfaces.Context) =>
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
