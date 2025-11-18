/**
 * 性能基准测试工具
 * 用于地图迁移系统的性能测试、基准对比和性能监控
 * 支持多种性能指标测量、回归测试和性能趋势分析
 */
const fs = require('fs');
const path = require('path');

class PerformanceBenchmark {
    constructor(options = {}) {
        this.options = {
            enableMemoryProfiling: options.enableMemoryProfiling !== false,
            enableCPUTiming: options.enableCPUTiming !== false,
            enableLoadTesting: options.enableLoadTesting || false,
            iterations: options.iterations || 10,
            warmupIterations: options.warmupIterations || 3,
            ...options
        };
        
        // 基准测试结果存储
        this.benchmarkResults = {
            suite: 'PerformanceBenchmark v1.0',
            timestamp: new Date().toISOString(),
            systemInfo: this.getSystemInfo(),
            benchmarks: {},
            comparisons: {},
            summary: null
        };
        
        // 性能基准数据
        this.baselines = {
            mapSplitting: {
                averageTime: 0,
                memoryUsage: 0,
                cpuUsage: 0
            },
            connectivityValidation: {
                averageTime: 0,
                memoryUsage: 0,
                cpuUsage: 0
            },
            dataIntegrityCheck: {
                averageTime: 0,
                memoryUsage: 0,
                cpuUsage: 0
            },
            queryPerformance: {
                averageTime: 0,
                throughput: 0,
                latency: 0
            }
        };
        
        // 历史性能数据
        this.historicalData = this.loadHistoricalData();
    }

    /**
     * 获取系统信息
     */
    getSystemInfo() {
        return {
            platform: process.platform,
            nodeVersion: process.version,
            arch: process.arch,
            cpuCount: require('os').cpus().length,
            totalMemory: require('os').totalmem(),
            freeMemory: require('os').freemem(),
            uptime: require('os').uptime()
        };
    }

