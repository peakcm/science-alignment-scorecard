/**
 * Advanced Bias Detection Algorithms and Statistical Analysis Tools
 * Science Alignment Scorecard - Advanced Analytics Module
 */

class AdvancedBiasAnalytics {
    constructor() {
        this.biasThresholds = {
            partyBias: 5,           // Maximum acceptable party score difference
            sourceBias: 8,          // Maximum acceptable source score variance  
            temporalDrift: 3,       // Maximum acceptable score drift per year
            nameEffect: 10,         // Maximum acceptable name-based score change
            semanticConsistency: 7   // Maximum acceptable score variance for similar content
        };
        
        this.statisticalTests = new StatisticalTestSuite();
        this.machineLearning = new BiasPatternDetection();
    }

    /**
     * 1. SOPHISTICATED PARTY BIAS DETECTION
     */
    async detectPartyBias(statements) {
        const partyGroups = this.groupStatementsByParty(statements);
        
        const analysis = {
            timestamp: new Date().toISOString(),
            partyComparison: {},
            statisticalTests: {},
            biasIndicators: {}
        };

        // Analyze each scientific topic separately
        const topics = [...new Set(statements.map(s => s.topic))];
        
        for (const topic of topics) {
            const topicStatements = statements.filter(s => s.topic === topic);
            const topicGroups = this.groupStatementsByParty(topicStatements);
            
            if (topicGroups.Democratic.length > 0 && topicGroups.Republican.length > 0) {
                analysis.partyComparison[topic] = await this.analyzePartyDifferences(
                    topicGroups.Democratic,
                    topicGroups.Republican,
                    topic
                );
            }
        }

        // Overall party bias assessment
        analysis.statisticalTests = await this.performPartyBiasStatistics(partyGroups);
        analysis.biasIndicators = this.calculatePartyBiasIndicators(analysis.partyComparison);
        
        return analysis;
    }

    groupStatementsByParty(statements) {
        return statements.reduce((groups, statement) => {
            const party = statement.party || 'Independent';
            if (!groups[party]) groups[party] = [];
            groups[party].push(statement);
            return groups;
        }, { Democratic: [], Republican: [], Independent: [] });
    }

    async analyzePartyDifferences(demStatements, repStatements, topic) {
        const demScores = demStatements.map(s => s.position || s.score);
        const repScores = repStatements.map(s => s.position || s.score);
        
        return {
            democraticMean: this.calculateMean(demScores),
            republicanMean: this.calculateMean(repScores),
            scoreDifference: this.calculateMean(demScores) - this.calculateMean(repScores),
            effectSize: this.calculateCohenD(demScores, repScores),
            welchTTest: this.statisticalTests.welchTTest(demScores, repScores),
            mannWhitneyU: this.statisticalTests.mannWhitneyU(demScores, repScores),
            democraticVariance: this.calculateVariance(demScores),
            republicanVariance: this.calculateVariance(repScores),
            biasAssessment: this.assessPartyBiasSignificance(demScores, repScores)
        };
    }

    /**
     * 2. SOURCE BIAS DETECTION
     */
    async detectSourceBias(statements) {
        const sourceGroups = this.groupStatementsBySource(statements);
        
        const analysis = {
            timestamp: new Date().toISOString(),
            sourceAnalysis: {},
            biasIndicators: {},
            suspiciousSources: []
        };

        // Analyze each source
        for (const [source, sourceStatements] of Object.entries(sourceGroups)) {
            if (sourceStatements.length >= 3) { // Minimum sample size
                analysis.sourceAnalysis[source] = await this.analyzeSourceBias(sourceStatements, source);
            }
        }

        // Identify biased sources
        analysis.suspiciousSources = this.identifySuspiciousSources(analysis.sourceAnalysis);
        analysis.biasIndicators = this.calculateSourceBiasIndicators(analysis.sourceAnalysis);
        
        return analysis;
    }

    groupStatementsBySource(statements) {
        return statements.reduce((groups, statement) => {
            const source = statement.source || 'Unknown';
            if (!groups[source]) groups[source] = [];
            groups[source].push(statement);
            return groups;
        }, {});
    }

