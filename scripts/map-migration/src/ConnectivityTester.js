/**
 * 增强型连通性测试器
 * 在ConnectivityValidator基础上，提供更全面的连通性验证和测试功能
 * 支持跨区域连接验证、性能测试和自动化测试管道
 */
const ConnectivityValidator = require('./ConnectivityValidator');
const fs = require('fs');
const path = require('path');

class ConnectivityTester {
    constructor(options = {}) {
        this.validator = new ConnectivityValidator();
        this.options = {
            enablePerformanceTesting: options.enablePerformanceTesting || true,
            enableDetailedLogging: options.enableDetailedLogging || false,
            crossRegionConnectionAnalysis: options.crossRegionConnectionAnalysis || true,
            validateAgainstSource: options.validateAgainstSource || true,
            ...options
        };
        
        // 测试结果存储
        this.testResults = {
            connectivity: null,
            crossRegion: null,
            performance: null,
            integrity: null,
            summary: null
        };
        
        // 性能基准
        this.performanceBaseline = {
            roomGraphConstruction: 0,
            dfsTraversal: 0,
            crossRegionValidation: 0,
            memoryUsage: 0
        };
        
        // 从Issue #2分析中加载的38个跨区域连接点
        this.expectedCrossRegionConnections = this.loadExpectedCrossRegionConnections();
    }

    /**
     * 加载预期的跨区域连接点（从Issue #2分析结果）
     */
    loadExpectedCrossRegionConnections() {
        try {
            const connectionAnalysisPath = path.join(__dirname, '../../../connection_analysis.json');
            if (fs.existsSync(connectionAnalysisPath)) {
                const analysis = JSON.parse(fs.readFileSync(connectionAnalysisPath, 'utf8'));
                return {
                    totalConnections: analysis.totalConnections,
                    crossDistrictConnections: analysis.crossDistrictConnections,
                    criticalConnections: analysis.criticalConnections,
                    trafficHubs: analysis.trafficHubs,
                    regionMapping: analysis.regionMapping
                };
            }
        } catch (error) {
            console.warn('⚠️ 无法加载跨区域连接分析数据，使用默认配置');
        }
        
        // 默认配置
        return {
            totalConnections: 284,
            crossDistrictConnections: 38,
            criticalConnections: [],
            trafficHubs: [],
            regionMapping: {}
        };
    }

    /**
     * 执行全面的连通性测试
     * @param {Object} sourceData - 源数据
     * @param {Object} splitData - 拆分后的数据
     * @returns {Object} 测试结果
     */
    async runComprehensiveTest(sourceData, splitData) {
        console.log('🔬 开始执行全面连通性测试...');
        const startTime = Date.now();
        
        try {
            // 1. 基础连通性测试
            console.log('1️⃣ 执行基础连通性测试...');
            this.testResults.connectivity = await this.runBasicConnectivityTest(splitData);
            
            // 2. 跨区域连接验证
            console.log('2️⃣ 执行跨区域连接验证...');
            this.testResults.crossRegion = await this.runCrossRegionValidation(splitData);
            
            // 3. 性能测试
            if (this.options.enablePerformanceTesting) {
                console.log('3️⃣ 执行性能测试...');
                this.testResults.performance = await this.runPerformanceTests(splitData);
            }
            
            // 4. 数据完整性验证
            if (this.options.validateAgainstSource) {
                console.log('4️⃣ 执行数据完整性验证...');
                this.testResults.integrity = await this.runDataIntegrityValidation(sourceData, splitData);
            }
            
            // 5. 生成综合摘要
            console.log('5️⃣ 生成测试摘要...');
            this.testResults.summary = this.generateTestSummary();
            
            const totalTime = Date.now() - startTime;
            console.log(`✅ 全面连通性测试完成，耗时: ${totalTime}ms`);
            
            return this.testResults;
            
        } catch (error) {
            console.error('❌ 连通性测试失败:', error);
            throw error;
        }
    }

