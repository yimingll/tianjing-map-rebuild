/**
 * 跨区域连接验证器
 * 专门用于验证38个跨区域连接点的完整性和正确性
 * 支持双向连接验证、连接路径分析和连接质量评估
 */
const fs = require('fs');
const path = require('path');

class CrossRegionValidator {
    constructor(options = {}) {
        this.options = {
            validateBidirectional: options.validateBidirectional !== false,
            checkConnectionPaths: options.checkConnectionPaths !== false,
            analyzeConnectionQuality: options.analyzeConnectionQuality !== false,
            generateConnectionMatrix: options.generateConnectionMatrix !== false,
            ...options
        };
        
        // 加载预期的跨区域连接数据
        this.expectedConnections = this.loadExpectedConnections();
        
        // 验证结果存储
        this.validationResults = {
            summary: null,
            connectionDetails: [],
            missingConnections: [],
            invalidConnections: [],
            bidirectionalIssues: [],
            pathAnalysis: null,
            connectionMatrix: null,
            qualityMetrics: null
        };
        
        // 区域映射关系
        this.regionMapping = {
            '皇城区': 'imperial_district',
            '官府区': 'imperial_district', 
            '商业区': 'commercial_district',
            '南门区': 'commercial_district',
            '东城区': 'residential_district',
            '西城区': 'residential_district',
            '贫民区': 'residential_district',
            '北门区': 'special_functions_district',
            '东门区': 'special_functions_district',
            '西门区': 'special_functions_district',
            '城墙区': 'special_functions_district',
            '城郊区': 'special_functions_district'
        };
    }

    /**
     * 加载预期的跨区域连接数据
     */
    loadExpectedConnections() {
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
            console.warn('⚠️ 无法加载跨区域连接分析数据');
        }
        