    async analyzeSourceBias(sourceStatements, sourceName) {
        const scores = sourceStatements.map(s => s.position || s.score);
        const topics = [...new Set(sourceStatements.map(s => s.topic))];
        
        return {
            sourceName,
            sampleSize: sourceStatements.length,
            meanScore: this.calculateMean(scores),
            scoreVariance: this.calculateVariance(scores),
            topicCoverage: topics.length,
            topicScores: topics.reduce((acc, topic) => {
                const topicScores = sourceStatements
                    .filter(s => s.topic === topic)
                    .map(s => s.position || s.score);
                acc[topic] = {
                    mean: this.calculateMean(topicScores),
                    count: topicScores.length
                };
                return acc;
            }, {}),
            biasRisk: this.calculateSourceBiasRisk(scores, sourceName),
            qualityMetrics: this.calculateSourceQualityMetrics(sourceStatements)
        };
    }

    calculateSourceBiasRisk(scores, sourceName) {
        // Check for suspicious patterns
        const variance = this.calculateVariance(scores);
        const mean = this.calculateMean(scores);
        const range = Math.max(...scores) - Math.min(...scores);
        
        let riskFactors = [];
        
        // Very low variance might indicate cherry-picking
        if (variance < 5 && scores.length > 5) {
            riskFactors.push('suspiciously_low_variance');
        }
        
        // Extreme means might indicate bias
        if (mean < 20 || mean > 80) {
            riskFactors.push('extreme_mean_score');
        }
        
        // Very limited range might indicate bias
        if (range < 15 && scores.length > 5) {
            riskFactors.push('limited_score_range');
        }
        
        // Source name analysis
        const biasedKeywords = ['partisan', 'conservative', 'liberal', 'progressive', 'activist'];
        if (biasedKeywords.some(keyword => sourceName.toLowerCase().includes(keyword))) {
            riskFactors.push('potentially_biased_source_name');
        }
        
        return {
            riskLevel: riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low',
            riskFactors: riskFactors,
            riskScore: Math.min(100, riskFactors.length * 25)
        };
    }

    /**
     * 3. TEMPORAL BIAS DETECTION
     */
    async detectTemporalBias(statements) {
        const timeSeriesData = this.prepareTimeSeriesData(statements);
        
        const analysis = {
            timestamp: new Date().toISOString(),
            overallTrend: {},
            candidateTrends: {},
            biasIndicators: {}
        };

        // Overall temporal trend analysis
        analysis.overallTrend = this.analyzeOverallTemporalTrend(timeSeriesData);
        
        // Per-candidate temporal analysis
        const candidates = [...new Set(statements.map(s => s.candidate))];
        for (const candidate of candidates) {
            const candidateStatements = statements.filter(s => s.candidate === candidate);
            if (candidateStatements.length >= 5) {
                analysis.candidateTrends[candidate] = this.analyzeCandidateTemporalTrend(candidateStatements);
            }
        }

        analysis.biasIndicators = this.calculateTemporalBiasIndicators(analysis);
        
        return analysis;
    }

    prepareTimeSeriesData(statements) {
        return statements
            .filter(s => s.date && (s.position !== undefined || s.score !== undefined))
            .map(s => ({
                date: new Date(s.date),
                score: s.position || s.score,
                candidate: s.candidate,
                topic: s.topic,
                party: s.party
            }))
            .sort((a, b) => a.date - b.date);
    }

    analyzeOverallTemporalTrend(timeSeriesData) {
        if (timeSeriesData.length < 10) {
            return { error: 'Insufficient data for temporal analysis' };
        }

        // Group by month for trend analysis
        const monthlyData = this.groupByMonth(timeSeriesData);
        const monthlyAverages = Object.entries(monthlyData).map(([month, scores]) => ({
            month,
            avgScore: this.calculateMean(scores.map(s => s.score)),
            count: scores.length
        }));

        const trendAnalysis = this.calculateTrendMetrics(monthlyAverages);
        
        return {
            dataPoints: timeSeriesData.length,
            timeSpan: this.calculateTimeSpan(timeSeriesData),
            trendSlope: trendAnalysis.slope,
            trendSignificance: trendAnalysis.pValue,
            seasonality: this.detectSeasonality(monthlyAverages),
            volatility: this.calculateVolatility(monthlyAverages)
        };
    }

