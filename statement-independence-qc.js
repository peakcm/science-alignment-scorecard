/**
 * Statement Independence Quality Control System
 * Ensures each statement is evaluated as an independent observation
 */

class StatementIndependenceQC {
    constructor() {
        this.independenceThresholds = {
            orderVariance: 5,           // Maximum acceptable variance from statement ordering
            priorStatementInfluence: 3, // Maximum score change due to previous statements
            contextualBias: 8,          // Maximum bias from statement context
            batchProcessingVariance: 4, // Maximum variance in batch vs individual processing
            temporalSequenceBias: 6     // Maximum bias from temporal processing sequence
        };
        
        this.qualityMetrics = new IndependenceMetrics();
        this.validationProtocols = new ValidationProtocols();
    }

    /**
     * 1. CORE INDEPENDENCE VALIDATION
     */
    async validateStatementIndependence(statements, scoringFunction) {
        const validation = {
            timestamp: new Date().toISOString(),
            totalStatements: statements.length,
            independenceTests: {},
            overallIndependenceScore: 0,
            criticalIssues: [],
            recommendations: []
        };

        // Run all independence validation tests
        validation.independenceTests.orderingIndependence = await this.testOrderingIndependence(statements, scoringFunction);
        validation.independenceTests.priorStatementInfluence = await this.testPriorStatementInfluence(statements, scoringFunction);
        validation.independenceTests.contextualIndependence = await this.testContextualIndependence(statements, scoringFunction);
        validation.independenceTests.batchProcessingIndependence = await this.testBatchProcessingIndependence(statements, scoringFunction);
        validation.independenceTests.temporalSequenceIndependence = await this.testTemporalSequenceIndependence(statements, scoringFunction);

        // Calculate overall independence score
        validation.overallIndependenceScore = this.calculateOverallIndependenceScore(validation.independenceTests);
        
        // Identify critical issues
        validation.criticalIssues = this.identifyCriticalIndependenceIssues(validation.independenceTests);
        
        // Generate recommendations
        validation.recommendations = this.generateIndependenceRecommendations(validation.independenceTests);

        return validation;
    }

    /**
     * 2. ORDERING INDEPENDENCE TEST
     */
    async testOrderingIndependence(statements, scoringFunction) {
        const test = {
            testType: 'ordering_independence',
            description: 'Test if statement scores change based on the order they are processed',
            iterations: 10,
            results: []
        };

        // Run multiple iterations with different random orderings
        for (let i = 0; i < test.iterations; i++) {
            const shuffledStatements = this.shuffleArray([...statements]);
            const scores = [];
            
            // Score each statement in the shuffled order
            for (const statement of shuffledStatements) {
                const score = await scoringFunction(statement, { isolated: true });
                scores.push({
                    statementId: statement.id,
                    score: score,
                    iteration: i
                });
            }
            
            test.results.push({
                iteration: i,
                scores: scores
            });
        }

        // Analyze variance across iterations for each statement
        const analysis = this.analyzeOrderingVariance(test.results, statements);
        
        return {
            ...test,
            analysis: analysis,
            independenceScore: this.calculateOrderingIndependenceScore(analysis),
            passed: analysis.maxVariance <= this.independenceThresholds.orderVariance
        };
    }

    analyzeOrderingVariance(results, statements) {
        const varianceAnalysis = {
            statementVariances: {},
            maxVariance: 0,
            averageVariance: 0,
            problematicStatements: []
        };

        // Calculate variance for each statement across iterations
        statements.forEach(statement => {
            const statementScores = results.map(result => 
                result.scores.find(s => s.statementId === statement.id).score
            );
            
            const variance = this.calculateVariance(statementScores);
            varianceAnalysis.statementVariances[statement.id] = {
                scores: statementScores,
                variance: variance,
                mean: this.calculateMean(statementScores),
                range: Math.max(...statementScores) - Math.min(...statementScores)
            };
            
            if (variance > this.independenceThresholds.orderVariance) {
                varianceAnalysis.problematicStatements.push({
                    id: statement.id,
                    quote: statement.quote.substring(0, 100) + '...',
                    variance: variance,
                    severity: variance > this.independenceThresholds.orderVariance * 2 ? 'high' : 'medium'
                });
            }
        });

        const allVariances = Object.values(varianceAnalysis.statementVariances).map(v => v.variance);
        varianceAnalysis.maxVariance = Math.max(...allVariances);
        varianceAnalysis.averageVariance = this.calculateMean(allVariances);

        return varianceAnalysis;
    }

