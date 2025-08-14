require('dotenv').config();
const fetch = require('node-fetch');

async function find2024Election() {
    try {
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        console.log('🗳️ Searching for 2024 elections...');
        
        // Get all elections and look for 2024
        const electionsUrl = `https://www.googleapis.com/civicinfo/v2/elections?key=${apiKey}`;
        const electionsResponse = await fetch(electionsUrl);
        
        if (!electionsResponse.ok) {
            console.error(`❌ Elections API Error: ${electionsResponse.status}`);
            return;
        }
        
        const electionsData = await electionsResponse.json();
        const elections = electionsData.elections || [];
        
        console.log(`\n📊 SEARCHING THROUGH ${elections.length} ELECTIONS:`);
        console.log('===============================================');
        
        // Look for 2024 elections
        const elections2024 = elections.filter(election => 
            election.electionDay && election.electionDay.includes('2024')
        );
        
        console.log(`\n🎯 FOUND ${elections2024.length} ELECTIONS FROM 2024:`);
        elections2024.forEach(election => {
            console.log(`\n🗳️  ID: ${election.id}`);
            console.log(`📅 Name: ${election.name}`);
            console.log(`📅 Date: ${election.electionDay}`);
            console.log(`📍 Divisions: ${election.ocdDivisionId || 'N/A'}`);
        });
        
        // Try different approaches to find 2024 general election
        const potentialElectionIds = [
            9000, // Common general election ID
            2024, // Year-based ID
            8000, // Another common pattern
            7000,
            ...elections2024.map(e => e.id) // Any 2024 elections we found
        ];
        
        for (const electionId of potentialElectionIds) {
            console.log(`\n🔍 Trying election ID ${electionId} for 98106...`);
            const hasData = await testElectionFor98106(electionId);
            if (hasData) {
                console.log(`✅ Found data with election ID ${electionId}!`);
                return;
            }
        }
        
        // If no specific election worked, try some historical approaches
        console.log(`\n🔄 Trying alternative approaches...`);
        await tryAlternativeApproaches();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testElectionFor98106(electionId) {
    try {
        const address = '1234 16th Ave SW, Seattle, WA 98106';
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        const url = `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
                   `key=${apiKey}&` +
                   `address=${encodeURIComponent(address)}&` +
                   `electionId=${electionId}&` +
                   `returnAllAvailableData=true`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.log(`   ❌ Election ${electionId}: ${response.status} ${response.statusText}`);
            return false;
        }
        
        const data = await response.json();
        
        if (data.contests && data.contests.length > 0) {
            console.log(`   ✅ Election ${electionId}: Found ${data.contests.length} contests!`);
            
            console.log(`\n🏛️ CONTESTS FOR 98106 IN ELECTION ${electionId}:`);
            console.log('===============================================');
            
            if (data.election) {
                console.log(`📅 Election: ${data.election.name}`);
                console.log(`📅 Date: ${data.election.electionDay}`);
            }
            
            data.contests.forEach((contest, index) => {
                console.log(`\n${index + 1}. 📋 Office: ${contest.office || 'Unknown Office'}`);
                if (contest.district) {
                    console.log(`   📍 District: ${contest.district.name}`);
                }
                
                const candidates = contest.candidates || [];
                console.log(`   👥 Candidates (${candidates.length}):`);
                candidates.forEach(candidate => {
                    console.log(`      • ${candidate.name} (${candidate.party || 'No Party'})`);
                    if (candidate.candidateUrl) {
                        console.log(`        🔗 ${candidate.candidateUrl}`);
                    }
                });
                
                // Highlight House races
                if (contest.office && contest.office.toLowerCase().includes('house')) {
                    console.log(`   🎯 *** THIS IS A HOUSE RACE! ***`);
                }
            });
            
            return true;
        } else {
            console.log(`   ⚪ Election ${electionId}: No contests found`);
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Election ${electionId}: ${error.message}`);
        return false;
    }
}

async function tryAlternativeApproaches() {
    try {
        const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
        
        // Try the representatives API instead
        console.log('\n🔍 Trying representatives API for 98106...');
        
        const address = 'Seattle, WA 98106';
        const repUrl = `https://www.googleapis.com/civicinfo/v2/representatives?` + 
                      `key=${apiKey}&` +
                      `address=${encodeURIComponent(address)}`;
        
        const response = await fetch(repUrl);
        
        if (!response.ok) {
            console.log(`❌ Representatives API error: ${response.status}`);
            return;
        }
        
        const data = await response.json();
        
        console.log(`\n🏛️ CURRENT REPRESENTATIVES FOR 98106:`);
        console.log('====================================');
        
        if (data.officials && data.offices) {
            data.offices.forEach(office => {
                console.log(`\n📋 Office: ${office.name}`);
                
                const officialIndices = office.officialIndices || [];
                officialIndices.forEach(index => {
                    const official = data.officials[index];
                    console.log(`   👤 ${official.name} (${official.party || 'No Party'})`);
                    
                    if (official.urls && official.urls.length > 0) {
                        console.log(`      🔗 ${official.urls[0]}`);
                    }
                    
                    if (official.channels) {
                        official.channels.forEach(channel => {
                            console.log(`      📱 ${channel.type}: ${channel.id}`);
                        });
                    }
                });
                
                // Highlight House representatives
                if (office.name && office.name.toLowerCase().includes('house')) {
                    console.log(`   🎯 *** THIS IS THE HOUSE REPRESENTATIVE! ***`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Representatives API error:', error.message);
    }
}

find2024Election();