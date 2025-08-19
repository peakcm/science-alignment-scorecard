/**
 * Bias Detection System Integration
 * Main integration script for the Science Alignment Scorecard
 */

// Import all bias detection modules
class BiasDetectionIntegration {
    constructor() {
        this.biasDetectionSystem = new BiasDetectionSystem();
        this.advancedAnalytics = new AdvancedBiasAnalytics();
        this.independenceQC = new StatementIndependenceQC();
        
        this.isInitialized = false;
        this.lastBiasReport = null;
        this.biasMonitoringEnabled = false;
    }

    /**
     * Initialize the bias detection system
     */
    async initialize() {
        console.log('🔍 Initializing Bias Detection System...');
        
        try {
            // Load candidate data
            const candidateData = await this.loadCandidateData();
            
            // Load scientific consensus data
            const consensusData = await this.loadScientificConsensusData();
            
            // Set up bias monitoring
            this.setupBiasMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Bias Detection System initialized successfully');
            
            return {
                success: true,
                message: 'Bias detection system ready',
                candidatesLoaded: Object.keys(candidateData.candidates).length,
                topicsLoaded: Object.keys(consensusData).length
            };
        } catch (error) {
            console.error('❌ Failed to initialize bias detection system:', error);
            return {
                success: false,
                message: 'Failed to initialize bias detection system',
                error: error.message
            };
        }
    }

    /**
     * Run comprehensive bias detection analysis
     */
    async runComprehensiveBiasAnalysis() {
        if (!this.isInitialized) {
            throw new Error('Bias detection system not initialized');
        }

        console.log('🔍 Running comprehensive bias detection analysis...');
        
        const startTime = Date.now();
        
        // Load current data
        const candidateData = await this.loadCandidateData();
        const candidates = Object.values(candidateData.candidates);
        const statements = this.extractAllStatements(candidates);

        // Create mock scoring function (in real implementation, use actual scoring)
        const scoringFunction = this.createScoringFunction();

        const analysis = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            executionTime: 0,
            totalStatements: statements.length,
            totalCandidates: candidates.length,
            tests: {},
            overallAssessment: {},
            recommendations: []
        };