    /**
     * 4. SEMANTIC CONSISTENCY ANALYSIS
     */
    async detectSemanticBias(statements) {
        const analysis = {
            timestamp: new Date().toISOString(),
            similarityGroups: {},
            consistencyMetrics: {},
            biasIndicators: {}
        };

        // Group semantically similar statements
        const similarityGroups = await this.groupBySementicSimilarity(statements);
        
        // Analyze scoring consistency within groups
        for (const [groupId, group] of Object.entries(similarityGroups)) {
            if (group.statements.length >= 3) {
                analysis.similarityGroups[groupId] = await this.analyzeSemanticConsistency(group);
            }
        }

        analysis.consistencyMetrics = this.calculateOverallSemanticConsistency(analysis.similarityGroups);
        analysis.biasIndicators = this.identifySemanticBiasPatterns(analysis.similarityGroups);
        
        return analysis;
    }

    async groupBySementicSimilarity(statements) {
        // Simplified semantic grouping (in real implementation, would use NLP)
        const groups = {};
        let groupCounter = 1;

        for (const statement of statements) {
            let assigned = false;
            
            // Check against existing groups
            for (const [groupId, group] of Object.entries(groups)) {
                const similarity = this.calculateTextSimilarity(statement.quote, group.representative);
                if (similarity > 0.7) { // 70% similarity threshold
                    group.statements.push(statement);
                    assigned = true;
                    break;
                }
            }
            
            // Create new group if not assigned
            if (!assigned) {
                groups[`group_${groupCounter++}`] = {
                    representative: statement.quote,
                    topic: statement.topic,
                    statements: [statement]
                };
            }
        }

        return groups;
    }

    calculateTextSimilarity(text1, text2) {
        // Simple word overlap similarity (replace with more sophisticated NLP in production)
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }

    /**
     * 5. STATISTICAL TEST SUITE
     */
    performPartyBiasStatistics(partyGroups) {
        if (partyGroups.Democratic.length === 0 || partyGroups.Republican.length === 0) {
            return { error: 'Insufficient data for party comparison' };
        }

        const demScores = partyGroups.Democratic.map(s => s.position || s.score);
        const repScores = partyGroups.Republican.map(s => s.position || s.score);

        return {
            welchTTest: this.statisticalTests.welchTTest(demScores, repScores),
            mannWhitneyU: this.statisticalTests.mannWhitneyU(demScores, repScores),
            kolmogorovSmirnov: this.statisticalTests.kolmogorovSmirnov(demScores, repScores),
            effectSize: this.calculateCohenD(demScores, repScores),
            confidenceInterval: this.calculateConfidenceInterval(demScores, repScores)
        };
    }

    /**
     * 6. BIAS PATTERN MACHINE LEARNING
     */
    async trainBiasDetectionModel(historicalData) {
        // Simplified ML approach (in production, use proper ML libraries)
        const features = this.extractBiasFeatures(historicalData);
        const model = await this.machineLearning.trainBiasClassifier(features);
        
        return {
            modelAccuracy: model.accuracy,
            featureImportance: model.featureImportance,
            trainingSize: historicalData.length,
            validationMetrics: model.validationMetrics
        };
    }

    extractBiasFeatures(statements) {
        return statements.map(statement => ({
            partyFeature: this.encodeParty(statement.party),
            sourceFeature: this.encodeSource(statement.source),
            temporalFeature: this.encodeTemporalContext(statement.date),
            semanticFeatures: this.extractSemanticFeatures(statement.quote),
            biasLabel: this.determineBiasLabel(statement) // Historical bias determination
        }));
    }

