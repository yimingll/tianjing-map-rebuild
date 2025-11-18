/**
 * 集成测试套件
 * 验证所有测试工具在真实数据上的集成工作
 * 支持140个房间和4个区域的全面测试覆盖
 */
const AutomatedTestPipeline = require('./AutomatedTestPipeline');
const MapSplitter = require('./MapSplitter');
const fs = require('fs');
const path = require('path');

class IntegrationTestSuite {
    constructor(options = {}) {
        this.options = {
            sourceDataPath: options.sourceDataPath || path.join(__dirname, '../../../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_fixed_complete.json'),
            outputDir: options.outputDir || path.join(__dirname, '../../../output/integration-tests'),
            generateRegionalFiles: options.generateRegionalFiles !== false,
            validateAllConnections: options.validateAllConnections !== false,
            performanceBaseline: options.performanceBaseline !== false,
            ...options
        };
        
        // 测试配置
        this.testConfig = {
            expectedRoomCount: 140,
            expectedRegionCount: 4,
            expectedCrossRegionConnections: 38,
            performanceThresholds: {
                mapSplitting: 5000, // 5秒
                connectivityValidation: 2000, // 2秒
                dataIntegrityCheck: 3000, // 3秒
                crossRegionValidation: 1500 // 1.5秒
            }
        };
        
        // 测试数据
        this.testData = {
            sourceData: null,
            splitData: null,
            regionalFiles: {}
        };
        
        // 测试结果
        this.testResults = {
            setup: null,
            mapSplitting: null,
            integrationTests: null,
            validationTests: null,
            performanceTests: null,
            summary: null
        };
    }

    /**
     * 执行完整的集成测试
     */
    async runIntegrationTests() {
        console.log('🔬 开始执行集成测试套件...');
        const startTime = Date.now();
        
        try {
            // 1. 设置阶段
            console.log('1️⃣ 设置测试环境...');
            this.testResults.setup = await this.setupTestEnvironment();
            
            // 2. 地图拆分测试
            console.log('2️⃣ 执行地图拆分测试...');
            this.testResults.mapSplitting = await this.testMapSplitting();
            
            // 3. 集成测试
            console.log('3️⃣ 执行集成测试...');
            this.testResults.integrationTests = await this.runIntegrationTests();
            
            // 4. 验证测试
            console.log('4️⃣ 执行验证测试...');
            this.testResults.validationTests = await this.runValidationTests();
            
            // 5. 性能测试
            if (this.options.performanceBaseline) {
                console.log('5️⃣ 执行性能基准测试...');
                this.testResults.performanceTests = await this.runPerformanceTests();
            }
            
            // 6. 生成测试摘要
            console.log('6️⃣ 生成测试摘要...');
            this.testResults.summary = this.generateIntegrationSummary();
            
            const totalTime = Date.now() - startTime;
            console.log(`✅ 集成测试完成，耗时: ${totalTime}ms`);
            
            // 保存结果
            await this.saveIntegrationResults();
            
            return this.testResults;
            
        } catch (error) {
            console.error('❌ 集成测试失败:', error);
            throw error;
        }
    }

