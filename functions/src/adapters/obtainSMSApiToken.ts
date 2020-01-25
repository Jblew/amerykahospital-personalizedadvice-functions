import {SecretManagerServiceClient} from "@google-cloud/secret-manager";
const client = new SecretManagerServiceClient();

export async function obtainSMSApiToken(): Promise<string> {
    try {
        const [accessResponse] =  await client.accessSecretVersion({ name: "smsapi-token" });
        if (!accessResponse.payload) throw new Error("Payload is null");
        return accessResponse.payload.data!.toString();
    } catch (error) {
        throw new Error("Could not obtain smsapi token: " + error.message);
    }
}