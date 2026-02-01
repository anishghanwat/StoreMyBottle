// Test API with proper UUIDs
const https = require('https');

const venueUUIDs = {
    'The Whiskey Bar': '62075002-e36f-47c6-ad2b-574bf81b6e92',
    'Club Paradise': '0121ee32-1d13-4885-8c6d-1f125f2f4846'
};

async function testEndpoint(path, description) {
    return new Promise((resolve) => {
        console.log(`\n🔍 Testing ${description}...`);
        console.log(`URL: https://storemybottle-backend.onrender.com${path}`);

        const startTime = Date.now();

        https.get(`https://storemybottle-backend.onrender.com${path}`, (res) => {
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
                            json.data.forEach((item, index) => {
                                if (item.name) {
                                    console.log(`  ${index + 1}. ${item.name} (ID: ${item.id})`);
                                } else if (item.brand) {
                                    console.log(`  ${index + 1}. ${item.brand} ${item.type} - $${item.price}`);
                                }
                            });
                        } else if (json.status) {
                            console.log(`📊 Status: ${json.status}`);
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
    console.log('🚀 Testing StoreMyBottle API with UUIDs');
    console.log('=======================================');

    await testEndpoint('/api/venues', 'Venues API');
    await testEndpoint(`/api/bottles/venue/${venueUUIDs['The Whiskey Bar']}`, 'Bottles for The Whiskey Bar');
    await testEndpoint(`/api/bottles/venue/${venueUUIDs['Club Paradise']}`, 'Bottles for Club Paradise');

    console.log('\n🏁 Testing complete!');
    console.log('\n📝 Venue UUIDs for frontend:');
    Object.entries(venueUUIDs).forEach(([name, id]) => {
        console.log(`  - ${name}: ${id}`);
    });
}

runTests();