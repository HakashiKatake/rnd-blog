const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (!fs.existsSync(envPath)) return;
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                process.env[match[1].trim()] = match[2].trim();
            }
        });
    } catch (e) {
        console.error("Failed to load .env", e);
    }
}
loadEnv();

const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

async function testWrite() {
    console.log("Testing Sanity Write Access...");
    console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log("Token Present:", !!process.env.SANITY_API_TOKEN);

    try {
        const doc = {
            _type: 'test_doc',
            name: 'Sanity Write Test'
        };
        const res = await client.create(doc);
        console.log("Success! Created document:", res._id);

        // Cleanup
        await client.delete(res._id);
        console.log("Cleanup successful.");
    } catch (err) {
        console.error("Write failed:", err.message);
        if (err.response) {
            console.error("Status:", err.response.statusCode);
            console.error("Body:", err.response.body);
        }
    }
}

testWrite();
