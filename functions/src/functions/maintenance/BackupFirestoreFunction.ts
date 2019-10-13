// tslint:disable no-console
import { FIREBASE_CONFIG } from "@/settings";
import firestore from "@google-cloud/firestore";
import functions from "firebase-functions";

const backupConfig = FIREBASE_CONFIG.backup.firestore;
const bucket = `gs://${backupConfig.bucketName}`;
const schedule = backupConfig.schedule;

const client = new firestore.v1.FirestoreAdminClient();

export const backupFirestoreFunction = functions.pubsub.schedule(schedule).onRun(() => {
    const databaseName = client.databasePath(process.env.GCP_PROJECT, "(default)");

    return client
        .exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: [],
        })
        .then((responses: any) => {
            const response = responses[0];
            console.log(`Operation Name: ${response.name}`);
            return response;
        })
        .catch((err: Error) => {
            console.error(err);
            throw new Error("Export operation failed");
        });
});