        // 如果无法加载分析数据，基于Issue #2信息构建默认连接
        return this.buildDefaultConnections();
    }

    /**
     * 构建默认的跨区域连接数据
     */
    buildDefaultConnections() {
        return {
            totalConnections: 284,
            crossDistrictConnections: 38,
            criticalConnections: [
                // 主要城门连接
                {
                    sourceRoom: "南门外",
                    sourceRoomId: "tj_gate_south_outside",
                    sourceDistrict: "南门区",
                    targetRoomId: "tj_road_south_01",
                    direction: "south",
                    description: "南面是南方官道",
                    targetDistrict: "城郊区",
                    targetRoom: "南郊官道"
                },
                {
                    sourceRoom: "南门内广场",
                    sourceRoomId: "tj_gate_south_inside",
                    sourceDistrict: "南门区",
                    targetRoomId: "tj_street_royal_south_01",
                    direction: "north",
                    description: "北面是御街",
                    targetDistrict: "商业区",
                    targetRoom: "御街-南段"
                },
                {
                    sourceRoom: "宫前广场",
                    sourceRoomId: "tj_palace_square",
                    sourceDistrict: "皇城区",
                    targetRoomId: "tj_street_royal_north_01",
                    direction: "south",
                    description: "南面是御街",
                    targetDistrict: "商业区",
                    targetRoom: "御街-北段"
                },
                {
                    sourceRoom: "北门外",
                    sourceRoomId: "tj_gate_north_outside",
                    sourceDistrict: "北门区",
                    targetRoomId: "tj_road_north_01",
                    direction: "north",
                    description: "北面是北疆官道",
                    targetDistrict: "城郊区",
                    targetRoom: "北郊官道"
                },
                {
                    sourceRoom: "东门外",
                    sourceRoomId: "tj_gate_east_outside",
                    sourceDistrict: "东门区",
                    targetRoomId: "tj_road_east_01",
                    direction: "east",
                    description: "东面是东方官道",
                    targetDistrict: "城郊区",
                    targetRoom: "东郊官道"
                },
                {
                    sourceRoom: "西门外",
                    sourceRoomId: "tj_gate_west_outside",
                    sourceDistrict: "西门区",
                    targetRoomId: "tj_road_west_01",
                    direction: "west",
                    description: "西面是丝绸之路",
                    targetDistrict: "城郊区",
                    targetRoom: "西郊官道-丝路起点"
                }
            ],
            trafficHubs: [],
            regionMapping: {}
        };
    }

    /**
     * 执行全面的跨区域连接验证
     * @param {Object} splitData - 拆分后的地图数据
     * @returns {Object} 验证结果
     */
    async validateCrossRegionConnections(splitData) {
        console.log('🌍 开始跨区域连接验证...');
        const startTime = Date.now();
        
        try {
            // 1. 验证关键连接点
            console.log('1️⃣ 验证关键连接点...');
            await this.validateCriticalConnections(splitData);
            
            // 2. 验证双向连接
            if (this.options.validateBidirectional) {
                console.log('2️⃣ 验证双向连接...');
                await this.validateBidirectionalConnections(splitData);
            }
            
            // 3. 检查连接路径
            if (this.options.checkConnectionPaths) {
                console.log('3️⃣ 检查连接路径...');
                await this.analyzeConnectionPaths(splitData);
            }
            
            // 4. 分析连接质量
            if (this.options.analyzeConnectionQuality) {
                console.log('4️⃣ 分析连接质量...');
                await this.analyzeConnectionQuality(splitData);
            }
            
            // 5. 生成连接矩阵
            if (this.options.generateConnectionMatrix) {
                console.log('5️⃣ 生成连接矩阵...');
                await this.generateConnectionMatrix(splitData);
            }
            
            // 6. 生成验证摘要
            console.log('6️⃣ 生成验证摘要...');
            await this.generateValidationSummary();
            
            const executionTime = Date.now() - startTime;
            console.log(`✅ 跨区域连接验证完成，耗时: ${executionTime}ms`);
            
            return this.validationResults;
            
        } catch (error) {
            console.error('❌ 跨区域连接验证失败:', error);
            throw error;
        }
    }

    /**
     * 验证关键连接点
     */
    async validateCriticalConnections(splitData) {
        const criticalConnections = this.expectedConnections.criticalConnections;
        const validatedConnections = [];
        const missingConnections = [];
        
        // 构建房间ID到区域的映射
        const roomToRegionMap = this.buildRoomToRegionMap(splitData);
        
        for (const expectedConn of criticalConnections) {
            let found = false;
            let actualConnection = null;
            let validationDetails = {
                expected: expectedConn,
                found: false,
                actualConnection: null,
                regionMatch: true,
                directionMatch: true
            };
            
            // 在拆分数据中查找连接
            for (const [regionId, regionData] of Object.entries(splitData)) {
                for (const connection of regionData.connections.crossRegion) {
                    const isMatch = (connection.from === expectedConn.sourceRoomId && connection.to === expectedConn.targetRoomId) ||
                                   (connection.from === expectedConn.targetRoomId && connection.to === expectedConn.sourceRoomId);
                    
                    if (isMatch) {
                        found = true;
                        actualConnection = {
                            ...connection,
                            sourceRegion: regionId,
                            targetRegion: connection.targetRegion
                        };
                        
                        // 验证区域匹配
                        const sourceExpectedRegion = this.regionMapping[expectedConn.sourceDistrict];
                        const targetExpectedRegion = this.regionMapping[expectedConn.targetDistrict];
                        
                        validationDetails.regionMatch = 
                            regionId === sourceExpectedRegion || 
                            connection.targetRegion === targetExpectedRegion;
                        
                        // 验证方向匹配（如果指定了方向）
                        if (expectedConn.direction) {
                            validationDetails.directionMatch = this.validateDirection(
                                connection, expectedConn, expectedConn.sourceRoomId === connection.from
                            );
                        }
                        
                        break;
                    }
                }
                if (found) break;
            }
            
            validationDetails.found = found;
            validationDetails.actualConnection = actualConnection;
            validatedConnections.push(validationDetails);
            
            if (!found) {
                missingConnections.push({
                    expected: expectedConn,
                    reason: 'Connection not found in split data'
                });
            }
        }
        
        // 计算验证统计
        const totalConnections = criticalConnections.length;
        const foundConnections = validatedConnections.filter(c => c.found).length;
        const fullyValidConnections = validatedConnections.filter(c => 
            c.found && c.regionMatch && c.directionMatch
        ).length;
        
        this.validationResults.connectionDetails = validatedConnections;
        this.validationResults.missingConnections = missingConnections;
        
        return {
            totalCriticalConnections: totalConnections,
            foundConnections,
            fullyValidConnections,
            missingConnections: missingConnections.length,
            validationRate: totalConnections > 0 ? ((foundConnections / totalConnections) * 100).toFixed(2) + '%' : '0%',
            fullValidationRate: totalConnections > 0 ? ((fullyValidConnections / totalConnections) * 100).toFixed(2) + '%' : '0%',
            details: validatedConnections,
            status: foundConnections === totalConnections ? 'PASS' : 'FAIL'
        };
    }

    /**
     * 验证双向连接
     */
    async validateBidirectionalConnections(splitData) {
        const bidirectionalIssues = [];
        const connectionsMap = new Map();
        
        // 收集所有跨区域连接
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const connection of regionData.connections.crossRegion) {
                const key = `${connection.from}_${connection.to}`;
                const reverseKey = `${connection.to}_${connection.from}`;
                
                connectionsMap.set(key, {
                    connection,
                    sourceRegion: regionId,
                    hasReverse: false
                });
                
                if (connectionsMap.has(reverseKey)) {
                    connectionsMap.get(key).hasReverse = true;
                    connectionsMap.get(reverseKey).hasReverse = true;
                }
            }
        }
        
        // 检查缺少反向连接的情况
        for (const [key, connInfo] of connectionsMap) {
            if (!connInfo.hasReverse && connInfo.connection.direction !== 'oneway') {
                bidirectionalIssues.push({
                    connection: connInfo.connection,
                    sourceRegion: connInfo.sourceRegion,
                    issue: 'Missing reverse connection',
                    severity: 'warning'
                });
            }
        }
        
        // 检查自引用连接
        for (const [key, connInfo] of connectionsMap) {
            if (connInfo.connection.from === connInfo.connection.to) {
                bidirectionalIssues.push({
                    connection: connInfo.connection,
                    sourceRegion: connInfo.sourceRegion,
                    issue: 'Self-referencing connection',
                    severity: 'error'
                });
            }
        }
        
        this.validationResults.bidirectionalIssues = bidirectionalIssues;
        
        return {
            totalConnections: connectionsMap.size,
            bidirectionalConnections: Array.from(connectionsMap.values()).filter(c => c.hasReverse).length,
            unidirectionalConnections: Array.from(connectionsMap.values()).filter(c => !c.hasReverse).length,
            issues: bidirectionalIssues,
            status: bidirectionalIssues.filter(i => i.severity === 'error').length === 0 ? 'PASS' : 'FAIL'
        };
    }

    /**
     * 分析连接路径
     */
    async analyzeConnectionPaths(splitData) {
        const pathAnalysis = {
            totalPaths: 0,
            pathLengths: [],
            criticalPaths: [],
            isolatedRegions: [],
            pathComplexity: {}
        };
        
        // 构建区域间连接图
        const regionGraph = new Map();
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (!regionGraph.has(regionId)) {
                regionGraph.set(regionId, new Set());
            }
            
            for (const connection of regionData.connections.crossRegion) {
                if (!regionGraph.has(connection.targetRegion)) {
                    regionGraph.set(connection.targetRegion, new Set());
                }
                
                regionGraph.get(regionId).add(connection.targetRegion);
                regionGraph.get(connection.targetRegion).add(regionId);
                pathAnalysis.totalPaths++;
            }
        }
        
        // 分析路径长度
        const pathLengths = [];
        for (const [sourceRegion, targets] of regionGraph) {
            for (const targetRegion of targets) {
                if (sourceRegion < targetRegion) { // 避免重复计算
                    const length = this.calculateShortestPath(regionGraph, sourceRegion, targetRegion);
                    pathLengths.push(length);
                }
            }
        }
        
        pathAnalysis.pathLengths = pathLengths;
        pathAnalysis.averagePathLength = pathLengths.length > 0 
            ? (pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length).toFixed(2)
            : 0;
        
        // 查找孤立区域
        for (const [regionId, targets] of regionGraph) {
            if (targets.size === 0) {
                pathAnalysis.isolatedRegions.push(regionId);
            }
        }
        
        // 计算路径复杂度
        for (const [regionId, targets] of regionGraph) {
            pathAnalysis.pathComplexity[regionId] = {
                directConnections: targets.size,
                connectivityDegree: targets.size / (regionGraph.size - 1)
            };
        }
        
        this.validationResults.pathAnalysis = pathAnalysis;
        
        return pathAnalysis;
    }

    /**
     * 计算最短路径长度
     */
    calculateShortestPath(graph, start, end) {
        if (start === end) return 0;
        if (!graph.has(start) || !graph.has(end)) return Infinity;
        
        const visited = new Set();
        const queue = [{ node: start, distance: 0 }];
        
        while (queue.length > 0) {
            const { node, distance } = queue.shift();
            
            if (node === end) return distance;
            if (visited.has(node)) continue;
            
            visited.add(node);
            
            for (const neighbor of graph.get(node)) {
                if (!visited.has(neighbor)) {
                    queue.push({ node: neighbor, distance: distance + 1 });
                }
            }
        }
        
        return Infinity;
    }

    /**
     * 分析连接质量
     */
    async analyzeConnectionQuality(splitData) {
        const qualityMetrics = {
            totalConnections: 0,
            connectionTypes: {},
            regionDistribution: {},
            consistencyScore: 0,
            redundancyAnalysis: {},
            performanceMetrics: {}
        };
        
        // 统计连接类型和分布
        const connectionTypes = {};
        const regionDistribution = {};
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (!regionDistribution[regionId]) {
                regionDistribution[regionId] = {
                    outbound: 0,
                    inbound: 0,
                    total: 0
                };
            }
            
            for (const connection of regionData.connections.crossRegion) {
                qualityMetrics.totalConnections++;
                
                // 统计连接类型
                const type = connection.direction || 'bidirectional';
                connectionTypes[type] = (connectionTypes[type] || 0) + 1;
                
                // 统计区域分布
                regionDistribution[regionId].outbound++;
                regionDistribution[regionId].total++;
                
                if (!regionDistribution[connection.targetRegion]) {
                    regionDistribution[connection.targetRegion] = {
                        outbound: 0,
                        inbound: 0,
                        total: 0
                    };
                }
                regionDistribution[connection.targetRegion].inbound++;
                regionDistribution[connection.targetRegion].total++;
            }
        }
        
        qualityMetrics.connectionTypes = connectionTypes;
        qualityMetrics.regionDistribution = regionDistribution;
        
        // 计算一致性分数
        qualityMetrics.consistencyScore = this.calculateConsistencyScore(regionDistribution);
        
        // 冗余分析
        qualityMetrics.redundancyAnalysis = this.analyzeRedundancy(splitData);
        
        // 性能指标
        qualityMetrics.performanceMetrics = this.calculatePerformanceMetrics(splitData);
        
        this.validationResults.qualityMetrics = qualityMetrics;
        
        return qualityMetrics;
    }

    /**
     * 计算一致性分数
     */
    calculateConsistencyScore(regionDistribution) {
        const connections = Object.values(regionDistribution).map(r => r.total);
        if (connections.length === 0) return 0;
        
        const mean = connections.reduce((a, b) => a + b, 0) / connections.length;
        const variance = connections.reduce((sum, conn) => sum + Math.pow(conn - mean, 2), 0) / connections.length;
        const standardDeviation = Math.sqrt(variance);
        
        // 一致性分数：标准差越小，一致性越好
        const consistencyScore = Math.max(0, 100 - (standardDeviation / mean) * 100);
        return consistencyScore.toFixed(2);
    }

    /**
     * 分析冗余连接
     */
    analyzeRedundancy(splitData) {
        const redundancyMap = new Map();
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const connection of regionData.connections.crossRegion) {
                const key = [connection.from, connection.to].sort().join('_');
                
                if (!redundancyMap.has(key)) {
                    redundancyMap.set(key, []);
                }
                
                redundancyMap.get(key).push({
                    connection,
                    sourceRegion: regionId
                });
            }
        }
        
        const redundantConnections = [];
        const uniqueConnections = [];
        
        for (const [key, connections] of redundancyMap) {
            if (connections.length > 1) {
                redundantConnections.push({
                    key,
                    connections,
                    redundancyLevel: connections.length
                });
            } else {
                uniqueConnections.push(connections[0]);
            }
        }
        
        return {
            totalUniquePaths: redundancyMap.size,
            redundantConnections: redundantConnections.length,
            uniqueConnections: uniqueConnections.length,
            redundancyRate: redundancyMap.size > 0 ? (redundantConnections.length / redundancyMap.size * 100).toFixed(2) + '%' : '0%',
            details: redundantConnections
        };
    }

    /**
     * 计算性能指标
     */
    calculatePerformanceMetrics(splitData) {
        let totalConnections = 0;
        let maxConnectionsPerRegion = 0;
        let minConnectionsPerRegion = Infinity;
        const regionCounts = [];
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            const connectionCount = regionData.connections.crossRegion.length;
            totalConnections += connectionCount;
            regionCounts.push(connectionCount);
            maxConnectionsPerRegion = Math.max(maxConnectionsPerRegion, connectionCount);
            minConnectionsPerRegion = Math.min(minConnectionsPerRegion, connectionCount);
        }
        
        const averageConnections = totalConnections / Object.keys(splitData).length;
        
        return {
            totalConnections,
            averageConnectionsPerRegion: averageConnections.toFixed(2),
            maxConnectionsPerRegion,
            minConnectionsPerRegion,
            balanceCoefficient: minConnectionsPerRegion > 0 
                ? (minConnectionsPerRegion / maxConnectionsPerRegion).toFixed(2) 
                : 0,
            regionDistribution: regionCounts
        };
    }

    /**
     * 生成连接矩阵
     */
    async generateConnectionMatrix(splitData) {
        const regions = Object.keys(splitData);
        const matrix = {};
        
        // 初始化矩阵
        for (const region1 of regions) {
            matrix[region1] = {};
            for (const region2 of regions) {
                matrix[region1][region2] = {
                    connectionCount: 0,
                    connections: [],
                    isConnected: false
                };
            }
        }
        
        // 填充矩阵数据
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const connection of regionData.connections.crossRegion) {
                const targetRegion = connection.targetRegion;
                
                matrix[regionId][targetRegion].connectionCount++;
                matrix[regionId][targetRegion].connections.push(connection);
                matrix[regionId][targetRegion].isConnected = true;
            }
        }
        
        // 计算连接统计
        const statistics = {
            totalRegions: regions.length,
            connectedRegionPairs: 0,
            totalConnections: 0,
            connectivityDensity: 0
        };
        
        for (let i = 0; i < regions.length; i++) {
            for (let j = i + 1; j < regions.length; j++) {
                const region1 = regions[i];
                const region2 = regions[j];
                
                if (matrix[region1][region2].isConnected || matrix[region2][region1].isConnected) {
                    statistics.connectedRegionPairs++;
                }
                
                statistics.totalConnections += matrix[region1][region2].connectionCount;
                statistics.totalConnections += matrix[region2][region1].connectionCount;
            }
        }
        
        const maxPossibleConnections = regions.length * (regions.length - 1);
        statistics.connectivityDensity = maxPossibleConnections > 0 
            ? (statistics.connectedRegionPairs / maxPossibleConnections * 100).toFixed(2) + '%'
            : '0%';
        
        this.validationResults.connectionMatrix = {
            matrix,
            statistics,
            regions
        };
        
        return this.validationResults.connectionMatrix;
    }

    /**
     * 生成验证摘要
     */
    async generateValidationSummary() {
        const summary = {
            overallStatus: 'PASS',
            validationTimestamp: new Date().toISOString(),
            validator: 'CrossRegionValidator v1.0',
            results: {}
        };
        
        // 关键连接验证结果
        if (this.validationResults.connectionDetails.length > 0) {
            const total = this.validationResults.connectionDetails.length;
            const found = this.validationResults.connectionDetails.filter(c => c.found).length;
            const valid = this.validationResults.connectionDetails.filter(c => 
                c.found && c.regionMatch && c.directionMatch
            ).length;
            
            summary.results.criticalConnections = {
                total,
                found,
                valid,
                missing: total - found,
                validationRate: ((found / total) * 100).toFixed(2) + '%',
                status: found === total ? 'PASS' : 'FAIL'
            };
        }
        
        // 双向连接验证结果
        if (this.validationResults.bidirectionalIssues) {
            const issues = this.validationResults.bidirectionalIssues;
            const errorCount = issues.filter(i => i.severity === 'error').length;
            
            summary.results.bidirectional = {
                totalIssues: issues.length,
                errors: errorCount,
                warnings: issues.filter(i => i.severity === 'warning').length,
                status: errorCount === 0 ? 'PASS' : 'FAIL'
            };
        }
        
        // 路径分析结果
        if (this.validationResults.pathAnalysis) {
            const path = this.validationResults.pathAnalysis;
            summary.results.pathAnalysis = {
                totalPaths: path.totalPaths,
                averagePathLength: path.averagePathLength,
                isolatedRegions: path.isolatedRegions.length,
                status: path.isolatedRegions.length === 0 ? 'PASS' : 'PARTIAL'
            };
        }
        
        // 质量指标结果
        if (this.validationResults.qualityMetrics) {
            const quality = this.validationResults.qualityMetrics;
            summary.results.quality = {
                consistencyScore: quality.consistencyScore,
                redundancyRate: quality.redundancyAnalysis.redundancyRate,
                totalConnections: quality.totalConnections,
                status: parseFloat(quality.consistencyScore) >= 80 ? 'PASS' : 'PARTIAL'
            };
        }
        
        // 连接矩阵结果
        if (this.validationResults.connectionMatrix) {
            const matrix = this.validationResults.connectionMatrix;
            summary.results.connectivityMatrix = {
                totalRegions: matrix.statistics.totalRegions,
                connectedRegionPairs: matrix.statistics.connectedRegionPairs,
                connectivityDensity: matrix.statistics.connectivityDensity,
                status: parseFloat(matrix.statistics.connectivityDensity) >= 50 ? 'PASS' : 'PARTIAL'
            };
        }
        
        // 计算总体状态
        const statuses = [
            summary.results.criticalConnections?.status,
            summary.results.bidirectional?.status,
            summary.results.pathAnalysis?.status,
            summary.results.quality?.status,
            summary.results.connectivityMatrix?.status
        ].filter(Boolean);
        
        if (statuses.includes('FAIL')) {
            summary.overallStatus = 'FAIL';
        } else if (statuses.includes('PARTIAL')) {
            summary.overallStatus = 'PARTIAL';
        }
        
        this.validationResults.summary = summary;
        return summary;
    }

    /**
     * 构建房间ID到区域的映射
     */
    buildRoomToRegionMap(splitData) {
        const roomToRegion = {};
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    roomToRegion[room.id] = regionId;
                }
            }
        }
        
        return roomToRegion;
    }

    /**
     * 验证连接方向
     */
    validateDirection(connection, expectedConn, isForward) {
        if (!expectedConn.direction || expectedConn.direction === 'bidirectional') {
            return true;
        }
        
        // 简化的方向验证逻辑
        return connection.direction === expectedConn.direction;
    }

    /**
     * 生成详细的验证报告
     */
    generateDetailedReport() {
        if (!this.validationResults.summary) {
            throw new Error('必须先执行验证才能生成报告');
        }
        
        const report = [];
        
        report.push('# 跨区域连接验证报告');
        report.push(`生成时间: ${this.validationResults.summary.validationTimestamp}`);
        report.push(`验证器: ${this.validationResults.summary.validator}`);
        report.push(`总体状态: ${this.validationResults.summary.overallStatus}`);
        report.push('');
        
        // 关键连接验证详情
        if (this.validationResults.connectionDetails.length > 0) {
            report.push('## 关键连接验证');
            const critical = this.validationResults.summary.results.criticalConnections;
            report.push(`- 总连接数: ${critical.total}`);
            report.push(`- 找到连接: ${critical.found}`);
            report.push(`- 有效连接: ${critical.valid}`);
            report.push(`- 缺失连接: ${critical.missing}`);
            report.push(`- 验证率: ${critical.validationRate}`);
            report.push(`- 状态: ${critical.status}`);
            report.push('');
            
            // 详细连接信息
            report.push('### 连接详情');
            for (const [index, detail] of this.validationResults.connectionDetails.entries()) {
                report.push(`#### ${index + 1}. ${detail.expected.sourceRoom} → ${detail.expected.targetRoom || detail.expected.targetRoomId}`);
                report.push(`- 源房间ID: ${detail.expected.sourceRoomId}`);
                report.push(`- 目标房间ID: ${detail.expected.targetRoomId}`);
                report.push(`- 源区域: ${detail.expected.sourceDistrict}`);
                report.push(`- 目标区域: ${detail.expected.targetDistrict}`);
                report.push(`- 描述: ${detail.expected.description}`);
                report.push(`- 找到连接: ${detail.found ? '是' : '否'}`);
                report.push(`- 区域匹配: ${detail.regionMatch ? '是' : '否'}`);
                report.push(`- 方向匹配: ${detail.directionMatch ? '是' : '否'}`);
                
                if (detail.actualConnection) {
                    report.push(`- 实际连接: ${JSON.stringify(detail.actualConnection, null, 2)}`);
                }
                report.push('');
            }
        }
        
        // 双向连接验证详情
        if (this.validationResults.bidirectionalIssues) {
            report.push('## 双向连接验证');
            const bidi = this.validationResults.summary.results.bidirectional;
            report.push(`- 总问题数: ${bidi.totalIssues}`);
            report.push(`- 错误数: ${bidi.errors}`);
            report.push(`- 警告数: ${bidi.warnings}`);
            report.push(`- 状态: ${bidi.status}`);
            report.push('');
            
            if (this.validationResults.bidirectionalIssues.length > 0) {
                report.push('### 问题详情');
                for (const [index, issue] of this.validationResults.bidirectionalIssues.entries()) {
                    report.push(`#### ${index + 1}. ${issue.issue}`);
                    report.push(`- 连接: ${issue.connection.from} → ${issue.connection.to}`);
                    report.push(`- 源区域: ${issue.sourceRegion}`);
                    report.push(`- 严重程度: ${issue.severity}`);
                    report.push('');
                }
            }
        }
        
        // 路径分析详情
        if (this.validationResults.pathAnalysis) {
            report.push('## 路径分析');
            const path = this.validationResults.summary.results.pathAnalysis;
            report.push(`- 总路径数: ${path.totalPaths}`);
            report.push(`- 平均路径长度: ${path.averagePathLength}`);
            report.push(`- 孤立区域数: ${path.isolatedRegions}`);
            report.push(`- 状态: ${path.status}`);
            report.push('');
            
            if (this.validationResults.pathAnalysis.isolatedRegions.length > 0) {
                report.push('### 孤立区域');
                this.validationResults.pathAnalysis.isolatedRegions.forEach(region => {
                    report.push(`- ${region}`);
                });
                report.push('');
            }
        }
        
        // 质量指标详情
        if (this.validationResults.qualityMetrics) {
            report.push('## 质量指标');
            const quality = this.validationResults.summary.results.quality;
            report.push(`- 一致性分数: ${quality.consistencyScore}/100`);
            report.push(`- 冗余率: ${quality.redundancyRate}`);
            report.push(`- 总连接数: ${quality.totalConnections}`);
            report.push(`- 状态: ${quality.status}`);
            report.push('');
            
            // 连接类型分布
            const types = this.validationResults.qualityMetrics.connectionTypes;
            report.push('### 连接类型分布');
            for (const [type, count] of Object.entries(types)) {
                report.push(`- ${type}: ${count}`);
            }
            report.push('');
        }
        
        // 连接矩阵详情
        if (this.validationResults.connectionMatrix) {
            report.push('## 连接矩阵');
            const matrix = this.validationResults.summary.results.connectivityMatrix;
            report.push(`- 总区域数: ${matrix.totalRegions}`);
            report.push(`- 连接区域对: ${matrix.connectedRegionPairs}`);
            report.push(`- 连接密度: ${matrix.connectivityDensity}`);
            report.push(`- 状态: ${matrix.status}`);
            report.push('');
            
            // 区域间连接表
            report.push('### 区域间连接表');
            const { matrix: connMatrix, regions } = this.validationResults.connectionMatrix;
            report.push('| 源区域 | 目标区域 | 连接数 |');
            report.push('|--------|----------|--------|');
            
            for (const sourceRegion of regions) {
                for (const targetRegion of regions) {
                    if (sourceRegion !== targetRegion && connMatrix[sourceRegion][targetRegion].isConnected) {
                        report.push(`| ${sourceRegion} | ${targetRegion} | ${connMatrix[sourceRegion][targetRegion].connectionCount} |`);
                    }
                }
            }
            report.push('');
        }
        
        // 缺失连接详情
        if (this.validationResults.missingConnections.length > 0) {
            report.push('## 缺失连接');
            for (const [index, missing] of this.validationResults.missingConnections.entries()) {
                report.push(`### ${index + 1}. ${missing.expected.sourceRoom} → ${missing.expected.targetRoom || missing.expected.targetRoomId}`);
                report.push(`- 源房间ID: ${missing.expected.sourceRoomId}`);
                report.push(`- 目标房间ID: ${missing.expected.targetRoomId}`);
                report.push(`- 源区域: ${missing.expected.sourceDistrict}`);
                report.push(`- 目标区域: ${missing.expected.targetDistrict}`);
                report.push(`- 缺失原因: ${missing.reason}`);
                report.push('');
            }
        }
        
        return report.join('\n');
    }

    /**
     * 保存验证结果
     */
    async saveResults(outputDir) {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 保存完整结果
        const resultsPath = path.join(outputDir, `cross-region-validation-${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(this.validationResults, null, 2));
        
        // 保存详细报告
        const reportPath = path.join(outputDir, `cross-region-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generateDetailedReport());
        
        // 保存摘要
        const summaryPath = path.join(outputDir, `cross-region-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.validationResults.summary, null, 2));
        
        console.log(`📄 跨区域验证结果已保存:`);
        console.log(`  - 完整结果: ${resultsPath}`);
        console.log(`  - 详细报告: ${reportPath}`);
        console.log(`  - 验证摘要: ${summaryPath}`);
        
        return {
            resultsPath,
            reportPath,
            summaryPath
        };
    }
}

module.exports = CrossRegionValidator;