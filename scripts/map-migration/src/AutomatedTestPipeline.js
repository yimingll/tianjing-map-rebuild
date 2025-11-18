/**
 * 自动化测试管道
 * 提供全面的回归测试自动化，支持CI/CD集成和测试报告生成
 * 集成所有测试工具，提供统一的测试执行和管理框架
 */
const ConnectivityTester = require('./ConnectivityTester');
const CrossRegionValidator = require('./CrossRegionValidator');
const DataIntegrityTester = require('./DataIntegrityTester');
const PerformanceBenchmark = require('./PerformanceBenchmark');
const fs = require('fs');
const path = require('path');

class AutomatedTestPipeline {
    constructor(options = {}) {
        this.options = {
            enableAllTests: options.enableAllTests !== false,
            testSuites: options.testSuites || ['connectivity', 'crossRegion', 'dataIntegrity', 'performance'],
            parallelExecution: options.parallelExecution || false,
            generateReports: options.generateReports !== false,
            saveResults: options.saveResults !== false,
            outputDir: options.outputDir || path.join(__dirname, '../../../output/test-pipeline'),
            emailReports: options.emailReports || false,
            slackNotifications: options.slackNotifications || false,
            ...options
        };
        
        // 测试管道配置
        this.pipelineConfig = {
            version: '1.0.0',
            name: 'Map Migration Test Pipeline',
            timeout: 300000, // 5分钟超时
            retryAttempts: 3,
            retryDelay: 5000 // 5秒重试延迟
        };
        
        // 测试工具实例
        this.testTools = {
            connectivity: new ConnectivityTester({
                enablePerformanceTesting: true,
                enableDetailedLogging: true
            }),
            crossRegion: new CrossRegionValidator({
                validateBidirectional: true,
                checkConnectionPaths: true,
                analyzeConnectionQuality: true
            }),
            dataIntegrity: new DataIntegrityTester({
                enableDeepValidation: true,
                enablePerformanceTesting: true,
                enableConsistencyAnalysis: true
            }),
            performance: new PerformanceBenchmark({
                enableMemoryProfiling: true,
                enableCPUTiming: true,
                enableLoadTesting: true,
                iterations: 10
            })
        };
        
        // 管道状态
        this.pipelineState = {
            status: 'initialized',
            startTime: null,
            endTime: null,
            currentTest: null,
            completedTests: [],
            failedTests: [],
            skippedTests: [],
            results: {},
            summary: null
        };
        
        // 测试历史
        this.testHistory = this.loadTestHistory();
    }