    /**
     * 7. COMPREHENSIVE BIAS SCORING
     */
    calculateComprehensiveBiasScore(allAnalyses) {
        const weights = {
            partyBias: 0.25,
            sourceBias: 0.20,
            temporalBias: 0.15,
            semanticBias: 0.20,
            controlPanelBias: 0.20
        };

        let weightedScore = 0;
        let totalWeight = 0;

        // Party bias component
        if (allAnalyses.partyBias && !allAnalyses.partyBias.error) {
            const partyScore = this.scorePartyBias(allAnalyses.partyBias);
            weightedScore += partyScore * weights.partyBias;
            totalWeight += weights.partyBias;
        }

        // Source bias component
        if (allAnalyses.sourceBias) {
            const sourceScore = this.scoreSourceBias(allAnalyses.sourceBias);
            weightedScore += sourceScore * weights.sourceBias;
            totalWeight += weights.sourceBias;
        }

        // Temporal bias component
        if (allAnalyses.temporalBias) {
            const temporalScore = this.scoreTemporalBias(allAnalyses.temporalBias);
            weightedScore += temporalScore * weights.temporalBias;
            totalWeight += weights.temporalBias;
        }

        // Semantic bias component
        if (allAnalyses.semanticBias) {
            const semanticScore = this.scoreSemanticBias(allAnalyses.semanticBias);
            weightedScore += semanticScore * weights.semanticBias;
            totalWeight += weights.semanticBias;
        }

        return {
            overallScore: totalWeight > 0 ? (weightedScore / totalWeight) : 0,
            componentScores: {
                partyBias: this.scorePartyBias(allAnalyses.partyBias),
                sourceBias: this.scoreSourceBias(allAnalyses.sourceBias),
                temporalBias: this.scoreTemporalBias(allAnalyses.temporalBias),
                semanticBias: this.scoreSemanticBias(allAnalyses.semanticBias)
            },
            confidence: this.calculateConfidenceLevel(allAnalyses),
            recommendations: this.generateBiasRecommendations(allAnalyses)
        };
    }

    /**
     * UTILITY FUNCTIONS
     */
    calculateMean(values) {
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    calculateVariance(values) {
        if (values.length < 2) return 0;
        const mean = this.calculateMean(values);
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    calculateCohenD(group1, group2) {
        const mean1 = this.calculateMean(group1);
        const mean2 = this.calculateMean(group2);
        const var1 = this.calculateVariance(group1);
        const var2 = this.calculateVariance(group2);
        
        const pooledSD = Math.sqrt((var1 + var2) / 2);
        return pooledSD > 0 ? (mean1 - mean2) / pooledSD : 0;
    }

    generateBiasRecommendations(analyses) {
        const recommendations = [];
        
        // Add specific recommendations based on analysis results
        if (analyses.partyBias && this.scorePartyBias(analyses.partyBias) < 70) {
            recommendations.push({
                priority: 'high',
                category: 'party_bias',
                action: 'Implement stricter party anonymization in scoring process',
                rationale: 'Significant party-based scoring differences detected'
            });
        }

        if (analyses.sourceBias && analyses.sourceBias.suspiciousSources.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'source_bias',
                action: 'Review and potentially exclude biased news sources',
                rationale: `${analyses.sourceBias.suspiciousSources.length} sources show bias indicators`
            });
        }

        return recommendations;
    }
}

class StatisticalTestSuite {
    welchTTest(sample1, sample2) {
        // Simplified implementation (use proper statistical library in production)
        const mean1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
        const mean2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;
        
        const var1 = this.calculateVariance(sample1);
        const var2 = this.calculateVariance(sample2);
        
        const n1 = sample1.length;
        const n2 = sample2.length;
        
        const tStatistic = (mean1 - mean2) / Math.sqrt(var1/n1 + var2/n2);
        const df = Math.pow(var1/n1 + var2/n2, 2) / (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1));
        
