require('dotenv').config();
const fetch = require('node-fetch');

async function test98106General() {
    try {
        const address = 'Seattle, WA 98106';
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        console.log(`🔍 Looking up general ballot info for: ${address}`);
        
        // Try without electionId to get general information
        const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
                   `key=${apiKey}&` +
                   `address=${encodeURIComponent(address)}&` +
                   `returnAllAvailableData=true`;
        
        console.log(`🌐 Making request to Google Civic API...`);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error('Error details:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log(`✅ API Response received`);
        
        // Show normalized address
        if (data.normalizedInput) {
            console.log(`📍 Normalized Address: ${data.normalizedInput.line1}, ${data.normalizedInput.city}, ${data.normalizedInput.state} ${data.normalizedInput.zip}`);
        }
        
        // Show election info
        if (data.election) {
            console.log(`📅 Election: ${data.election.name}`);
            console.log(`📅 Date: ${data.election.electionDay}`);
        }
        
        // Show polling locations
        if (data.pollingLocations && data.pollingLocations.length > 0) {
            console.log(`\n🗳️ POLLING LOCATIONS:`);
            data.pollingLocations.forEach((location, index) => {
                console.log(`${index + 1}. ${location.address.locationName || 'Polling Location'}`);
                console.log(`   ${location.address.line1}`);
                console.log(`   ${location.address.city}, ${location.address.state} ${location.address.zip}`);
            });
        }
        
        // Show contests and focus on House races
        const contests = data.contests || [];
        console.log(`\n🏛️ ALL CONTESTS FOR 98106:`);
        console.log('===========================');
        
        if (contests.length === 0) {
            console.log('No contests found for this address.');
            console.log('\n💡 This could mean:');
            console.log('   - No active elections at this time');
            console.log('   - Address needs to be more specific'); 
            console.log('   - Try with a full street address');
        } else {
            contests.forEach((contest, index) => {
                console.log(`\n${index + 1}. 📋 Office: ${contest.office || 'Unknown Office'}`);
                if (contest.district) {
                    console.log(`   📍 District: ${contest.district.name}`);
                }
                console.log(`   👥 Candidates:`);
                
                const candidates = contest.candidates || [];
                if (candidates.length === 0) {
                    console.log('      No candidates listed');
                } else {
                    candidates.forEach(candidate => {
                        console.log(`      • ${candidate.name} (${candidate.party || 'No Party'})`);
                        if (candidate.candidateUrl) {
                            console.log(`        🔗 ${candidate.candidateUrl}`);
                        }
                    });
                }
            });
        }
        
        // Try with a specific street address for better results
        console.log(`\n🔄 Trying with a specific street address...`);
        await testSpecificAddress();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testSpecificAddress() {
    try {
        const address = '1234 16th Ave SW, Seattle, WA 98106'; // Specific address in 98106
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
                   `key=${apiKey}&` +
                   `address=${encodeURIComponent(address)}&` +
                   `returnAllAvailableData=true`;
        
        console.log(`🔍 Testing with specific address: ${address}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.log(`❌ Specific address failed: ${response.status}`);
            return;
        }
        
        const data = await response.json();
        const contests = data.contests || [];
        
        console.log(`\n🏛️ CONTESTS WITH SPECIFIC ADDRESS:`);
        console.log('==================================');
        
        if (contests.length === 0) {
            console.log('No contests found even with specific address.');
        } else {
            const houseContests = contests.filter(contest => 
                contest.office && contest.office.toLowerCase().includes('house')
            );
            
            if (houseContests.length > 0) {
                console.log('🎯 HOUSE RACES FOUND:');
                houseContests.forEach(contest => {
                    console.log(`\n📋 ${contest.office}`);
                    console.log(`📍 District: ${contest.district?.name || 'N/A'}`);
                    contest.candidates?.forEach(candidate => {
                        console.log(`   • ${candidate.name} (${candidate.party || 'No Party'})`);
                    });
                });
            } else {
                console.log('No House contests found. All contests:');
                contests.forEach(contest => {
                    console.log(`- ${contest.office || 'Unknown Office'}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Specific address error:', error.message);
    }
}

test98106General();