    /**
     * 加载测试历史
     */
    loadTestHistory() {
        try {
            const historyPath = path.join(__dirname, '../../../output/test-history.json');
            if (fs.existsSync(historyPath)) {
                return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️ 无法加载测试历史数据');
        }
        return [];
    }

    /**
     * 执行完整的测试管道
     * @param {Object} testData - 测试数据
     * @returns {Object} 管道执行结果
     */
    async runPipeline(testData) {
        console.log('🚀 启动自动化测试管道...');
        this.pipelineState.status = 'running';
        this.pipelineState.startTime = new Date().toISOString();
        
        try {
            // 验证测试数据
            await this.validateTestData(testData);
            
            // 执行测试套件
            for (const testSuite of this.options.testSuites) {
                if (!this.options.enableAllTests && !this.options[`enable${testSuite.charAt(0).toUpperCase() + testSuite.slice(1)}`]) {
                    console.log(`⏭️ 跳过测试套件: ${testSuite}`);
                    this.pipelineState.skippedTests.push(testSuite);
                    continue;
                }
                
                console.log(`🧪 执行测试套件: ${testSuite}`);
                this.pipelineState.currentTest = testSuite;
                
                try {
                    const result = await this.executeTestSuite(testSuite, testData);
                    this.pipelineState.results[testSuite] = result;
                    this.pipelineState.completedTests.push(testSuite);
                    
                    console.log(`✅ 测试套件 ${testSuite} 完成`);
                    
                } catch (error) {
                    console.error(`❌ 测试套件 ${testSuite} 失败:`, error.message);
                    this.pipelineState.failedTests.push({
                        testSuite,
                        error: error.message,
                        stack: error.stack
                    });
                    
                    if (this.options.failFast) {
                        throw error;
                    }
                }
            }
            
            // 生成管道摘要
            this.pipelineState.summary = this.generatePipelineSummary();
            
            // 保存结果
            if (this.options.saveResults) {
                await this.savePipelineResults();
            }
            
            // 发送通知
            if (this.options.emailReports || this.options.slackNotifications) {
                await this.sendNotifications();
            }
            
            this.pipelineState.status = this.pipelineState.failedTests.length === 0 ? 'passed' : 'failed';
            this.pipelineState.endTime = new Date().toISOString();
            
            console.log(`🏁 测试管道完成，状态: ${this.pipelineState.status}`);
            
            return this.pipelineState;
            
        } catch (error) {
            console.error('❌ 测试管道执行失败:', error);
            this.pipelineState.status = 'error';
            this.pipelineState.endTime = new Date().toISOString();
            this.pipelineState.error = error.message;
            throw error;
        }
    }

    /**
     * 验证测试数据
     */
    async validateTestData(testData) {
        if (!testData || !testData.sourceData || !testData.splitData) {
            throw new Error('测试数据不完整，需要sourceData和splitData');
        }
        
        if (!Array.isArray(testData.sourceData.districts)) {
            throw new Error('sourceData.districts必须是数组');
        }
        
        if (typeof testData.splitData !== 'object' || Object.keys(testData.splitData).length === 0) {
            throw new Error('splitData必须是非空对象');
        }
        
        console.log('✅ 测试数据验证通过');
    }

    /**
     * 执行测试套件
     */
    async executeTestSuite(testSuite, testData) {
        let result;
        const startTime = Date.now();
        
        switch (testSuite) {
            case 'connectivity':
                result = await this.testTools.connectivity.runComprehensiveTest(testData.sourceData, testData.splitData);
                break;
                
            case 'crossRegion':
                result = await this.testTools.crossRegion.validateCrossRegionConnections(testData.splitData);
                break;
                
            case 'dataIntegrity':
                result = await this.testTools.dataIntegrity.runComprehensiveTest(testData.sourceData, testData.splitData);
                break;
                
            case 'performance':
                result = await this.testTools.performance.runComprehensiveBenchmark(testData);
                break;
                
            default:
                throw new Error(`未知的测试套件: ${testSuite}`);
        }
        
        result.executionTime = Date.now() - startTime;
        result.testSuite = testSuite;
        result.timestamp = new Date().toISOString();
        
        return result;
    }

    /**
     * 生成管道摘要
     */
    generatePipelineSummary() {
        const summary = {
            pipelineVersion: this.pipelineConfig.version,
            pipelineName: this.pipelineConfig.name,
            executionId: this.generateExecutionId(),
            status: this.pipelineState.status,
            startTime: this.pipelineState.startTime,
            endTime: this.pipelineState.endTime,
            duration: this.calculateDuration(),
            testResults: {},
            overallGrade: 'A',
            overallScore: 0,
            recommendations: [],
            regressionAnalysis: null
        };
        
        // 汇总测试结果
        let totalScore = 0;
        let scoreCount = 0;
        
        for (const [testSuite, result] of Object.entries(this.pipelineState.results)) {
            const testSummary = this.extractTestSummary(testSuite, result);
            summary.testResults[testSuite] = testSummary;
            
            if (testSummary.score !== undefined) {
                totalScore += testSummary.score;
                scoreCount++;
            }
        }
        
        summary.overallScore = scoreCount > 0 ? totalScore / scoreCount : 0;
        summary.overallGrade = this.scoreToGrade(summary.overallScore);
        
        // 生成建议
        summary.recommendations = this.generatePipelineRecommendations(summary.testResults);
        
        // 回归分析
        summary.regressionAnalysis = this.performRegressionAnalysis(summary.testResults);
        
        return summary;
    }

    /**
     * 提取测试摘要
     */
    extractTestSummary(testSuite, result) {
        const summary = {
            status: 'unknown',
            score: 0,
            executionTime: result.executionTime || 0,
            issues: []
        };
        
        switch (testSuite) {
            case 'connectivity':
                if (result.summary) {
                    summary.status = result.summary.results?.connectivity?.status || 'unknown';
                    summary.score = this.calculateConnectivityScore(result);
                    summary.issues = this.extractConnectivityIssues(result);
                }
                break;
                
            case 'crossRegion':
                if (result.summary) {
                    summary.status = result.summary.results?.criticalConnections?.status || 'unknown';
                    summary.score = this.calculateCrossRegionScore(result);
                    summary.issues = this.extractCrossRegionIssues(result);
                }
                break;
                
            case 'dataIntegrity':
                if (result.summary) {
                    summary.status = result.summary.results?.basicIntegrity?.status || 'unknown';
                    summary.score = this.calculateDataIntegrityScore(result);
                    summary.issues = this.extractDataIntegrityIssues(result);
                }
                break;
                
            case 'performance':
                if (result.summary) {
                    summary.status = this.scoreToGrade(result.summary.overallScore);
                    summary.score = result.summary.overallScore;
                    summary.issues = this.extractPerformanceIssues(result);
                }
                break;
        }
        
        return summary;
    }

    /**
     * 计算连通性测试分数
     */
    calculateConnectivityScore(result) {
        let score = 100;
        
        if (result.summary?.results?.connectivity?.isFullyConnected === false) {
            score -= 30;
        }
        
        if (result.summary?.results?.connectivity?.isolatedRooms > 0) {
            score -= 20;
        }
        
        if (result.summary?.results?.crossRegion?.status === 'FAIL') {
            score -= 25;
        }
        
        if (result.summary?.results?.integrity?.totalErrors > 0) {
            score -= 25;
        }
        
        return Math.max(0, score);
    }

    /**
     * 计算跨区域验证分数
     */
    calculateCrossRegionScore(result) {
        let score = 100;
        
        const critical = result.summary?.results?.criticalConnections;
        if (critical) {
            const validationRate = parseFloat(critical.validationRate) || 0;
            score = validationRate;
        }
        
        const bidi = result.summary?.results?.bidirectional;
        if (bidi && bidi.errors > 0) {
            score -= 10;
        }
        
        return Math.max(0, score);
    }

    /**
     * 计算数据完整性分数
     */
    calculateDataIntegrityScore(result) {
        let score = 100;
        
        if (result.summary?.results?.basicIntegrity?.status === 'FAIL') {
            score -= 40;
        }
        
        if (result.summary?.results?.deepValidation?.overallQualityScore < 80) {
            score -= 20;
        }
        
        if (result.summary?.results?.consistency?.overallConsistencyScore < 80) {
            score -= 20;
        }
        
        if (result.summary?.results?.performance?.validationTime > 5000) {
            score -= 20;
        }
        
        return Math.max(0, score);
    }

    /**
     * 提取连通性问题
     */
    extractConnectivityIssues(result) {
        const issues = [];
        
        if (result.connectivity?.overallConnectivity?.isolatedRooms?.length > 0) {
            issues.push(`发现 ${result.connectivity.overallConnectivity.isolatedRooms.length} 个孤立房间`);
        }
        
        if (result.crossRegion?.missingConnections?.length > 0) {
            issues.push(`缺失 ${result.crossRegion.missingConnections.length} 个跨区域连接`);
        }
        
        if (result.integrity?.errors?.length > 0) {
            issues.push(`数据完整性检查发现 ${result.integrity.errors.length} 个错误`);
        }
        
        return issues;
    }

    /**
     * 提取跨区域问题
     */
    extractCrossRegionIssues(result) {
        const issues = [];
        
        if (result.missingConnections?.length > 0) {
            issues.push(`缺失 ${result.missingConnections.length} 个关键连接`);
        }
        
        if (result.bidirectionalIssues?.length > 0) {
            issues.push(`发现 ${result.bidirectionalIssues.length} 个双向连接问题`);
        }
        
        if (result.pathAnalysis?.isolatedRegions?.length > 0) {
            issues.push(`发现 ${result.pathAnalysis.isolatedRegions.length} 个孤立区域`);
        }
        
        return issues;
    }

    /**
     * 提取数据完整性问题
     */
    extractDataIntegrityIssues(result) {
        const issues = [];
        
        if (result.basicIntegrity?.summary?.totalErrors > 0) {
            issues.push(`基础完整性检查发现 ${result.basicIntegrity.summary.totalErrors} 个错误`);
        }
        
        if (result.deepValidation?.dataQuality?.qualityIssues?.length > 0) {
            issues.push(`数据质量分析发现 ${result.deepValidation.dataQuality.qualityIssues.length} 个问题`);
        }
        
        if (result.consistency?.structuralConsistency?.inconsistencies?.length > 0) {
            issues.push(`结构一致性检查发现 ${result.consistency.structuralConsistency.inconsistencies.length} 个不一致`);
        }
        
        return issues;
    }

    /**
     * 提取性能问题
     */
    extractPerformanceIssues(result) {
        const issues = [];
        
        if (result.summary?.results?.performance?.validationTime > 5000) {
            issues.push('验证时间超过5秒阈值');
        }
        
        if (result.summary?.results?.performance?.memoryUsage > 100) {
            issues.push('内存使用超过100MB阈值');
        }
        
        if (result.summary?.results?.performance?.scalabilityIssue) {
            issues.push('检测到可扩展性问题');
        }
        
        return issues;
    }

    /**
     * 生成管道建议
     */
    generatePipelineRecommendations(testResults) {
        const recommendations = [];
        
        for (const [testSuite, result] of Object.entries(testResults)) {
            if (result.issues && result.issues.length > 0) {
                recommendations.push({
                    testSuite,
                    priority: result.score < 60 ? 'high' : result.score < 80 ? 'medium' : 'low',
                    issues: result.issues,
                    suggestions: this.getTestSuiteSuggestions(testSuite)
                });
            }
        }
        
        return recommendations;
    }

    /**
     * 获取测试套件建议
     */
    getTestSuiteSuggestions(testSuite) {
        const suggestions = {
            connectivity: [
                '检查地图连通性配置',
                '验证跨区域连接设置',
                '修复孤立房间连接',
                '运行连接修复工具'
            ],
            crossRegion: [
                '验证38个关键连接点',
                '检查双向连接配置',
                '修复缺失的跨区域连接',
                '运行区域连接验证器'
            ],
            dataIntegrity: [
                '检查房间数据一致性',
                '验证ID唯一性',
                '修复数据不匹配问题',
                '运行数据完整性修复器'
            ],
            performance: [
                '优化算法性能',
                '减少内存使用',
                '改进数据结构',
                '考虑缓存策略'
            ]
        };
        
        return suggestions[testSuite] || ['分析具体问题并制定解决方案'];
    }

    /**
     * 执行回归分析
     */
    performRegressionAnalysis(testResults) {
        if (this.testHistory.length === 0) {
            return {
                status: 'no_baseline',
                message: '没有历史数据可供比较'
            };
        }
        
        const latestHistorical = this.testHistory[this.testHistory.length - 1];
        const regression = {
            status: 'stable',
            regressions: [],
            improvements: [],
            scoreComparison: {}
        };
        
        for (const [testSuite, result] of Object.entries(testResults)) {
            if (latestHistorical.testResults && latestHistorical.testResults[testSuite]) {
                const historicalScore = latestHistorical.testResults[testSuite].score || 0;
                const currentScore = result.score || 0;
                const scoreDiff = currentScore - historicalScore;
                
                regression.scoreComparison[testSuite] = {
                    historical: historicalScore,
                    current: currentScore,
                    difference: scoreDiff
                };
                
                if (scoreDiff < -10) {
                    regression.regressions.push({
                        testSuite,
                        scoreDrop: Math.abs(scoreDiff),
                        severity: scoreDiff < -20 ? 'high' : 'medium'
                    });
                    regression.status = 'regression_detected';
                } else if (scoreDiff > 10) {
                    regression.improvements.push({
                        testSuite,
                        scoreImprovement: scoreDiff
                    });
                }
            }
        }
        
        if (regression.regressions.length === 0 && regression.status === 'regression_detected') {
            regression.status = 'stable';
        }
        
        return regression;
    }

    /**
     * 保存管道结果
     */
    async savePipelineResults() {
        const outputDir = this.options.outputDir;
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 保存完整管道结果
        const pipelineResultsPath = path.join(outputDir, `pipeline-results-${timestamp}.json`);
        const pipelineData = {
            ...this.pipelineState,
            config: this.pipelineConfig,
            options: this.options
        };
        fs.writeFileSync(pipelineResultsPath, JSON.stringify(pipelineData, null, 2));
        
        // 保存管道摘要
        const summaryPath = path.join(outputDir, `pipeline-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.pipelineState.summary, null, 2));
        
        // 生成详细报告
        const reportPath = path.join(outputDir, `pipeline-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generatePipelineReport());
        
        // 保存到测试历史
        await this.saveToTestHistory();
        
        console.log(`📄 管道结果已保存:`);
        console.log(`  - 完整结果: ${pipelineResultsPath}`);
        console.log(`  - 管道摘要: ${summaryPath}`);
        console.log(`  - 详细报告: ${reportPath}`);
        
        return {
            pipelineResultsPath,
            summaryPath,
            reportPath
        };
    }

    /**
     * 保存到测试历史
     */
    async saveToTestHistory() {
        try {
            const historyPath = path.join(__dirname, '../../../output/test-history.json');
            
            const historyEntry = {
                executionId: this.pipelineState.summary.executionId,
                timestamp: this.pipelineState.summary.timestamp,
                status: this.pipelineState.summary.status,
                overallGrade: this.pipelineState.summary.overallGrade,
                overallScore: this.pipelineState.summary.overallScore,
                testResults: this.pipelineState.summary.testResults,
                duration: this.pipelineState.summary.duration
            };
            
            this.testHistory.push(historyEntry);
            
            // 保留最近100条记录
            if (this.testHistory.length > 100) {
                this.testHistory = this.testHistory.slice(-100);
            }
            
            fs.writeFileSync(historyPath, JSON.stringify(this.testHistory, null, 2));
        } catch (error) {
            console.warn('⚠️ 无法保存测试历史:', error.message);
        }
    }

    /**
     * 生成管道报告
     */
    generatePipelineReport() {
        if (!this.pipelineState.summary) {
            throw new Error('必须先执行管道才能生成报告');
        }
        
        const report = [];
        const summary = this.pipelineState.summary;
        
        report.push('# 自动化测试管道报告');
        report.push(`管道名称: ${summary.pipelineName}`);
        report.push(`管道版本: ${summary.pipelineVersion}`);
        report.push(`执行ID: ${summary.executionId}`);
        report.push(`执行时间: ${summary.timestamp}`);
        report.push(`执行状态: ${summary.status}`);
        report.push(`总体评级: ${summary.overallGrade}`);
        report.push(`总体分数: ${summary.overallScore.toFixed(1)}/100`);
        report.push(`执行时长: ${summary.duration}`);
        report.push('');
        
        // 执行摘要
        report.push('## 执行摘要');
        report.push(`- 开始时间: ${summary.startTime}`);
        report.push(`- 结束时间: ${summary.endTime}`);
        report.push(`- 已完成测试: ${this.pipelineState.completedTests.length}`);
        report.push(`- 失败测试: ${this.pipelineState.failedTests.length}`);
        report.push(`- 跳过测试: ${this.pipelineState.skippedTests.length}`);
        report.push('');
        
        // 测试结果详情
        report.push('## 测试结果详情');
        for (const [testSuite, result] of Object.entries(summary.testResults)) {
            report.push(`### ${testSuite.charAt(0).toUpperCase() + testSuite.slice(1)} 测试`);
            report.push(`- 状态: ${result.status}`);
            report.push(`- 分数: ${result.score.toFixed(1)}/100`);
            report.push(`- 执行时间: ${result.executionTime}ms`);
            
            if (result.issues && result.issues.length > 0) {
                report.push('- 发现的问题:');
                result.issues.forEach(issue => {
                    report.push(`  - ${issue}`);
                });
            }
            report.push('');
        }
        
        // 回归分析
        if (summary.regressionAnalysis) {
            report.push('## 回归分析');
            const regression = summary.regressionAnalysis;
            report.push(`- 分析状态: ${regression.status}`);
            
            if (regression.scoreComparison && Object.keys(regression.scoreComparison).length > 0) {
                report.push('- 分数比较:');
                for (const [testSuite, comparison] of Object.entries(regression.scoreComparison)) {
                    const diff = comparison.difference > 0 ? '+' : '';
                    report.push(`  - ${testSuite}: ${comparison.historical.toFixed(1)} → ${comparison.current.toFixed(1)} (${diff}${comparison.difference.toFixed(1)})`);
                }
            }
            
            if (regression.regressions.length > 0) {
                report.push('- 检测到的回归:');
                regression.regressions.forEach(reg => {
                    report.push(`  - ${reg.testSuite}: 分数下降 ${reg.scoreDrop.toFixed(1)} (${reg.severity}严重)`);
                });
            }
            
            if (regression.improvements.length > 0) {
                report.push('- 性能改进:');
                regression.improvements.forEach(imp => {
                    report.push(`  - ${imp.testSuite}: 分数提升 ${imp.scoreImprovement.toFixed(1)}`);
                });
            }
            report.push('');
        }
        
        // 优化建议
        if (summary.recommendations.length > 0) {
            report.push('## 优化建议');
            for (const [index, rec] of summary.recommendations.entries()) {
                report.push(`### ${index + 1}. ${rec.testSuite} - ${rec.priority}优先级`);
                if (rec.issues.length > 0) {
                    report.push('**发现的问题:**');
                    rec.issues.forEach(issue => {
                        report.push(`- ${issue}`);
                    });
                }
                report.push('**建议措施:**');
                rec.suggestions.forEach(suggestion => {
                    report.push(`- ${suggestion}`);
                });
                report.push('');
            }
        }
        
        // 失败详情
        if (this.pipelineState.failedTests.length > 0) {
            report.push('## 失败详情');
            for (const [index, failed] of this.pipelineState.failedTests.entries()) {
                report.push(`### ${index + 1}. ${failed.testSuite}`);
                report.push(`- 错误: ${failed.error}`);
                if (failed.stack) {
                    report.push(`- 堆栈跟踪: ${failed.stack.substring(0, 200)}...`);
                }
                report.push('');
            }
        }
        
        return report.join('\n');
    }

    /**
     * 发送通知
     */
    async sendNotifications() {
        // 这里可以实现邮件和Slack通知
        console.log('📧 通知功能待实现');
    }

    /**
     * 生成执行ID
     */
    generateExecutionId() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const random = Math.random().toString(36).substr(2, 9);
        return `pipeline-${timestamp}-${random}`;
    }

