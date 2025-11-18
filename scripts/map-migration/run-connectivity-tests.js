#!/usr/bin/env node

/**
 * 连通性验证和测试工具运行器
 * 执行完整的连通性验证、数据完整性测试和性能基准测试
 * 
 * 使用方法:
 * node run-connectivity-tests.js [options]
 * 
 * 选项:
 * --quick: 快速验证模式
 * --full: 完整测试模式（默认）
 * --performance: 包含性能测试
 * --integration: 运行集成测试
 * --output <dir>: 指定输出目录
 */

const path = require('path');
const fs = require('fs');

// 导入测试工具
const ConnectivityTester = require('./src/ConnectivityTester');
const CrossRegionValidator = require('./src/CrossRegionValidator');
const DataIntegrityTester = require('./src/DataIntegrityTester');
const PerformanceBenchmark = require('./src/PerformanceBenchmark');
const AutomatedTestPipeline = require('./src/AutomatedTestPipeline');
const IntegrationTestSuite = require('./src/IntegrationTestSuite');

// 命令行参数解析
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        mode: 'full',
        performance: false,
        integration: false,
        outputDir: path.join(__dirname, '../output/connectivity-tests'),
        sourceDataPath: path.join(__dirname, '../packages/server/data/maps/dazhou/tianjing_fu/tianjing_cheng_fixed_complete.json')
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--quick':
                options.mode = 'quick';
                break;
            case '--full':
                options.mode = 'full';
                break;
            case '--performance':
                options.performance = true;
                break;
            case '--integration':
                options.integration = true;
                break;
            case '--output':
                options.outputDir = args[++i];
                break;
            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
                break;
            default:
                console.error(`未知参数: ${args[i]}`);
                showHelp();
                process.exit(1);
        }
    }
    
    return options;
}

/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
连通性验证和测试工具运行器

使用方法:
  node run-connectivity-tests.js [options]

选项:
  --quick              快速验证模式（基本连通性检查）
  --full               完整测试模式（包含所有测试）
  --performance        包含性能基准测试
  --integration        运行完整集成测试
  --output <dir>       指定输出目录
  --help, -h           显示此帮助信息