    /**
     * 3. PRIOR STATEMENT INFLUENCE TEST
     */
    async testPriorStatementInfluence(statements, scoringFunction) {
        const test = {
            testType: 'prior_statement_influence',
            description: 'Test if previous statements influence current statement scoring',
            results: []
        };

        // Test each statement with and without prior context
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Score in isolation
            const isolatedScore = await scoringFunction(statement, { isolated: true });
            
            // Score with different prior contexts
            const contextualScores = [];
            
            // With positive context (high-scoring prior statements)
            const positiveContext = statements.filter(s => s.position > 80).slice(0, 3);
            const positiveContextScore = await scoringFunction(statement, { 
                priorStatements: positiveContext 
            });
            
            // With negative context (low-scoring prior statements)  
            const negativeContext = statements.filter(s => s.position < 30).slice(0, 3);
            const negativeContextScore = await scoringFunction(statement, {
                priorStatements: negativeContext
            });
            
            // With mixed context
            const mixedContext = statements.slice(Math.max(0, i-2), i);
            const mixedContextScore = await scoringFunction(statement, {
                priorStatements: mixedContext
            });

            const result = {
                statementId: statement.id,
                isolatedScore: isolatedScore,
                positiveContextScore: positiveContextScore,
                negativeContextScore: negativeContextScore,
                mixedContextScore: mixedContextScore,
                maxInfluence: Math.max(
                    Math.abs(isolatedScore - positiveContextScore),
                    Math.abs(isolatedScore - negativeContextScore),
                    Math.abs(isolatedScore - mixedContextScore)
                )
            };

            test.results.push(result);
        }

        const analysis = this.analyzePriorInfluence(test.results);
        
