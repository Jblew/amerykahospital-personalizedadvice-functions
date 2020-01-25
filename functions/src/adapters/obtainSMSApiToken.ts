// tslint:disable:no-console
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

import { FIREBASE_CONFIG } from "../settings";

const projectName = FIREBASE_CONFIG.projectId;
const secretName = "smsapi-token";
const secretPath = `projects/${projectName}/secrets/${secretName}/versions/latest`;

export async function obtainSMSApiToken(): Promise<string> {
    try {
        const client = new SecretManagerServiceClient();
        console.log("auth", client.auth);
        console.log("projectId", client.getProjectId());

        const [secrets] = await client.listSecrets({
            parent: `projects/${projectName}`,
        });

        secrets.forEach(secret => {
            // tslint:disable:no-console
            console.log(`${secret.name}`, secret);
        });

        const [accessResponse] = await client.accessSecretVersion({ name: secretPath });
        if (!accessResponse.payload) throw new Error("Payload is null");
        return accessResponse.payload.data!.toString();
    } catch (error) {
        throw new Error("Could not obtain smsapi token: " + error.message);
    }
}
