import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { AddAdviceFunction } from "./functions/addadvice/AddAdviceFunction";

//
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

//
const addAdviceFunctionFactory = new AddAdviceFunction(db);
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = addAdviceFunctionFactory.getFunction();
