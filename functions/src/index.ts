// tslint:disable no-console

import { Advice } from "amerykahospital-personalizedadvices-core";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FirebaseFunctionsRateLimiter } from "firebase-functions-rate-limiter";

import { AuthHelper } from "./helpers/AuthHelper";
import { AddAdviceFunction } from "./logic/AddAdviceFunction";

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const perUserlimiter = new FirebaseFunctionsRateLimiter(
    {
        firebaseCollectionKey: "per_user_limiter",
        maxCallsPerPeriod: 2,
        periodSeconds: 15,
    },
    db,
);
exports.authenticatedFunction = functions.region("europe-west2").https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.uid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Please authenticate",
        );
    }
    const uidQualifier = "u_" + context.auth.uid;
    const isQuotaExceeded = await perUserlimiter.isQuotaExceededOrRecordCall(uidQualifier);
    if (isQuotaExceeded) {
        throw new functions.https.HttpsError(
            "resource-exhausted",
            "Call quota exceeded for this user. Try again later",
        );
    }

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


const limiter = new FirebaseFunctionsRateLimiter(
    {
        firebaseCollectionKey: "rate_limiter_collection",
        maxCallsPerPeriod: 2,
        periodSeconds: 15,
    },
    db,
);
exports.testRateLimiter = functions.https.onRequest(async (req, res) => {
    console.log("Limiter.isQuotaExceededOrRecordCall");
    console.log("Limiter should have debug enabled");
    const quotaExceeded = await limiter.isQuotaExceededOrRecordCall();
    if (quotaExceeded) {
        res.send("Sorry, quota exceeded");
        return;
    }

    res.send("Function called");
});
