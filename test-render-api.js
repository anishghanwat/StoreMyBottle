// Simple script to test Render API endpoints
const https = require('https');

const baseUrl = 'https://storemybottle-backend.onrender.com';

async function testEndpoint(path, description) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing ${description}...`);
        console.log(`URL: ${baseUrl}${path}`);

        const startTime = Date.now();

        https.get(`${baseUrl}${path}`, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const duration = Date.now() - startTime;
                console.log(`Status: ${res.statusCode}`);
                console.log(`Duration: ${duration}ms`);

                try {
                    const json = JSON.parse(data);
                    if (res.statusCode === 200) {
                        console.log('✅ Success!');
                        if (json.data && Array.isArray(json.data)) {
                            console.log(`📊 Found ${json.data.length} records`);
                        } else if (json.status) {
                            console.log(`📊 Status: ${json.status}`);
                        }
                    } else {
                        console.log('❌ Error Response:');
                        console.log(JSON.stringify(json, null, 2));
                    }
                } catch (e) {
                    console.log('❌ Invalid JSON Response:');
                    console.log(data.substring(0, 200) + (data.length > 200 ? '...' : ''));
                }

                resolve();
            });
        }).on('error', (err) => {
            const duration = Date.now() - startTime;
            console.log(`❌ Network Error (${duration}ms):`, err.message);
            resolve();
        });
    });
}

async function runTests() {
    console.log('🚀 Testing StoreMyBottle Backend API');
    console.log('=====================================');

    await testEndpoint('/', 'Root endpoint');
    await testEndpoint('/api/health', 'Health check');
    await testEndpoint('/api/venues', 'Venues API');
    await testEndpoint('/api/bottles', 'Bottles API');

    console.log('\n🏁 Testing complete!');
}

runTests();