    /**
     * 设置测试环境
     */
    async setupTestEnvironment() {
        console.log('  📁 加载源数据...');
        
        // 加载源数据
        if (!fs.existsSync(this.options.sourceDataPath)) {
            throw new Error(`源数据文件不存在: ${this.options.sourceDataPath}`);
        }
        
        const sourceDataRaw = fs.readFileSync(this.options.sourceDataPath, 'utf8');
        const sourceData = JSON.parse(sourceDataRaw);
        this.testData.sourceData = sourceData;
        
        // 验证源数据结构
        const sourceValidation = this.validateSourceData(sourceData);
        
        console.log(`  ✅ 源数据加载完成: ${sourceValidation.totalRooms} 个房间, ${sourceValidation.totalDistricts} 个区域`);
        
        // 创建输出目录
        if (!fs.existsSync(this.options.outputDir)) {
            fs.mkdirSync(this.options.outputDir, { recursive: true });
        }
        
        return {
            sourceDataLoaded: true,
            sourceValidation,
            outputDirectory: this.options.outputDir,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 验证源数据结构
     */
    validateSourceData(sourceData) {
        const validation = {
            valid: true,
            totalRooms: 0,
            totalDistricts: 0,
            totalLocations: 0,
            issues: []
        };
        
        // 检查城市信息
        if (!sourceData.city) {
            validation.valid = false;
            validation.issues.push('缺少城市信息');
        }
        
        // 检查区域信息
        if (!Array.isArray(sourceData.districts)) {
            validation.valid = false;
            validation.issues.push('districts必须是数组');
            return validation;
        }
        
        validation.totalDistricts = sourceData.districts.length;
        
        // 统计房间和位置
        for (const district of sourceData.districts) {
            if (!district.locations || !Array.isArray(district.locations)) {
                validation.issues.push(`区域 ${district.id} 缺少locations数组`);
                continue;
            }
            
            validation.totalLocations += district.locations.length;
            
            for (const location of district.locations) {
                if (!location.rooms || !Array.isArray(location.rooms)) {
                    validation.issues.push(`位置 ${location.id} 缺少rooms数组`);
                    continue;
                }
                
                validation.totalRooms += location.rooms.length;
                
                // 验证房间数据
                for (const room of location.rooms) {
                    if (!room.id) {
                        validation.issues.push(`发现缺少ID的房间`);
                    }
                    if (!room.name) {
                        validation.issues.push(`发现缺少名称的房间`);
                    }
                }
            }
        }
        
        // 检查房间数量是否符合预期
        if (validation.totalRooms !== this.testConfig.expectedRoomCount) {
            validation.issues.push(`房间数量不匹配: 期望 ${this.testConfig.expectedRoomCount}, 实际 ${validation.totalRooms}`);
        }
        
        return validation;
    }

    /**
     * 测试地图拆分
     */
    async testMapSplitting() {
        console.log('  🔧 执行地图拆分...');
        
        const splitter = new MapSplitter();
        const startTime = Date.now();
        
        try {
            // 执行拆分
            this.testData.splitData = await splitter.splitMap(this.testData.sourceData);
            const splitTime = Date.now() - startTime;
            
            // 验证拆分结果
            const validation = this.validateSplitResult(this.testData.splitData);
            
            // 生成区域文件
            if (this.options.generateRegionalFiles) {
                await this.generateRegionalFiles(this.testData.splitData);
            }
            
            return {
                success: true,
                executionTime: splitTime,
                resultValidation: validation,
                regionCount: Object.keys(this.testData.splitData).length,
                performanceWithinThreshold: splitTime <= this.testConfig.performanceThresholds.mapSplitting
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * 验证拆分结果
     */
    validateSplitResult(splitData) {
        const validation = {
            valid: true,
            regionCount: Object.keys(splitData).length,
            totalRooms: 0,
            totalLocations: 0,
            totalConnections: 0,
            crossRegionConnections: 0,
            issues: []
        };
        
        // 检查区域数量
        if (validation.regionCount !== this.testConfig.expectedRegionCount) {
            validation.valid = false;
            validation.issues.push(`区域数量不匹配: 期望 ${this.testConfig.expectedRegionCount}, 实际 ${validation.regionCount}`);
        }
        
        // 统计数据
        for (const [regionId, regionData] of Object.entries(splitData)) {
            // 检查区域结构
            if (!regionData.region || !regionData.locations || !regionData.connections) {
                validation.valid = false;
                validation.issues.push(`区域 ${regionId} 结构不完整`);
                continue;
            }
            
            validation.totalLocations += regionData.locations.length;
            
            for (const location of regionData.locations) {
                if (location.rooms) {
                    validation.totalRooms += location.rooms.length;
                }
            }
            
            const internalConns = regionData.connections.internal || [];
            const crossRegionConns = regionData.connections.crossRegion || [];
            
            validation.totalConnections += internalConns.length + crossRegionConns.length;
            validation.crossRegionConnections += crossRegionConns.length;
        }
        
        // 检查房间数量
        if (validation.totalRooms !== this.testConfig.expectedRoomCount) {
            validation.issues.push(`房间数量不匹配: 期望 ${this.testConfig.expectedRoomCount}, 实际 ${validation.totalRooms}`);
        }
        
        // 检查跨区域连接
        if (validation.crossRegionConnections !== this.testConfig.expectedCrossRegionConnections) {
            validation.issues.push(`跨区域连接数量不匹配: 期望 ${this.testConfig.expectedCrossRegionConnections}, 实际 ${validation.crossRegionConnections}`);
        }
        
        return validation;
    }

    /**
     * 生成区域文件
     */
    async generateRegionalFiles(splitData) {
        console.log('  📄 生成区域文件...');
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            const filename = `tianjing_${regionId}_district.json`;
            const filepath = path.join(this.options.outputDir, filename);
            
            // 添加元数据
            const regionalFile = {
                ...regionData,
                metadata: {
                    version: "1.0.0",
                    migrationDate: new Date().toISOString(),
                    sourceFile: this.options.sourceDataPath,
                    regionId: regionId,
                    generatedBy: "IntegrationTestSuite"
                }
            };
            
            fs.writeFileSync(filepath, JSON.stringify(regionalFile, null, 2));
            this.testData.regionalFiles[regionId] = filepath;
        }
        
        console.log(`  ✅ 生成了 ${Object.keys(this.testData.regionalFiles).length} 个区域文件`);
    }

    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        console.log('  🔗 执行集成测试...');
        
        const pipeline = new AutomatedTestPipeline({
            enableAllTests: true,
            saveResults: false,
            outputDir: path.join(this.options.outputDir, 'pipeline-tests')
        });
        
        const testData = {
            sourceData: this.testData.sourceData,
            splitData: this.testData.splitData
        };
        
        const startTime = Date.now();
        
        try {
            const pipelineResults = await pipeline.runPipeline(testData);
            const executionTime = Date.now() - startTime;
            
            return {
                success: true,
                executionTime,
                pipelineResults,
                allTestsPassed: pipelineResults.status === 'passed',
                failedTests: pipelineResults.failedTests.length,
                completedTests: pipelineResults.completedTests.length
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * 运行验证测试
     */
    async runValidationTests() {
        console.log('  ✅ 执行验证测试...');
        
        const validationTests = {
            roomCountValidation: null,
            connectionValidation: null,
            crossRegionValidation: null,
            dataIntegrityValidation: null
        };
        
        // 房间数量验证
        validationTests.roomCountValidation = await this.validateRoomCounts();
        
        // 连接验证
        validationTests.connectionValidation = await this.validateConnections();
        
        // 跨区域连接验证
        if (this.options.validateAllConnections) {
            validationTests.crossRegionValidation = await this.validateCrossRegionConnections();
        }
        
        // 数据完整性验证
        validationTests.dataIntegrityValidation = await this.validateDataIntegrity();
        
        return validationTests;
    }

    /**
     * 验证房间数量
     */
    async validateRoomCounts() {
        const sourceRoomCount = this.testResults.setup.sourceValidation.totalRooms;
        let splitRoomCount = 0;
        const roomCountsByRegion = {};
        
        for (const [regionId, regionData] of Object.entries(this.testData.splitData)) {
            let regionRoomCount = 0;
            for (const location of regionData.locations) {
                regionRoomCount += location.rooms.length;
            }
            roomCountsByRegion[regionId] = regionRoomCount;
            splitRoomCount += regionRoomCount;
        }
        
        return {
            sourceRoomCount,
            splitRoomCount,
            roomCountsMatch: sourceRoomCount === splitRoomCount,
            expectedCount: this.testConfig.expectedRoomCount,
            countsByRegion: roomCountsByRegion,
            status: sourceRoomCount === splitRoomCount && splitRoomCount === this.testConfig.expectedRoomCount ? 'PASS' : 'FAIL'
        };
    }

    /**
     * 验证连接
     */
    async validateConnections() {
        const ConnectivityValidator = require('./ConnectivityValidator');
        const validator = new ConnectivityValidator();
        
        const startTime = Date.now();
        
        try {
            validator.buildRoomGraph(this.testData.splitData);
            const overallResult = validator.validateOverallConnectivity(this.testData.splitData);
            const interRegionResult = validator.validateInterRegionConnectivity(this.testData.splitData);
            
            return {
                success: true,
                executionTime: Date.now() - startTime,
                overallConnectivity: overallResult,
                interRegionConnectivity: interRegionResult,
                isFullyConnected: overallResult.isFullyConnected,
                totalComponents: overallResult.components.length,
                isolatedRooms: overallResult.isolatedRooms.length,
                status: overallResult.isFullyConnected && overallResult.isolatedRooms.length === 0 ? 'PASS' : 'FAIL'
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * 验证跨区域连接
     */
    async validateCrossRegionConnections() {
        const CrossRegionValidator = require('./CrossRegionValidator');
        const validator = new CrossRegionValidator();
        
        const startTime = Date.now();
        
        try {
            const result = await validator.validateCrossRegionConnections(this.testData.splitData);
            
            return {
                success: true,
                executionTime: Date.now() - startTime,
                validationResult: result,
                expectedConnections: this.testConfig.expectedCrossRegionConnections,
                actualConnections: result.summary?.results?.criticalConnections?.found || 0,
                status: result.summary?.overallStatus === 'PASS' ? 'PASS' : 'FAIL'
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * 验证数据完整性
     */
    async validateDataIntegrity() {
        const DataIntegrityTester = require('./DataIntegrityTester');
        const tester = new DataIntegrityTester();
        
        const startTime = Date.now();
        
        try {
            const result = await tester.runComprehensiveTest(this.testData.sourceData, this.testData.splitData);
            
            return {
                success: true,
                executionTime: Date.now() - startTime,
                integrityResult: result,
                overallStatus: result.summary.overallStatus,
                totalErrors: result.summary.results?.basicIntegrity?.totalErrors || 0,
                totalWarnings: result.summary.results?.basicIntegrity?.totalWarnings || 0,
                status: result.summary.overallStatus === 'PASS' ? 'PASS' : 'FAIL'
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * 运行性能测试
     */
    async runPerformanceTests() {
        console.log('  ⚡ 执行性能基准测试...');
        
        const PerformanceBenchmark = require('./PerformanceBenchmark');
        const benchmark = new PerformanceBenchmark({
            enableLoadTesting: false, // 在集成测试中禁用负载测试以节省时间
            iterations: 5
        });
        
        const testData = {
            sourceData: this.testData.sourceData,
            splitData: this.testData.splitData
        };
        
        const startTime = Date.now();
        
        try {
            const benchmarkResults = await benchmark.runComprehensiveBenchmark(testData);
            const executionTime = Date.now() - startTime;
            
            return {
                success: true,
                executionTime,
                benchmarkResults,
                overallGrade: benchmarkResults.summary.overallGrade,
                overallScore: benchmarkResults.summary.overallScore,
                performanceWithinThresholds: this.checkPerformanceThresholds(benchmarkResults),
                status: benchmarkResults.summary.overallGrade === 'A' ? 'PASS' : 'PARTIAL'
            };
            
        } catch (error) {
            return {
                success: false,
                executionTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * 检查性能阈值
     */
    checkPerformanceThresholds(benchmarkResults) {
        const thresholds = this.testConfig.performanceThresholds;
        const results = benchmarkResults.benchmarks;
        
        return {
            mapSplitting: results.mapSplitting?.statistics?.mean <= thresholds.mapSplitting,
            connectivityValidation: results.connectivityValidation?.statistics?.mean <= thresholds.connectivityValidation,
            dataIntegrityCheck: results.dataIntegrityCheck?.statistics?.mean <= thresholds.dataIntegrityCheck,
            crossRegionValidation: results.queryPerformance?.statistics?.mean <= thresholds.crossRegionValidation
        };
    }

    /**
     * 生成集成测试摘要
     */
    generateIntegrationSummary() {
        const summary = {
            suiteName: 'Integration Test Suite v1.0',
            executionTime: new Date().toISOString(),
            overallStatus: 'PASS',
            testResults: {},
            performanceSummary: {},
            recommendations: [],
            detailedMetrics: {}
        };
        
        // 汇总各测试结果
        let allPassed = true;
        
        // 设置测试结果
        if (this.testResults.setup) {
            summary.testResults.setup = {
                status: this.testResults.setup.sourceDataLoaded ? 'PASS' : 'FAIL',
                details: {
                    sourceDataLoaded: this.testResults.setup.sourceDataLoaded,
                    totalRooms: this.testResults.setup.sourceValidation.totalRooms,
                    totalDistricts: this.testResults.setup.sourceValidation.totalDistricts
                }
            };
        }
        
        // 地图拆分测试结果
        if (this.testResults.mapSplitting) {
            summary.testResults.mapSplitting = {
                status: this.testResults.mapSplitting.success ? 'PASS' : 'FAIL',
                details: {
                    executionTime: this.testResults.mapSplitting.executionTime,
                    regionCount: this.testResults.mapSplitting.regionCount,
                    performanceWithinThreshold: this.testResults.mapSplitting.performanceWithinThreshold
                }
            };
            
            if (!this.testResults.mapSplitting.success) {
                allPassed = false;
            }
        }
        
        // 集成测试结果
        if (this.testResults.integrationTests) {
            summary.testResults.integrationTests = {
                status: this.testResults.integrationTests.success && this.testResults.integrationTests.allTestsPassed ? 'PASS' : 'FAIL',
                details: {
                    executionTime: this.testResults.integrationTests.executionTime,
                    allTestsPassed: this.testResults.integrationTests.allTestsPassed,
                    failedTests: this.testResults.integrationTests.failedTests,
                    completedTests: this.testResults.integrationTests.completedTests
                }
            };
            
            if (!this.testResults.integrationTests.success || !this.testResults.integrationTests.allTestsPassed) {
                allPassed = false;
            }
        }
        
        // 验证测试结果
        if (this.testResults.validationTests) {
            const validation = this.testResults.validationTests;
            summary.testResults.validation = {
                status: 'PASS',
                details: {
                    roomCountValidation: validation.roomCountValidation?.status,
                    connectionValidation: validation.connectionValidation?.status,
                    crossRegionValidation: validation.crossRegionValidation?.status,
                    dataIntegrityValidation: validation.dataIntegrityValidation?.status
                }
            };
            
            // 检查是否有验证失败
            for (const [testName, result] of Object.entries(validation)) {
                if (result && result.status === 'FAIL') {
                    summary.testResults.validation.status = 'FAIL';
                    allPassed = false;
                    break;
                }
            }
        }
        
        // 性能测试结果
        if (this.testResults.performanceTests) {
            summary.testResults.performance = {
                status: this.testResults.performanceTests.success ? this.testResults.performanceTests.status : 'FAIL',
                details: {
                    executionTime: this.testResults.performanceTests.executionTime,
                    overallGrade: this.testResults.performanceTests.overallGrade,
                    overallScore: this.testResults.performanceTests.overallScore
                }
            };
            
            if (!this.testResults.performanceTests.success) {
                allPassed = false;
            }
        }
        
        summary.overallStatus = allPassed ? 'PASS' : 'FAIL';
        
        // 生成建议
        summary.recommendations = this.generateIntegrationRecommendations(summary.testResults);
        
        // 详细指标
        summary.detailedMetrics = {
            expectedRoomCount: this.testConfig.expectedRoomCount,
            actualRoomCount: this.testResults.setup?.sourceValidation?.totalRooms || 0,
            expectedRegionCount: this.testConfig.expectedRegionCount,
            actualRegionCount: this.testResults.mapSplitting?.regionCount || 0,
            expectedCrossRegionConnections: this.testConfig.expectedCrossRegionConnections,
            performanceThresholds: this.testConfig.performanceThresholds
        };
        
        return summary;
    }

    /**
     * 生成集成测试建议
     */
    generateIntegrationRecommendations(testResults) {
        const recommendations = [];
        
        for (const [testName, result] of Object.entries(testResults)) {
            if (result.status === 'FAIL') {
                recommendations.push({
                    test: testName,
                    severity: 'high',
                    message: `${testName} 测试失败`,
                    suggestions: this.getTestSpecificSuggestions(testName, result)
                });
            } else if (result.status === 'PARTIAL') {
                recommendations.push({
                    test: testName,
                    severity: 'medium',
                    message: `${testName} 测试部分通过`,
                    suggestions: this.getTestSpecificSuggestions(testName, result)
                });
            }
        }
        
        return recommendations;
    }

    /**
     * 获取测试特定建议
     */
    getTestSpecificSuggestions(testName, result) {
        const suggestions = {
            setup: [
                '检查源数据文件格式',
                '验证数据完整性',
                '确保文件路径正确'
            ],
            mapSplitting: [
                '检查MapSplitter配置',
                '验证拆分策略',
                '检查内存使用情况'
            ],
            integrationTests: [
                '检查管道配置',
                '验证测试工具兼容性',
                '检查测试数据完整性'
            ],
            validation: [
                '修复验证失败的问题',
                '检查数据一致性',
                '验证连接完整性'
            ],
            performance: [
                '优化算法性能',
                '检查系统资源使用',
                '考虑性能优化策略'
            ]
        };
        
        return suggestions[testName] || ['分析具体错误并制定解决方案'];
    }

    /**
     * 保存集成测试结果
     */
    async saveIntegrationResults() {
        const outputDir = this.options.outputDir;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 保存完整结果
        const resultsPath = path.join(outputDir, `integration-test-results-${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
        
        // 保存摘要
        const summaryPath = path.join(outputDir, `integration-test-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.testResults.summary, null, 2));
        
        // 生成详细报告
        const reportPath = path.join(outputDir, `integration-test-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generateIntegrationReport());
        
        console.log(`📄 集成测试结果已保存:`);
        console.log(`  - 完整结果: ${resultsPath}`);
        console.log(`  - 测试摘要: ${summaryPath}`);
        console.log(`  - 详细报告: ${reportPath}`);
        
        return {
            resultsPath,
            summaryPath,
            reportPath
        };
    }

    /**
     * 生成集成测试报告
     */
    generateIntegrationReport() {
        if (!this.testResults.summary) {
            throw new Error('必须先执行集成测试才能生成报告');
        }
        
        const report = [];
        const summary = this.testResults.summary;
        
        report.push('# 集成测试报告');
        report.push(`测试套件: ${summary.suiteName}`);
        report.push(`执行时间: ${summary.executionTime}`);
        report.push(`总体状态: ${summary.overallStatus}`);
        report.push('');
        
        // 测试概述
        report.push('## 测试概述');
        report.push(`- 预期房间数: ${summary.detailedMetrics.expectedRoomCount}`);
        report.push(`- 实际房间数: ${summary.detailedMetrics.actualRoomCount}`);
        report.push(`- 预期区域数: ${summary.detailedMetrics.expectedRegionCount}`);
        report.push(`- 实际区域数: ${summary.detailedMetrics.actualRegionCount}`);
        report.push(`- 预期跨区域连接: ${summary.detailedMetrics.expectedCrossRegionConnections}`);
        report.push('');
        
        // 各测试结果
        for (const [testName, result] of Object.entries(summary.testResults)) {
            report.push(`## ${testName.charAt(0).toUpperCase() + testName.slice(1)} 测试`);
            report.push(`- 状态: ${result.status}`);
            
            if (result.details) {
                for (const [key, value] of Object.entries(result.details)) {
                    report.push(`- ${key}: ${value}`);
                }
            }
            report.push('');
        }
        
        // 建议和改进
        if (summary.recommendations.length > 0) {
            report.push('## 建议和改进');
            for (const [index, rec] of summary.recommendations.entries()) {
                report.push(`### ${index + 1}. ${rec.test} - ${rec.severity}优先级`);
                report.push(`**问题**: ${rec.message}`);
                report.push('**建议**:');
                rec.suggestions.forEach(suggestion => {
                    report.push(`- ${suggestion}`);
                });
                report.push('');
            }
        }
        
        return report.join('\n');
    }

    /**
     * 快速验证
     */
    async quickValidation() {
        console.log('⚡ 执行快速验证...');
        
        try {
            await this.setupTestEnvironment();
            await this.testMapSplitting();
            
            const validation = await this.validateRoomCounts();
            const connectivity = await this.validateConnections();
            
            return {
                status: (validation.status === 'PASS' && connectivity.status === 'PASS') ? 'PASS' : 'FAIL',
                roomCountValidation: validation,
                connectivityValidation: connectivity
            };
            
        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message
            };
        }
    }
}

module.exports = IntegrationTestSuite;