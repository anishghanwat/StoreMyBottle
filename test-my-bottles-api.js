// Test the my-bottles API endpoint
const https = require('https');

async function testMyBottlesAPI() {
    return new Promise((resolve) => {
        const url = 'https://storemybottle-backend.onrender.com/api/redemptions/my-bottles';
        console.log(`🔍 Testing My Bottles API...`);
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
                    console.log('Response structure:');
                    console.log(JSON.stringify(json, null, 2));

                    if (res.statusCode === 200) {
                        console.log('✅ API working');
                        if (json.data && Array.isArray(json.data)) {
                            console.log(`📊 Found ${json.data.length} bottles`);
                        } else if (Array.isArray(json)) {
                            console.log(`📊 Found ${json.length} bottles (direct array)`);
                        } else {
                            console.log('⚠️ Response is not an array - this might cause frontend .map() error');
                        }
                    } else {
                        console.log('❌ API Error');
                    }
                } catch (e) {
                    console.log('❌ Invalid JSON Response:');
                    console.log(data.substring(0, 500));
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

testMyBottlesAPI();