/**
 * Comprehensive Bias Detection and Management System
 * Science Alignment Scorecard - Bias Detection Framework
 */

class BiasDetectionSystem {
    constructor() {
        this.neutralNames = {
            male: ['Alex Johnson', 'Taylor Smith', 'Jordan Brown', 'Casey Davis', 'Morgan Wilson'],
            female: ['Riley Garcia', 'Quinn Miller', 'Avery Jones', 'Cameron Thompson', 'Parker Lee'],
            neutral: ['River Anderson', 'Sage Martinez', 'Dakota Wilson', 'Phoenix Chen', 'Emery Davis']
        };
        
        this.controlPanel = this.createControlPanel();
        this.biasTestResults = [];
    }

    /**
     * 1. NAME ANONYMIZATION SYSTEM
     */
    generatePlaceholderName(gender = 'neutral', seed = null) {
        const namePool = this.neutralNames[gender] || this.neutralNames.neutral;
        const index = seed ? seed % namePool.length : Math.floor(Math.random() * namePool.length);
        return namePool[index];
    }

    anonymizeStatement(statement, candidate) {
        let anonymized = statement.quote;
        
        // Replace candidate name variations
        const nameVariations = [
            candidate.name,
            candidate.name.split(' ')[0], // First name
            candidate.name.split(' ').slice(1).join(' '), // Last name(s)
            candidate.name.split(' ').pop() // Final last name
        ].filter(name => name && name.length > 2);

        nameVariations.forEach(name => {
            const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            anonymized = anonymized.replace(regex, '[CANDIDATE_NAME]');
        });

        // Replace party references
        anonymized = anonymized.replace(/\b(Republican|Democratic|GOP|Democrat|conservative|liberal|progressive)\b/gi, '[PARTY_AFFILIATION]');
        
        // Replace geographic references
        if (candidate.state) {
            anonymized = anonymized.replace(new RegExp(`\\b${candidate.state}\\b`, 'gi'), '[STATE]');
        }

        // Replace office references
        if (candidate.office) {
            const officeTerms = candidate.office.split(' ');
            officeTerms.forEach(term => {
                if (term.length > 3) {
                    anonymized = anonymized.replace(new RegExp(`\\b${term}\\b`, 'gi'), '[OFFICE]');
                }
            });
        }

        return {
            ...statement,
            quote: anonymized,
            originalQuote: statement.quote,
            anonymizationApplied: true
        };
    }

    /**
     * 2. CONTROL PANEL OF KNOWN-SCORE STATEMENTS
     */
    createControlPanel() {
        return {
            // High alignment statements (should score 90-100)
            highAlignment: [
                {
                    id: 'ctrl_001',
                    topic: 'childhood_immunization',
                    quote: 'Vaccines are one of the most important public health achievements, preventing millions of deaths from diseases like measles, polio, and whooping cough.',
                    expectedScore: 95,
                    expectedRange: [90, 100],
                    scientificBasis: 'Direct alignment with WHO, CDC, and medical consensus'
                },
                {
                    id: 'ctrl_002', 
                    topic: 'climate_change',
                    quote: 'Climate change is primarily driven by human activities, particularly greenhouse gas emissions from burning fossil fuels, as confirmed by overwhelming scientific evidence.',
                    expectedScore: 96,
                    expectedRange: [92, 100],
                    scientificBasis: 'Aligns with IPCC consensus and 97%+ scientific agreement'
                },
                {
                    id: 'ctrl_003',
                    topic: 'gmo_safety',
                    quote: 'Genetically modified foods that have been approved by regulatory agencies have undergone extensive safety testing and are as safe as conventional foods.',
                    expectedScore: 12,
                    expectedRange: [8, 18],
                    scientificBasis: 'Consistent with FDA, WHO, and major scientific organizations'
                }
            ],

            // Medium alignment statements (should score 40-60)
            mediumAlignment: [
                {
                    id: 'ctrl_004',
                    topic: 'nuclear_energy',
                    quote: 'Nuclear energy can be safe with proper oversight, though concerns about waste storage and accidents remain valid considerations.',
                    expectedScore: 70,
                    expectedRange: [60, 80],
                    scientificBasis: 'Balanced view acknowledging both safety improvements and legitimate concerns'
                },
                {
                    id: 'ctrl_005',
                    topic: 'covid_origins',
                    quote: 'The origins of COVID-19 require further investigation, with both natural spillover and laboratory accident scenarios remaining plausible.',
                    expectedScore: 35,
                    expectedRange: [25, 45],
                    scientificBasis: 'Reflects current scientific uncertainty and ongoing investigation needs'
                }
            ],

            // Low alignment statements (should score 0-20)
            lowAlignment: [
                {
                    id: 'ctrl_006',
                    topic: 'childhood_immunization',
                    quote: 'Vaccines cause autism and contain dangerous toxins that harm children more than they help.',
                    expectedScore: 5,
                    expectedRange: [0, 15],
                    scientificBasis: 'Directly contradicts scientific consensus and debunked claims'
                },
                {
                    id: 'ctrl_007',
                    topic: 'climate_change',
                    quote: 'Climate change is a natural cycle and human activities have no significant impact on global temperature.',
                    expectedScore: 8,
                    expectedRange: [0, 20],
                    scientificBasis: 'Contradicts overwhelming scientific evidence and consensus'
                }
            ]
        };
    }