        return {
            tStatistic: tStatistic,
            degreesOfFreedom: df,
            pValue: this.tDistributionPValue(Math.abs(tStatistic), df),
            significant: this.tDistributionPValue(Math.abs(tStatistic), df) < 0.05
        };
    }

    mannWhitneyU(sample1, sample2) {
        // Simplified non-parametric test implementation
        const combined = [...sample1.map(x => ({value: x, group: 1})), 
                          ...sample2.map(x => ({value: x, group: 2}))];
        
        combined.sort((a, b) => a.value - b.value);
        
        let u1 = 0;
        for (let i = 0; i < combined.length; i++) {
            if (combined[i].group === 1) {
                u1 += combined.filter((item, idx) => idx < i && item.group === 2).length;
            }
        }
        
        const u2 = sample1.length * sample2.length - u1;
        const uStatistic = Math.min(u1, u2);
        
        return {
            u1: u1,
            u2: u2,
            uStatistic: uStatistic,
            significant: this.mannWhitneySignificant(uStatistic, sample1.length, sample2.length)
        };
    }

    kolmogorovSmirnov(sample1, sample2) {
        // Simplified KS test for comparing distributions
        const combined = [...new Set([...sample1, ...sample2])].sort((a, b) => a - b);
        
        let maxDifference = 0;
        for (const value of combined) {
            const cdf1 = sample1.filter(x => x <= value).length / sample1.length;
            const cdf2 = sample2.filter(x => x <= value).length / sample2.length;
            
            maxDifference = Math.max(maxDifference, Math.abs(cdf1 - cdf2));
        }
        
        return {
            dStatistic: maxDifference,
            pValue: this.ksDistributionPValue(maxDifference, sample1.length, sample2.length),
            significant: this.ksDistributionPValue(maxDifference, sample1.length, sample2.length) < 0.05
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }

    tDistributionPValue(t, df) {
        // Simplified p-value calculation (use proper statistical library)
        return t > 2.0 ? 0.025 : t > 1.645 ? 0.05 : 0.1;
    }

    mannWhitneySignificant(u, n1, n2) {
        // Simplified significance test
        const critical = Math.min(n1 * n2 * 0.3, 20);
        return u < critical;
    }

    ksDistributionPValue(d, n1, n2) {
        // Simplified KS p-value
        return d > 0.5 ? 0.01 : d > 0.3 ? 0.05 : 0.1;
    }
}

class BiasPatternDetection {
    constructor() {
        this.patterns = [];
        this.modelWeights = {};
    }

    async trainBiasClassifier(features) {
        // Simplified ML training (use proper ML library in production)
        const model = {
            accuracy: 0.85,
            featureImportance: {
                partyFeature: 0.35,
                sourceFeature: 0.25,
                temporalFeature: 0.15,
                semanticFeatures: 0.25
            },
            validationMetrics: {
                precision: 0.82,
                recall: 0.88,
                f1Score: 0.85
            }
        };
        
        return model;
    }

    detectBiasPatterns(statements) {
        const patterns = {
            partyClusteringPattern: this.detectPartyClusteringBias(statements),
            sourceConsistencyPattern: this.detectSourceConsistencyBias(statements),
            temporalShiftPattern: this.detectTemporalShiftBias(statements),
            semanticInconsistencyPattern: this.detectSemanticInconsistencyBias(statements)
        };
        
        return patterns;
    }

    detectPartyClusteringBias(statements) {
        // Check if scores cluster by party affiliation
        const democraticScores = statements.filter(s => s.party === 'Democratic').map(s => s.position || s.score);
        const republicanScores = statements.filter(s => s.party === 'Republican').map(s => s.position || s.score);
        
        if (democraticScores.length === 0 || republicanScores.length === 0) {
            return { detected: false, reason: 'insufficient_data' };
        }
        
        const clustering = this.calculateClusteringSeparation(democraticScores, republicanScores);
        
        return {
            detected: clustering.separation > 0.7,
            severity: clustering.separation,
            description: 'Scores show strong clustering by party affiliation',
            recommendation: 'Review scoring methodology for party-based bias'
        };
    }

    calculateClusteringSeparation(group1, group2) {
        const mean1 = group1.reduce((a, b) => a + b, 0) / group1.length;
        const mean2 = group2.reduce((a, b) => a + b, 0) / group2.length;
        
        const pooledStd = Math.sqrt((this.variance(group1) + this.variance(group2)) / 2);
        const separation = Math.abs(mean1 - mean2) / (pooledStd + 1); // Add 1 to prevent division by zero
        
        return {
            separation: Math.min(1, separation / 50), // Normalize to 0-1
            meanDifference: Math.abs(mean1 - mean2),
            pooledStandardDeviation: pooledStd
        };
    }

    variance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdvancedBiasAnalytics,
        StatisticalTestSuite,
        BiasPatternDetection
    };
}