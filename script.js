// Global variables to hold loaded data
let candidates = {};
let scientificConsensus = {};
let ballotData = {};

// Data loading functions
async function loadData(dataSource = 'mock') {
    try {
        // Determine which candidate data file to use
        const candidateFile = dataSource === 'real' ? 'candidate-data-real.json' : 'candidate-data.json';
        
        // Load JSON data files
        const [consensusResponse, candidateResponse] = await Promise.all([
            fetch('scientific-consensus.json'),
            fetch(candidateFile)
        ]);
        
        if (!consensusResponse.ok || !candidateResponse.ok) {
            const consensusError = !consensusResponse.ok ? `consensus: ${consensusResponse.status} ${consensusResponse.statusText}` : '';
            const candidateError = !candidateResponse.ok ? `candidate: ${candidateResponse.status} ${candidateResponse.statusText}` : '';
            throw new Error(`Failed to load data files - ${consensusError} ${candidateError}`);
        }
        
        scientificConsensus = await consensusResponse.json();
        const candidateData = await candidateResponse.json();
        
        // Transform candidate data to match expected structure
        candidates = transformCandidateData(candidateData, scientificConsensus);
        
        // Initialize ballot data (this would typically come from an API)
        initializeBallotData();
        
        // Update UI to reflect data source
        showNotification(`Loaded ${dataSource === 'real' ? 'real' : 'demo'} candidate data successfully`, 'success');
        
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        console.log('Falling back to embedded demo data');
        
        // Show user-friendly message with more context
        const isFileProtocol = window.location.protocol === 'file:';
        const errorMsg = isFileProtocol 
            ? `Unable to load ${dataSource} data files due to CORS restrictions. Please run a local server or open via HTTP. Using demo data instead.`
            : `Unable to load ${dataSource} data files. Error: ${error.message}. Using demo data instead.`;
        
        showNotification(errorMsg, 'error');
        
        // Fallback to hardcoded data if JSON files fail to load
        loadFallbackData();
        return false;
    }
}

function transformCandidateData(candidateData, consensusData) {
    const transformed = {};
    
    Object.keys(candidateData.candidates).forEach(candidateId => {
        const candidate = candidateData.candidates[candidateId];
        transformed[candidateId] = {
            name: candidate.name,
            party: candidate.party,
            office: candidate.office,
            overallPattern: candidate.overallPattern,
            patternDescription: candidate.patternDescription,
            topics: []
        };
        
        // Transform topics using consensus data
        Object.keys(candidate.positions).forEach(topicId => {
            const position = candidate.positions[topicId];
            const consensusTopic = consensusData.topics[topicId];
            
            if (consensusTopic) {
                transformed[candidateId].topics.push({
                    statement: consensusTopic.statement,
                    consensusPosition: consensusTopic.consensusPosition,
                    consensusWidth: consensusTopic.consensusWidth,
                    consensusInfo: consensusTopic.consensusInfo,
                    candidateStatements: position.statements || [],
                    candidateMedian: position.candidateMedian,
                    candidateVariability: position.candidateVariability,
                    alignmentScore: position.alignmentScore,
                    dataStatus: position.dataStatus || 'sufficient'
                });
            }
        });
    });
    
    return transformed;
}

function initializeBallotData() {
    // Initialize mock ballot data (in production, this would come from an API)
    ballotData = {
        "WA": {
            district: "Washington State, King County",
            races: [
                {
                    office: "U.S. Senate",
                    candidates: ["candidate1", "candidate2", "candidate4"]
                },
                {
                    office: "Mayor of Seattle", 
                    candidates: ["candidate5", "candidate6"]
                },
                {
                    office: "King County Council",
                    candidates: ["candidate7", "candidate8"]
                },
                {
                    office: "Governor", 
                    candidates: ["candidate3", "candidate4"]
                }
            ]
        }
    };
}

function loadFallbackData() {
    // Fallback hardcoded data in case JSON files can't be loaded
    candidates = {
    candidate1: {
        name: "Dr. Sarah Chen",
        party: "Democratic",
        office: "U.S. Senate",
        overallPattern: "consistently-right",
        patternDescription: "High alignment with scientific consensus across most topics.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                consensusInfo: {
                    sources: ["WHO Global Health Observatory", "CDC Pink Book", "Cochrane Review 2018"],
                    summary: "Multiple large-scale studies and meta-analyses show vaccines prevent millions of deaths annually with extremely low risk profiles."
                },
                candidateStatements: [
                    { position: 98, date: "2024-01-15", quote: "Vaccines are one of the greatest public health achievements in human history.", source: "Healthcare Summit Speech", url: "#" },
                    { position: 92, date: "2023-09-20", quote: "We need to ensure all children have access to life-saving vaccines.", source: "Campaign Interview", url: "#" },
                    { position: 95, date: "2023-07-10", quote: "The evidence is overwhelming - vaccines save lives.", source: "Policy Paper", url: "#" }
                ],
                candidateMedian: 95,
                candidateVariability: 6,
                alignmentScore: 92
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                consensusInfo: {
                    sources: ["IPCC AR6 Report", "NASA GISS", "97% Expert Consensus Study"],
                    summary: "Over 97% of actively publishing climate scientists agree that human activities are the primary cause of recent climate change."
                },
                candidateStatements: [
                    { position: 96, date: "2024-02-01", quote: "Climate change is real, human-caused, and demands urgent action.", source: "Senate Floor Speech", url: "#" },
                    { position: 89, date: "2023-11-15", quote: "While natural factors play a role, human emissions are the dominant driver.", source: "Climate Panel", url: "#" },
                    { position: 94, date: "2023-08-22", quote: "The scientific evidence is clear about human responsibility for climate change.", source: "Environmental Forum", url: "#" }
                ],
                candidateMedian: 93,
                candidateVariability: 7,
                alignmentScore: 88
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                consensusInfo: {
                    sources: ["WHO Investigation Report", "Nature Origins Review", "Intelligence Community Assessment"],
                    summary: "Current evidence is insufficient to determine origins definitively. Both natural spillover and lab leak remain plausible hypotheses requiring further investigation."
                },
                candidateStatements: [
                    { position: 35, date: "2024-01-30", quote: "We need more investigation before drawing firm conclusions about COVID origins.", source: "Press Conference", url: "#" },
                    { position: 40, date: "2023-10-12", quote: "All possibilities should remain on the table until we have definitive evidence.", source: "Committee Hearing", url: "#" },
                    { position: 30, date: "2023-06-05", quote: "The origin question requires careful scientific investigation, not speculation.", source: "Op-Ed", url: "#" }
                ],
                candidateMedian: 35,
                candidateVariability: 10,
                alignmentScore: 82
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                consensusInfo: {
                    sources: ["IAEA Safety Standards", "MIT Nuclear Study", "EU Scientific Committee"],
                    summary: "Modern nuclear plants have strong safety records when properly designed, built, and operated under robust regulatory frameworks."
                },
                candidateStatements: [
                    { position: 82, date: "2024-03-05", quote: "Nuclear energy can be safe with proper oversight and modern technology.", source: "Energy Conference", url: "#" },
                    { position: 75, date: "2023-12-01", quote: "We should consider nuclear as part of our clean energy mix, with appropriate safeguards.", source: "Town Hall", url: "#" },
                    { position: 70, date: "2023-09-18", quote: "Nuclear safety has improved dramatically, though concerns remain about waste.", source: "Interview", url: "#" }
                ],
                candidateMedian: 76,
                candidateVariability: 12,
                alignmentScore: 85
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                consensusInfo: {
                    sources: ["WHO GMO Safety Assessment", "FDA GRAS Reviews", "European Food Safety Authority"],
                    summary: "Extensive testing shows approved GMO foods are as safe as conventional foods. No credible evidence of unique health risks from genetic modification process itself."
                },
                candidateStatements: [
                    { position: 35, date: "2024-02-20", quote: "We need more long-term studies on GMO safety and better labeling.", source: "Agriculture Committee", url: "#" },
                    { position: 45, date: "2023-11-30", quote: "I have concerns about the rapid approval process for some GMO crops.", source: "Farm Bill Hearing", url: "#" },
                    { position: 40, date: "2023-08-15", quote: "Consumers have a right to know what's in their food, including GMO ingredients.", source: "Consumer Advocacy Event", url: "#" }
                ],
                candidateMedian: 40,
                candidateVariability: 10,
                alignmentScore: 45
            }
        ]
    },
    candidate2: {
        name: "Rep. Michael Torres",
        party: "Republican",
        office: "U.S. Senate",
        overallPattern: "inconsistent",
        patternDescription: "Mixed record with some strong alignments and some significant departures from consensus.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                consensusInfo: {
                    sources: ["WHO Global Health Observatory", "CDC Pink Book", "Cochrane Review 2018"],
                    summary: "Multiple large-scale studies and meta-analyses show vaccines prevent millions of deaths annually with extremely low risk profiles."
                },
                candidateStatements: [
                    { position: 85, date: "2024-01-10", quote: "Most vaccines are beneficial, but parents should have more choice.", source: "Town Hall", url: "#" },
                    { position: 60, date: "2023-10-05", quote: "We need to investigate potential links between vaccines and autism more thoroughly.", source: "Health Subcommittee", url: "#" },
                    { position: 75, date: "2023-07-20", quote: "Vaccines work, but mandate policies go too far.", source: "Radio Interview", url: "#" }
                ],
                candidateMedian: 73,
                candidateVariability: 25,
                alignmentScore: 52
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                consensusInfo: {
                    sources: ["IPCC AR6 Report", "NASA GISS", "97% Expert Consensus Study"],
                    summary: "Over 97% of actively publishing climate scientists agree that human activities are the primary cause of recent climate change."
                },
                candidateStatements: [
                    { position: 25, date: "2024-02-15", quote: "Climate has always changed naturally. Human impact is still being debated.", source: "Energy Committee", url: "#" },
                    { position: 30, date: "2023-11-08", quote: "We can't be certain humans are the main cause of climate change.", source: "Fox News Interview", url: "#" },
                    { position: 20, date: "2023-09-12", quote: "Climate models are unreliable and often wrong.", source: "Campaign Rally", url: "#" }
                ],
                candidateMedian: 25,
                candidateVariability: 10,
                alignmentScore: 8
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                consensusInfo: {
                    sources: ["WHO Investigation Report", "Nature Origins Review", "Intelligence Community Assessment"],
                    summary: "Current evidence is insufficient to determine origins definitively. Both natural spillover and lab leak remain plausible hypotheses requiring further investigation."
                },
                candidateStatements: [
                    { position: 85, date: "2024-01-25", quote: "The evidence strongly suggests COVID came from the Wuhan lab.", source: "Press Release", url: "#" },
                    { position: 88, date: "2023-09-30", quote: "China covered up the lab leak and we need accountability.", source: "Intelligence Committee", url: "#" },
                    { position: 82, date: "2023-06-18", quote: "It's obvious this virus was engineered in a laboratory.", source: "Conservative Conference", url: "#" }
                ],
                candidateMedian: 85,
                candidateVariability: 6,
                alignmentScore: 35
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                consensusInfo: {
                    sources: ["IAEA Safety Standards", "MIT Nuclear Study", "EU Scientific Committee"],
                    summary: "Modern nuclear plants have strong safety records when properly designed, built, and operated under robust regulatory frameworks."
                },
                candidateStatements: [
                    { position: 92, date: "2024-03-12", quote: "Nuclear is our cleanest, most reliable energy source.", source: "Energy Independence Rally", url: "#" },
                    { position: 88, date: "2023-12-15", quote: "America needs to lead in nuclear technology for energy security.", source: "Industry Conference", url: "#" },
                    { position: 90, date: "2023-10-08", quote: "Nuclear power is key to American energy dominance.", source: "Committee Vote", url: "#" }
                ],
                candidateMedian: 90,
                candidateVariability: 4,
                alignmentScore: 88
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                consensusInfo: {
                    sources: ["WHO GMO Safety Assessment", "FDA GRAS Reviews", "European Food Safety Authority"],
                    summary: "Extensive testing shows approved GMO foods are as safe as conventional foods. No credible evidence of unique health risks from genetic modification process itself."
                },
                candidateStatements: [
                    { position: 15, date: "2024-02-28", quote: "GMOs have been thoroughly tested and are safe for consumption.", source: "Agriculture Roundtable", url: "#" },
                    { position: 12, date: "2023-11-22", quote: "American farmers should be free to use the best technology available.", source: "Farm State Visit", url: "#" },
                    { position: 18, date: "2023-08-30", quote: "GMO crops help feed the world safely and efficiently.", source: "Rural Forum", url: "#" }
                ],
                candidateMedian: 15,
                candidateVariability: 6,
                alignmentScore: 85
            }
        ]
    },
    candidate3: {
        name: "Sen. Rebecca Wallace",
        party: "Republican",
        office: "Governor",
        overallPattern: "improving",
        patternDescription: "Generally strong alignment with some evolution toward better scientific positions over time.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                consensusInfo: {
                    sources: ["WHO Global Health Observatory", "CDC Pink Book", "Cochrane Review 2018"],
                    summary: "Multiple large-scale studies and meta-analyses show vaccines prevent millions of deaths annually with extremely low risk profiles."
                },
                candidateStatements: [
                    { position: 96, date: "2024-02-05", quote: "Vaccines are essential for public health and individual protection.", source: "Health Policy Address", url: "#" },
                    { position: 88, date: "2023-10-20", quote: "We must combat vaccine misinformation with facts and science.", source: "Medical Association Conference", url: "#" },
                    { position: 85, date: "2023-07-15", quote: "Immunization programs are among our greatest public health successes.", source: "Committee Hearing", url: "#" }
                ],
                candidateMedian: 90,
                candidateVariability: 11,
                alignmentScore: 85
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                consensusInfo: {
                    sources: ["IPCC AR6 Report", "NASA GISS", "97% Expert Consensus Study"],
                    summary: "Over 97% of actively publishing climate scientists agree that human activities are the primary cause of recent climate change."
                },
                candidateStatements: [
                    { position: 98, date: "2024-03-01", quote: "Human-caused climate change is the defining challenge of our time.", source: "Climate Summit", url: "#" },
                    { position: 94, date: "2023-12-10", quote: "The science is unequivocal - we are driving climate change.", source: "UN Conference", url: "#" },
                    { position: 92, date: "2023-08-05", quote: "Overwhelming evidence shows humans are changing our climate.", source: "Environmental Committee", url: "#" }
                ],
                candidateMedian: 95,
                candidateVariability: 6,
                alignmentScore: 95
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                consensusInfo: {
                    sources: ["WHO Investigation Report", "Nature Origins Review", "Intelligence Community Assessment"],
                    summary: "Current evidence is insufficient to determine origins definitively. Both natural spillover and lab leak remain plausible hypotheses requiring further investigation."
                },
                candidateStatements: [
                    { position: 28, date: "2024-01-20", quote: "We need transparent investigation of all possible COVID origins.", source: "Intelligence Briefing", url: "#" },
                    { position: 32, date: "2023-09-15", quote: "Both natural and lab origins remain possible until proven otherwise.", source: "Science Committee", url: "#" },
                    { position: 25, date: "2023-05-28", quote: "Premature conclusions about COVID origins undermine scientific integrity.", source: "Op-Ed", url: "#" }
                ],
                candidateMedian: 28,
                candidateVariability: 7,
                alignmentScore: 88
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                consensusInfo: {
                    sources: ["IAEA Safety Standards", "MIT Nuclear Study", "EU Scientific Committee"],
                    summary: "Modern nuclear plants have strong safety records when properly designed, built, and operated under robust regulatory frameworks."
                },
                candidateStatements: [
                    { position: 65, date: "2024-03-18", quote: "Nuclear can be safe, but we must proceed carefully with oversight.", source: "Energy Hearing", url: "#" },
                    { position: 58, date: "2023-11-12", quote: "Nuclear safety has improved, but waste storage remains a concern.", source: "Environmental Forum", url: "#" },
                    { position: 52, date: "2023-08-25", quote: "We should explore nuclear options while prioritizing renewables.", source: "Green Energy Conference", url: "#" }
                ],
                candidateMedian: 58,
                candidateVariability: 13,
                alignmentScore: 72
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                consensusInfo: {
                    sources: ["WHO GMO Safety Assessment", "FDA GRAS Reviews", "European Food Safety Authority"],
                    summary: "Extensive testing shows approved GMO foods are as safe as conventional foods. No credible evidence of unique health risks from genetic modification process itself."
                },
                candidateStatements: [
                    { position: 22, date: "2024-02-12", quote: "Current evidence suggests GMOs are generally safe, though labeling is important.", source: "Consumer Protection Hearing", url: "#" },
                    { position: 28, date: "2023-10-18", quote: "More long-term studies would help address public concerns about GMOs.", source: "Agriculture Committee", url: "#" },
                    { position: 35, date: "2023-07-08", quote: "We should be cautious about rapidly approving new GMO crops.", source: "Food Safety Forum", url: "#" }
                ],
                candidateMedian: 28,
                candidateVariability: 13,
                alignmentScore: 68
            }
        ]
    },
    candidate4: {
        name: "Maria Rodriguez",
        party: "Democratic",
        office: "Governor", 
        overallPattern: "consistently-right",
        patternDescription: "Strong alignment with scientific consensus across all topics.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                candidateStatements: [
                    { position: 94, date: "2024-02-10", quote: "Vaccines are one of our most effective public health tools.", source: "Health Summit", url: "#" }
                ],
                candidateMedian: 94,
                candidateVariability: 3,
                alignmentScore: 92
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                candidateStatements: [
                    { position: 96, date: "2024-01-15", quote: "Climate science is clear - we must act now.", source: "Environmental Address", url: "#" }
                ],
                candidateMedian: 96,
                candidateVariability: 2,
                alignmentScore: 98
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                candidateStatements: [
                    { position: 30, date: "2024-01-20", quote: "We need evidence-based investigation, not speculation.", source: "Press Conference", url: "#" }
                ],
                candidateMedian: 30,
                candidateVariability: 5,
                alignmentScore: 85
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                candidateStatements: [
                    { position: 80, date: "2024-02-05", quote: "Nuclear can be safe with proper regulation.", source: "Energy Forum", url: "#" }
                ],
                candidateMedian: 80,
                candidateVariability: 8,
                alignmentScore: 88
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                candidateStatements: [
                    { position: 15, date: "2024-02-12", quote: "GMOs are safe when properly tested.", source: "Agriculture Committee", url: "#" }
                ],
                candidateMedian: 15,
                candidateVariability: 5,
                alignmentScore: 90
            }
        ]
    },
    candidate5: {
        name: "James Patterson",
        party: "Republican",
        office: "U.S. House",
        overallPattern: "consistently-wrong",
        patternDescription: "Consistently opposes scientific consensus on key issues.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                candidateStatements: [
                    { position: 45, date: "2024-01-10", quote: "Parents should have complete control over medical decisions.", source: "Town Hall", url: "#" }
                ],
                candidateMedian: 45,
                candidateVariability: 15,
                alignmentScore: 25
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                candidateStatements: [
                    { position: 15, date: "2024-02-01", quote: "Climate change is a natural cycle, not human-caused.", source: "Campaign Rally", url: "#" }
                ],
                candidateMedian: 15,
                candidateVariability: 8,
                alignmentScore: 5
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                candidateStatements: [
                    { position: 90, date: "2024-01-25", quote: "It obviously came from the Wuhan lab.", source: "Interview", url: "#" }
                ],
                candidateMedian: 90,
                candidateVariability: 5,
                alignmentScore: 20
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                candidateStatements: [
                    { position: 85, date: "2024-02-10", quote: "Nuclear is our best energy source.", source: "Energy Conference", url: "#" }
                ],
                candidateMedian: 85,
                candidateVariability: 5,
                alignmentScore: 85
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                candidateStatements: [
                    { position: 75, date: "2024-02-15", quote: "We don't know the long-term effects of GMOs.", source: "Agriculture Forum", url: "#" }
                ],
                candidateMedian: 75,
                candidateVariability: 10,
                alignmentScore: 15
            }
        ]
    },
    candidate6: {
        name: "Lisa Thompson",
        party: "Democratic", 
        office: "U.S. House",
        overallPattern: "improving",
        patternDescription: "Improving alignment with science over time.",
        topics: [
            {
                statement: "Childhood immunization saves lives and prevents serious diseases",
                consensusPosition: 95,
                consensusWidth: 8,
                candidateStatements: [
                    { position: 92, date: "2024-01-05", quote: "Vaccines are critical for public health.", source: "Health Committee", url: "#" }
                ],
                candidateMedian: 92,
                candidateVariability: 8,
                alignmentScore: 88
            },
            {
                statement: "Human activities are the primary driver of current climate change",
                consensusPosition: 97,
                consensusWidth: 5,
                candidateStatements: [
                    { position: 93, date: "2024-01-20", quote: "Climate change demands urgent action.", source: "Environmental Summit", url: "#" }
                ],
                candidateMedian: 93,
                candidateVariability: 5,
                alignmentScore: 90
            },
            {
                statement: "COVID-19 definitely originated from a laboratory leak in Wuhan",
                consensusPosition: 25,
                consensusWidth: 35,
                candidateStatements: [
                    { position: 28, date: "2024-02-01", quote: "We need thorough investigation of all possibilities.", source: "Committee Hearing", url: "#" }
                ],
                candidateMedian: 28,
                candidateVariability: 10,
                alignmentScore: 82
            },
            {
                statement: "Nuclear energy is safe when properly regulated and managed",
                consensusPosition: 78,
                consensusWidth: 20,
                candidateStatements: [
                    { position: 72, date: "2024-01-25", quote: "Nuclear can be part of our clean energy future.", source: "Energy Panel", url: "#" }
                ],
                candidateMedian: 72,
                candidateVariability: 12,
                alignmentScore: 78
            },
            {
                statement: "Genetically modified foods are unsafe for human consumption",
                consensusPosition: 12,
                consensusWidth: 15,
                candidateStatements: [
                    { position: 20, date: "2024-02-10", quote: "GMO safety testing is generally adequate.", source: "Agriculture Meeting", url: "#" }
                ],
                candidateMedian: 20,
                candidateVariability: 8,
                alignmentScore: 75
            }
        ]
    }
};
    
    // Initialize ballot data for fallback
    initializeBallotData();
}

let tooltip = null;
let currentDateFilter = 'all';
let currentCandidate = null;

// Advanced Features Functions
function exportToPDF() {
    if (!currentCandidate) return;
    
    // In a real implementation, this would generate an actual PDF
    const candidateData = candidates[currentCandidate];
    const overallScore = calculateOverallScore(candidateData);
    
    // Simulate PDF generation
    const pdfContent = `
        Science Alignment Report
        Candidate: ${candidateData.name}
        Overall Score: ${overallScore}/100
        Pattern: ${getPatternLabel(candidateData.overallPattern)}
        
        Generated on: ${new Date().toLocaleDateString()}
        
        This report would include detailed analysis of all scientific positions,
        trend data, and source citations.
    `;
    
    // Create and download a text file (in real app, this would be a PDF)
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateData.name.replace(/\s+/g, '_')}_Science_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('📄 Report exported successfully!', 'success');
}

function showEmailSignup() {
    const emailSignup = document.getElementById('emailSignup');
    emailSignup.style.display = emailSignup.style.display === 'none' ? 'block' : 'none';
}

function subscribeToUpdates() {
    const email = document.getElementById('emailInput').value;
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // In real implementation, this would call your backend API
    console.log('Subscribing email:', email);
    
    // Simulate success
    showNotification('✅ Successfully subscribed to updates!', 'success');
    document.getElementById('emailInput').value = '';
    document.getElementById('emailSignup').style.display = 'none';
}

function showShareModal() {
    document.getElementById('shareModal').classList.add('show');
    
    // Update share link with current candidate
    if (currentCandidate) {
        const candidateData = candidates[currentCandidate];
        const shareUrl = `https://yourusername.github.io/science-alignment-scorecard/candidate/${candidateData.name.toLowerCase().replace(/\s+/g, '-')}`;
        document.getElementById('shareLink').value = shareUrl;
    }
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

function shareViaTwitter() {
    if (!currentCandidate) return;
    
    const candidateData = candidates[currentCandidate];
    const overallScore = calculateOverallScore(candidateData);
    
    const tweetText = `${candidateData.name} has a ${overallScore}/100 science alignment score. See how your candidates align with scientific consensus at Science Scorecard! 🔬📊`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    window.open(tweetUrl, '_blank');
    closeShareModal();
}

function shareViaFacebook() {
    const shareUrl = document.getElementById('shareLink').value;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
    closeShareModal();
}

function shareViaLinkedIn() {
    if (!currentCandidate) return;
    
    const candidateData = candidates[currentCandidate];
    const shareUrl = document.getElementById('shareLink').value;
    const title = `Science Alignment Analysis: ${candidateData.name}`;
    const summary = `See how ${candidateData.name} aligns with scientific consensus on key issues.`;
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
    closeShareModal();
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('🔗 Link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }
    
    closeShareModal();
}


function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Address Autofill Data and Functions
const addressData = {
    streets: [
        "Main St", "First St", "Second St", "Third St", "Park Ave", "Oak St", "Maple St",
        "Washington St", "Lincoln Ave", "Jefferson St", "Madison Ave", "Roosevelt Blvd",
        "Church St", "School St", "High St", "Elm St", "Cedar St", "Pine St", "Walnut St",
        "Chestnut St", "Spring St", "Franklin St", "Jackson Ave", "Adams St", "Union St",
        "Market St", "Center St", "Water St", "Mill St", "Bridge St", "College Ave",
        "University Ave", "Broadway", "Fifth Ave", "Sixth Ave", "Seventh Ave", "Eighth Ave"
    ],
    cities: {
        "WA": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Everett", "Kent", "Renton", "Yakima", "Federal Way"],
        "CA": ["Los Angeles", "San Francisco", "San Diego", "Oakland", "Sacramento", "Long Beach", "Fresno", "Santa Ana", "Anaheim", "Riverside"],
        "NY": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
        "TX": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
        "FL": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral"],
        "IL": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero"],
        "PA": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona"],
        "OH": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain"],
        "AZ": ["Phoenix", "Tucson", "Mesa", "Chandler", "Glendale", "Scottsdale", "Gilbert", "Tempe", "Peoria", "Surprise"]
    },
    zipCodes: {
        "WA": ["98101", "98102", "98103", "98104", "98105", "98106", "98107", "98108", "98109", "98110"],
        "CA": ["90210", "90211", "90212", "90213", "90214", "90215", "90001", "90002", "90003", "90004"],
        "NY": ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010"],
        "TX": ["75001", "75002", "75003", "75004", "75005", "75006", "75007", "75008", "75009", "75010"],
        "FL": ["33101", "33102", "33103", "33104", "33105", "33106", "33107", "33108", "33109", "33110"],
        "AZ": ["85001", "85002", "85003", "85004", "85005", "85006", "85007", "85008", "85009", "85010"]
    }
};

function setupAutocomplete(inputId, dropdownId, dataSource) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    let highlightedIndex = -1;
    
    if (!input || !dropdown) return;

    input.addEventListener('input', function() {
        const value = this.value.trim().toLowerCase();
        
        if (value.length < 1) {
            hideDropdown();
            return;
        }
        
        let suggestions = [];
        
        if (inputId === 'address') {
            suggestions = addressData.streets.filter(street => 
                street.toLowerCase().includes(value)
            ).map(street => `123 ${street}`); // Add sample house numbers
        } else if (inputId === 'city') {
            const selectedState = document.getElementById('state').value;
            if (selectedState && addressData.cities[selectedState]) {
                suggestions = addressData.cities[selectedState].filter(city =>
                    city.toLowerCase().includes(value)
                );
            } else {
                // Search all cities if no state selected
                suggestions = Object.values(addressData.cities).flat().filter(city =>
                    city.toLowerCase().includes(value)
                );
            }
        } else if (inputId === 'zip') {
            const selectedState = document.getElementById('state').value;
            if (selectedState && addressData.zipCodes[selectedState]) {
                suggestions = addressData.zipCodes[selectedState].filter(zip =>
                    zip.startsWith(value)
                );
            } else {
                // Search all ZIP codes if no state selected
                suggestions = Object.values(addressData.zipCodes).flat().filter(zip =>
                    zip.startsWith(value)
                );
            }
        }
        
        showSuggestions(suggestions.slice(0, 8)); // Limit to 8 suggestions
    });

    input.addEventListener('keydown', function(e) {
        const options = dropdown.querySelectorAll('.autocomplete-option');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = Math.min(highlightedIndex + 1, options.length - 1);
            updateHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = Math.max(highlightedIndex - 1, -1);
            updateHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && options[highlightedIndex]) {
                selectOption(options[highlightedIndex].textContent);
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });

    input.addEventListener('blur', function() {
        // Small delay to allow click on dropdown option
        setTimeout(() => hideDropdown(), 200);
    });

    function showSuggestions(suggestions) {
        if (suggestions.length === 0) {
            hideDropdown();
            return;
        }

        dropdown.innerHTML = '';
        highlightedIndex = -1;
        
        suggestions.forEach(suggestion => {
            const option = document.createElement('div');
            option.className = 'autocomplete-option';
            option.textContent = suggestion;
            option.addEventListener('click', () => selectOption(suggestion));
            dropdown.appendChild(option);
        });
        
        dropdown.classList.add('show');
    }

    function hideDropdown() {
        dropdown.classList.remove('show');
        highlightedIndex = -1;
    }

    function updateHighlight() {
        const options = dropdown.querySelectorAll('.autocomplete-option');
        options.forEach((option, index) => {
            option.classList.toggle('highlighted', index === highlightedIndex);
        });
    }

    function selectOption(value) {
        input.value = value;
        hideDropdown();
        
        // Auto-populate related fields when address is selected
        if (inputId === 'city') {
            autoPopulateFromCity(value);
        }
    }
}

function autoPopulateFromCity(cityName) {
    // Auto-select state when city is chosen
    for (const [state, cities] of Object.entries(addressData.cities)) {
        if (cities.includes(cityName)) {
            document.getElementById('state').value = state;
            break;
        }
    }
}

function initializeAutocomplete() {
    setupAutocomplete('address', 'addressDropdown', 'streets');
    setupAutocomplete('city', 'cityDropdown', 'cities');
    setupAutocomplete('zip', 'zipDropdown', 'zipCodes');
}

// Candidate Comparison Functions
function getElectionsFromCandidates() {
    const elections = new Map();
    
    Object.values(candidates).forEach(candidate => {
        const electionKey = `${candidate.state}_${candidate.office}`;
        const electionName = `${candidate.state} ${candidate.office}${candidate.district ? ` - ${candidate.district}` : ''}`;
        
        if (!elections.has(electionKey)) {
            elections.set(electionKey, {
                key: electionKey,
                name: electionName,
                candidates: []
            });
        }
        elections.get(electionKey).candidates.push(candidate);
    });
    
    return Array.from(elections.values());
}

function populateElectionSelector() {
    const selector = document.getElementById('electionSelect');
    selector.innerHTML = '<option value="">Choose an election...</option>';
    
    const elections = getElectionsFromCandidates();
    
    elections.forEach(election => {
        const option = document.createElement('option');
        option.value = election.key;
        option.textContent = election.name;
        selector.appendChild(option);
    });
}

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
}

function renderComparisonTable(electionKey) {
    const container = document.getElementById('comparisonTableContainer');
    
    if (!electionKey) {
        container.innerHTML = '<div class="no-election-selected">Please select an election to compare candidates.</div>';
        return;
    }
    
    const elections = getElectionsFromCandidates();
    const election = elections.find(e => e.key === electionKey);
    
    if (!election || election.candidates.length < 2) {
        container.innerHTML = '<div class="no-election-selected">No comparison data available for this election.</div>';
        return;
    }
    
    // Get all unique topics across candidates
    const allTopics = new Set();
    election.candidates.forEach(candidate => {
        candidate.topics.forEach(topic => {
            allTopics.add(topic.statement);
        });
    });
    
    if (allTopics.size === 0) {
        container.innerHTML = '<div class="no-election-selected">No scientific topics found for these candidates.</div>';
        return;
    }
    
    // Build comparison table
    let tableHTML = `
        <h3>🗳️ ${election.name}</h3>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th class="topic-name">Scientific Topic</th>
    `;
    
    // Add candidate headers
    election.candidates.forEach(candidate => {
        tableHTML += `
            <th class="candidate-header">
                ${candidate.name}
                <div class="candidate-party">(${candidate.party})</div>
            </th>
        `;
    });
    
    tableHTML += `</tr></thead><tbody>`;
    
    // Add rows for each topic
    Array.from(allTopics).forEach(topicStatement => {
        tableHTML += `<tr><td class="topic-name">${topicStatement}</td>`;
        
        election.candidates.forEach(candidate => {
            const topic = candidate.topics.find(t => t.statement === topicStatement);
            
            if (topic) {
                const score = topic.alignmentScore || topic.candidateMedian || 0;
                const scoreClass = getScoreClass(score);
                tableHTML += `
                    <td class="score-cell">
                        <span class="score-badge ${scoreClass}">${score}</span>
                    </td>
                `;
            } else {
                tableHTML += '<td class="score-cell">—</td>';
            }
        });
        
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

function switchElection() {
    const selectedElection = document.getElementById('electionSelect').value;
    renderComparisonTable(selectedElection);
}

function init() {
    tooltip = document.getElementById('tooltip');
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
}

function getScoreColor(score) {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
}

function getPatternClass(pattern) {
    const classes = {
        'consistently-right': 'consistently-right',
        'consistently-correct': 'consistently-right',
        'consistently-wrong': 'consistently-wrong', 
        'inconsistent': 'inconsistent',
        'improving': 'improving',
        'declining': 'declining',
        'limited-data': 'limited-data'
    };
    return classes[pattern] || 'inconsistent';
}

function getPatternLabel(pattern) {
    const labels = {
        'consistently-right': 'Consistently Aligned',
        'consistently-correct': 'Consistently Aligned',
        'consistently-wrong': 'Consistently Misaligned',
        'inconsistent': 'Inconsistent',
        'improving': 'Improving',
        'declining': 'Declining',
        'limited-data': 'Limited Data'
    };
    return labels[pattern] || 'Mixed Record';
}

let hideTooltipTimer = null;

function showTooltip(e, content) {
    // Clear any existing hide timer
    if (hideTooltipTimer) {
        clearTimeout(hideTooltipTimer);
        hideTooltipTimer = null;
    }

    tooltip.innerHTML = content;
    tooltip.style.left = (e.pageX + 10) + 'px';
    tooltip.style.top = (e.pageY - 10) + 'px';
    tooltip.classList.add('show');

    // Add event listeners to keep tooltip open when cursor is inside
    tooltip.addEventListener('mouseenter', function() {
        if (hideTooltipTimer) {
            clearTimeout(hideTooltipTimer);
            hideTooltipTimer = null;
        }
    });

    tooltip.addEventListener('mouseleave', function() {
        hideTooltip();
    });
}

function hideTooltip() {
    // Add a small delay before hiding to allow cursor to move to tooltip
    hideTooltipTimer = setTimeout(() => {
        tooltip.classList.remove('show');
        hideTooltipTimer = null;
    }, 200);
}

function filterStatementsByDate(statements, filterType) {
    if (filterType === 'all') return statements;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch(filterType) {
        case '6months':
            cutoffDate.setMonth(now.getMonth() - 6);
            break;
        case '1year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        case '2years':
            cutoffDate.setFullYear(now.getFullYear() - 2);
            break;
    }
    
    return statements.filter(stmt => new Date(stmt.date) >= cutoffDate);
}

function renderDistribution(topic, container) {
    const distContainer = document.createElement('div');
    distContainer.className = 'distribution-container';
    
    const consensusLeft = Math.max(0, topic.consensusPosition - topic.consensusWidth/2);
    const consensusWidth = Math.min(100, topic.consensusWidth);
    
    const candidateLeft = Math.max(0, topic.candidateMedian - topic.candidateVariability);
    const candidateWidth = Math.min(100 - candidateLeft, topic.candidateVariability * 2);
    
    distContainer.innerHTML = `
        <div class="distribution-header">
            <div class="distribution-title">Scientific Consensus vs. Candidate Position</div>
            <div class="consensus-info" data-consensus='${JSON.stringify(topic.consensusInfo)}'>ℹ️ Consensus Sources</div>
        </div>
        <div class="distribution-viz">
            <div class="consensus-distribution" style="left: ${consensusLeft}%; width: ${consensusWidth}%" title="Scientific Consensus Range"></div>
            <div class="candidate-distribution" style="left: ${candidateLeft}%; width: ${candidateWidth}%" title="Candidate Position Range"></div>
            <div class="statement-points" id="points-${container.dataset.topicId}"></div>
        </div>
        <div class="scale-labels">
            <span>Strongly Disagree (0)</span>
            <span>Neutral (50)</span>
            <span>Strongly Agree (100)</span>
        </div>
    `;
    
    // Add consensus hover
    const consensusInfo = distContainer.querySelector('.consensus-info');
    consensusInfo.addEventListener('mouseenter', (e) => {
        const info = JSON.parse(e.target.dataset.consensus);
        const content = `
            <h4>Scientific Consensus (${topic.consensusPosition}%)</h4>
            <p><strong>Sources:</strong></p>
            <ul>${info.sources.map(source => `<li>${source}</li>`).join('')}</ul>
            <p><strong>Summary:</strong> ${info.summary}</p>
        `;
        showTooltip(e, content);
    });
    consensusInfo.addEventListener('mouseleave', hideTooltip);
    
    container.appendChild(distContainer);
    
    // Add statement points with date filtering
    const pointsContainer = distContainer.querySelector(`#points-${container.dataset.topicId}`);
    const filteredStatements = filterStatementsByDate(topic.candidateStatements, currentDateFilter);
    const allStatements = topic.candidateStatements;
    
    allStatements.forEach((statement, index) => {
        const point = document.createElement('div');
        point.className = 'statement-point';
        point.style.left = `${statement.position}%`;
        point.dataset.statement = JSON.stringify(statement);
        
        // Apply filtering visual effect
        const isFiltered = !filteredStatements.includes(statement);
        if (isFiltered) {
            point.classList.add('filtered-out');
        }
        
        point.addEventListener('mouseenter', (e) => {
            const stmt = JSON.parse(e.target.dataset.statement);
            const sourceUrl = stmt.sourceUrl || stmt.url || '#';
            const content = `
                <h4>Statement (Score: ${stmt.position})</h4>
                <div class="quote">"${stmt.quote}"</div>
                <p><strong>Date:</strong> ${stmt.date}</p>
                <div class="source"><strong>Source:</strong> <a href="${sourceUrl}" target="_blank" rel="noopener">${stmt.source}</a></div>
                ${stmt.context ? `<p><strong>Context:</strong> ${stmt.context}</p>` : ''}
                ${isFiltered ? '<p style="color: #f39c12;"><strong>Filtered out by date range</strong></p>' : ''}
            `;
            showTooltip(e, content);
        });
        point.addEventListener('mouseleave', hideTooltip);
        
        pointsContainer.appendChild(point);
    });
}

function renderTopics(candidateData) {
    const topicsList = document.getElementById('topicsList');
    topicsList.innerHTML = '';

    candidateData.topics.forEach((topic, index) => {
        const topicDiv = document.createElement('div');
        topicDiv.className = 'topic-item';
        topicDiv.dataset.topicId = index;
        
        const filteredStatements = filterStatementsByDate(topic.candidateStatements, currentDateFilter);
        const statementCount = filteredStatements.length;
        
        const scoreDisplay = topic.alignmentScore !== null && topic.alignmentScore !== undefined 
            ? topic.alignmentScore 
            : 'No Data';
        const scoreColor = topic.alignmentScore !== null && topic.alignmentScore !== undefined 
            ? getScoreColor(topic.alignmentScore)
            : '#cccccc';
            
        topicDiv.innerHTML = `
            <div class="topic-header">
                <div class="topic-statement">${topic.statement}</div>
                <div class="topic-score" style="background-color: ${scoreColor}">${scoreDisplay}</div>
            </div>
            
            <div class="metrics">
                <div class="metric">
                    <span class="metric-label">Consensus</span>
                    <span class="metric-value">${topic.consensusPosition}%</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Candidate</span>
                    <span class="metric-value">${topic.candidateMedian !== null ? topic.candidateMedian + '%' : 'No Data'}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Variability</span>
                    <span class="metric-value">${topic.candidateVariability !== null ? '±' + topic.candidateVariability + '%' : 'N/A'}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Statements</span>
                    <span class="metric-value">${statementCount}${currentDateFilter !== 'all' ? `/${topic.candidateStatements.length}` : ''}</span>
                </div>
            </div>
        `;
        
        topicsList.appendChild(topicDiv);
        renderDistribution(topic, topicDiv);
    });
}

function updateOverallScore(candidateData) {
    const topicsWithScores = candidateData.topics.filter(topic => topic.alignmentScore !== null && topic.alignmentScore !== undefined);
    const overallScore = topicsWithScores.length > 0 
        ? topicsWithScores.reduce((sum, topic) => sum + topic.alignmentScore, 0) / topicsWithScores.length
        : 0;
    
    document.getElementById('overallScore').textContent = topicsWithScores.length > 0 ? Math.round(overallScore) : 'N/A';
    document.getElementById('topicCount').textContent = `${topicsWithScores.length} of ${candidateData.topics.length}`;
    
    const consistencyNote = document.getElementById('consistencyNote');
    const patternClass = getPatternClass(candidateData.overallPattern);
    const patternLabel = getPatternLabel(candidateData.overallPattern);
    
    consistencyNote.innerHTML = `
        <span class="consistency-indicator ${patternClass}">${patternLabel}</span>
        ${candidateData.patternDescription}
    `;
}

function switchCandidate() {
    const selectedCandidate = document.getElementById('candidateSelect').value;
    const candidateData = candidates[selectedCandidate];
    
    currentCandidate = selectedCandidate;
    
    renderTopics(candidateData);
    updateOverallScore(candidateData);
}

function updateDateFilter() {
    currentDateFilter = document.getElementById('dateFilter').value;
    switchCandidate(); // Re-render with new filter
}

async function switchDataSource() {
    const selectedSource = document.getElementById('dataSourceFilter').value;
    
    // Show loading state
    showNotification('Loading data...', 'info');
    
    // Reload data with selected source
    await loadData(selectedSource);
    
    // Update candidate selector with new data
    populateCandidateSelector();
    
    // Update election selector with new data
    populateElectionSelector();
    
    // Reset to first candidate or clear selection
    const candidateSelect = document.getElementById('candidateSelect');
    if (candidateSelect.options.length > 0) {
        candidateSelect.selectedIndex = 0;
        currentCandidate = candidateSelect.value;
        switchCandidate();
    } else {
        // Clear display if no candidates available
        document.getElementById('candidate-analysis').innerHTML = '<p>No candidates available in selected data source.</p>';
    }
}

function lookupBallot() {
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    
    if (!address || !city || !state || !zip) {
        alert('Please fill in all address fields');
        return;
    }
    
    // Mock API call - in real implementation, this would call actual ballot lookup service
    const ballot = ballotData[state];
    if (!ballot) {
        alert('Ballot information not available for this location yet. More states coming soon!');
        return;
    }
    
    // Show results
    document.getElementById('locationDetails').textContent = 
        `${address}, ${city}, ${state} ${zip} • ${ballot.district}`;
    
    renderBallotRaces(ballot.races);
    document.getElementById('ballotResults').classList.add('show');
}

function renderBallotRaces(races) {
    const container = document.getElementById('racesContainer');
    container.innerHTML = '';
    
    races.forEach(race => {
        const raceDiv = document.createElement('div');
        raceDiv.className = 'race-card';
        
        const raceCandidates = race.candidates.map(id => candidates[id]);
        
        raceDiv.innerHTML = `
            <div class="race-title">${race.office}</div>
            <div class="candidates-comparison" id="race-${race.office.replace(/\s+/g, '-')}"></div>
        `;
        
        container.appendChild(raceDiv);
        
        const candidatesContainer = raceDiv.querySelector('.candidates-comparison');
        raceCandidates.forEach(candidate => {
            const overallScore = calculateOverallScore(candidate);
            
            const candidateDiv = document.createElement('div');
            candidateDiv.className = 'candidate-card';
            candidateDiv.onclick = () => {
                // Switch to candidate analysis tab and select this candidate
                const candidateKey = Object.keys(candidates).find(key => candidates[key].name === candidate.name);
                if (candidateKey) {
                    currentCandidate = candidateKey;
                    document.getElementById('candidateSelect').value = candidateKey;
                    switchTab('candidate-analysis');
                    switchCandidate();
                }
            };
            
            candidateDiv.innerHTML = `
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-party">${candidate.party} Party</div>
                <div class="candidate-score" style="background-color: ${getScoreColor(overallScore)}">${overallScore}</div>
                <div class="score-breakdown">
                    <div class="breakdown-item">
                        <div class="breakdown-label">Pattern</div>
                        <div class="breakdown-value">${getPatternLabel(candidate.overallPattern)}</div>
                    </div>
                    <div class="breakdown-item">
                        <div class="breakdown-label">Topics</div>
                        <div class="breakdown-value">${candidate.topics.length}</div>
                    </div>
                </div>
            `;
            
            candidatesContainer.appendChild(candidateDiv);
        });
    });
}

function calculateOverallScore(candidate) {
    const topicsWithScores = candidate.topics.filter(topic => topic.alignmentScore !== null && topic.alignmentScore !== undefined);
    return topicsWithScores.length > 0 
        ? Math.round(topicsWithScores.reduce((sum, topic) => sum + topic.alignmentScore, 0) / topicsWithScores.length)
        : 0;
}

// Initialize application
async function initializeApp() {
    try {
        // Show loading indicator
        document.body.style.opacity = '0.7';
        
        // Load data from JSON files
        const dataLoaded = await loadData();
        
        if (dataLoaded) {
            console.log('Data loaded successfully from JSON files');
        } else {
            console.log('Using fallback hardcoded data');
        }
        
        // Initialize UI
        init();
        
        // Initialize autocomplete functionality
        initializeAutocomplete();
        
        // Populate candidate selector
        populateCandidateSelector();
        
        // Populate election selector for comparison tab
        populateElectionSelector();
        
        // Set up event listeners
        document.getElementById('candidateSelect').addEventListener('change', switchCandidate);
        document.getElementById('dateFilter').addEventListener('change', updateDateFilter);
        document.getElementById('dataSourceFilter').addEventListener('change', switchDataSource);
        document.getElementById('electionSelect').addEventListener('change', switchElection);
        
        // Close modal when clicking outside
        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') {
                closeShareModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeShareModal();
            }
        });
        
        // Initialize with first candidate
        switchCandidate();
        
        // Hide loading indicator
        document.body.style.opacity = '1';
        
    } catch (error) {
        console.error('Error initializing application:', error);
        // Fallback initialization
        init();
        switchCandidate();
        document.body.style.opacity = '1';
    }
}

function populateCandidateSelector() {
    const select = document.getElementById('candidateSelect');
    select.innerHTML = '';
    
    Object.keys(candidates).forEach(candidateId => {
        const candidate = candidates[candidateId];
        const option = document.createElement('option');
        option.value = candidateId;
        option.textContent = candidate.name;
        select.appendChild(option);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);