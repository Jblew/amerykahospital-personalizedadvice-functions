// tslint:disable no-console
import firestore from "@google-cloud/firestore";
import Axios from "axios";
import * as functions from "firebase-functions";

import { FIREBASE_CONFIG } from "../../settings";

const backupConfig = FIREBASE_CONFIG.backup.firestore;
const bucket = `gs://${backupConfig.bucketName}`;
const schedule = backupConfig.schedule;
const cronHealthcheckService = FIREBASE_CONFIG.cronHealthcheckUrl;

const client = new firestore.v1.FirestoreAdminClient();

// based on: https://firebase.google.com/docs/firestore/solutions/schedule-export
export const backupFirestoreFunction = functions.pubsub.schedule(schedule).onRun(async () => {
    const databaseName = client.databasePath(process.env.GCP_PROJECT, "(default)");

    try {
        const exportResponses = await client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: [],
        });

        const response = exportResponses[0];
        console.log("Database export finished");
        console.log(`Operation Name: ${response.name}`);

        await Axios.get(cronHealthcheckService("success"));
        return response;
    } catch (err) {
        console.error(err);
        await Axios.get(cronHealthcheckService("failure"));
        throw new Error("Export operation failed");
    }
});
