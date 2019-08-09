import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as inversify from "inversify";
export default (context: inversify.interfaces.Context) => admin.initializeApp(functions.config().firebase);
