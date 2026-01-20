const { createClient } = require('@sanity/client');

console.log("--- Debug Sanity Write (Hardcoded) ---");

// Values from .env view
const PROJECT_ID = 'stkv66mz';
const DATASET = 'production';
const TOKEN = 'sk4UHiX3LCmmtHfIG8yWzASJvhRIKzUnUWv1jIx18g5Dn07YnRw4i4SOxuCpXkZ6xMZXDXlANmwdzoK0QTwLNVCAoqsdYPkB9ixYAwYeSkqHUIx7ZbMIvHTMVNKOoIE14wbIzJbdkG2hpjMOKNgKyKMXWURB6tPYZzM6qdubZU6fd7xbrRIU';

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: TOKEN,
    useCdn: false,
});

async function run() {
    try {
        console.log("Connect to Project:", PROJECT_ID);
        console.log("Attempting to create a test document...");
        const doc = { _type: 'test_connectivity', title: 'Sanity Write Test', timestamp: new Date().toISOString() };
        const result = await client.create(doc);
        console.log("SUCCESS: Document created with ID:", result._id);

        console.log("Attempting to delete the test document...");
        await client.delete(result._id);
        console.log("SUCCESS: Document deleted.");
    } catch (error) {
        console.error("FAILURE: Operation failed.");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Status Code:", error.response.statusCode);
            console.error("Response Body:", JSON.stringify(error.response.body, null, 2));
        }
    }
}

run();