    /**
     * 计算执行时长
     */
    calculateDuration() {
        if (!this.pipelineState.startTime || !this.pipelineState.endTime) {
            return 'unknown';
        }
        
        const start = new Date(this.pipelineState.startTime);
        const end = new Date(this.pipelineState.endTime);
        const durationMs = end - start;
        
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * 分数转等级
     */
    scoreToGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * 运行特定的测试套件
     */
    async runSpecificTestSuite(testSuite, testData) {
        console.log(`🎯 运行特定测试套件: ${testSuite}`);
        
        if (!this.testTools[testSuite]) {
            throw new Error(`未知的测试套件: ${testSuite}`);
        }
        
        const result = await this.executeTestSuite(testSuite, testData);
        
        // 保存单个测试套件结果
        if (this.options.saveResults) {
            const outputDir = this.options.outputDir;
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultPath = path.join(outputDir, `${testSuite}-test-${timestamp}.json`);
            fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
            
            console.log(`📄 测试结果已保存: ${resultPath}`);
        }
        
        return result;
    }

    /**
     * 快速健康检查
     */
    async quickHealthCheck(testData) {
        console.log('🏥 执行快速健康检查...');
        
        const healthCheck = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            checks: {},
            overallScore: 0
        };
        
        try {
            // 基础连通性检查
            this.testTools.connectivity.validator.buildRoomGraph(testData.splitData);
            const overallResult = this.testTools.connectivity.validator.validateOverallConnectivity(testData.splitData);
            healthCheck.checks.connectivity = {
                status: overallResult.isFullyConnected ? 'pass' : 'fail',
                details: {
                    totalRooms: overallResult.totalRooms,
                    components: overallResult.components.length,
                    isolatedRooms: overallResult.isolatedRooms.length
                }
            };
            
            // 基础数据完整性检查
            const integrityResult = this.testTools.dataIntegrity.checker.validateIntegrity(testData.sourceData, testData.splitData);
            healthCheck.checks.dataIntegrity = {
                status: integrityResult.isValid ? 'pass' : 'fail',
                details: {
                    totalErrors: integrityResult.summary.totalErrors,
                    totalWarnings: integrityResult.summary.totalWarnings
                }
            };
            
            // 计算总体分数
            const checks = Object.values(healthCheck.checks);
            const passCount = checks.filter(c => c.status === 'pass').length;
            healthCheck.overallScore = (passCount / checks.length) * 100;
            healthCheck.status = healthCheck.overallScore === 100 ? 'healthy' : 'unhealthy';
            
        } catch (error) {
            healthCheck.status = 'error';
            healthCheck.error = error.message;
        }
        
        return healthCheck;
    }
}

module.exports = AutomatedTestPipeline;