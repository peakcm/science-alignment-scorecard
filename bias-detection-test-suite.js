/**
 * Bias Detection Test Suite and Implementation
 * Demonstrates the bias detection system with practical examples
 */

// Mock scoring function for demonstration
async function mockScoringFunction(statement) {
    // Simulate bias by adjusting scores based on candidate names or parties
    let baseScore = statement.expectedScore || 50;
    
    // Simulate potential biases (these would be eliminated by proper implementation)
    if (statement.quote.toLowerCase().includes('kari lake')) {
        baseScore *= 0.8; // Potential negative bias
    }
    if (statement.quote.toLowerCase().includes('ruben gallego')) {
        baseScore *= 1.1; // Potential positive bias
    }
    if (statement.party === 'Republican') {
        baseScore *= 0.95; // Slight party bias
    }
    if (statement.party === 'Democratic') {
        baseScore *= 1.05; // Slight party bias
    }
    
    // Add some randomness
    const randomFactor = 0.9 + (Math.random() * 0.2);
    baseScore *= randomFactor;
    
    return Math.min(100, Math.max(0, Math.round(baseScore)));
}

class BiasDetectionTestSuite {
    constructor() {
        this.biasDetectionSystem = new BiasDetectionSystem();
        this.testCandidates = [
            {
                name: 'Kari Lake',
                party: 'Republican',
                state: 'AZ',
                office: 'U.S. Senate'
            },
            {
                name: 'Ruben Gallego', 
                party: 'Democratic',
                state: 'AZ',
                office: 'U.S. Senate'
            }
        ];
    }

    async runFullBiasDetectionDemo() {
        console.log('='.repeat(80));
        console.log('BIAS DETECTION SYSTEM DEMONSTRATION');
        console.log('='.repeat(80));
        
        // 1. Control Panel Bias Testing
        await this.demonstrateControlPanelTesting();
        
        // 2. Name Anonymization Testing
        await this.demonstrateNameAnonymization();
        
        // 3. Cross-Validation Testing
        await this.demonstrateCrossValidation();
        
        // 4. Comprehensive Report Generation
        await this.generateComprehensiveReport();
        
        console.log('\n' + '='.repeat(80));
        console.log('BIAS DETECTION DEMONSTRATION COMPLETE');
        console.log('='.repeat(80));
    }

    async demonstrateControlPanelTesting() {
        console.log('\n1. CONTROL PANEL BIAS TESTING');
        console.log('-'.repeat(50));
        console.log('Testing known statements with different candidate attributions...\n');
        
        const results = await this.biasDetectionSystem.runControlPanelBiasTest(
            this.testCandidates, 
            mockScoringFunction
        );
        
        console.log(`Test Results Summary:`);
        console.log(`- Total Tests: ${results.summary.totalTests}`);
        console.log(`- Passed Tests: ${results.summary.passedTests}`);
        console.log(`- Failed Tests: ${results.summary.failedTests}`);
        console.log(`- Overall Bias Score: ${results.summary.overallBiasScore.toFixed(1)}%`);
        
        if (results.summary.biasWarnings.length > 0) {
            console.log(`\nBias Warnings Detected:`);
            results.summary.biasWarnings.forEach((warning, i) => {
                console.log(`  ${i+1}. Control ${warning.controlId}: Max deviation of ${warning.maxDeviation} points`);
            });
        }
        
        // Show detailed example
        const exampleTest = results.tests[0];
        console.log(`\nDetailed Example - ${exampleTest.controlId} (${exampleTest.topic}):`);
        console.log(`Expected Score: ${exampleTest.expectedScore}`);
        Object.entries(exampleTest.tests).forEach(([testName, result]) => {
            const deviation = Math.abs(result.score - exampleTest.expectedScore);
            console.log(`  ${testName}: ${result.score} (deviation: ${deviation})`);
        });
    }

    async demonstrateNameAnonymization() {
        console.log('\n2. NAME ANONYMIZATION TESTING');
        console.log('-'.repeat(50));
        
        const testStatement = {
            quote: "Kari Lake believes vaccines are dangerous and should not be mandatory for children in Arizona schools.",
            candidate: "Kari Lake",
            party: "Republican",
            state: "AZ"
        };
        
        console.log('Original Statement:');
        console.log(`"${testStatement.quote}"`);
        
        const anonymized = this.biasDetectionSystem.anonymizeStatement(
            testStatement, 
            this.testCandidates[0]
        );
        
        console.log('\nAnonymized Statement:');
        console.log(`"${anonymized.quote}"`);
        
        // Test scoring with different versions
        const originalScore = await mockScoringFunction(testStatement);
        const anonymizedScore = await mockScoringFunction({...anonymized, expectedScore: 10});
        
        console.log(`\nScoring Comparison:`);
        console.log(`Original (with name): ${originalScore}`);
        console.log(`Anonymized: ${anonymizedScore}`);
        console.log(`Score difference: ${Math.abs(originalScore - anonymizedScore)} points`);
        
        if (Math.abs(originalScore - anonymizedScore) > 5) {
            console.log('⚠️  WARNING: Significant score difference detected - potential name bias');
        } else {
            console.log('✅ GOOD: Minimal score difference - low name bias');
        }
    }

