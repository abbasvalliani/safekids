import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';

// AWS SDK v3. Credentials and region come from the same environment variables
// the v2 client used; an unset key pair falls back to the default provider chain.
const kms = new KMSClient({
    region: process.env.AWS_REGION,
    credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? {
                  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              }
            : undefined,
});

export class CryptoUtil {
    static async encrypt(plainText) {
        const { CiphertextBlob } = await kms.send(
            new EncryptCommand({
                KeyId: process.env.AWS_KMS_KEY_ID,
                Plaintext: Buffer.from(String(plainText)),
            }),
        );

        // store encrypted data as base64 encoded string
        return Buffer.from(CiphertextBlob).toString('base64');
    }

    static async decrypt(plainText) {
        const { Plaintext } = await kms.send(
            new DecryptCommand({
                CiphertextBlob: Buffer.from(plainText, 'base64'),
            }),
        );
        return Buffer.from(Plaintext).toString();
    }
}
