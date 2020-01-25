import * as admin from "firebase-admin";
import * as inversify from "inversify";

import { FIREBASE_CONFIG } from "../settings";

export default (context: inversify.interfaces.Context) => admin.initializeApp(FIREBASE_CONFIG);
