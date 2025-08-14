require('dotenv').config();
const fetch = require('node-fetch');

async function getCurrentElections() {
    try {
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        console.log('🗳️ Getting current elections...');
        
        const url = `https://www.googleapis.com/civicinfo/v2/elections?key=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const data = await response.json();
        console.log(`✅ Elections API Response received`);
        
        const elections = data.elections || [];
        console.log(`\n📊 AVAILABLE ELECTIONS:`);
        console.log('======================');
        
        elections.forEach(election => {
            console.log(`\n🗳️  ID: ${election.id}`);
            console.log(`📅 Name: ${election.name}`);
            console.log(`📅 Date: ${election.electionDay}`);
            console.log(`📍 Divisions: ${election.ocdDivisionId || 'N/A'}`);
        });
        
        // Now try the most recent election for 98106
        if (elections.length > 0) {
            const latestElection = elections[elections.length - 1];
            console.log(`\n🔍 Testing ballot lookup with election ID: ${latestElection.id}`);
            await testBallotWithElection(latestElection.id);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testBallotWithElection(electionId) {
    try {
        const address = 'Seattle, WA 98106';
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
                   `key=${apiKey}&` +
                   `address=${encodeURIComponent(address)}&` +
                   `electionId=${electionId}&` +
                   `returnAllAvailableData=true`;
        
        console.log(`🌐 Looking up ballot for ${address} in election ${electionId}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error(`❌ Ballot API Error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const data = await response.json();
        
        const contests = data.contests || [];
        console.log(`\n🏛️ CONTESTS FOR 98106:`);
        console.log('=====================');
        
        if (contests.length === 0) {
            console.log('No contests found for this address in this election.');
        } else {
            contests.forEach(contest => {
                console.log(`\n📋 Office: ${contest.office || 'Unknown Office'}`);
                console.log(`📍 District: ${contest.district?.name || 'N/A'}`);
                console.log(`👥 Candidates:`);
                
                const candidates = contest.candidates || [];
                candidates.forEach(candidate => {
                    console.log(`   • ${candidate.name} (${candidate.party || 'No Party'})`);
                });
            });
        }
        
    } catch (error) {
        console.error('❌ Ballot lookup error:', error.message);
    }
}

getCurrentElections();