    /**
     * 加载历史性能数据
     */
    loadHistoricalData() {
        try {
            const historicalPath = path.join(__dirname, '../../../output/performance-history.json');
            if (fs.existsSync(historicalPath)) {
                return JSON.parse(fs.readFileSync(historicalPath, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️ 无法加载历史性能数据');
        }
        return [];
    }

    /**
     * 执行完整的性能基准测试
     * @param {Object} testData - 测试数据
     * @returns {Object} 基准测试结果
     */
    async runComprehensiveBenchmark(testData) {
        console.log('🏁 开始执行性能基准测试...');
        const startTime = Date.now();
        
        try {
            // 1. 地图拆分性能测试
            console.log('1️⃣ 地图拆分性能测试...');
            this.benchmarkResults.benchmarks.mapSplitting = await this.benchmarkMapSplitting(testData.sourceData);
            
            // 2. 连通性验证性能测试
            console.log('2️⃣ 连通性验证性能测试...');
            this.benchmarkResults.benchmarks.connectivityValidation = await this.benchmarkConnectivityValidation(testData.splitData);
            
            // 3. 数据完整性检查性能测试
            console.log('3️⃣ 数据完整性检查性能测试...');
            this.benchmarkResults.benchmarks.dataIntegrityCheck = await this.benchmarkDataIntegrityCheck(testData.sourceData, testData.splitData);
            
            // 4. 查询性能测试
            console.log('4️⃣ 查询性能测试...');
            this.benchmarkResults.benchmarks.queryPerformance = await this.benchmarkQueryPerformance(testData.splitData);
            
            // 5. 负载测试
            if (this.options.enableLoadTesting) {
                console.log('5️⃣ 负载测试...');
                this.benchmarkResults.benchmarks.loadTesting = await this.benchmarkLoadTesting(testData.splitData);
            }
            
            // 6. 性能对比分析
            console.log('6️⃣ 性能对比分析...');
            this.benchmarkResults.comparisons = await this.performComparativeAnalysis();
            
            // 7. 生成性能摘要
            console.log('7️⃣ 生成性能摘要...');
            this.benchmarkResults.summary = this.generatePerformanceSummary();
            
            const totalTime = Date.now() - startTime;
            console.log(`✅ 性能基准测试完成，耗时: ${totalTime}ms`);
            
            return this.benchmarkResults;
            
        } catch (error) {
            console.error('❌ 性能基准测试失败:', error);
            throw error;
        }
    }

    /**
     * 基准测试：地图拆分
     */
    async benchmarkMapSplitting(sourceData) {
        const MapSplitter = require('./MapSplitter');
        const splitter = new MapSplitter();
        
        const results = {
            test: 'Map Splitting',
            iterations: [],
            statistics: {},
            memoryAnalysis: {},
            performanceGrade: 'A'
        };
        
        console.log('  🔄 预热...');
        // 预热运行
        for (let i = 0; i < this.options.warmupIterations; i++) {
            try {
                await splitter.splitMap(sourceData);
            } catch (error) {
                // 忽略预热错误
            }
        }
        
        console.log('  🏃 正式测试...');
        // 正式测试
        for (let i = 0; i < this.options.iterations; i++) {
            const iteration = await this.runMapSplittingIteration(splitter, sourceData, i);
            results.iterations.push(iteration);
        }
        
        // 计算统计数据
        results.statistics = this.calculateStatistics(results.iterations, 'executionTime');
        
        // 内存分析
        if (this.options.enableMemoryProfiling) {
            results.memoryAnalysis = await this.analyzeMemoryUsage('mapSplitting');
        }
        
        // 性能评级
        results.performanceGrade = this.calculatePerformanceGrade(results.statistics, 'mapSplitting');
        
        return results;
    }

    /**
     * 运行单次地图拆分迭代
     */
    async runMapSplittingIteration(splitter, sourceData, iteration) {
        const memBefore = process.memoryUsage();
        const cpuStart = process.cpuUsage();
        const startTime = process.hrtime.bigint();
        
        try {
            const result = await splitter.splitMap(sourceData);
            const endTime = process.hrtime.bigint();
            const cpuEnd = process.cpuUsage(cpuStart);
            const memAfter = process.memoryUsage();
            
            return {
                iteration: iteration + 1,
                success: true,
                executionTime: Number(endTime - startTime) / 1000000, // 转换为毫秒
                cpuTime: {
                    user: cpuEnd.user / 1000000,
                    system: cpuEnd.system / 1000000
                },
                memoryUsage: {
                    heapUsed: memAfter.heapUsed - memBefore.heapUsed,
                    heapTotal: memAfter.heapTotal - memBefore.heapTotal,
                    external: memAfter.external - memBefore.external
                },
                result: {
                    regionsCount: Object.keys(result).length,
                    totalRooms: Object.values(result).reduce((sum, region) => 
                        sum + region.locations.reduce((locSum, loc) => locSum + loc.rooms.length, 0), 0)
                }
            };
        } catch (error) {
            return {
                iteration: iteration + 1,
                success: false,
                error: error.message,
                executionTime: 0,
                cpuTime: { user: 0, system: 0 },
                memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0 }
            };
        }
    }

    /**
     * 基准测试：连通性验证
     */
    async benchmarkConnectivityValidation(splitData) {
        const ConnectivityValidator = require('./ConnectivityValidator');
        const validator = new ConnectivityValidator();
        
        const results = {
            test: 'Connectivity Validation',
            iterations: [],
            statistics: {},
            memoryAnalysis: {},
            performanceGrade: 'A'
        };
        
        console.log('  🔄 预热...');
        // 预热运行
        for (let i = 0; i < this.options.warmupIterations; i++) {
            validator.buildRoomGraph(splitData);
            validator.validateOverallConnectivity(splitData);
        }
        
        console.log('  🏃 正式测试...');
        // 正式测试
        for (let i = 0; i < this.options.iterations; i++) {
            const iteration = await this.runConnectivityValidationIteration(validator, splitData, i);
            results.iterations.push(iteration);
        }
        
        // 计算统计数据
        results.statistics = this.calculateStatistics(results.iterations, 'executionTime');
        
        // 内存分析
        if (this.options.enableMemoryProfiling) {
            results.memoryAnalysis = await this.analyzeMemoryUsage('connectivityValidation');
        }
        
        // 性能评级
        results.performanceGrade = this.calculatePerformanceGrade(results.statistics, 'connectivityValidation');
        
        return results;
    }

    /**
     * 运行单次连通性验证迭代
     */
    async runConnectivityValidationIteration(validator, splitData, iteration) {
        const memBefore = process.memoryUsage();
        const cpuStart = process.cpuUsage();
        const startTime = process.hrtime.bigint();
        
        try {
            validator.buildRoomGraph(splitData);
            const overallResult = validator.validateOverallConnectivity(splitData);
            const interRegionResult = validator.validateInterRegionConnectivity(splitData);
            
            const endTime = process.hrtime.bigint();
            const cpuEnd = process.cpuUsage(cpuStart);
            const memAfter = process.memoryUsage();
            
            return {
                iteration: iteration + 1,
                success: true,
                executionTime: Number(endTime - startTime) / 1000000,
                cpuTime: {
                    user: cpuEnd.user / 1000000,
                    system: cpuEnd.system / 1000000
                },
                memoryUsage: {
                    heapUsed: memAfter.heapUsed - memBefore.heapUsed,
                    heapTotal: memAfter.heapTotal - memBefore.heapTotal,
                    external: memAfter.external - memBefore.external
                },
                result: {
                    roomCount: validator.roomGraph.size,
                    isConnected: overallResult.isFullyConnected,
                    componentsCount: overallResult.components.length
                }
            };
        } catch (error) {
            return {
                iteration: iteration + 1,
                success: false,
                error: error.message,
                executionTime: 0,
                cpuTime: { user: 0, system: 0 },
                memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0 }
            };
        }
    }

    /**
     * 基准测试：数据完整性检查
     */
    async benchmarkDataIntegrityCheck(sourceData, splitData) {
        const DataIntegrityChecker = require('./DataIntegrityChecker');
        const checker = new DataIntegrityChecker();
        
        const results = {
            test: 'Data Integrity Check',
            iterations: [],
            statistics: {},
            memoryAnalysis: {},
            performanceGrade: 'A'
        };
        
        console.log('  🔄 预热...');
        // 预热运行
        for (let i = 0; i < this.options.warmupIterations; i++) {
            checker.validateIntegrity(sourceData, splitData);
        }
        
        console.log('  🏃 正式测试...');
        // 正式测试
        for (let i = 0; i < this.options.iterations; i++) {
            const iteration = await this.runDataIntegrityCheckIteration(checker, sourceData, splitData, i);
            results.iterations.push(iteration);
        }
        
        // 计算统计数据
        results.statistics = this.calculateStatistics(results.iterations, 'executionTime');
        
        // 内存分析
        if (this.options.enableMemoryProfiling) {
            results.memoryAnalysis = await this.analyzeMemoryUsage('dataIntegrityCheck');
        }
        
        // 性能评级
        results.performanceGrade = this.calculatePerformanceGrade(results.statistics, 'dataIntegrityCheck');
        
        return results;
    }

    /**
     * 运行单次数据完整性检查迭代
     */
    async runDataIntegrityCheckIteration(checker, sourceData, splitData, iteration) {
        const memBefore = process.memoryUsage();
        const cpuStart = process.cpuUsage();
        const startTime = process.hrtime.bigint();
        
        try {
            const result = checker.validateIntegrity(sourceData, splitData);
            const endTime = process.hrtime.bigint();
            const cpuEnd = process.cpuUsage(cpuStart);
            const memAfter = process.memoryUsage();
            
            return {
                iteration: iteration + 1,
                success: true,
                executionTime: Number(endTime - startTime) / 1000000,
                cpuTime: {
                    user: cpuEnd.user / 1000000,
                    system: cpuEnd.system / 1000000
                },
                memoryUsage: {
                    heapUsed: memAfter.heapUsed - memBefore.heapUsed,
                    heapTotal: memAfter.heapTotal - memBefore.heapTotal,
                    external: memAfter.external - memBefore.external
                },
                result: {
                    isValid: result.isValid,
                    totalErrors: result.summary.totalErrors,
                    totalWarnings: result.summary.totalWarnings
                }
            };
        } catch (error) {
            return {
                iteration: iteration + 1,
                success: false,
                error: error.message,
                executionTime: 0,
                cpuTime: { user: 0, system: 0 },
                memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0 }
            };
        }
    }

