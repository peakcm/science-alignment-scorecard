// Mock ballot data for 98106 (Seattle area) based on typical district mapping
const mock98106Ballot = {
    "normalizedAddress": "Seattle, WA 98106",
    "election": {
        "name": "General Election 2024",
        "electionDay": "2024-11-05"
    },
    "contests": [
        {
            "office": "U.S. House of Representatives - District 7",
            "district": {
                "name": "Washington's 7th Congressional District",
                "scope": "congressional"
            },
            "candidates": [
                {
                    "name": "Pramila Jayapal",
                    "party": "Democratic Party",
                    "candidateUrl": "https://www.jayapal.org",
                    "channels": [
                        {"type": "Twitter", "id": "@PramilaJayapal"},
                        {"type": "Facebook", "id": "RepJayapal"}
                    ]
                },
                {
                    "name": "Cliff Moon", 
                    "party": "Republican Party",
                    "candidateUrl": "",
                    "channels": []
                }
            ]
        }
    ]
};

console.log('🏛️ HOUSE CANDIDATES FOR 98106 (SEATTLE AREA):');
console.log('==============================================');

const houseContests = mock98106Ballot.contests.filter(contest => 
    contest.office.toLowerCase().includes('house')
);

houseContests.forEach(contest => {
    console.log(`\n📋 Office: ${contest.office}`);
    console.log(`📍 District: ${contest.district.name}`);
    console.log(`👥 Candidates:`);
    
    contest.candidates.forEach(candidate => {
        console.log(`   • ${candidate.name} (${candidate.party})`);
        if (candidate.candidateUrl) {
            console.log(`     🔗 ${candidate.candidateUrl}`);
        }
        if (candidate.channels.length > 0) {
            console.log(`     📱 Social: ${candidate.channels.map(c => c.id).join(', ')}`);
        }
    });
});

console.log(`\n📅 Election: ${mock98106Ballot.election.name}`);
console.log(`📅 Date: ${mock98106Ballot.election.electionDay}`);
console.log(`\n⚠️  Note: This is mock data. Enable Google Civic API to get real-time ballot information.`);