        try {
            // 1. Control Panel Testing
            console.log('  📋 Running control panel bias tests...');
            analysis.tests.controlPanelResults = await this.biasDetectionSystem.runControlPanelBiasTest(
                candidates, 
                scoringFunction
            );

            // 2. Cross-Validation Testing  
            console.log('  🔄 Running cross-validation tests...');
            analysis.tests.crossValidationResults = await this.biasDetectionSystem.runCrossValidationTest(
                statements,
                candidates,
                scoringFunction
            );

            // 3. Advanced Analytics
            console.log('  📊 Running advanced bias analytics...');
            analysis.tests.partyBiasAnalysis = await this.advancedAnalytics.detectPartyBias(statements);
            analysis.tests.sourceBiasAnalysis = await this.advancedAnalytics.detectSourceBias(statements);
            analysis.tests.temporalBiasAnalysis = await this.advancedAnalytics.detectTemporalBias(statements);
            analysis.tests.semanticBiasAnalysis = await this.advancedAnalytics.detectSemanticBias(statements);

            // 4. Statement Independence Testing
            console.log('  🔬 Running statement independence tests...');
            analysis.tests.independenceValidation = await this.independenceQC.validateStatementIndependence(
                statements,
                scoringFunction
            );

            // 5. Generate Overall Assessment
            console.log('  📝 Generating overall assessment...');
            analysis.overallAssessment = this.generateOverallAssessment(analysis.tests);
            analysis.recommendations = this.generateComprehensiveRecommendations(analysis.tests);

            analysis.executionTime = Date.now() - startTime;
            this.lastBiasReport = analysis;

            console.log(`✅ Bias analysis completed in ${analysis.executionTime}ms`);
            return analysis;

        } catch (error) {
            console.error('❌ Error during bias analysis:', error);
            analysis.error = error.message;
            analysis.executionTime = Date.now() - startTime;
            return analysis;
        }
    }

    /**
     * Generate bias detection report
     */
    async generateBiasReport(format = 'html') {
        const analysis = this.lastBiasReport || await this.runComprehensiveBiasAnalysis();
        
        switch (format) {
            case 'html':
                return this.generateHTMLReport(analysis);
            case 'json':
                return this.generateJSONReport(analysis);
            case 'markdown':
                return this.generateMarkdownReport(analysis);
            default:
                throw new Error(`Unsupported report format: ${format}`);
        }
    }

    /**
     * Create scoring function for testing
     */
    createScoringFunction() {
        return async (statement, options = {}) => {
            // Simulate realistic scoring with potential biases
            let baseScore = statement.position || statement.expectedScore || 50;
            
            // Add some controlled variance to simulate real scoring
            const variance = (Math.random() - 0.5) * 10; // ±5 point variance
            baseScore += variance;
            
            // Simulate potential biases for testing purposes
            if (!options.isolated && !options.anonymized) {
                // Simulate slight party bias
                if (statement.party === 'Republican') {
                    baseScore *= 0.98; // Slight negative bias
                }
                if (statement.party === 'Democratic') {
                    baseScore *= 1.02; // Slight positive bias
                }
                
                // Simulate name recognition bias
                if (statement.quote && statement.quote.includes('Trump')) {
                    baseScore *= 0.95;
                }
                if (statement.quote && statement.quote.includes('Biden')) {
                    baseScore *= 1.05;
                }
            }
            
            return Math.min(100, Math.max(0, Math.round(baseScore)));
        };
    }

    /**
     * Extract all statements from candidate data
     */
    extractAllStatements(candidates) {
        const allStatements = [];
        
        candidates.forEach(candidate => {
            if (candidate.positions) {
                Object.entries(candidate.positions).forEach(([topic, topicData]) => {
                    if (topicData.statements) {
                        topicData.statements.forEach(statement => {
                            allStatements.push({
                                ...statement,
                                candidate: candidate.name,
                                party: candidate.party,
                                topic: topic,
                                position: statement.position
                            });
                        });
                    }
                });
            }
        });
        
        return allStatements;
    }

    /**
     * Load candidate data from JSON
     */
    async loadCandidateData() {
        try {
            const response = await fetch('candidate-data.json');
            if (!response.ok) {
                throw new Error('Failed to load candidate data');
            }
            return await response.json();
        } catch (error) {
            // Fallback for Node.js environment
            if (typeof require !== 'undefined') {
                try {
                    return require('./candidate-data.json');
                } catch (requireError) {
                    throw new Error('Could not load candidate data in any environment');
                }
            }
            throw error;
        }
    }

    /**
     * Load scientific consensus data
     */
    async loadScientificConsensusData() {
        try {
            const response = await fetch('scientific-consensus.json');
            if (!response.ok) {
                throw new Error('Failed to load scientific consensus data');
            }
            return await response.json();
        } catch (error) {
            // Fallback for Node.js environment
            if (typeof require !== 'undefined') {
                try {
                    return require('./scientific-consensus.json');
                } catch (requireError) {
                    // Return mock data if file doesn't exist
                    return {
                        childhood_immunization: { consensus: 95, width: 8 },
                        climate_change: { consensus: 97, width: 5 },
                        covid_origins: { consensus: 25, width: 20 },
                        nuclear_energy: { consensus: 75, width: 15 },
                        gmo_safety: { consensus: 15, width: 12 }
                    };
                }
            }
            throw error;
        }
    }

    /**
     * Generate overall assessment
     */
    generateOverallAssessment(tests) {
        const assessment = {
            overallBiasScore: 0,
            rating: '',
            keyFindings: [],
            criticalIssues: [],
            confidence: 0
        };

        // Calculate weighted overall score
        const weights = {
            controlPanel: 0.25,
            crossValidation: 0.20,
            partyBias: 0.20,
            sourceBias: 0.15,
            independence: 0.20
        };

        let weightedSum = 0;
        let totalWeight = 0;

        // Control Panel Score
        if (tests.controlPanelResults) {
            const controlScore = tests.controlPanelResults.summary.overallBiasScore;
            weightedSum += controlScore * weights.controlPanel;
            totalWeight += weights.controlPanel;
            
            if (controlScore < 80) {
                assessment.keyFindings.push(`Control panel tests show ${100 - controlScore}% failure rate`);
            }
        }

        // Cross-Validation Score
        if (tests.crossValidationResults) {
            const crossScore = 100 - tests.crossValidationResults.summary.biasLikelihood;
            weightedSum += crossScore * weights.crossValidation;
            totalWeight += weights.crossValidation;
            
            if (crossScore < 80) {
                assessment.keyFindings.push(`${tests.crossValidationResults.summary.biasLikelihood}% of statements show cross-validation bias`);
            }
        }

        // Party Bias Score
        if (tests.partyBiasAnalysis && !tests.partyBiasAnalysis.error) {
            const partyScore = this.calculatePartyBiasScore(tests.partyBiasAnalysis);
            weightedSum += partyScore * weights.partyBias;
            totalWeight += weights.partyBias;
            
            if (partyScore < 80) {
                assessment.keyFindings.push('Significant party-based scoring differences detected');
            }
        }

        // Source Bias Score
        if (tests.sourceBiasAnalysis) {
            const sourceScore = this.calculateSourceBiasScore(tests.sourceBiasAnalysis);
            weightedSum += sourceScore * weights.sourceBias;
            totalWeight += weights.sourceBias;
            
            if (tests.sourceBiasAnalysis.suspiciousSources.length > 0) {
                assessment.keyFindings.push(`${tests.sourceBiasAnalysis.suspiciousSources.length} sources show bias indicators`);
            }
        }

        // Independence Score
        if (tests.independenceValidation) {
            const independenceScore = tests.independenceValidation.overallIndependenceScore;
            weightedSum += independenceScore * weights.independence;
            totalWeight += weights.independence;
            
            if (independenceScore < 80) {
                assessment.keyFindings.push('Statement independence issues detected');
                if (tests.independenceValidation.criticalIssues.length > 0) {
                    assessment.criticalIssues.push(...tests.independenceValidation.criticalIssues);
                }
            }
        }

        assessment.overallBiasScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        assessment.rating = this.getBiasRating(assessment.overallBiasScore);
        assessment.confidence = this.calculateConfidenceLevel(tests);

        return assessment;
    }

    calculatePartyBiasScore(partyBiasAnalysis) {
        // Extract meaningful score from party bias analysis
        let totalScore = 100;
        
        if (partyBiasAnalysis.partyComparison) {
            Object.values(partyBiasAnalysis.partyComparison).forEach(comparison => {
                if (comparison.scoreDifference && Math.abs(comparison.scoreDifference) > 10) {
                    totalScore -= 20; // Penalize large differences
                }
                if (comparison.biasAssessment && comparison.biasAssessment.significant) {
                    totalScore -= 15; // Penalize statistical significance
                }
            });
        }
        
        return Math.max(0, totalScore);
    }

    calculateSourceBiasScore(sourceBiasAnalysis) {
        // Calculate source bias score based on suspicious sources
        const totalSources = Object.keys(sourceBiasAnalysis.sourceAnalysis).length;
        const suspiciousSources = sourceBiasAnalysis.suspiciousSources.length;
        
        if (totalSources === 0) return 100;
        
        const cleanSourcesRatio = (totalSources - suspiciousSources) / totalSources;
        return cleanSourcesRatio * 100;
    }

    getBiasRating(score) {
        if (score >= 90) return 'Excellent - Minimal bias detected';
        if (score >= 80) return 'Good - Minor bias concerns';
        if (score >= 70) return 'Fair - Moderate bias issues';
        if (score >= 60) return 'Poor - Significant bias problems';
        return 'Critical - Severe bias issues require immediate attention';
    }

    calculateConfidenceLevel(tests) {
        // Calculate confidence based on test coverage and sample sizes
        let confidence = 0;
        let factors = 0;

        if (tests.controlPanelResults) {
            confidence += 25;
            factors++;
        }
        
        if (tests.crossValidationResults) {
            confidence += 25;
            factors++;
        }
        
        if (tests.independenceValidation) {
            confidence += 25;
            factors++;
        }
        
        if (tests.partyBiasAnalysis && !tests.partyBiasAnalysis.error) {
            confidence += 25;
            factors++;
        }

        return factors > 0 ? confidence / factors : 0;
    }

    /**
     * Generate comprehensive recommendations
     */
    generateComprehensiveRecommendations(tests) {
        const recommendations = [];

        // Control panel recommendations
        if (tests.controlPanelResults && tests.controlPanelResults.summary.overallBiasScore < 80) {
            recommendations.push({
                priority: 'high',
                category: 'control_panel',
                action: 'Improve name anonymization in scoring pipeline',
                rationale: `Control panel tests show ${100 - tests.controlPanelResults.summary.overallBiasScore}% failure rate`,
                expectedImpact: 'Reduce name-based bias by 15-20 percentage points'
            });
        }

        // Cross-validation recommendations
        if (tests.crossValidationResults && tests.crossValidationResults.summary.biasLikelihood > 20) {
            recommendations.push({
                priority: 'high',
                category: 'cross_validation',
                action: 'Review and retrain scoring methodology',
                rationale: `${tests.crossValidationResults.summary.biasLikelihood}% of statements show inconsistent scoring`,
                expectedImpact: 'Improve scoring consistency to >85%'
            });
        }

        // Party bias recommendations
        if (tests.partyBiasAnalysis && this.calculatePartyBiasScore(tests.partyBiasAnalysis) < 70) {
            recommendations.push({
                priority: 'high',
                category: 'party_bias',
                action: 'Implement blind scoring protocols',
                rationale: 'Significant party-based scoring differences detected',
                expectedImpact: 'Eliminate systematic party bias'
            });
        }

        // Source bias recommendations
        if (tests.sourceBiasAnalysis && tests.sourceBiasAnalysis.suspiciousSources.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'source_bias',
                action: 'Review and potentially exclude biased sources',
                rationale: `${tests.sourceBiasAnalysis.suspiciousSources.length} sources show bias indicators`,
                expectedImpact: 'Improve source reliability score to >95%'
            });
        }

        // Independence recommendations
        if (tests.independenceValidation && tests.independenceValidation.overallIndependenceScore < 80) {
            recommendations.push({
                priority: 'high',
                category: 'independence',
                action: 'Implement statement isolation protocols',
                rationale: 'Statement independence validation failed',
                expectedImpact: 'Ensure each statement is evaluated independently'
            });
        }

        return recommendations;
    }

    /**
     * Setup continuous bias monitoring
     */
    setupBiasMonitoring() {
        this.biasMonitoringEnabled = true;
        
        // Set up periodic bias checks (in real implementation, this would be more sophisticated)
        if (typeof setInterval !== 'undefined') {
            setInterval(() => {
                if (this.biasMonitoringEnabled) {
                    this.performQuickBiasCheck();
                }
            }, 3600000); // Check every hour
        }
    }

    /**
     * Perform quick bias check
     */
    async performQuickBiasCheck() {
        try {
            const quickAnalysis = await this.runComprehensiveBiasAnalysis();
            
            if (quickAnalysis.overallAssessment.overallBiasScore < 70) {
                console.warn('🚨 BIAS ALERT: Overall bias score dropped below acceptable threshold');
                
                // In a real implementation, this would trigger alerts
                this.triggerBiasAlert(quickAnalysis);
            }
        } catch (error) {
            console.error('Error during quick bias check:', error);
        }
    }

    /**
     * Trigger bias alert
     */
    triggerBiasAlert(analysis) {
        const alert = {
            timestamp: new Date().toISOString(),
            severity: analysis.overallAssessment.overallBiasScore < 60 ? 'critical' : 'warning',
            score: analysis.overallAssessment.overallBiasScore,
            issues: analysis.overallAssessment.criticalIssues,
            recommendations: analysis.recommendations.filter(r => r.priority === 'high')
        };

        console.warn('Bias alert triggered:', alert);
        
        // In real implementation, send notifications, update dashboard, etc.
        this.handleBiasAlert(alert);
    }

    handleBiasAlert(alert) {
        // Placeholder for alert handling
        // In real implementation: send emails, update UI, log to database, etc.
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(analysis) {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bias Detection Report - Science Alignment Scorecard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f7fa; }
                .report-container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                .score { font-size: 3em; font-weight: bold; color: ${this.getScoreColor(analysis.overallAssessment.overallBiasScore)}; }
                .rating { font-size: 1.2em; color: #666; }
                .section { margin: 30px 0; }
                .section h2 { color: #333; border-left: 4px solid #667eea; padding-left: 15px; }
                .metric { display: inline-block; margin: 10px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
                .finding { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 6px; }
                .recommendation { background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; margin: 10px 0; border-radius: 6px; }
                .high-priority { border-left: 4px solid #e74c3c; }
                .medium-priority { border-left: 4px solid #f39c12; }
                .low-priority { border-left: 4px solid #27ae60; }
            </style>
        </head>
        <body>
            <div class="report-container">
                <div class="header">
                    <h1>🔍 Bias Detection Report</h1>
                    <div class="score">${analysis.overallAssessment.overallBiasScore.toFixed(1)}%</div>
                    <div class="rating">${analysis.overallAssessment.rating}</div>
                    <p>Generated: ${new Date(analysis.timestamp).toLocaleString()}</p>
                    <p>Analysis Time: ${analysis.executionTime}ms | Statements: ${analysis.totalStatements} | Candidates: ${analysis.totalCandidates}</p>
                </div>

                <div class="section">
                    <h2>📊 Key Metrics</h2>
                    <div class="metric">
                        <h3>Control Panel Score</h3>
                        <div>${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.overallBiasScore.toFixed(1) + '%' : 'N/A'}</div>
                    </div>
                    <div class="metric">
                        <h3>Cross-Validation Pass Rate</h3>
                        <div>${analysis.tests.crossValidationResults ? (100 - analysis.tests.crossValidationResults.summary.biasLikelihood).toFixed(1) + '%' : 'N/A'}</div>
                    </div>
                    <div class="metric">
                        <h3>Independence Score</h3>
                        <div>${analysis.tests.independenceValidation ? analysis.tests.independenceValidation.overallIndependenceScore.toFixed(1) + '%' : 'N/A'}</div>
                    </div>
                </div>

                <div class="section">
                    <h2>🔍 Key Findings</h2>
                    ${analysis.overallAssessment.keyFindings.map(finding => `<div class="finding">${finding}</div>`).join('')}
                    ${analysis.overallAssessment.keyFindings.length === 0 ? '<div class="finding">No significant bias issues detected.</div>' : ''}
                </div>

                <div class="section">
                    <h2>⚠️ Critical Issues</h2>
                    ${analysis.overallAssessment.criticalIssues.map(issue => `<div class="finding"><strong>${issue.testType}:</strong> ${issue.description}</div>`).join('')}
                    ${analysis.overallAssessment.criticalIssues.length === 0 ? '<div class="finding">No critical issues identified.</div>' : ''}
                </div>

                <div class="section">
                    <h2>📋 Recommendations</h2>
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation ${rec.priority}-priority">
                            <strong>[${rec.priority.toUpperCase()}] ${rec.action}</strong>
                            <p>${rec.rationale}</p>
                            <p><em>Expected Impact:</em> ${rec.expectedImpact}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="section">
                    <h2>📈 Test Results Summary</h2>
                    <h3>Control Panel Tests</h3>
                    <p>Passed: ${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.passedTests : 0} | Failed: ${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.failedTests : 0}</p>
                    
                    <h3>Cross-Validation Results</h3>
                    <p>Consistent Statements: ${analysis.tests.crossValidationResults ? analysis.tests.crossValidationResults.summary.consistentStatements : 0} | Inconsistent: ${analysis.tests.crossValidationResults ? analysis.tests.crossValidationResults.summary.inconsistentStatements : 0}</p>
                    
                    <h3>Independence Validation</h3>
                    <p>Overall Score: ${analysis.tests.independenceValidation ? analysis.tests.independenceValidation.overallIndependenceScore.toFixed(1) + '%' : 'N/A'}</p>
                </div>

                <div class="section">
                    <h2>ℹ️ Methodology</h2>
                    <p>This bias detection report was generated using a comprehensive multi-layered approach:</p>
                    <ul>
                        <li><strong>Control Panel Testing:</strong> Known statements tested with different candidate attributions</li>
                        <li><strong>Cross-Validation:</strong> Statement content tested across different candidate assignments</li>
                        <li><strong>Statistical Analysis:</strong> Advanced statistical tests for party, source, and temporal bias</li>
                        <li><strong>Independence Validation:</strong> Ensures each statement is evaluated independently</li>
                        <li><strong>Pattern Detection:</strong> Machine learning algorithms identify systematic bias patterns</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>`;
        
        return html;
    }

    getScoreColor(score) {
        if (score >= 90) return '#27ae60';
        if (score >= 80) return '#f39c12';
        if (score >= 70) return '#e67e22';
        return '#e74c3c';
    }

    /**
     * Generate JSON report
     */
    generateJSONReport(analysis) {
        return JSON.stringify(analysis, null, 2);
    }

    /**
     * Generate Markdown report
     */
    generateMarkdownReport(analysis) {
        return `# 🔍 Bias Detection Report

**Overall Bias Score:** ${analysis.overallAssessment.overallBiasScore.toFixed(1)}%  
**Rating:** ${analysis.overallAssessment.rating}  
**Generated:** ${new Date(analysis.timestamp).toLocaleString()}  
**Analysis Time:** ${analysis.executionTime}ms | **Statements:** ${analysis.totalStatements} | **Candidates:** ${analysis.totalCandidates}

## 📊 Key Metrics

| Metric | Score |
|--------|-------|
| Control Panel Score | ${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.overallBiasScore.toFixed(1) + '%' : 'N/A'} |
| Cross-Validation Pass Rate | ${analysis.tests.crossValidationResults ? (100 - analysis.tests.crossValidationResults.summary.biasLikelihood).toFixed(1) + '%' : 'N/A'} |
| Independence Score | ${analysis.tests.independenceValidation ? analysis.tests.independenceValidation.overallIndependenceScore.toFixed(1) + '%' : 'N/A'} |

## 🔍 Key Findings

${analysis.overallAssessment.keyFindings.map(finding => `- ${finding}`).join('\n')}
${analysis.overallAssessment.keyFindings.length === 0 ? '- No significant bias issues detected.' : ''}

## 📋 Recommendations

${analysis.recommendations.map(rec => `### [${rec.priority.toUpperCase()}] ${rec.action}
${rec.rationale}  
**Expected Impact:** ${rec.expectedImpact}`).join('\n\n')}

## 📈 Detailed Results

### Control Panel Tests
- **Passed:** ${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.passedTests : 0}
- **Failed:** ${analysis.tests.controlPanelResults ? analysis.tests.controlPanelResults.summary.failedTests : 0}

### Cross-Validation Results  
- **Consistent Statements:** ${analysis.tests.crossValidationResults ? analysis.tests.crossValidationResults.summary.consistentStatements : 0}
- **Inconsistent Statements:** ${analysis.tests.crossValidationResults ? analysis.tests.crossValidationResults.summary.inconsistentStatements : 0}

### Independence Validation
- **Overall Score:** ${analysis.tests.independenceValidation ? analysis.tests.independenceValidation.overallIndependenceScore.toFixed(1) + '%' : 'N/A'}
`;
    }
}

// Export for use in both browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiasDetectionIntegration;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    window.BiasDetectionIntegration = BiasDetectionIntegration;
}