    /**
     * 基准测试：查询性能
     */
    async benchmarkQueryPerformance(splitData) {
        const results = {
            test: 'Query Performance',
            queries: [],
            statistics: {},
            memoryAnalysis: {},
            performanceGrade: 'A'
        };
        
        // 构建测试数据
        const testData = this.buildQueryTestData(splitData);
        
        console.log('  🏃 执行查询测试...');
        for (const query of testData) {
            const queryResult = await this.runQueryTest(query, splitData);
            results.queries.push(queryResult);
        }
        
        // 计算统计数据
        const allTimes = results.queries.map(q => q.executionTime);
        results.statistics = this.calculateBasicStatistics(allTimes);
        results.statistics.throughput = results.queries.length / (allTimes.reduce((a, b) => a + b, 0) / 1000); // 查询/秒
        results.statistics.averageLatency = results.statistics.mean;
        
        // 性能评级
        results.performanceGrade = this.calculateQueryPerformanceGrade(results.statistics);
        
        return results;
    }

    /**
     * 构建查询测试数据
     */
    buildQueryTestData(splitData) {
        const queries = [];
        
        // 收集所有房间
        const allRooms = [];
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    allRooms.push({ id: room.id, name: room.name, region: regionId });
                }
            }
        }
        
        // 随机房间查询
        const randomRoomQueries = [];
        for (let i = 0; i < 20; i++) {
            const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
            randomRoomQueries.push({
                type: 'findRoomById',
                params: { roomId: randomRoom.id },
                expected: randomRoom
            });
        }
        
        // 房间名称查询
        const nameQueries = [];
        for (let i = 0; i < 10; i++) {
            const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
            nameQueries.push({
                type: 'findRoomByName',
                params: { roomName: randomRoom.name },
                expected: randomRoom
            });
        }
        
        // 区域统计查询
        const regionQueries = Object.keys(splitData).map(regionId => ({
            type: 'getRegionStats',
            params: { regionId },
            expected: { regionId }
        }));
        
        return [...randomRoomQueries, ...nameQueries, ...regionQueries];
    }

    /**
     * 运行单个查询测试
     */
    async runQueryTest(query, splitData) {
        const startTime = process.hrtime.bigint();
        let result = null;
        let success = true;
        
        try {
            switch (query.type) {
                case 'findRoomById':
                    result = this.findRoomById(splitData, query.params.roomId);
                    break;
                case 'findRoomByName':
                    result = this.findRoomByName(splitData, query.params.roomName);
                    break;
                case 'getRegionStats':
                    result = this.getRegionStats(splitData, query.params.regionId);
                    break;
                default:
                    throw new Error(`Unknown query type: ${query.type}`);
            }
        } catch (error) {
            success = false;
            result = { error: error.message };
        }
        
        const endTime = process.hrtime.bigint();
        const executionTime = Number(endTime - startTime) / 1000000;
        
        return {
            queryType: query.type,
            params: query.params,
            executionTime,
            success,
            result,
            resultSize: JSON.stringify(result).length
        };
    }

    /**
     * 基准测试：负载测试
     */
    async benchmarkLoadTesting(splitData) {
        const results = {
            test: 'Load Testing',
            scenarios: [],
            summary: {}
        };
        
        console.log('  🏃 执行负载测试...');
        
        // 并发查询测试
        const concurrentTest = await this.runConcurrentQueryTest(splitData);
        results.scenarios.push(concurrentTest);
        
        // 内存压力测试
        const memoryTest = await this.runMemoryStressTest(splitData);
        results.scenarios.push(memoryTest);
        
        // 长时间运行测试
        const enduranceTest = await this.runEnduranceTest(splitData);
        results.scenarios.push(enduranceTest);
        
        // 生成负载测试摘要
        results.summary = {
            totalScenarios: results.scenarios.length,
            passedScenarios: results.scenarios.filter(s => s.status === 'PASS').length,
            averagePerformance: results.scenarios.reduce((sum, s) => sum + (s.performanceScore || 0), 0) / results.scenarios.length
        };
        
        return results;
    }

    /**
     * 运行并发查询测试
     */
    async runConcurrentQueryTest(splitData) {
        const concurrency = 10;
        const queriesPerWorker = 5;
        
        const startTime = Date.now();
        const promises = [];
        
        for (let i = 0; i < concurrency; i++) {
            const workerPromise = this.runQueryWorker(splitData, queriesPerWorker);
            promises.push(workerPromise);
        }
        
        const results = await Promise.all(promises);
        const totalTime = Date.now() - startTime;
        
        const totalQueries = results.reduce((sum, r) => sum + r.queryCount, 0);
        const averageLatency = results.reduce((sum, r) => sum + r.averageLatency, 0) / results.length;
        
        return {
            scenario: 'Concurrent Queries',
            concurrency,
            totalQueries,
            totalTime,
            throughput: totalQueries / (totalTime / 1000), // 查询/秒
            averageLatency,
            status: averageLatency < 100 ? 'PASS' : 'FAIL',
            performanceScore: Math.max(0, 100 - averageLatency)
        };
    }

    /**
     * 运行查询工作器
     */
    async runQueryWorker(splitData, queryCount) {
        const times = [];
        
        for (let i = 0; i < queryCount; i++) {
            const startTime = process.hrtime.bigint();
            
            // 执行简单查询
            this.findRoomById(splitData, 'tj_palace_square');
            
            const endTime = process.hrtime.bigint();
            times.push(Number(endTime - startTime) / 1000000);
        }
        
        return {
            queryCount,
            averageLatency: times.reduce((a, b) => a + b, 0) / times.length
        };
    }

    /**
     * 运行内存压力测试
     */
    async runMemoryStressTest(splitData) {
        const iterations = 50;
        const memorySnapshots = [];
        
        for (let i = 0; i < iterations; i++) {
            const memBefore = process.memoryUsage();
            
            // 执行内存密集操作
            const validator = require('./ConnectivityValidator');
            const v = new validator();
            v.buildRoomGraph(splitData);
            
            const memAfter = process.memoryUsage();
            memorySnapshots.push({
                iteration: i,
                heapUsed: memAfter.heapUsed,
                memoryGrowth: memAfter.heapUsed - memBefore.heapUsed
            });
            
            // 强制垃圾回收（如果可用）
            if (global.gc) {
                global.gc();
            }
        }
        
        const memoryGrowth = memorySnapshots.map(s => s.memoryGrowth);
        const averageGrowth = memoryGrowth.reduce((a, b) => a + b, 0) / memoryGrowth.length;
        
        return {
            scenario: 'Memory Stress Test',
            iterations,
            averageMemoryGrowth: averageGrowth,
            maxMemoryGrowth: Math.max(...memoryGrowth),
            memoryLeakDetected: averageGrowth > 1024 * 1024, // 1MB阈值
            status: averageGrowth < 512 * 1024 ? 'PASS' : 'FAIL', // 512KB阈值
            performanceScore: Math.max(0, 100 - (averageGrowth / (1024 * 10))) // 转换为分数
        };
    }

    /**
     * 运行长时间运行测试
     */
    async runEnduranceTest(splitData) {
        const duration = 10000; // 10秒
        const startTime = Date.now();
        let operationCount = 0;
        const latencies = [];
        
        while (Date.now() - startTime < duration) {
            const opStart = process.hrtime.bigint();
            
            // 执行操作
            this.findRoomById(splitData, 'tj_palace_square');
            operationCount++;
            
            const opEnd = process.hrtime.bigint();
            latencies.push(Number(opEnd - opStart) / 1000000);
        }
        
        const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const throughput = operationCount / (duration / 1000);
        
        return {
            scenario: 'Endurance Test',
            duration,
            operationCount,
            throughput,
            averageLatency,
            latencyStability: Math.max(...latencies) - Math.min(...latencies),
            status: throughput > 100 ? 'PASS' : 'FAIL', // 100 操作/秒阈值
            performanceScore: Math.min(100, throughput)
        };
    }

    /**
     * 执行性能对比分析
     */
    async performComparativeAnalysis() {
        const comparisons = {};
        
        for (const [testName, benchmark] of Object.entries(this.benchmarkResults.benchmarks)) {
            if (benchmark.statistics) {
                const historical = this.historicalData.filter(d => d.test === testName);
                
                if (historical.length > 0) {
                    const latestHistorical = historical[historical.length - 1];
                    comparisons[testName] = {
                        current: benchmark.statistics.mean,
                        previous: latestHistorical.statistics.mean,
                        improvement: ((latestHistorical.statistics.mean - benchmark.statistics.mean) / latestHistorical.statistics.mean * 100).toFixed(2),
                        trend: this.calculateTrend(historical, benchmark.statistics.mean)
                    };
                } else {
                    comparisons[testName] = {
                        current: benchmark.statistics.mean,
                        previous: null,
                        improvement: null,
                        trend: 'baseline'
                    };
                }
            }
        }
        
        return comparisons;
    }

    /**
     * 计算性能趋势
     */
    calculateTrend(historicalData, currentValue) {
        if (historicalData.length < 2) return 'insufficient_data';
        
        const recentData = historicalData.slice(-5); // 最近5次
        const averageRecent = recentData.reduce((sum, d) => sum + d.statistics.mean, 0) / recentData.length;
        
        if (currentValue < averageRecent * 0.95) return 'improving';
        if (currentValue > averageRecent * 1.05) return 'degrading';
        return 'stable';
    }

    /**
     * 生成性能摘要
     */
    generatePerformanceSummary() {
        const summary = {
            overallGrade: 'A',
            overallScore: 0,
            testResults: {},
            recommendations: [],
            performanceTrends: {}
        };
        
        let totalScore = 0;
        let testCount = 0;
        
        for (const [testName, benchmark] of Object.entries(this.benchmarkResults.benchmarks)) {
            if (benchmark.performanceGrade) {
                summary.testResults[testName] = {
                    grade: benchmark.performanceGrade,
                    score: this.gradeToScore(benchmark.performanceGrade),
                    statistics: benchmark.statistics
                };
                
                totalScore += summary.testResults[testName].score;
                testCount++;
            }
        }
        
        summary.overallScore = testCount > 0 ? totalScore / testCount : 0;
        summary.overallGrade = this.scoreToGrade(summary.overallScore);
        
        // 生成建议
        summary.recommendations = this.generateRecommendations(summary.testResults);
        
        // 性能趋势
        summary.performanceTrends = this.benchmarkResults.comparisons;
        
        return summary;
    }

    /**
     * 生成性能建议
     */
    generateRecommendations(testResults) {
        const recommendations = [];
        
        for (const [testName, result] of Object.entries(testResults)) {
            if (result.score < 80) {
                recommendations.push({
                    test: testName,
                    severity: result.score < 60 ? 'high' : 'medium',
                    message: `${testName} 性能需要优化，当前分数: ${result.score.toFixed(1)}`,
                    suggestions: this.getOptimizationSuggestions(testName)
                });
            }
        }
        
        return recommendations;
    }

    /**
     * 获取优化建议
     */
    getOptimizationSuggestions(testName) {
        const suggestions = {
            mapSplitting: [
                '考虑使用更高效的数据结构',
                '优化房间分配算法',
                '减少不必要的数据复制'
            ],
            connectivityValidation: [
                '优化图遍历算法',
                '使用缓存减少重复计算',
                '考虑并行处理大型图'
            ],
            dataIntegrityCheck: [
                '优化数据比较算法',
                '使用增量验证减少工作量',
                '改进内存使用模式'
            ],
            queryPerformance: [
                '添加数据索引',
                '优化查询算法',
                '实现查询结果缓存'
            ]
        };
        
        return suggestions[testName] || ['分析性能瓶颈', '优化算法实现'];
    }

    /**
     * 计算统计数据
     */
    calculateStatistics(iterations, field = 'executionTime') {
        const values = iterations.filter(i => i.success).map(i => i[field]);
        return this.calculateBasicStatistics(values);
    }

    /**
     * 计算基础统计数据
     */
    calculateBasicStatistics(values) {
        if (values.length === 0) {
            return { mean: 0, median: 0, min: 0, max: 0, stdDev: 0, variance: 0 };
        }
        
        const sorted = [...values].sort((a, b) => a - b);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return {
            mean,
            median,
            min: Math.min(...values),
            max: Math.max(...values),
            stdDev,
            variance,
            count: values.length
        };
    }

    /**
     * 内存使用分析
     */
    async analyzeMemoryUsage(testName) {
        // 简化的内存分析
        const memUsage = process.memoryUsage();
        
        return {
            heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
            heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
            external: memUsage.external / 1024 / 1024, // MB
            rss: memUsage.rss / 1024 / 1024 // MB
        };
    }

    /**
     * 计算性能等级
     */
    calculatePerformanceGrade(statistics, testType) {
        const thresholds = this.getPerformanceThresholds(testType);
        const mean = statistics.mean || 0;
        
        if (mean <= thresholds.excellent) return 'A';
        if (mean <= thresholds.good) return 'B';
        if (mean <= thresholds.average) return 'C';
        if (mean <= thresholds.poor) return 'D';
        return 'F';
    }

    /**
     * 计算查询性能等级
     */
    calculateQueryPerformanceGrade(statistics) {
        const throughput = statistics.throughput || 0;
        const latency = statistics.averageLatency || 0;
        
        if (throughput >= 1000 && latency <= 1) return 'A';
        if (throughput >= 500 && latency <= 5) return 'B';
        if (throughput >= 100 && latency <= 10) return 'C';
        if (throughput >= 50 && latency <= 50) return 'D';
        return 'F';
    }

    /**
     * 获取性能阈值
     */
    getPerformanceThresholds(testType) {
        const thresholds = {
            mapSplitting: { excellent: 100, good: 500, average: 1000, poor: 2000 },
            connectivityValidation: { excellent: 50, good: 100, average: 200, poor: 500 },
            dataIntegrityCheck: { excellent: 100, good: 200, average: 400, poor: 800 }
        };
        
        return thresholds[testType] || thresholds.connectivityValidation;
    }

    /**
     * 等级转分数
     */
    gradeToScore(grade) {
        const gradeScores = { A: 95, B: 85, C: 75, D: 65, F: 30 };
        return gradeScores[grade] || 50;
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
     * 保存基准测试结果
     */
    async saveResults(outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 保存完整结果
        const resultsPath = path.join(outputDir, `performance-benchmark-${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(this.benchmarkResults, null, 2));
        
        // 保存详细报告
        const reportPath = path.join(outputDir, `performance-benchmark-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generateDetailedReport());
        
        // 保存摘要
        const summaryPath = path.join(outputDir, `performance-benchmark-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.benchmarkResults.summary, null, 2));
        
        // 更新历史数据
        await this.updateHistoricalData();
        
        console.log(`📄 性能基准测试结果已保存:`);
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
     * 更新历史数据
     */
    async updateHistoricalData() {
        try {
            const historicalPath = path.join(__dirname, '../../../output/performance-history.json');
            
            // 添加当前测试结果到历史数据
            for (const [testName, benchmark] of Object.entries(this.benchmarkResults.benchmarks)) {
                if (benchmark.statistics) {
                    this.historicalData.push({
                        timestamp: new Date().toISOString(),
                        test: testName,
                        statistics: benchmark.statistics,
                        grade: benchmark.performanceGrade
                    });
                }
            }
            
            // 保留最近50条记录
            this.historicalData = this.historicalData.slice(-50);
            
            fs.writeFileSync(historicalPath, JSON.stringify(this.historicalData, null, 2));
        } catch (error) {
            console.warn('⚠️ 无法更新历史性能数据:', error.message);
        }
    }

    /**
     * 生成详细的基准测试报告
     */
    generateDetailedReport() {
        if (!this.benchmarkResults.summary) {
            throw new Error('必须先执行基准测试才能生成报告');
        }
        
        const report = [];
        
        report.push('# 性能基准测试报告');
        report.push(`生成时间: ${this.benchmarkResults.timestamp}`);
        report.push(`测试套件: ${this.benchmarkResults.suite}`);
        report.push(`总体评级: ${this.benchmarkResults.summary.overallGrade}`);
        report.push(`总体分数: ${this.benchmarkResults.summary.overallScore.toFixed(1)}/100`);
        report.push('');
        
        // 系统信息
        report.push('## 系统信息');
        const sysInfo = this.benchmarkResults.systemInfo;
        report.push(`- 平台: ${sysInfo.platform}`);
        report.push(`- Node.js版本: ${sysInfo.nodeVersion}`);
        report.push(`- 架构: ${sysInfo.arch}`);
        report.push(`- CPU核心数: ${sysInfo.cpuCount}`);
        report.push(`- 总内存: ${(sysInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB`);
        report.push(`- 可用内存: ${(sysInfo.freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB`);
        report.push('');
        
        // 各测试结果
        for (const [testName, result] of Object.entries(this.benchmarkResults.benchmarks)) {
            report.push(`## ${result.test}`);
            report.push(`- 性能等级: ${result.performanceGrade}`);
            
            if (result.statistics) {
                const stats = result.statistics;
                report.push(`- 平均时间: ${stats.mean.toFixed(2)}ms`);
                report.push(`- 中位数: ${stats.median.toFixed(2)}ms`);
                report.push(`- 最小值: ${stats.min.toFixed(2)}ms`);
                report.push(`- 最大值: ${stats.max.toFixed(2)}ms`);
                report.push(`- 标准差: ${stats.stdDev.toFixed(2)}ms`);
                report.push(`- 测试次数: ${stats.count}`);
            }
            
            if (result.queries && result.statistics.throughput) {
                report.push(`- 吞吐量: ${result.statistics.throughput.toFixed(2)} 查询/秒`);
                report.push(`- 平均延迟: ${result.statistics.averageLatency.toFixed(2)}ms`);
            }
            
            if (result.memoryAnalysis && result.memoryAnalysis.heapUsed) {
                report.push(`- 内存使用: ${result.memoryAnalysis.heapUsed.toFixed(2)}MB`);
            }
            
            report.push('');
            
            // 迭代详情
            if (result.iterations && result.iterations.length > 0) {
                report.push('### 迭代详情');
                report.push('| 迭代 | 成功 | 时间(ms) | CPU用户(ms) | CPU系统(ms) | 内存使用(KB) |');
                report.push('|------|------|----------|-------------|-------------|--------------|');
                
                for (const iteration of result.iterations.slice(0, 10)) { // 只显示前10次
                    report.push(`| ${iteration.iteration} | ${iteration.success ? '✅' : '❌'} | ${iteration.executionTime.toFixed(2)} | ${iteration.cpuTime.user.toFixed(2)} | ${iteration.cpuTime.system.toFixed(2)} | ${(iteration.memoryUsage.heapUsed / 1024).toFixed(2)} |`);
                }
                
                if (result.iterations.length > 10) {
                    report.push(`| ... | ... | ... | ... | ... | ... |`);
                    report.push(`| 总计: ${result.iterations.length} 次迭代 | | | | | |`);
                }
                report.push('');
            }
            
            // 查询详情
            if (result.queries && result.queries.length > 0) {
                report.push('### 查询详情');
                const queryStats = {};
                
                for (const query of result.queries) {
                    if (!queryStats[query.queryType]) {
                        queryStats[query.queryType] = { count: 0, totalTime: 0, successCount: 0 };
                    }
                    queryStats[query.queryType].count++;
                    queryStats[query.queryType].totalTime += query.executionTime;
                    if (query.success) queryStats[query.queryType].successCount++;
                }
                
                for (const [queryType, stats] of Object.entries(queryStats)) {
                    const avgTime = stats.totalTime / stats.count;
                    const successRate = (stats.successCount / stats.count * 100).toFixed(1);
                    report.push(`- ${queryType}: ${stats.count} 次查询, 平均 ${avgTime.toFixed(2)}ms, 成功率 ${successRate}%`);
                }
                report.push('');
            }
        }
        
        // 性能对比
        if (Object.keys(this.benchmarkResults.comparisons).length > 0) {
            report.push('## 性能对比');
            for (const [testName, comparison] of Object.entries(this.benchmarkResults.comparisons)) {
                report.push(`### ${testName}`);
                report.push(`- 当前性能: ${comparison.current.toFixed(2)}ms`);
                if (comparison.previous) {
                    report.push(`- 之前性能: ${comparison.previous.toFixed(2)}ms`);
                    report.push(`- 性能改进: ${comparison.improvement}%`);
                    report.push(`- 趋势: ${comparison.trend}`);
                } else {
                    report.push(`- 之前性能: 无历史数据`);
                    report.push(`- 趋势: 基准线`);
                }
                report.push('');
            }
        }
        
        // 优化建议
        if (this.benchmarkResults.summary.recommendations.length > 0) {
            report.push('## 优化建议');
            for (const [index, rec] of this.benchmarkResults.summary.recommendations.entries()) {
                report.push(`### ${index + 1}. ${rec.test} - ${rec.severity}优先级`);
                report.push(`**问题**: ${rec.message}`);
                report.push('**建议**:');
                for (const suggestion of rec.suggestions) {
                    report.push(`- ${suggestion}`);
                }
                report.push('');
            }
        }
        
        return report.join('\n');
    }

    // 辅助方法
    findRoomById(splitData, roomId) {
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    if (room.id === roomId) {
                        return room;
                    }
                }
            }
        }
        return null;
    }

    findRoomByName(splitData, roomName) {
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    if (room.name === roomName) {
                        return room;
                    }
                }
            }
        }
        return null;
    }

    getRegionStats(splitData, regionId) {
        const regionData = splitData[regionId];
        if (!regionData) return null;
        
        let totalRooms = 0;
        for (const location of regionData.locations) {
            totalRooms += location.rooms.length;
        }
        
        return {
            regionId,
            totalRooms,
            totalLocations: regionData.locations.length,
            totalConnections: regionData.connections.internal.length + regionData.connections.crossRegion.length
        };
    }
}

module.exports = PerformanceBenchmark;