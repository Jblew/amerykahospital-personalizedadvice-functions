// tslint:disable no-console

import { Advice } from "amerykahospital-personalizedadvices-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FirebaseFunctionsRateLimiter } from "firebase-functions-rate-limiter";

import { AuthHelper } from "./helpers/AuthHelper";
import { AddAdviceFunction } from "./logic/AddAdviceFunction";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.addAdvice = functions.region("europe-west2").https.onCall(async (data, context) => {
    const isMedicalProfessional =
        context.auth &&
        context.auth.uid &&
        (await AuthHelper.isAuthenticatedMedicalProfessional(context.auth.uid, db as any));

    if (!isMedicalProfessional) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only medicalprofessional accounts can access this function",
        );
    }

    try {
        await AddAdviceFunction.addAdvice(data as Advice, db as any);
    } catch (e) {
        console.error(e);
        throw new functions.https.HttpsError("internal", "Error while adding advice: " + e);
    }
});

exports.testRateLimiter = functions.https.onRequest(async (req, res) => {
    console.log("Limiter.isQuotaExceededOrRecordCall");
    const limiter = new FirebaseFunctionsRateLimiter(
        { firebaseCollectionKey: "rate_limiter_collection", maxCallsPerPeriod: 2, periodSeconds: 15, debug: true },
        db,
    );
    console.log("Limiter should have debug enabled");
    const quotaExceeded = await limiter.isQuotaExceededOrRecordCall();
    if (quotaExceeded) {
        res.send("Sorry, quota exceeded");
        return;
    }

    res.send("Function called");
});
