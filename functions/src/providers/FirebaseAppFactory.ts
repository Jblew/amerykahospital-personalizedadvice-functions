import * as admin from "firebase-admin";
import * as inversify from "inversify";
export default (context: inversify.interfaces.Context) => admin.initializeApp();
