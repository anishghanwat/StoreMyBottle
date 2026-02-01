// Test the specific bottles by venue endpoint
const https = require('https');

async function testBottlesEndpoint(venueId) {
    return new Promise((resolve) => {
        const url = `https://storemybottle-backend.onrender.com/api/bottles/venue/${venueId}`;
        console.log(`\n🔍 Testing bottles for venue ${venueId}...`);
        console.log(`URL: ${url}`);

        const startTime = Date.now();

        https.get(url, (res) => {
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
                            console.log(`📊 Found ${json.data.length} bottles`);
                            json.data.forEach(bottle => {
                                console.log(`  - ${bottle.brand} (${bottle.type}) - $${bottle.price}`);
                            });
                        }
                    } else {
                        console.log('❌ Error Response:');
                        console.log(JSON.stringify(json, null, 2));
                    }
                } catch (e) {
                    console.log('❌ Invalid JSON Response:');
                    console.log(data.substring(0, 200));
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
    console.log('🍾 Testing Bottles API by Venue');
    console.log('================================');

    await testBottlesEndpoint(1); // The Whiskey Bar
    await testBottlesEndpoint(2); // Club Paradise

    console.log('\n🏁 Testing complete!');
}

runTests();