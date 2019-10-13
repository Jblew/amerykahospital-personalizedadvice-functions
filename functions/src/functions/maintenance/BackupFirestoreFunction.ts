// tslint:disable no-console
import firestore from "@google-cloud/firestore";
import functions from "firebase-functions";

import { Config } from "../../Config";

const bucket = `gs://${Config.backupFirestore.bucketName}`;
const schedule = Config.backupFirestore.schedule;

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