    /**
     * 3. BIAS TESTING WITH KNOWN-SCORE CONTROL PANEL
     */
    async runControlPanelBiasTest(candidates, scoringFunction) {
        const results = {
            timestamp: new Date().toISOString(),
            candidates: candidates.map(c => c.name),
            tests: [],
            summary: {}
        };

        // Test each control statement with different name attributions
        for (const category of ['highAlignment', 'mediumAlignment', 'lowAlignment']) {
            for (const controlStatement of this.controlPanel[category]) {
                const testResult = await this.testStatementWithDifferentNames(
                    controlStatement, 
                    candidates, 
                    scoringFunction
                );
                results.tests.push(testResult);
            }
        }

        results.summary = this.analyzeControlPanelResults(results.tests);
        return results;
    }

    async testStatementWithDifferentNames(controlStatement, candidates, scoringFunction) {
        const testResult = {
            controlId: controlStatement.id,
            topic: controlStatement.topic,
            expectedScore: controlStatement.expectedScore,
            expectedRange: controlStatement.expectedRange,
            tests: {}
        };

        // 1. Test with no name (baseline)
        const anonymousStatement = {
            ...controlStatement,
            quote: controlStatement.quote
        };
        testResult.tests.anonymous = {
            score: await scoringFunction(anonymousStatement),
            variation: 'No candidate name'
        };

        // 2. Test with neutral placeholder name
        const placeholderName = this.generatePlaceholderName();
        const placeholderStatement = {
            ...controlStatement,
            quote: controlStatement.quote.replace('[CANDIDATE_NAME]', placeholderName)
        };
        testResult.tests.placeholder = {
            score: await scoringFunction(placeholderStatement),
            variation: `Placeholder name: ${placeholderName}`
        };

        // 3. Test with each real candidate name
        for (const candidate of candidates) {
            const candidateStatement = {
                ...controlStatement,
                quote: controlStatement.quote.replace('[CANDIDATE_NAME]', candidate.name),
                candidate: candidate.name,
                party: candidate.party
            };
            
            testResult.tests[candidate.name] = {
                score: await scoringFunction(candidateStatement),
                variation: `Real candidate: ${candidate.name} (${candidate.party})`,
                party: candidate.party
            };
        }

        // Calculate bias indicators
        testResult.biasAnalysis = this.calculateBiasIndicators(testResult.tests, controlStatement.expectedScore);
        
        return testResult;
    }