        return {
            ...test,
            analysis: analysis,
            independenceScore: this.calculatePriorInfluenceIndependenceScore(analysis),
            passed: analysis.maxInfluence <= this.independenceThresholds.priorStatementInfluence
        };
    }

    analyzePriorInfluence(results) {
        const influences = results.map(r => r.maxInfluence);
        const problematicStatements = results.filter(r => 
            r.maxInfluence > this.independenceThresholds.priorStatementInfluence
        );

        return {
            maxInfluence: Math.max(...influences),
            averageInfluence: this.calculateMean(influences),
            problematicCount: problematicStatements.length,
            problematicStatements: problematicStatements.map(s => ({
                id: s.statementId,
                influence: s.maxInfluence,
                contextualBias: this.identifyContextualBias(s)
            }))
        };
    }

    identifyContextualBias(statementResult) {
        const biases = [];
        
        if (Math.abs(statementResult.isolatedScore - statementResult.positiveContextScore) > 3) {
            biases.push('positive_context_bias');
        }
        
        if (Math.abs(statementResult.isolatedScore - statementResult.negativeContextScore) > 3) {
            biases.push('negative_context_bias');
        }
        
        if (Math.abs(statementResult.isolatedScore - statementResult.mixedContextScore) > 3) {
            biases.push('sequence_dependency');
        }

        return biases;
    }

    /**
     * 4. CONTEXTUAL INDEPENDENCE TEST
     */
    async testContextualIndependence(statements, scoringFunction) {
        const test = {
            testType: 'contextual_independence',
            description: 'Test if statement context (source, date, etc.) influences scientific content scoring',
            results: []
        };

        for (const statement of statements) {
            // Score with original context
            const originalScore = await scoringFunction(statement);
            
            // Score with anonymized context
            const anonymizedStatement = this.anonymizeStatementContext(statement);
            const anonymizedScore = await scoringFunction(anonymizedStatement);
            
            // Score with alternate contexts
            const alternateContexts = this.generateAlternateContexts(statement, statements);
            const alternateScores = [];
            
            for (const altContext of alternateContexts) {
                const altScore = await scoringFunction(altContext);
                alternateScores.push(altScore);
            }

            test.results.push({
                statementId: statement.id,
                originalScore: originalScore,
                anonymizedScore: anonymizedScore,
                alternateScores: alternateScores,
                contextualInfluence: Math.abs(originalScore - anonymizedScore),
                alternateVariance: this.calculateVariance(alternateScores)
            });
        }

        const analysis = this.analyzeContextualIndependence(test.results);
        
        return {
            ...test,
            analysis: analysis,
            independenceScore: this.calculateContextualIndependenceScore(analysis),
            passed: analysis.maxContextualInfluence <= this.independenceThresholds.contextualBias
        };
    }

    anonymizeStatementContext(statement) {
        return {
            ...statement,
            source: '[ANONYMIZED_SOURCE]',
            date: '[ANONYMIZED_DATE]', 
            candidate: '[ANONYMIZED_CANDIDATE]',
            party: '[ANONYMIZED_PARTY]',
            context: '[ANONYMIZED_CONTEXT]'
        };
    }

    generateAlternateContexts(statement, allStatements) {
        const alternates = [];
        
        // Get different sources, dates, candidates from other statements
        const otherStatements = allStatements.filter(s => s.id !== statement.id);
        
        for (let i = 0; i < Math.min(3, otherStatements.length); i++) {
            const other = otherStatements[i];
            alternates.push({
                ...statement,
                source: other.source,
                date: other.date,
                candidate: other.candidate,
                party: other.party,
                context: other.context
            });
        }

        return alternates;
    }

    /**
     * 5. BATCH PROCESSING INDEPENDENCE TEST
     */
    async testBatchProcessingIndependence(statements, scoringFunction) {
        const test = {
            testType: 'batch_processing_independence',
            description: 'Test if batch processing affects individual statement scores',
            results: []
        };

        // Score statements individually
        const individualScores = [];
        for (const statement of statements) {
            const score = await scoringFunction(statement, { batchSize: 1 });
            individualScores.push({ id: statement.id, score: score });
        }

        // Score statements in different batch sizes
        const batchSizes = [5, 10, 25, 50];
        const batchResults = {};

        for (const batchSize of batchSizes) {
            const batches = this.createBatches(statements, batchSize);
            const batchScores = [];
            
            for (const batch of batches) {
                const scores = await Promise.all(
                    batch.map(s => scoringFunction(s, { batchSize: batch.length }))
                );
                
                scores.forEach((score, idx) => {
                    batchScores.push({ 
                        id: batch[idx].id, 
                        score: score,
                        batchSize: batchSize
                    });
                });
            }
            
            batchResults[batchSize] = batchScores;
        }

        // Compare individual vs batch scores
        const analysis = this.analyzeBatchProcessingVariance(individualScores, batchResults);
        
        return {
            ...test,
            individualScores: individualScores,
            batchResults: batchResults,
            analysis: analysis,
            independenceScore: this.calculateBatchIndependenceScore(analysis),
            passed: analysis.maxBatchVariance <= this.independenceThresholds.batchProcessingVariance
        };
    }

    createBatches(statements, batchSize) {
        const batches = [];
        for (let i = 0; i < statements.length; i += batchSize) {
            batches.push(statements.slice(i, i + batchSize));
        }
        return batches;
    }

    analyzeBatchProcessingVariance(individualScores, batchResults) {
        const analysis = {
            batchVariances: {},
            maxBatchVariance: 0,
            problematicStatements: []
        };

        // Compare each batch size against individual scores
        Object.entries(batchResults).forEach(([batchSize, batchScores]) => {
            const variances = [];
            
            individualScores.forEach(individual => {
                const batchScore = batchScores.find(b => b.id === individual.id);
                if (batchScore) {
                    const variance = Math.abs(individual.score - batchScore.score);
                    variances.push(variance);
                    
                    if (variance > this.independenceThresholds.batchProcessingVariance) {
                        analysis.problematicStatements.push({
                            id: individual.id,
                            batchSize: parseInt(batchSize),
                            variance: variance,
                            individualScore: individual.score,
                            batchScore: batchScore.score
                        });
                    }
                }
            });
            
            analysis.batchVariances[batchSize] = {
                maxVariance: Math.max(...variances),
                averageVariance: this.calculateMean(variances),
                problematicCount: variances.filter(v => v > this.independenceThresholds.batchProcessingVariance).length
            };
        });

        analysis.maxBatchVariance = Math.max(
            ...Object.values(analysis.batchVariances).map(bv => bv.maxVariance)
        );

        return analysis;
    }

    /**
     * 6. TEMPORAL SEQUENCE INDEPENDENCE TEST
     */
    async testTemporalSequenceIndependence(statements, scoringFunction) {
        const test = {
            testType: 'temporal_sequence_independence',
            description: 'Test if temporal processing sequence affects statement scores',
            results: []
        };

        // Sort statements by different temporal criteria
        const sortingMethods = {
            chronological: [...statements].sort((a, b) => new Date(a.date) - new Date(b.date)),
            reverseChronological: [...statements].sort((a, b) => new Date(b.date) - new Date(a.date)),
            random: this.shuffleArray([...statements]),
            byCandidate: [...statements].sort((a, b) => a.candidate.localeCompare(b.candidate)),
            byTopic: [...statements].sort((a, b) => a.topic.localeCompare(b.topic))
        };

        const sequenceResults = {};

        // Score with each temporal sequence
        for (const [method, orderedStatements] of Object.entries(sortingMethods)) {
            const scores = [];
            
            for (let i = 0; i < orderedStatements.length; i++) {
                const statement = orderedStatements[i];
                const score = await scoringFunction(statement, { 
                    sequencePosition: i,
                    totalInSequence: orderedStatements.length,
                    processingMethod: method
                });
                
                scores.push({
                    id: statement.id,
                    score: score,
                    sequencePosition: i
                });
            }
            
            sequenceResults[method] = scores;
        }

        const analysis = this.analyzeTemporalSequenceVariance(sequenceResults);
        
        return {
            ...test,
            sequenceResults: sequenceResults,
            analysis: analysis,
            independenceScore: this.calculateTemporalIndependenceScore(analysis),
            passed: analysis.maxSequenceVariance <= this.independenceThresholds.temporalSequenceBias
        };
    }

    analyzeTemporalSequenceVariance(sequenceResults) {
        const analysis = {
            sequenceVariances: {},
            maxSequenceVariance: 0,
            problematicStatements: []
        };

        // Get baseline (random) scores
        const randomScores = sequenceResults.random;
        
        // Compare each method against random baseline
        Object.entries(sequenceResults).forEach(([method, scores]) => {
            if (method === 'random') return;
            
            const variances = [];
            
            randomScores.forEach(randomScore => {
                const methodScore = scores.find(s => s.id === randomScore.id);
                if (methodScore) {
                    const variance = Math.abs(randomScore.score - methodScore.score);
                    variances.push(variance);
                    
                    if (variance > this.independenceThresholds.temporalSequenceBias) {
                        analysis.problematicStatements.push({
                            id: randomScore.id,
                            method: method,
                            variance: variance,
                            randomScore: randomScore.score,
                            methodScore: methodScore.score
                        });
                    }
                }
            });
            
            analysis.sequenceVariances[method] = {
                maxVariance: Math.max(...variances),
                averageVariance: this.calculateMean(variances),
                problematicCount: variances.filter(v => v > this.independenceThresholds.temporalSequenceBias).length
            };
        });

        analysis.maxSequenceVariance = Math.max(
            ...Object.values(analysis.sequenceVariances).map(sv => sv.maxVariance)
        );

        return analysis;
    }

    /**
     * 7. OVERALL INDEPENDENCE SCORING
     */
    calculateOverallIndependenceScore(independenceTests) {
        const weights = {
            orderingIndependence: 0.25,
            priorStatementInfluence: 0.20,
            contextualIndependence: 0.20,
            batchProcessingIndependence: 0.20,
            temporalSequenceIndependence: 0.15
        };

        let weightedScore = 0;
        let totalWeight = 0;

        Object.entries(weights).forEach(([testName, weight]) => {
            if (independenceTests[testName]) {
                weightedScore += independenceTests[testName].independenceScore * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 ? weightedScore / totalWeight : 0;
    }

    calculateOrderingIndependenceScore(analysis) {
        const maxAllowableVariance = this.independenceThresholds.orderVariance;
        return Math.max(0, 100 - (analysis.maxVariance / maxAllowableVariance) * 100);
    }

    calculatePriorInfluenceIndependenceScore(analysis) {
        const maxAllowableInfluence = this.independenceThresholds.priorStatementInfluence;
        return Math.max(0, 100 - (analysis.maxInfluence / maxAllowableInfluence) * 100);
    }

    calculateContextualIndependenceScore(analysis) {
        const maxAllowableBias = this.independenceThresholds.contextualBias;
        return Math.max(0, 100 - (analysis.maxContextualInfluence / maxAllowableBias) * 100);
    }

    calculateBatchIndependenceScore(analysis) {
        const maxAllowableVariance = this.independenceThresholds.batchProcessingVariance;
        return Math.max(0, 100 - (analysis.maxBatchVariance / maxAllowableVariance) * 100);
    }

    calculateTemporalIndependenceScore(analysis) {
        const maxAllowableVariance = this.independenceThresholds.temporalSequenceBias;
        return Math.max(0, 100 - (analysis.maxSequenceVariance / maxAllowableVariance) * 100);
    }

    /**
     * 8. ISSUE IDENTIFICATION AND RECOMMENDATIONS
     */
    identifyCriticalIndependenceIssues(independenceTests) {
        const criticalIssues = [];

        Object.entries(independenceTests).forEach(([testName, testResult]) => {
            if (!testResult.passed) {
                criticalIssues.push({
                    testType: testName,
                    severity: testResult.independenceScore < 60 ? 'critical' : 'warning',
                    description: testResult.description,
                    independenceScore: testResult.independenceScore,
                    details: this.extractIssueDetails(testResult)
                });
            }
        });

        return criticalIssues;
    }

    generateIndependenceRecommendations(independenceTests) {
        const recommendations = [];

        Object.entries(independenceTests).forEach(([testName, testResult]) => {
            if (testResult.independenceScore < 80) {
                const recommendation = this.generateTestSpecificRecommendation(testName, testResult);
                if (recommendation) {
                    recommendations.push(recommendation);
                }
            }
        });

        return recommendations;
    }

    generateTestSpecificRecommendation(testName, testResult) {
        const recommendations = {
            orderingIndependence: {
                priority: 'high',
                action: 'Implement statement shuffling and isolation protocols',
                rationale: 'Statement scores show dependency on processing order',
                expectedImprovement: 'Reduce ordering variance by 60-80%'
            },
            priorStatementInfluence: {
                priority: 'high', 
                action: 'Isolate statement scoring from contextual history',
                rationale: 'Previous statements are influencing current scores',
                expectedImprovement: 'Eliminate context dependency'
            },
            contextualIndependence: {
                priority: 'medium',
                action: 'Enhance context anonymization procedures',
                rationale: 'Statement context is affecting scientific content scores',
                expectedImprovement: 'Reduce contextual bias by 50-70%'
            },
            batchProcessingIndependence: {
                priority: 'medium',
                action: 'Standardize batch processing or use individual scoring',
                rationale: 'Batch size affects individual statement scores',
                expectedImprovement: 'Eliminate batch processing variance'
            },
            temporalSequenceIndependence: {
                priority: 'low',
                action: 'Randomize processing sequences',
                rationale: 'Temporal processing order introduces bias',
                expectedImprovement: 'Reduce sequence-dependent scoring'
            }
        };

        return recommendations[testName] || null;
    }

    /**
     * UTILITY FUNCTIONS
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    calculateMean(values) {
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    calculateVariance(values) {
        if (values.length < 2) return 0;
        const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    extractIssueDetails(testResult) {
        const details = {
            score: testResult.independenceScore,
            passed: testResult.passed
        };

        if (testResult.analysis) {
            if (testResult.analysis.problematicStatements) {
                details.problematicCount = testResult.analysis.problematicStatements.length;
            }
            if (testResult.analysis.maxVariance !== undefined) {
                details.maxVariance = testResult.analysis.maxVariance;
            }
            if (testResult.analysis.maxInfluence !== undefined) {
                details.maxInfluence = testResult.analysis.maxInfluence;
            }
        }

        return details;
    }
}

class IndependenceMetrics {
    constructor() {
        this.metrics = {};
    }

    calculateIndependenceMetric(testResults) {
        // Calculate comprehensive independence metrics
        return {
            overallScore: this.calculateOverallScore(testResults),
            reliability: this.calculateReliability(testResults),
            consistency: this.calculateConsistency(testResults),
            robustness: this.calculateRobustness(testResults)
        };
    }

    calculateOverallScore(testResults) {
        // Implementation for overall independence scoring
        return 85; // Placeholder
    }

    calculateReliability(testResults) {
        // Implementation for reliability calculation
        return 0.87; // Placeholder
    }

    calculateConsistency(testResults) {
        // Implementation for consistency calculation  
        return 0.82; // Placeholder
    }

    calculateRobustness(testResults) {
        // Implementation for robustness calculation
        return 0.79; // Placeholder
    }
}

class ValidationProtocols {
    constructor() {
        this.protocols = [];
    }

    createValidationProtocol(testType, requirements) {
        return {
            testType: testType,
            requirements: requirements,
            validationSteps: this.defineValidationSteps(testType),
            acceptanceCriteria: this.defineAcceptanceCriteria(testType)
        };
    }

    defineValidationSteps(testType) {
        const steps = {
            orderingIndependence: [
                'Shuffle statement order multiple times',
                'Score statements in each order',
                'Calculate variance across orderings',
                'Identify statements with high variance',
                'Validate consistency of scores'
            ],
            priorStatementInfluence: [
                'Score statements in isolation',
                'Score with positive context',
                'Score with negative context', 
                'Score with mixed context',
                'Compare isolated vs contextual scores'
            ]
        };
        
        return steps[testType] || [];
    }

    defineAcceptanceCriteria(testType) {
        const criteria = {
            orderingIndependence: [
                'Max variance ≤ 5 points',
                'Average variance ≤ 2 points',
                '<5% of statements show high variance',
                'No systematic ordering bias detected'
            ],
            priorStatementInfluence: [
                'Max influence ≤ 3 points',
                'Average influence ≤ 1 point',
                '<3% of statements show context dependency',
                'No systematic context bias patterns'
            ]
        };
        
        return criteria[testType] || [];
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StatementIndependenceQC,
        IndependenceMetrics,
        ValidationProtocols
    };
}