示例:
  node run-connectivity-tests.js --quick
  node run-connectivity-tests.js --full --performance
  node run-connectivity-tests.js --integration --output ./test-results
  `);
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 启动连通性验证和测试工具...');
    
    try {
        const options = parseArguments();
        
        // 确保输出目录存在
        if (!fs.existsSync(options.outputDir)) {
            fs.mkdirSync(options.outputDir, { recursive: true });
        }
        
        let results = {};
        
        if (options.integration) {
            // 运行完整集成测试
            console.log('🧪 运行完整集成测试套件...');
            const integrationSuite = new IntegrationTestSuite({
                sourceDataPath: options.sourceDataPath,
                outputDir: options.outputDir,
                generateRegionalFiles: true,
                validateAllConnections: true,
                performanceBaseline: options.performance
            });
            
            results.integration = await integrationSuite.runIntegrationTests();
            
        } else if (options.mode === 'quick') {
            // 快速验证模式
            console.log('⚡ 运行快速验证...');
            results = await runQuickValidation(options);
            
        } else {
            // 完整测试模式
            console.log('🔬 运行完整测试套件...');
            results = await runFullTests(options);
        }
        
        // 生成总结报告
        console.log('📊 生成总结报告...');
        await generateSummaryReport(results, options.outputDir);
        
        // 显示结果摘要
        displayResultsSummary(results);
        
        console.log('\n✅ 所有测试完成！');
        
        // 根据测试结果设置退出码
        const hasFailures = checkForFailures(results);
        process.exit(hasFailures ? 1 : 0);
        
    } catch (error) {
        console.error('\n❌ 测试执行失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * 运行快速验证
 */
async function runQuickValidation(options) {
    const MapSplitter = require('./src/MapSplitter');
    const ConnectivityValidator = require('./src/ConnectivityValidator');
    
    console.log('📁 加载源数据...');
    
    // 加载源数据
    const sourceData = JSON.parse(fs.readFileSync(options.sourceDataPath, 'utf8'));
    
    console.log('🔧 执行地图拆分...');
    const splitter = new MapSplitter();
    const splitData = await splitter.splitMap(sourceData);
    
    const results = {
        sourceData: {
            totalRooms: sourceData.districts.reduce((sum, d) => 
                sum + d.locations.reduce((lsum, l) => lsum + l.rooms.length, 0), 0),
            totalDistricts: sourceData.districts.length
        },
        splitData: {
            totalRegions: Object.keys(splitData).length,
            totalRooms: Object.values(splitData).reduce((sum, r) => 
                sum + r.locations.reduce((lsum, l) => lsum + l.rooms.length, 0), 0)
        },
        connectivity: null,
        validation: null
    };
    
    console.log('🔗 验证连通性...');
    const validator = new ConnectivityValidator();
    const connectivityResult = validator.validateOverallConnectivity(splitData);
    results.connectivity = {
        isFullyConnected: connectivityResult.isFullyConnected,
        totalRooms: connectivityResult.totalRooms,
        components: connectivityResult.components.length,
        isolatedRooms: connectivityResult.isolatedRooms.length
    };
    
    console.log('✅ 快速验证完成');
    return results;
}

/**
 * 运行完整测试
 */
async function runFullTests(options) {
    console.log('📁 加载测试数据...');
    
    // 加载源数据
    const sourceData = JSON.parse(fs.readFileSync(options.sourceDataPath, 'utf8'));
    
    // 执行地图拆分
    const MapSplitter = require('./src/MapSplitter');
    const splitter = new MapSplitter();
    const splitData = await splitter.splitMap(sourceData);
    
    const results = {};
    const testData = { sourceData, splitData };
    
    // 1. 连通性测试
    console.log('1️⃣ 执行连通性测试...');
    const connectivityTester = new ConnectivityTester({
        enablePerformanceTesting: true,
        enableDetailedLogging: true
    });
    results.connectivity = await connectivityTester.runComprehensiveTest(sourceData, splitData);
    
    // 2. 跨区域连接验证
    console.log('2️⃣ 执行跨区域连接验证...');
    const crossRegionValidator = new CrossRegionValidator({
        validateBidirectional: true,
        checkConnectionPaths: true
    });
    results.crossRegion = await crossRegionValidator.validateCrossRegionConnections(splitData);
    
    // 3. 数据完整性测试
    console.log('3️⃣ 执行数据完整性测试...');
    const dataIntegrityTester = new DataIntegrityTester({
        enableDeepValidation: true,
        enableConsistencyAnalysis: true
    });
    results.dataIntegrity = await dataIntegrityTester.runComprehensiveTest(sourceData, splitData);
    
    // 4. 性能测试（如果启用）
    if (options.performance) {
        console.log('4️⃣ 执行性能基准测试...');
        const performanceBenchmark = new PerformanceBenchmark({
            enableMemoryProfiling: true,
            enableLoadTesting: false // 在标准测试中禁用负载测试
        });
        results.performance = await performanceBenchmark.runComprehensiveBenchmark(testData);
    }
    
    console.log('✅ 完整测试套件执行完成');
    return results;
}

/**
 * 生成总结报告
 */
async function generateSummaryReport(results, outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const report = [];
    report.push('# 连通性验证和测试总结报告');
    report.push(`生成时间: ${new Date().toISOString()}`);
    report.push('');
    
    // 测试概述
    report.push('## 测试概述');
    report.push(`- 测试模式: ${results.integration ? '集成测试' : (results.performance ? '完整测试+性能' : '完整测试')}`);
    report.push(`- 执行状态: ${getOverallStatus(results)}`);
    report.push('');
    
    // 各测试结果摘要
    if (results.connectivity) {
        report.push('## 连通性测试');
        const conn = results.connectivity.summary || results.connectivity;
        report.push(`- 状态: ${conn.results?.connectivity?.status || conn.isFullyConnected ? '通过' : '失败'}`);
        if (conn.results?.connectivity) {
            report.push(`- 总房间数: ${conn.results.connectivity.totalRooms}`);
            report.push(`- 孤立房间: ${conn.results.connectivity.isolatedRooms}`);
        }
        report.push('');
    }
    
    if (results.crossRegion) {
        report.push('## 跨区域连接验证');
        const cross = results.crossRegion.summary || results.crossRegion;
        report.push(`- 状态: ${cross.results?.criticalConnections?.status || '未知'}`);
        if (cross.results?.criticalConnections) {
            report.push(`- 关键连接验证率: ${cross.results.criticalConnections.validationRate}`);
        }
        report.push('');
    }
    
    if (results.dataIntegrity) {
        report.push('## 数据完整性测试');
        const integrity = results.dataIntegrity.summary || results.dataIntegrity;
        report.push(`- 状态: ${integrity.results?.basicIntegrity?.status || '未知'}`);
        if (integrity.results?.basicIntegrity) {
            report.push(`- 错误数: ${integrity.results.basicIntegrity.totalErrors}`);
            report.push(`- 警告数: ${integrity.results.basicIntegrity.totalWarnings}`);
        }
        report.push('');
    }
    
    if (results.performance) {
        report.push('## 性能基准测试');
        const perf = results.performance.summary;
        report.push(`- 总体评级: ${perf.overallGrade}`);
        report.push(`- 总体分数: ${perf.overallScore.toFixed(1)}/100`);
        report.push('');
    }
    
    if (results.integration) {
        report.push('## 集成测试');
        const integration = results.integration.summary;
        report.push(`- 总体状态: ${integration.overallStatus}`);
        report.push(`- 总体评级: ${integration.overallGrade || 'N/A'}`);
        report.push('');
        
        // 集成测试详细结果
        for (const [testName, result] of Object.entries(integration.testResults)) {
            report.push(`### ${testName}`);
            report.push(`- 状态: ${result.status}`);
            if (result.details) {
                for (const [key, value] of Object.entries(result.details)) {
                    report.push(`- ${key}: ${value}`);
                }
            }
            report.push('');
        }
    }
    
    // 保存报告
    const reportPath = path.join(outputDir, `connectivity-test-summary-${timestamp}.md`);
    fs.writeFileSync(reportPath, report.join('\n'));
    
    // 保存完整结果（JSON格式）
    const resultsPath = path.join(outputDir, `connectivity-test-results-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    
    console.log(`📄 测试报告已保存:`);
    console.log(`  - 摘要报告: ${reportPath}`);
    console.log(`  - 完整结果: ${resultsPath}`);
}

/**
 * 获取总体状态
 */
function getOverallStatus(results) {
    const statuses = [];
    
    if (results.connectivity?.summary?.results?.connectivity?.status) {
        statuses.push(results.connectivity.summary.results.connectivity.status);
    } else if (results.connectivity?.isFullyConnected === false) {
        statuses.push('FAIL');
    }
    
    if (results.crossRegion?.summary?.results?.criticalConnections?.status) {
        statuses.push(results.crossRegion.summary.results.criticalConnections.status);
    }
    
    if (results.dataIntegrity?.summary?.results?.basicIntegrity?.status) {
        statuses.push(results.dataIntegrity.summary.results.basicIntegrity.status);
    }
    
    if (results.performance?.summary?.overallGrade) {
        const grade = results.performance.summary.overallGrade;
        if (grade === 'A' || grade === 'B') {
            statuses.push('PASS');
        } else if (grade === 'C' || grade === 'D') {
            statuses.push('PARTIAL');
        } else {
            statuses.push('FAIL');
        }
    }
    
    if (results.integration?.summary?.overallStatus) {
        statuses.push(results.integration.summary.overallStatus);
    }
    
    if (statuses.includes('FAIL')) {
        return '失败';
    } else if (statuses.includes('PARTIAL')) {
        return '部分通过';
    } else if (statuses.length === 0) {
        return '未知';
    } else {
        return '通过';
    }
}

/**
 * 显示结果摘要
 */
function displayResultsSummary(results) {
    console.log('\n📊 测试结果摘要:');
    console.log('================');
    
    if (results.connectivity) {
        const conn = results.connectivity.summary || results.connectivity;
        const status = conn.results?.connectivity?.status || (conn.isFullyConnected ? '✅ 通过' : '❌ 失败');
        console.log(`连通性测试:     ${status}`);
    }
    
    if (results.crossRegion) {
        const cross = results.crossRegion.summary || results.crossRegion;
        const status = cross.results?.criticalConnections?.status || '❌ 未知';
        const rate = cross.results?.criticalConnections?.validationRate || 'N/A';
        console.log(`跨区域验证:     ${status} (验证率: ${rate})`);
    }
    
    if (results.dataIntegrity) {
        const integrity = results.dataIntegrity.summary || results.dataIntegrity;
        const status = integrity.results?.basicIntegrity?.status || '❌ 未知';
        const errors = integrity.results?.basicIntegrity?.totalErrors || 0;
        console.log(`数据完整性:     ${status} (错误数: ${errors})`);
    }
    
    if (results.performance) {
        const perf = results.performance.summary;
        console.log(`性能基准:       ${perf.overallGrade} (${perf.overallScore.toFixed(1)}/100)`);
    }
    
    if (results.integration) {
        const integration = results.integration.summary;
        console.log(`集成测试:       ${integration.overallStatus}`);
        console.log(`总体评级:       ${integration.overallGrade || 'N/A'}`);
    }
    
    console.log('================');
}

/**
 * 检查是否有失败
 */
function checkForFailures(results) {
    if (results.integration?.summary?.overallStatus === 'FAIL') {
        return true;
    }
    
    if (results.connectivity?.summary?.results?.connectivity?.status === 'FAIL') {
        return true;
    }
    
    if (results.crossRegion?.summary?.results?.criticalConnections?.status === 'FAIL') {
        return true;
    }
    
    if (results.dataIntegrity?.summary?.results?.basicIntegrity?.status === 'FAIL') {
        return true;
    }
    
    if (results.performance?.summary?.overallGrade === 'F') {
        return true;
    }
    
    return false;
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    main,
    runQuickValidation,
    runFullTests,
    parseArguments
};