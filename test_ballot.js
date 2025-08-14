require('dotenv').config();
const fetch = require('node-fetch');

async function testBallotLookup() {
    try {
        const address = 'Seattle, WA 98106';
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        console.log(`🔍 Looking up ballot for: ${address}`);
        console.log(`🔑 API Key: ${apiKey ? 'Present' : 'Missing'}`);
        
        const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
                   `key=${apiKey}&` +
                   `address=${encodeURIComponent(address)}&` +
                   `electionId=2000&` +
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
        
        // Extract house candidates
        const contests = data.contests || [];
        const houseContests = contests.filter(contest => 
            contest.office && contest.office.toLowerCase().includes('house')
        );
        
        console.log(`\n🏛️ HOUSE CANDIDATES FOR 98106 AREA:`);
        console.log(`=================================`);
        
        if (houseContests.length === 0) {
            console.log('No House contests found in this election data.');
            console.log('\nAll available contests:');
            contests.forEach(contest => {
                console.log(`- ${contest.office || 'Unknown Office'}`);
            });
        } else {
            houseContests.forEach(contest => {
                console.log(`\n📋 Office: ${contest.office}`);
                console.log(`📍 District: ${contest.district?.name || 'N/A'}`);
                console.log(`👥 Candidates:`);
                
                const candidates = contest.candidates || [];
                candidates.forEach(candidate => {
                    console.log(`   • ${candidate.name} (${candidate.party || 'No Party'})`);
                    if (candidate.candidateUrl) {
                        console.log(`     🔗 ${candidate.candidateUrl}`);
                    }
                });
            });
        }
        
        // Also show election info
        if (data.election) {
            console.log(`\n📅 Election: ${data.election.name}`);
            console.log(`📅 Date: ${data.election.electionDay}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBallotLookup();