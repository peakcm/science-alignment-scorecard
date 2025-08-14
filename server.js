require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - only allow your GitHub Pages site
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Google Civic API endpoint
app.post('/api/ballot-lookup', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }

        // Call Google Civic API with YOUR secure key
        const response = await fetch(
            `https://www.googleapis.com/civicinfo/v2/voterinfo?` + 
            `key=${process.env.GOOGLE_CIVIC_API_KEY}&` +
            `address=${encodeURIComponent(address)}&` +
            `electionId=2000&` +
            `returnAllAvailableData=true`
        );

        if (!response.ok) {
            throw new Error(`Google Civic API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Process and return the data
        const processedData = {
            normalizedAddress: data.normalizedInput?.line1 || address,
            election: data.election || null,
            pollingLocations: data.pollingLocations || [],
            contests: (data.contests || []).map(contest => ({
                office: contest.office,
                district: contest.district?.name || '',
                candidates: (contest.candidates || []).map(candidate => ({
                    name: candidate.name,
                    party: candidate.party || '',
                    candidateUrl: candidate.candidateUrl || '',
                    channels: candidate.channels || []
                }))
            }))
        };

        res.json(processedData);

    } catch (error) {
        console.error('Ballot lookup error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch ballot information',
            message: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Science Scorecard API running on port ${PORT}`);
    console.log(`📍 Allowed origin: ${process.env.CORS_ORIGIN}`);
});