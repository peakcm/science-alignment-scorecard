# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **Science Alignment Scorecard** is a web application that measures how well political candidates align with scientific consensus on key issues. This is a Jekyll-based static site with an Express.js backend for ballot lookup functionality.

## Key Technologies

- **Frontend**: Pure HTML/CSS/JavaScript (no build process required)
- **Backend**: Node.js with Express.js (`server.js`)
- **Hosting**: GitHub Pages with Jekyll
- **External API**: Google Civic Information API for ballot lookup
- **Data**: Static JSON files for scientific consensus and candidate data

## Architecture

### Frontend Components
- **Main Application**: `docs/index_html.html` - Single-page application with tabbed interface
- **Configuration**: `_config.yml` - Jekyll configuration for GitHub Pages hosting
- **Data Files**: 
  - `scientific-consensus.json` - Scientific consensus positions on key topics
  - `candidate-data.json` - Candidate statements and positions over time

### Backend Components
- **API Server**: `server.js` - Express.js server providing ballot lookup functionality
- **API Endpoints**:
  - `POST /api/ballot-lookup` - Integrates with Google Civic Information API
  - `GET /api/health` - Health check endpoint

### Data Structure

The application uses a sophisticated data model:
- **Scientific Consensus**: Each topic has a consensus position (0-100 scale), width (uncertainty range), sources, and evidence level
- **Candidate Data**: Includes statements with positions, dates, sources, trend analysis, and calculated alignment scores
- **Scoring System**: Uses Likert scale (0-100) with overlap calculations between candidate positions and consensus ranges

## Development Workflow

### Running the Application

**Frontend (Jekyll site):**
```bash
# Serve locally (if Jekyll is installed)
jekyll serve

# Or simply open docs/index_html.html in a browser
```

**Backend API server:**
```bash
# Install dependencies
npm install express cors dotenv node-fetch

# Set up environment variables
# Create .env file with:
# GOOGLE_CIVIC_API_KEY=your_key_here
# CORS_ORIGIN=http://localhost:3000

# Start server
node server.js
```

### Key Features to Understand

1. **Interactive Scoring**: Candidate statements are plotted on distribution visualizations showing alignment with scientific consensus
2. **Trend Analysis**: Tracks how candidate positions change over time with directional indicators
3. **Date Filtering**: Allows filtering statements by time period (6 months, 1 year, 2 years)
4. **Ballot Integration**: Uses Google Civic API to find local candidates and display their science scores
5. **Export/Share**: PDF generation, email signup, and social media sharing functionality

## Data Management

### Scientific Topics Covered
- Childhood immunization and vaccine safety
- Human-driven climate change  
- COVID-19 origins investigation
- Nuclear energy safety
- GMO food safety

### Candidate Analysis Patterns
- `consistently-correct`: High alignment across topics
- `consistently-wrong`: Low alignment across topics  
- `inconsistent`: Mixed record with variability
- `improving`: Trending toward better alignment
- `declining`: Trending away from consensus

## Important Notes

- **API Key Security**: The Google Civic API key should be stored in environment variables, not committed to the repository
- **Demo Data**: Current candidate data is illustrative for demonstration purposes
- **Responsive Design**: Application works on both mobile and desktop
- **No Build Process**: The frontend is pure HTML/CSS/JS, no compilation required

## Common Tasks

- **Add New Candidate**: Update `candidate-data.json` with new candidate data following the existing structure
- **Add Scientific Topic**: Update `scientific-consensus.json` with new consensus data and corresponding candidate positions
- **Update Styling**: Modify CSS within `docs/index_html.html` (embedded styles)
- **API Changes**: Modify `server.js` for backend functionality
- **Configuration**: Update `_config.yml` for Jekyll/GitHub Pages settings

## Deployment

The site deploys automatically to GitHub Pages when changes are pushed to the main branch. The backend server would need to be deployed separately to a service like Heroku, Railway, or similar Node.js hosting platform.