    calculateBiasIndicators(tests, expectedScore) {
        const scores = Object.values(tests).map(t => t.score);
        const partyScores = {
            Democratic: [],
            Republican: []
        };

        // Group scores by party
        Object.entries(tests).forEach(([key, test]) => {
            if (test.party && partyScores[test.party]) {
                partyScores[test.party].push(test.score);
            }
        });

        return {
            scoreVariance: this.calculateVariance(scores),
            maxDeviation: Math.max(...scores.map(s => Math.abs(s - expectedScore))),
            nameEffectSize: this.calculateEffectSize(scores),
            partyBiasIndicator: this.calculatePartyBias(partyScores),
            acceptableVariance: scores.every(s => Math.abs(s - expectedScore) <= 10),
            warningFlags: this.identifyWarningFlags(tests, expectedScore)
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    calculateEffectSize(scores) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = this.calculateVariance(scores);
        return variance > 0 ? Math.sqrt(variance) / mean : 0;
    }

    calculatePartyBias(partyScores) {
        if (partyScores.Democratic.length === 0 || partyScores.Republican.length === 0) {
            return { bias: 0, significance: 'insufficient_data' };
        }

        const demMean = partyScores.Democratic.reduce((a, b) => a + b, 0) / partyScores.Democratic.length;
        const repMean = partyScores.Republican.reduce((a, b) => a + b, 0) / partyScores.Republican.length;
        
        return {
            bias: demMean - repMean,
            democraticMean: demMean,
            republicanMean: repMean,
            significance: Math.abs(demMean - repMean) > 5 ? 'significant' : 'acceptable'
        };
    }

    identifyWarningFlags(tests, expectedScore) {
        const flags = [];
        const threshold = 15; // Acceptable deviation threshold

        Object.entries(tests).forEach(([testName, result]) => {
            const deviation = Math.abs(result.score - expectedScore);
            if (deviation > threshold) {
                flags.push({
                    test: testName,
                    issue: 'high_deviation',
                    deviation: deviation,
                    severity: deviation > 25 ? 'critical' : 'warning'
                });
            }
        });

        return flags;
    }

    analyzeControlPanelResults(testResults) {
        const summary = {
            totalTests: testResults.length,
            passedTests: 0,
            failedTests: 0,
            biasWarnings: [],
            overallBiasScore: 0,
            recommendations: []
        };

        testResults.forEach(test => {
            if (test.biasAnalysis.acceptableVariance) {
                summary.passedTests++;
            } else {
                summary.failedTests++;
                summary.biasWarnings.push({
                    controlId: test.controlId,
                    issue: 'excessive_variance',
                    variance: test.biasAnalysis.scoreVariance,
                    maxDeviation: test.biasAnalysis.maxDeviation
                });
            }
        });

        summary.overallBiasScore = (summary.passedTests / summary.totalTests) * 100;
        summary.recommendations = this.generateRecommendations(summary);

        return summary;
    }

    generateRecommendations(summary) {
        const recommendations = [];

        if (summary.overallBiasScore < 80) {
            recommendations.push({
                priority: 'high',
                action: 'Review scoring methodology for systematic bias',
                reason: `Only ${summary.overallBiasScore.toFixed(1)}% of control tests passed`
            });
        }

        if (summary.biasWarnings.length > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Implement additional name anonymization',
                reason: `${summary.biasWarnings.length} tests showed excessive score variance`
            });
        }

        if (summary.overallBiasScore >= 90) {
            recommendations.push({
                priority: 'low',
                action: 'Continue current bias detection practices',
                reason: 'Bias detection system performing well'
            });
        }

