const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env');
console.log("Loading .env from:", envPath);
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) process.env[match[1].trim()] = match[2].trim();
    });
} else {
    console.error("No .env file found!");
}

const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false
};

console.log("Config:", {
    ...config,
    token: config.token ? `${config.token.substring(0, 5)}...` : 'MISSING'
});

const client = createClient(config);

async function test() {
    try {
        console.log("Attempting to create doc...");
        const res = await client.create({ _type: 'sanity_test_doc', name: 'Test' });
        console.log("Success! Created:", res._id);
        await client.delete(res._id);
        console.log("Deleted test doc.");
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("StatusCode:", err.response.statusCode);
        }
    }
}

test();