    /**
     * 执行基础连通性测试
     */
    async runBasicConnectivityTest(splitData) {
        const startTime = Date.now();
        
        // 构建房间连接图
        this.validator.buildRoomGraph(splitData);
        
        // 验证整体连通性
        const overallResult = this.validator.validateOverallConnectivity(splitData);
        
        // 验证区域间连通性
        const interRegionResult = this.validator.validateInterRegionConnectivity(splitData);
        
        const executionTime = Date.now() - startTime;
        
        return {
            overallConnectivity: overallResult,
            interRegionConnectivity: interRegionResult,
            executionTime,
            timestamp: new Date().toISOString(),
            status: overallResult.isFullyConnected ? 'PASS' : 'FAIL'
        };
    }

    /**
     * 执行跨区域连接验证
     */
    async runCrossRegionValidation(splitData) {
        const startTime = Date.now();
        
        const validation = {
            expectedConnections: this.expectedCrossRegionConnections.crossDistrictConnections,
            actualConnections: 0,
            connectionDetails: [],
            missingConnections: [],
            unexpectedConnections: [],
            validationStatus: 'UNKNOWN'
        };
        
        // 收集实际的跨区域连接
        const actualCrossRegionConnections = new Map();
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const connection of regionData.connections.crossRegion) {
                const connectionKey = `${regionId}_to_${connection.targetRegion}`;
                
                if (!actualCrossRegionConnections.has(connectionKey)) {
                    actualCrossRegionConnections.set(connectionKey, []);
                }
                
                actualCrossRegionConnections.get(connectionKey).push({
                    from: connection.from,
                    to: connection.to,
                    connectionId: connection.connectionId,
                    direction: connection.direction
                });
            }
        }
        
        // 统计实际连接数
        for (const connections of actualCrossRegionConnections.values()) {
            validation.actualConnections += connections.length;
            validation.connectionDetails.push(...connections);
        }
        
        // 验证关键连接点
        const criticalConnectionValidation = this.validateCriticalConnections(splitData);
        validation.criticalConnectionValidation = criticalConnectionValidation;
        
        // 验证交通枢纽
        const trafficHubValidation = this.validateTrafficHubs(splitData);
        validation.trafficHubValidation = trafficHubValidation;
        
        // 计算验证状态
        if (validation.actualConnections === validation.expectedConnections) {
            validation.validationStatus = 'PASS';
        } else if (validation.actualConnections > validation.expectedConnections) {
            validation.validationStatus = 'EXTRA_CONNECTIONS';
        } else {
            validation.validationStatus = 'MISSING_CONNECTIONS';
        }
        
        const executionTime = Date.now() - startTime;
        validation.executionTime = executionTime;
        validation.timestamp = new Date().toISOString();
        
        return validation;
    }

    /**
     * 验证关键连接点
     */
    validateCriticalConnections(splitData) {
        const criticalConnections = this.expectedCrossRegionConnections.criticalConnections;
        const validationResults = [];
        
        for (const expectedConn of criticalConnections) {
            let found = false;
            let actualConn = null;
            
            // 在拆分数据中查找对应的连接
            for (const [regionId, regionData] of Object.entries(splitData)) {
                for (const connection of regionData.connections.crossRegion) {
                    if ((connection.from === expectedConn.sourceRoomId && connection.to === expectedConn.targetRoomId) ||
                        (connection.from === expectedConn.targetRoomId && connection.to === expectedConn.sourceRoomId)) {
                        found = true;
                        actualConn = connection;
                        break;
                    }
                }
                if (found) break;
            }
            
            validationResults.push({
                expected: expectedConn,
                found,
                actual: actualConn,
                status: found ? 'VERIFIED' : 'MISSING'
            });
        }
        
        const verifiedCount = validationResults.filter(r => r.status === 'VERIFIED').length;
        const totalCount = validationResults.length;
        
        return {
            totalCriticalConnections: totalCount,
            verifiedConnections: verifiedCount,
            missingConnections: totalCount - verifiedCount,
            verificationRate: totalCount > 0 ? (verifiedCount / totalCount * 100).toFixed(2) + '%' : '0%',
            details: validationResults,
            status: verifiedCount === totalCount ? 'PASS' : 'PARTIAL'
        };
    }

    /**
     * 验证交通枢纽
     */
    validateTrafficHubs(splitData) {
        const expectedHubs = this.expectedCrossRegionConnections.trafficHubs;
        const validationResults = [];
        
        for (const expectedHub of expectedHubs) {
            const roomNode = this.validator.roomGraph.get(expectedHub.name);
            
            if (roomNode) {
                const actualConnections = roomNode.connections.length + roomNode.crossRegionConnections.length;
                validationResults.push({
                    name: expectedHub.name,
                    district: expectedHub.district,
                    expectedConnections: expectedHub.connections,
                    actualConnections,
                    connectionDifference: actualConnections - expectedHub.connections,
                    status: actualConnections >= expectedHub.connections ? 'VERIFIED' : 'INSUFFICIENT'
                });
            } else {
                validationResults.push({
                    name: expectedHub.name,
                    district: expectedHub.district,
                    expectedConnections: expectedHub.connections,
                    actualConnections: 0,
                    connectionDifference: -expectedHub.connections,
                    status: 'MISSING'
                });
            }
        }
        
        const verifiedCount = validationResults.filter(r => r.status === 'VERIFIED').length;
        const totalCount = validationResults.length;
        
        return {
            totalHubs: totalCount,
            verifiedHubs: verifiedCount,
            verificationRate: totalCount > 0 ? (verifiedCount / totalCount * 100).toFixed(2) + '%' : '0%',
            details: validationResults,
            status: verifiedCount === totalCount ? 'PASS' : 'PARTIAL'
        };
    }

    /**
     * 执行性能测试
     */
    async runPerformanceTests(splitData) {
        const results = {
            benchmarks: {},
            memoryAnalysis: {},
            performanceScore: 0
        };
        
        // 1. 房间图构建性能测试
        console.log('  🏃 测试房间图构建性能...');
        results.benchmarks.roomGraphConstruction = await this.benchmarkRoomGraphConstruction(splitData);
        
        // 2. DFS遍历性能测试
        console.log('  🏃 测试DFS遍历性能...');
        results.benchmarks.dfsTraversal = await this.benchmarkDFSTraversal();
        
        // 3. 内存使用分析
        console.log('  🏃 分析内存使用...');
        results.memoryAnalysis = await this.analyzeMemoryUsage();
        
        // 4. 计算性能分数
        results.performanceScore = this.calculatePerformanceScore(results);
        
        return results;
    }

    /**
     * 基准测试：房间图构建
     */
    async benchmarkRoomGraphConstruction(splitData) {
        const iterations = 10;
        const times = [];
        
        for (let i = 0; i < iterations; i++) {
            const startTime = process.hrtime.bigint();
            
            // 清空并重新构建
            this.validator.roomGraph.clear();
            this.validator.buildRoomGraph(splitData);
            
            const endTime = process.hrtime.bigint();
            times.push(Number(endTime - startTime) / 1000000); // 转换为毫秒
        }
        
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        return {
            averageTime: averageTime.toFixed(2),
            minTime: minTime.toFixed(2),
            maxTime: maxTime.toFixed(2),
            iterations,
            roomCount: this.validator.roomGraph.size,
            performancePerRoom: (averageTime / this.validator.roomGraph.size).toFixed(4)
        };
    }

    /**
     * 基准测试：DFS遍历
     */
    async benchmarkDFSTraversal() {
        if (this.validator.roomGraph.size === 0) {
            return { error: 'No rooms to traverse' };
        }
        
        const iterations = 50;
        const times = [];
        const startRoomId = this.validator.roomGraph.keys().next().value;
        
        for (let i = 0; i < iterations; i++) {
            const startTime = process.hrtime.bigint();
            
            this.validator.visitedRooms.clear();
            this.validator.dfsConnectivity(startRoomId);
            
            const endTime = process.hrtime.bigint();
            times.push(Number(endTime - startTime) / 1000000);
        }
        
        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        return {
            averageTime: averageTime.toFixed(2),
            minTime: minTime.toFixed(2),
            maxTime: maxTime.toFixed(2),
            iterations,
            roomCount: this.validator.roomGraph.size,
            traversalRate: (this.validator.roomGraph.size / averageTime).toFixed(0)
        };
    }

    /**
     * 内存使用分析
     */
    async analyzeMemoryUsage() {
        const memBefore = process.memoryUsage();
        
        // 执行内存密集操作
        this.validator.buildRoomGraph(this.lastSplitData || {});
        
        const memAfter = process.memoryUsage();
        
        return {
            heapUsed: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024, // MB
            heapTotal: (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024, // MB
            external: (memAfter.external - memBefore.external) / 1024 / 1024, // MB
            rss: (memAfter.rss - memBefore.rss) / 1024 / 1024, // MB
            roomGraphSize: this.validator.roomGraph.size,
            memoryPerRoom: ((memAfter.heapUsed - memBefore.heapUsed) / this.validator.roomGraph.size / 1024).toFixed(2) // KB
        };
    }

    /**
     * 计算性能分数
     */
    calculatePerformanceScore(results) {
        let score = 100;
        
        // 房间图构建性能评分 (40%)
        const graphConstruction = results.benchmarks.roomGraphConstruction;
        if (graphConstruction) {
            const avgTime = parseFloat(graphConstruction.averageTime);
            if (avgTime > 100) score -= 20; // 超过100ms扣20分
            else if (avgTime > 50) score -= 10; // 超过50ms扣10分
        }
        
        // DFS遍历性能评分 (30%)
        const dfsTraversal = results.benchmarks.dfsTraversal;
        if (dfsTraversal) {
            const avgTime = parseFloat(dfsTraversal.averageTime);
            if (avgTime > 10) score -= 15; // 超过10ms扣15分
            else if (avgTime > 5) score -= 8; // 超过5ms扣8分
        }
        
        // 内存使用评分 (30%)
        const memoryAnalysis = results.memoryAnalysis;
        if (memoryAnalysis) {
            const memoryMB = memoryAnalysis.heapUsed;
            if (memoryMB > 50) score -= 15; // 超过50MB扣15分
            else if (memoryMB > 20) score -= 8; // 超过20MB扣8分
        }
        
        return Math.max(0, score);
    }

    /**
     * 执行数据完整性验证
     */
    async runDataIntegrityValidation(sourceData, splitData) {
        const DataIntegrityChecker = require('./DataIntegrityChecker');
        const integrityChecker = new DataIntegrityChecker();
        
        return integrityChecker.validateIntegrity(sourceData, splitData);
    }

    /**
     * 生成测试摘要
     */
    generateTestSummary() {
        const summary = {
            overallStatus: 'PASS',
            testTimestamp: new Date().toISOString(),
            testSuite: 'ConnectivityTester v1.0',
            results: {}
        };
        
        // 连通性测试结果
        if (this.testResults.connectivity) {
            summary.results.connectivity = {
                status: this.testResults.connectivity.status,
                executionTime: this.testResults.connectivity.executionTime,
                isFullyConnected: this.testResults.connectivity.overallConnectivity.isFullyConnected,
                totalRooms: this.testResults.connectivity.overallConnectivity.totalRooms,
                isolatedRooms: this.testResults.connectivity.overallConnectivity.isolatedRooms.length
            };
        }
        
        // 跨区域验证结果
        if (this.testResults.crossRegion) {
            summary.results.crossRegion = {
                status: this.testResults.crossRegion.validationStatus,
                expectedConnections: this.testResults.crossRegion.expectedConnections,
                actualConnections: this.testResults.crossRegion.actualConnections,
                criticalConnectionsStatus: this.testResults.crossRegion.criticalConnectionValidation?.status,
                trafficHubsStatus: this.testResults.crossRegion.trafficHubValidation?.status
            };
        }
        
        // 性能测试结果
        if (this.testResults.performance) {
            summary.results.performance = {
                score: this.testResults.performance.performanceScore,
                graphConstructionTime: this.testResults.performance.benchmarks.roomGraphConstruction?.averageTime,
                dfsTraversalTime: this.testResults.performance.benchmarks.dfsTraversal?.averageTime,
                memoryUsage: this.testResults.performance.memoryAnalysis?.heapUsed
            };
        }
        
        // 完整性验证结果
        if (this.testResults.integrity) {
            summary.results.integrity = {
                status: this.testResults.integrity.summary.overallStatus,
                totalErrors: this.testResults.integrity.summary.totalErrors,
                totalWarnings: this.testResults.integrity.summary.totalWarnings,
                isValid: this.testResults.integrity.isValid
            };
        }
        
        // 计算总体状态
        const statuses = [
            summary.results.connectivity?.status,
            summary.results.crossRegion?.status,
            summary.results.integrity?.status
        ].filter(Boolean);
        
        if (statuses.includes('FAIL') || statuses.includes('MISSING_CONNECTIONS')) {
            summary.overallStatus = 'FAIL';
        } else if (statuses.includes('PARTIAL') || statuses.includes('EXTRA_CONNECTIONS')) {
            summary.overallStatus = 'PARTIAL';
        }
        
        return summary;
    }

    /**
     * 生成详细的测试报告
     */
    generateDetailedReport() {
        if (!this.testResults.summary) {
            throw new Error('必须先执行测试才能生成报告');
        }
        
        const report = [];
        
        report.push('# 连通性测试详细报告');
        report.push(`生成时间: ${this.testResults.summary.testTimestamp}`);
        report.push(`测试套件: ${this.testResults.summary.testSuite}`);
        report.push(`总体状态: ${this.testResults.summary.overallStatus}`);
        report.push('');
        
        // 连通性测试详情
        if (this.testResults.connectivity) {
            report.push('## 基础连通性测试');
            const conn = this.testResults.connectivity;
            report.push(`- 测试状态: ${conn.status}`);
            report.push(`- 执行时间: ${conn.executionTime}ms`);
            report.push(`- 完全连通: ${conn.overallConnectivity.isFullyConnected ? '是' : '否'}`);
            report.push(`- 总房间数: ${conn.overallConnectivity.totalRooms}`);
            report.push(`- 连通分量数: ${conn.overallConnectivity.components.length}`);
            report.push(`- 孤立房间数: ${conn.overallConnectivity.isolatedRooms.length}`);
            report.push('');
            
            // 连通性统计
            const stats = conn.overallConnectivity.statistics;
            report.push('### 连通性统计');
            report.push(`- 有连接的房间: ${stats.roomsWithConnections}`);
            report.push(`- 无连接的房间: ${stats.roomsWithoutConnections}`);
            report.push(`- 平均连接数: ${stats.averageConnectionsPerRoom.toFixed(2)}`);
            report.push(`- 内部连接总数: ${stats.totalInternalConnections}`);
            report.push(`- 跨区域连接总数: ${stats.totalCrossRegionConnections}`);
            report.push('');
        }
        
        // 跨区域连接验证详情
        if (this.testResults.crossRegion) {
            report.push('## 跨区域连接验证');
            const cross = this.testResults.crossRegion;
            report.push(`- 验证状态: ${cross.validationStatus}`);
            report.push(`- 预期连接数: ${cross.expectedConnections}`);
            report.push(`- 实际连接数: ${cross.actualConnections}`);
            report.push(`- 连接差异: ${cross.actualConnections - cross.expectedConnections}`);
            report.push('');
            
            // 关键连接验证
            if (cross.criticalConnectionValidation) {
                const critical = cross.criticalConnectionValidation;
                report.push('### 关键连接验证');
                report.push(`- 总关键连接: ${critical.totalCriticalConnections}`);
                report.push(`- 已验证连接: ${critical.verifiedConnections}`);
                report.push(`- 缺失连接: ${critical.missingConnections}`);
                report.push(`- 验证率: ${critical.verificationRate}`);
                report.push(`- 状态: ${critical.status}`);
                report.push('');
            }
            
            // 交通枢纽验证
            if (cross.trafficHubValidation) {
                const hubs = cross.trafficHubValidation;
                report.push('### 交通枢纽验证');
                report.push(`- 总枢纽数: ${hubs.totalHubs}`);
                report.push(`- 已验证枢纽: ${hubs.verifiedHubs}`);
                report.push(`- 验证率: ${hubs.verificationRate}`);
                report.push(`- 状态: ${hubs.status}`);
                report.push('');
            }
        }
        
        // 性能测试详情
        if (this.testResults.performance) {
            report.push('## 性能测试');
            const perf = this.testResults.performance;
            report.push(`- 性能分数: ${perf.performanceScore}/100`);
            report.push('');
            
            // 基准测试详情
            if (perf.benchmarks.roomGraphConstruction) {
                const bench = perf.benchmarks.roomGraphConstruction;
                report.push('### 房间图构建性能');
                report.push(`- 平均时间: ${bench.averageTime}ms`);
                report.push(`- 最小时间: ${bench.minTime}ms`);
                report.push(`- 最大时间: ${bench.maxTime}ms`);
                report.push(`- 每房间耗时: ${bench.performancePerRoom}ms`);
                report.push('');
            }
            
            if (perf.benchmarks.dfsTraversal) {
                const dfs = perf.benchmarks.dfsTraversal;
                report.push('### DFS遍历性能');
                report.push(`- 平均时间: ${dfs.averageTime}ms`);
                report.push(`- 遍历速率: ${dfs.traversalRate} 房间/秒`);
                report.push('');
            }
            
            // 内存使用分析
            if (perf.memoryAnalysis) {
                const mem = perf.memoryAnalysis;
                report.push('### 内存使用分析');
                report.push(`- 堆内存使用: ${mem.heapUsed.toFixed(2)}MB`);
                report.push(`- 每房间内存: ${mem.memoryPerRoom}KB`);
                report.push('');
            }
        }
        
        // 数据完整性验证详情
        if (this.testResults.integrity) {
            report.push('## 数据完整性验证');
            const integrity = this.testResults.integrity;
            report.push(`- 验证状态: ${integrity.summary.overallStatus}`);
            report.push(`- 错误数量: ${integrity.summary.totalErrors}`);
            report.push(`- 警告数量: ${integrity.summary.totalWarnings}`);
            report.push(`- 数据完整: ${integrity.isValid ? '是' : '否'}`);
            report.push('');
            
            // ID唯一性
            const idResult = integrity.idUniqueness;
            report.push('### 房间ID唯一性');
            report.push(`- 总房间数: ${idResult.totalRooms}`);
            report.push(`- 唯一ID数: ${idResult.uniqueIds}`);
            report.push(`- 重复房间: ${idResult.duplicateRooms.length}`);
            report.push(`- 发现重复: ${idResult.duplicatesFound ? '是' : '否'}`);
            report.push('');
            
            // 数据完整性
            const completenessResult = integrity.dataCompleteness;
            report.push('### 数据完整性');
            report.push(`- 源数据房间数: ${completenessResult.sourceRoomCount}`);
            report.push(`- 拆分数据房间数: ${completenessResult.splitRoomCount}`);
            report.push(`- 缺失房间: ${completenessResult.missingRooms.length}`);
            report.push(`- 多余房间: ${completenessResult.extraRooms.length}`);
            report.push(`- 数据完整: ${completenessResult.isComplete ? '是' : '否'}`);
            report.push('');
        }
        
        // 错误和警告
        const errors = [];
        const warnings = [];
        
        if (this.testResults.connectivity?.overallConnectivity.connectivityIssues) {
            errors.push(...this.testResults.connectivity.overallConnectivity.connectivityIssues);
        }
        
        if (this.testResults.integrity?.errors) {
            errors.push(...this.testResults.integrity.errors);
        }
        
        if (this.testResults.integrity?.warnings) {
            warnings.push(...this.testResults.integrity.warnings);
        }
        
        if (errors.length > 0) {
            report.push('## 发现的错误');
            errors.forEach((error, index) => {
                report.push(`${index + 1}. ${error}`);
            });
            report.push('');
        }
        
        if (warnings.length > 0) {
            report.push('## 发现的警告');
            warnings.forEach((warning, index) => {
                report.push(`${index + 1}. ${warning}`);
            });
            report.push('');
        }
        
        return report.join('\n');
    }

    /**
     * 保存测试结果
     */
    async saveResults(outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 保存完整结果
        const resultsPath = path.join(outputDir, `connectivity-test-results-${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
        
        // 保存详细报告
        const reportPath = path.join(outputDir, `connectivity-test-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generateDetailedReport());
        
        // 保存摘要
        const summaryPath = path.join(outputDir, `connectivity-test-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.testResults.summary, null, 2));
        
        console.log(`📄 测试结果已保存:`);
        console.log(`  - 完整结果: ${resultsPath}`);
        console.log(`  - 详细报告: ${reportPath}`);
        console.log(`  - 测试摘要: ${summaryPath}`);
        
        return {
            resultsPath,
            reportPath,
            summaryPath
        };
    }

    /**
     * 保存拆分数据以供后续测试使用
     */
    setSplitDataForMemoryAnalysis(splitData) {
        this.lastSplitData = splitData;
    }
}

module.exports = ConnectivityTester;