    async demonstrateCrossValidation() {
        console.log('\n3. CROSS-VALIDATION TESTING');
        console.log('-'.repeat(50));
        
        const testStatements = [
            {
                id: 'test_001',
                quote: 'Vaccines are safe and effective for preventing disease.',
                candidate: 'Kari Lake',
                party: 'Republican',
                position: 20,
                topic: 'childhood_immunization'
            },
            {
                id: 'test_002', 
                quote: 'Climate change is driven primarily by human activities.',
                candidate: 'Ruben Gallego',
                party: 'Democratic', 
                position: 95,
                topic: 'climate_change'
            }
        ];
        
        const crossValidationResults = await this.biasDetectionSystem.runCrossValidationTest(
            testStatements,
            this.testCandidates,
            mockScoringFunction
        );
        
        console.log(`Cross-Validation Results:`);
        console.log(`- Consistent Statements: ${crossValidationResults.summary.consistentStatements}`);
        console.log(`- Inconsistent Statements: ${crossValidationResults.summary.inconsistentStatements}`);
        console.log(`- Average Score Difference: ${crossValidationResults.summary.averageScoreDifference.toFixed(1)}`);
        console.log(`- Bias Likelihood: ${crossValidationResults.summary.biasLikelihood.toFixed(1)}%`);
        
        // Show detailed example
        console.log(`\nDetailed Cross-Validation Example:`);
        const example = crossValidationResults.tests[0];
        console.log(`Statement: "${testStatements[0].quote}"`);
        console.log(`Original candidate: ${example.originalCandidate} (Score: ${example.originalScore})`);
        
        Object.entries(example.crossValidationScores).forEach(([candidate, result]) => {
            console.log(`  ${candidate} (${result.party}): ${result.score} (diff: ${result.scoreDifference})`);
        });
    }

    async generateComprehensiveReport() {
        console.log('\n4. COMPREHENSIVE BIAS REPORT');
        console.log('-'.repeat(50));
        
        // Use sample statements from candidate data
        const sampleStatements = [
            {
                id: 'sample_001',
                quote: 'We will NEVER allow experimental COVID shots for children in Arizona.',
                candidate: 'Kari Lake',
                party: 'Republican',
                position: 8,
                topic: 'childhood_immunization'
            },
            {
                id: 'sample_002',
                quote: 'Vaccines save lives and we must support vaccine access while fighting misinformation.',
                candidate: 'Ruben Gallego', 
                party: 'Democratic',
                position: 98,
                topic: 'childhood_immunization'
            }
        ];
        
        const comprehensiveReport = await this.biasDetectionSystem.generateComprehensiveBiasReport(
            this.testCandidates,
            sampleStatements,
            mockScoringFunction
        );
        
        console.log(`Overall Assessment:`);
        console.log(`- Bias Score: ${comprehensiveReport.overallAssessment.overallBiasScore.toFixed(1)}%`);
        console.log(`- Rating: ${comprehensiveReport.overallAssessment.rating}`);
        
        if (comprehensiveReport.overallAssessment.keyFindings.length > 0) {
            console.log(`\nKey Findings:`);
            comprehensiveReport.overallAssessment.keyFindings.forEach((finding, i) => {
                console.log(`  ${i+1}. ${finding}`);
            });
        }
        
        if (comprehensiveReport.overallAssessment.criticalIssues.length > 0) {
            console.log(`\nCritical Issues:`);
            comprehensiveReport.overallAssessment.criticalIssues.forEach((issue, i) => {
                console.log(`  ${i+1}. ${issue.description} (${issue.severity})`);
            });
        }
        
        console.log(`\nRecommendations:`);
        comprehensiveReport.overallAssessment.recommendations.forEach((rec, i) => {
            console.log(`  ${i+1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
            console.log(`      Reason: ${rec.reason}`);
        });
    }

    // Utility method to save bias test results
    async saveBiasTestResults(results, filename) {
        const fs = require('fs').promises;
        await fs.writeFile(filename, JSON.stringify(results, null, 2));
        console.log(`Results saved to ${filename}`);
    }
}

// Implementation Guide and Usage Examples
class BiasDetectionImplementationGuide {
    static getImplementationInstructions() {
        return {
            setup: [
                '1. Import BiasDetectionSystem into your main application',
                '2. Initialize with: const biasDetector = new BiasDetectionSystem()',
                '3. Configure your scoring function to work with the bias detection system',
                '4. Set up regular bias monitoring in your application'
            ],
            
            integration: [
                '1. Run control panel tests before deploying new scoring algorithms',
                '2. Implement name anonymization in your statement preprocessing',
                '3. Add cross-validation testing to your quality assurance process',
                '4. Set up automated bias monitoring with alerts for threshold violations'
            ],
            
            monitoring: [
                '1. Schedule daily bias detection reports',
                '2. Set up alerts for bias scores below 80%',
                '3. Review control panel test failures immediately',
                '4. Monitor cross-validation consistency trends',
                '5. Document all bias detection findings and remediation actions'
            ],
            
            bestPractices: [
                '1. Always anonymize candidate names before scoring',
                '2. Use multiple scoring methods and compare results',
                '3. Regularly update control panel with new test cases',
                '4. Train scorers on bias awareness and mitigation',
                '5. Maintain detailed audit logs of all scoring decisions',
                '6. Implement human review for statements with high bias risk'
            ]
        };
    }
    
    static printImplementationGuide() {
        const guide = this.getImplementationInstructions();
        
        console.log('\n' + '='.repeat(80));
        console.log('BIAS DETECTION IMPLEMENTATION GUIDE');
        console.log('='.repeat(80));
        
        Object.entries(guide).forEach(([section, instructions]) => {
            console.log(`\n${section.toUpperCase()}:`);
            console.log('-'.repeat(30));
            instructions.forEach(instruction => {
                console.log(instruction);
            });
        });
    }
}

// Export classes for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BiasDetectionTestSuite,
        BiasDetectionImplementationGuide,
        mockScoringFunction
    };
}

// Run demonstration if called directly
if (require.main === module) {
    (async () => {
        const testSuite = new BiasDetectionTestSuite();
        await testSuite.runFullBiasDetectionDemo();
        BiasDetectionImplementationGuide.printImplementationGuide();
    })();
}