        return recommendations;
    }

    /**
     * 4. CROSS-VALIDATION TESTING METHODOLOGY
     */
    async runCrossValidationTest(statements, candidates, scoringFunction) {
        const results = {
            timestamp: new Date().toISOString(),
            methodology: 'cross_validation',
            tests: []
        };

        for (const statement of statements) {
            const crossValidationResult = await this.performStatementCrossValidation(
                statement, 
                candidates, 
                scoringFunction
            );
            results.tests.push(crossValidationResult);
        }

        results.summary = this.analyzeCrossValidationResults(results.tests);
        return results;
    }

    async performStatementCrossValidation(statement, candidates, scoringFunction) {
        const testResult = {
            statementId: statement.id,
            originalCandidate: statement.candidate,
            originalScore: statement.position,
            crossValidationScores: {}
        };

        // Test the same statement content attributed to different candidates
        for (const candidate of candidates) {
            if (candidate.name !== statement.candidate) {
                const modifiedStatement = {
                    ...statement,
                    candidate: candidate.name,
                    party: candidate.party,
                    quote: statement.quote.replace(
                        new RegExp(statement.candidate, 'g'), 
                        candidate.name
                    )
                };

                testResult.crossValidationScores[candidate.name] = {
                    score: await scoringFunction(modifiedStatement),
                    party: candidate.party,
                    scoreDifference: Math.abs(await scoringFunction(modifiedStatement) - statement.position)
                };
            }
        }

        testResult.biasAnalysis = this.analyzeCrossValidationBias(testResult);
        return testResult;
    }

    analyzeCrossValidationBias(testResult) {
        const scores = Object.values(testResult.crossValidationScores).map(cv => cv.score);
        const scoreDifferences = Object.values(testResult.crossValidationScores).map(cv => cv.scoreDifference);

        return {
            maxScoreDifference: Math.max(...scoreDifferences),
            avgScoreDifference: scoreDifferences.reduce((a, b) => a + b, 0) / scoreDifferences.length,
            scoreVariance: this.calculateVariance(scores),
            consistencyRating: Math.max(0, 100 - Math.max(...scoreDifferences)),
            biasDetected: Math.max(...scoreDifferences) > 10
        };
    }

    analyzeCrossValidationResults(testResults) {
        const summary = {
            totalStatements: testResults.length,
            consistentStatements: 0,
            inconsistentStatements: 0,
            averageScoreDifference: 0,
            maxScoreDifference: 0,
            biasLikelihood: 0
        };

        const allDifferences = [];
        
        testResults.forEach(test => {
            if (test.biasAnalysis.maxScoreDifference <= 10) {
                summary.consistentStatements++;
            } else {
                summary.inconsistentStatements++;
            }
            
            allDifferences.push(test.biasAnalysis.maxScoreDifference);
        });

        summary.averageScoreDifference = allDifferences.reduce((a, b) => a + b, 0) / allDifferences.length;
        summary.maxScoreDifference = Math.max(...allDifferences);
        summary.biasLikelihood = (summary.inconsistentStatements / summary.totalStatements) * 100;

        return summary;
    }

    /**
     * 5. COMPREHENSIVE BIAS REPORT GENERATION
     */
    async generateComprehensiveBiasReport(candidates, statements, scoringFunction) {
        console.log('Generating comprehensive bias detection report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            methodology: 'comprehensive_bias_detection',
            candidates: candidates.map(c => ({name: c.name, party: c.party})),
            tests: {}
        };

        // Run all bias detection tests
        report.tests.controlPanel = await this.runControlPanelBiasTest(candidates, scoringFunction);
        report.tests.crossValidation = await this.runCrossValidationTest(statements, candidates, scoringFunction);
        
        // Generate overall assessment
        report.overallAssessment = this.generateOverallBiasAssessment(report.tests);
        
        return report;
    }

    generateOverallBiasAssessment(tests) {
        const controlPanelScore = tests.controlPanel.summary.overallBiasScore;
        const crossValidationConsistency = 100 - tests.crossValidation.summary.biasLikelihood;
        
        const overallScore = (controlPanelScore + crossValidationConsistency) / 2;
        
        return {
            overallBiasScore: overallScore,
            rating: this.getBiasRating(overallScore),
            keyFindings: this.extractKeyFindings(tests),
            criticalIssues: this.identifyCriticalIssues(tests),
            recommendations: this.generateComprehensiveRecommendations(tests)
        };
    }

    getBiasRating(score) {
        if (score >= 90) return 'Excellent - Minimal bias detected';
        if (score >= 80) return 'Good - Some minor bias concerns';
        if (score >= 70) return 'Fair - Moderate bias issues identified';
        if (score >= 60) return 'Poor - Significant bias problems';
        return 'Critical - Severe bias issues require immediate attention';
    }

    extractKeyFindings(tests) {
        const findings = [];
        
        if (tests.controlPanel.summary.overallBiasScore < 80) {
            findings.push(`Control panel tests failed: ${100 - tests.controlPanel.summary.overallBiasScore}% failure rate`);
        }
        
        if (tests.crossValidation.summary.biasLikelihood > 20) {
            findings.push(`High cross-validation inconsistency: ${tests.crossValidation.summary.biasLikelihood}% of statements showed bias`);
        }
        
        return findings;
    }

    identifyCriticalIssues(tests) {
        const issues = [];
        
        tests.controlPanel.summary.biasWarnings.forEach(warning => {
            if (warning.maxDeviation > 25) {
                issues.push({
                    type: 'severe_score_deviation',
                    description: `Control statement ${warning.controlId} showed ${warning.maxDeviation} point deviation`,
                    severity: 'critical'
                });
            }
        });
        
        return issues;
    }

    generateComprehensiveRecommendations(tests) {
        const recommendations = [];
        
        // Add specific recommendations based on test results
        recommendations.push(...tests.controlPanel.summary.recommendations);
        
        if (tests.crossValidation.summary.biasLikelihood > 15) {
            recommendations.push({
                priority: 'high',
                action: 'Implement stricter name anonymization protocols',
                reason: 'Cross-validation revealed significant bias in statement scoring'
            });
        }
        
        return recommendations;
    }
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiasDetectionSystem;
}