require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow GitHub Pages site and localhost for development
const allowedOrigins = [
    process.env.CORS_ORIGIN, 
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000'
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(`Blocked CORS request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
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
    console.log(`📍 Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Google Civic API: ${process.env.GOOGLE_CIVIC_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});