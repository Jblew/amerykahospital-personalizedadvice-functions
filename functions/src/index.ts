import { FirebaseFunctionDefinitions } from "amerykahospital-personalizedadvice-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { AddAdviceFunction } from "./functions/addadvice/AddAdviceFunction";
import { ImportAdviceToUserFunction } from "./functions/importadvicetouser/ImportAdviceToUserFunction";
import { SendSMSFunction } from "./functions/sendsms/SendSMSFunction";
import { Log } from "./Log";

Log.log().initialize();

//
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();
const realtimeDb = admin.database();

//
const addAdviceFunctionFactory = new AddAdviceFunction(firestore, realtimeDb);
exports[FirebaseFunctionDefinitions.AddAdvice.NAME] = addAdviceFunctionFactory.getFunction();

const sendSMSFunctionFactory = new SendSMSFunction(firestore, realtimeDb);
exports[FirebaseFunctionDefinitions.SendSMS.NAME] = sendSMSFunctionFactory.getFunction();

const importAdviceToUserFunctionFactory = new ImportAdviceToUserFunction(firestore, realtimeDb);
exports[FirebaseFunctionDefinitions.ImportAdviceToUser.NAME] = importAdviceToUserFunctionFactory.getFunction();
