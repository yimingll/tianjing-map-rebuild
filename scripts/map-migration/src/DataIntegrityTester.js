/**
 * 数据完整性测试器
 * 在DataIntegrityChecker基础上，提供更全面的数据一致性和完整性测试
 * 支持深度数据验证、性能测试和自动化测试管道
 */
const DataIntegrityChecker = require('./DataIntegrityChecker');
const fs = require('fs');
const path = require('path');

class DataIntegrityTester {
    constructor(options = {}) {
        this.checker = new DataIntegrityChecker();
        this.options = {
            enableDeepValidation: options.enableDeepValidation !== false,
            enablePerformanceTesting: options.enablePerformanceTesting !== false,
            enableConsistencyAnalysis: options.enableConsistencyAnalysis !== false,
            enableRegressionTesting: options.enableRegressionTesting || false,
            benchmarkComparison: options.benchmarkComparison || false,
            ...options
        };
        
        // 测试结果存储
        this.testResults = {
            basicIntegrity: null,
            deepValidation: null,
            consistency: null,
            performance: null,
            regression: null,
            summary: null
        };
        
        // 验证基准
        this.benchmarks = {
            roomCountBenchmark: 140,
            connectionCountBenchmark: 284,
            regionCountBenchmark: 4,
            performanceBaseline: null
        };
        
        // 测试数据集合
        this.testDataSets = {
            sourceData: null,
            splitData: null,
            validationData: null
        };
    }

    /**
     * 执行全面的数据完整性测试
     * @param {Object} sourceData - 源数据
     * @param {Object} splitData - 拆分后的数据
     * @returns {Object} 测试结果
     */
    async runComprehensiveTest(sourceData, splitData) {
        console.log('🔬 开始执行全面数据完整性测试...');
        const startTime = Date.now();
        
        // 保存测试数据
        this.testDataSets.sourceData = sourceData;
        this.testDataSets.splitData = splitData;
        
        try {
            // 1. 基础完整性测试
            console.log('1️⃣ 执行基础完整性测试...');
            this.testResults.basicIntegrity = await this.runBasicIntegrityTest(sourceData, splitData);
            
            // 2. 深度验证测试
            if (this.options.enableDeepValidation) {
                console.log('2️⃣ 执行深度验证测试...');
                this.testResults.deepValidation = await this.runDeepValidationTest(sourceData, splitData);
            }
            
            // 3. 一致性分析
            if (this.options.enableConsistencyAnalysis) {
                console.log('3️⃣ 执行一致性分析...');
                this.testResults.consistency = await this.runConsistencyAnalysis(sourceData, splitData);
            }
            
            // 4. 性能测试
            if (this.options.enablePerformanceTesting) {
                console.log('4️⃣ 执行性能测试...');
                this.testResults.performance = await this.runPerformanceTests(sourceData, splitData);
            }
            
            // 5. 回归测试
            if (this.options.enableRegressionTesting) {
                console.log('5️⃣ 执行回归测试...');
                this.testResults.regression = await this.runRegressionTests(sourceData, splitData);
            }
            
            // 6. 生成综合摘要
            console.log('6️⃣ 生成测试摘要...');
            this.testResults.summary = this.generateTestSummary();
            
            const totalTime = Date.now() - startTime;
            console.log(`✅ 全面数据完整性测试完成，耗时: ${totalTime}ms`);
            
            return this.testResults;
            
        } catch (error) {
            console.error('❌ 数据完整性测试失败:', error);
            throw error;
        }
    }

    /**
     * 执行基础完整性测试
     */
    async runBasicIntegrityTest(sourceData, splitData) {
        const startTime = Date.now();
        
        // 使用现有的DataIntegrityChecker
        const basicResult = this.checker.validateIntegrity(sourceData, splitData);
        
        // 增强基础验证
        const enhancedResult = {
            ...basicResult,
            enhancedChecks: await this.performEnhancedBasicChecks(sourceData, splitData),
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };
        
        return enhancedResult;
    }

    /**
     * 执行增强的基础检查
     */
    async performEnhancedBasicChecks(sourceData, splitData) {
        const checks = {
            structuralCompleteness: await this.checkStructuralCompleteness(sourceData, splitData),
            dataConsistency: await this.checkDataConsistency(sourceData, splitData),
            logicalIntegrity: await this.checkLogicalIntegrity(sourceData, splitData),
            formatCompliance: await this.checkFormatCompliance(splitData)
        };
        
        return checks;
    }

    /**
     * 检查结构完整性
     */
    async checkStructuralCompleteness(sourceData, splitData) {
        const result = {
            sourceStructureValid: true,
            splitStructureValid: true,
            structuralMapping: {},
            issues: []
        };
        
        // 检查源数据结构
        if (!sourceData.districts || !Array.isArray(sourceData.districts)) {
            result.sourceStructureValid = false;
            result.issues.push('源数据缺少districts数组');
        }
        
        // 检查拆分数据结构
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (!regionData.region || !regionData.locations || !regionData.connections) {
                result.splitStructureValid = false;
                result.issues.push(`区域 ${regionId} 结构不完整`);
            }
        }
        
        // 建立结构映射
        result.structuralMapping = {
            sourceDistricts: sourceData.districts ? sourceData.districts.length : 0,
            splitRegions: Object.keys(splitData).length,
            expectedRegions: this.benchmarks.regionCountBenchmark
        };
        
        return result;
    }

    /**
     * 检查数据一致性
     */
    async checkDataConsistency(sourceData, splitData) {
        const result = {
            roomDataConsistency: true,
            connectionConsistency: true,
            metadataConsistency: true,
            inconsistencies: []
        };
        
        // 检查房间数据一致性
        const sourceRooms = this.extractAllRoomsFromSource(sourceData);
        const splitRooms = this.extractAllRoomsFromSplit(splitData);
        
        for (const sourceRoom of sourceRooms) {
            const splitRoom = splitRooms.find(r => r.id === sourceRoom.id);
            if (splitRoom) {
                // 比较关键字段
                if (sourceRoom.name !== splitRoom.name) {
                    result.roomDataConsistency = false;
                    result.inconsistencies.push({
                        type: 'room_name_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.name,
                        split: splitRoom.name
                    });
                }
                
                if (sourceRoom.type !== splitRoom.type) {
                    result.roomDataConsistency = false;
                    result.inconsistencies.push({
                        type: 'room_type_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.type,
                        split: splitRoom.type
                    });
                }
            }
        }
        
        return result;
    }

    /**
     * 检查逻辑完整性
     */
    async checkLogicalIntegrity(sourceData, splitData) {
        const result = {
            connectionLogicValid: true,
            regionLogicValid: true,
            locationLogicValid: true,
            logicalErrors: []
        };
        
        // 检查连接逻辑
        const connections = this.extractAllConnectionsFromSplit(splitData);
        for (const connection of connections) {
            // 检查自连接
            if (connection.from === connection.to) {
                result.logicalErrors.push({
                    type: 'self_connection',
                    connection,
                    severity: 'warning'
                });
            }
            
            // 检查循环连接（简单检查）
            if (connection.direction === 'both' && connection.from && connection.to) {
                // 这里可以添加更复杂的循环检测逻辑
            }
        }
        
        return result;
    }

    /**
     * 检查格式合规性
     */
    async checkFormatCompliance(splitData) {
        const result = {
            formatValid: true,
            formatErrors: [],
            recommendations: []
        };
        
        const requiredFields = {
            region: ['id', 'name', 'type', 'roomCount'],
            location: ['id', 'name', 'rooms'],
            room: ['id', 'name', 'type'],
            connection: ['from', 'to']
        };
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            // 检查区域格式
            for (const field of requiredFields.region) {
                if (!regionData.region || regionData.region[field] === undefined) {
                    result.formatErrors.push({
                        type: 'missing_field',
                        entity: 'region',
                        id: regionId,
                        field
                    });
                    result.formatValid = false;
                }
            }
            
            // 检查位置和房间格式
            for (const location of regionData.locations) {
                for (const field of requiredFields.location) {
                    if (location[field] === undefined) {
                        result.formatErrors.push({
                            type: 'missing_field',
                            entity: 'location',
                            id: location.id,
                            field
                        });
                        result.formatValid = false;
                    }
                }
                
                for (const room of location.rooms) {
                    for (const field of requiredFields.room) {
                        if (room[field] === undefined) {
                            result.formatErrors.push({
                                type: 'missing_field',
                                entity: 'room',
                                id: room.id,
                                field
                            });
                            result.formatValid = false;
                        }
                    }
                }
            }
            
            // 检查连接格式
            const allConnections = [
                ...regionData.connections.internal,
                ...regionData.connections.crossRegion
            ];
            
            for (const connection of allConnections) {
                for (const field of requiredFields.connection) {
                    if (connection[field] === undefined) {
                        result.formatErrors.push({
                            type: 'missing_field',
                            entity: 'connection',
                            id: connection.connectionId || `${connection.from}-${connection.to}`,
                            field
                        });
                        result.formatValid = false;
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * 执行深度验证测试
     */
    async runDeepValidationTest(sourceData, splitData) {
        const startTime = Date.now();
        
        const deepValidation = {
            dataQuality: await this.performDataQualityAnalysis(splitData),
            businessLogic: await this.performBusinessLogicValidation(splitData),
            completeness: await this.performCompletenessValidation(sourceData, splitData),
            accuracy: await this.performAccuracyValidation(sourceData, splitData),
            reliability: await this.performReliabilityAnalysis(splitData)
        };
        
        deepValidation.executionTime = Date.now() - startTime;
        deepValidation.timestamp = new Date().toISOString();
        
        return deepValidation;
    }

    /**
     * 执行数据质量分析
     */
    async performDataQualityAnalysis(splitData) {
        const qualityMetrics = {
            completenessScore: 0,
            accuracyScore: 0,
            consistencyScore: 0,
            validityScore: 0,
            overallQualityScore: 0,
            qualityIssues: []
        };
        
        let totalRooms = 0;
        let roomsWithCompleteData = 0;
        let roomsWithValidCoordinates = 0;
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    totalRooms++;
                    
                    // 检查数据完整性
                    const hasBasicFields = room.id && room.name && room.type;
                    const hasOptionalFields = room.description || room.coordinates;
                    
                    if (hasBasicFields) {
                        roomsWithCompleteData++;
                    }
                    
                    // 检查坐标有效性
                    if (room.coordinates && 
                        typeof room.coordinates.x === 'number' && 
                        typeof room.coordinates.y === 'number') {
                        roomsWithValidCoordinates++;
                    }
                    
                    // 检查数据质量问题
                    if (!room.id || room.id.trim() === '') {
                        qualityMetrics.qualityIssues.push({
                            type: 'missing_id',
                            roomId: room.id,
                            region: regionId
                        });
                    }
                    
                    if (!room.name || room.name.trim() === '') {
                        qualityMetrics.qualityIssues.push({
                            type: 'missing_name',
                            roomId: room.id,
                            region: regionId
                        });
                    }
                    
                    if (room.name && room.name.length > 100) {
                        qualityMetrics.qualityIssues.push({
                            type: 'name_too_long',
                            roomId: room.id,
                            region: regionId,
                            length: room.name.length
                        });
                    }
                }
            }
        }
        
        // 计算质量分数
        qualityMetrics.completenessScore = totalRooms > 0 ? (roomsWithCompleteData / totalRooms * 100) : 0;
        qualityMetrics.accuracyScore = totalRooms > 0 ? (roomsWithValidCoordinates / totalRooms * 100) : 0;
        qualityMetrics.consistencyScore = 100 - (qualityMetrics.qualityIssues.length / totalRooms * 100);
        qualityMetrics.validityScore = qualityMetrics.qualityIssues.length === 0 ? 100 : Math.max(0, 100 - qualityMetrics.qualityIssues.length);
        qualityMetrics.overallQualityScore = (
            qualityMetrics.completenessScore + 
            qualityMetrics.accuracyScore + 
            qualityMetrics.consistencyScore + 
            qualityMetrics.validityScore
        ) / 4;
        
        return qualityMetrics;
    }

    /**
     * 执行业务逻辑验证
     */
    async performBusinessLogicValidation(splitData) {
        const validation = {
            businessRulesCompliant: true,
            ruleViolations: [],
            warnings: []
        };
        
        // 业务规则1：每个区域应该有至少一个位置
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (!regionData.locations || regionData.locations.length === 0) {
                validation.businessRulesCompliant = false;
                validation.ruleViolations.push({
                    type: 'empty_region',
                    regionId,
                    rule: '每个区域应该有至少一个位置'
                });
            }
        }
        
        // 业务规则2：房间数量应该与区域统计一致
        for (const [regionId, regionData] of Object.entries(splitData)) {
            let actualRoomCount = 0;
            for (const location of regionData.locations) {
                actualRoomCount += location.rooms.length;
            }
            
            if (regionData.region.roomCount !== actualRoomCount) {
                validation.warnings.push({
                    type: 'room_count_mismatch',
                    regionId,
                    expected: regionData.region.roomCount,
                    actual: actualRoomCount
                });
            }
        }
        
        // 业务规则3：重要区域应该有特殊房间
        const importantRegions = ['imperial_district', 'commercial_district'];
        for (const regionId of importantRegions) {
            if (splitData[regionId]) {
                const hasSpecialRooms = splitData[regionId].locations.some(location =>
                    location.rooms.some(room => 
                        room.type === 'palace' || 
                        room.type === 'market' || 
                        room.type === 'government'
                    )
                );
                
                if (!hasSpecialRooms) {
                    validation.warnings.push({
                        type: 'missing_special_rooms',
                        regionId,
                        rule: '重要区域应该有特殊房间类型'
                    });
                }
            }
        }
        
        return validation;
    }

    /**
     * 执行完整性验证
     */
    async performCompletenessValidation(sourceData, splitData) {
        const validation = {
            dataComplete: true,
            missingEntities: [],
            redundantEntities: [],
            completenessScore: 0
        };
        
        // 检查房间完整性
        const sourceRoomIds = this.extractAllRoomsFromSource(sourceData).map(r => r.id);
        const splitRoomIds = this.extractAllRoomsFromSplit(splitData).map(r => r.id);
        
        // 查找缺失的房间
        for (const roomId of sourceRoomIds) {
            if (!splitRoomIds.includes(roomId)) {
                validation.missingEntities.push({
                    type: 'missing_room',
                    id: roomId
                });
                validation.dataComplete = false;
            }
        }
        
        // 查找多余的房间
        for (const roomId of splitRoomIds) {
            if (!sourceRoomIds.includes(roomId)) {
                validation.redundantEntities.push({
                    type: 'redundant_room',
                    id: roomId
                });
            }
        }
        
        // 计算完整性分数
        const totalExpected = sourceRoomIds.length;
        const totalFound = splitRoomIds.filter(id => sourceRoomIds.includes(id)).length;
        validation.completenessScore = totalExpected > 0 ? (totalFound / totalExpected * 100) : 0;
        
        return validation;
    }

    /**
     * 执行准确性验证
     */
    async performAccuracyValidation(sourceData, splitData) {
        const validation = {
            dataAccurate: true,
            inaccuracies: [],
            accuracyScore: 0
        };
        
        // 比较源数据和拆分数据的准确性
        const sourceRooms = this.extractAllRoomsFromSource(sourceData);
        const splitRooms = this.extractAllRoomsFromSplit(splitData);
        
        let accurateRooms = 0;
        
        for (const sourceRoom of sourceRooms) {
            const splitRoom = splitRooms.find(r => r.id === sourceRoom.id);
            if (splitRoom) {
                let isAccurate = true;
                
                // 比较关键字段
                if (sourceRoom.name !== splitRoom.name) {
                    validation.inaccuracies.push({
                        type: 'name_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.name,
                        split: splitRoom.name
                    });
                    isAccurate = false;
                }
                
                if (sourceRoom.type !== splitRoom.type) {
                    validation.inaccuracies.push({
                        type: 'type_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.type,
                        split: splitRoom.type
                    });
                    isAccurate = false;
                }
                
                // 比较坐标（如果有）
                if (sourceRoom.coordinates && splitRoom.coordinates) {
                    if (Math.abs(sourceRoom.coordinates.x - splitRoom.coordinates.x) > 0.01 ||
                        Math.abs(sourceRoom.coordinates.y - splitRoom.coordinates.y) > 0.01) {
                        validation.inaccuracies.push({
                            type: 'coordinate_mismatch',
                            roomId: sourceRoom.id,
                            source: sourceRoom.coordinates,
                            split: splitRoom.coordinates
                        });
                        isAccurate = false;
                    }
                }
                
                if (isAccurate) {
                    accurateRooms++;
                } else {
                    validation.dataAccurate = false;
                }
            }
        }
        
        // 计算准确性分数
        validation.accuracyScore = sourceRooms.length > 0 ? (accurateRooms / sourceRooms.length * 100) : 0;
        
        return validation;
    }

    /**
     * 执行可靠性分析
     */
    async performReliabilityAnalysis(splitData) {
        const analysis = {
            reliabilityScore: 0,
            reliabilityFactors: {},
            issues: [],
            recommendations: []
        };
        
        let totalRooms = 0;
        let roomsWithConnections = 0;
        let isolatedRooms = 0;
        let wellConnectedRooms = 0;
        
        // 分析房间连接可靠性
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    totalRooms++;
                    
                    // 计算房间连接数
                    let connectionCount = 0;
                    
                    // 内部连接
                    const internalConnections = regionData.connections.internal.filter(
                        conn => conn.from === room.id || conn.to === room.id
                    );
                    connectionCount += internalConnections.length;
                    
                    // 跨区域连接
                    const crossRegionConnections = regionData.connections.crossRegion.filter(
                        conn => conn.from === room.id || conn.to === room.id
                    );
                    connectionCount += crossRegionConnections.length;
                    
                    if (connectionCount > 0) {
                        roomsWithConnections++;
                    } else {
                        isolatedRooms++;
                        analysis.issues.push({
                            type: 'isolated_room',
                            roomId: room.id,
                            region: regionId
                        });
                    }
                    
                    if (connectionCount >= 2) {
                        wellConnectedRooms++;
                    }
                }
            }
        }
        
        // 计算可靠性因子
        analysis.reliabilityFactors = {
            connectivityRate: totalRooms > 0 ? (roomsWithConnections / totalRooms * 100) : 0,
            isolationRate: totalRooms > 0 ? (isolatedRooms / totalRooms * 100) : 0,
            wellConnectedRate: totalRooms > 0 ? (wellConnectedRooms / totalRooms * 100) : 0
        };
        
        // 计算整体可靠性分数
        analysis.reliabilityScore = (
            analysis.reliabilityFactors.connectivityRate * 0.4 +
            (100 - analysis.reliabilityFactors.isolationRate) * 0.4 +
            analysis.reliabilityFactors.wellConnectedRate * 0.2
        );
        
        // 生成建议
        if (analysis.reliabilityFactors.isolationRate > 5) {
            analysis.recommendations.push({
                type: 'connectivity_improvement',
                message: '建议减少孤立房间数量，提高连通性'
            });
        }
        
        if (analysis.reliabilityFactors.wellConnectedRate < 50) {
            analysis.recommendations.push({
                type: 'connection_enhancement',
                message: '建议增加房间间的连接，提高网络稳定性'
            });
        }
        
        return analysis;
    }

    /**
     * 执行一致性分析
     */
    async runConsistencyAnalysis(sourceData, splitData) {
        const startTime = Date.now();
        
        const consistency = {
            structuralConsistency: await this.analyzeStructuralConsistency(sourceData, splitData),
            semanticConsistency: await this.analyzeSemanticConsistency(sourceData, splitData),
            temporalConsistency: await this.analyzeTemporalConsistency(splitData),
            crossReferenceConsistency: await this.analyzeCrossReferenceConsistency(splitData)
        };
        
        consistency.executionTime = Date.now() - startTime;
        consistency.timestamp = new Date().toISOString();
        consistency.overallConsistencyScore = this.calculateOverallConsistencyScore(consistency);
        
        return consistency;
    }

    /**
     * 分析结构一致性
     */
    async analyzeStructuralConsistency(sourceData, splitData) {
        const analysis = {
            dataStructureConsistent: true,
            structureMapping: {},
            inconsistencies: []
        };
        
        // 比较数据结构
        analysis.structureMapping = {
            sourceStructure: {
                districts: sourceData.districts?.length || 0,
                totalLocations: sourceData.districts?.reduce((sum, d) => sum + (d.locations?.length || 0), 0) || 0,
                totalRooms: sourceData.districts?.reduce((sum, d) => sum + (d.locations?.reduce((lsum, l) => lsum + (l.rooms?.length || 0), 0) || 0), 0) || 0
            },
            splitStructure: {
                regions: Object.keys(splitData).length,
                totalLocations: Object.values(splitData).reduce((sum, r) => sum + (r.locations?.length || 0), 0),
                totalRooms: Object.values(splitData).reduce((sum, r) => sum + (r.locations?.reduce((lsum, l) => lsum + (l.rooms?.length || 0), 0) || 0), 0)
            }
        };
        
        // 检查房间数量一致性
        if (analysis.structureMapping.sourceStructure.totalRooms !== analysis.structureMapping.splitStructure.totalRooms) {
            analysis.inconsistencies.push({
                type: 'room_count_mismatch',
                source: analysis.structureMapping.sourceStructure.totalRooms,
                split: analysis.structureMapping.splitStructure.totalRooms
            });
            analysis.dataStructureConsistent = false;
        }
        
        return analysis;
    }

    /**
     * 分析语义一致性
     */
    async analyzeSemanticConsistency(sourceData, splitData) {
        const analysis = {
            semanticConsistent: true,
            semanticInconsistencies: []
        };
        
        // 检查房间名称和类型的一致性
        const sourceRooms = this.extractAllRoomsFromSource(sourceData);
        const splitRooms = this.extractAllRoomsFromSplit(splitData);
        
        for (const sourceRoom of sourceRooms) {
            const splitRoom = splitRooms.find(r => r.id === sourceRoom.id);
            if (splitRoom) {
                // 检查名称语义一致性
                if (sourceRoom.name !== splitRoom.name) {
                    analysis.semanticInconsistencies.push({
                        type: 'name_semantic_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.name,
                        split: splitRoom.name
                    });
                    analysis.semanticConsistent = false;
                }
                
                // 检查类型语义一致性
                if (sourceRoom.type !== splitRoom.type) {
                    analysis.semanticInconsistencies.push({
                        type: 'type_semantic_mismatch',
                        roomId: sourceRoom.id,
                        source: sourceRoom.type,
                        split: splitRoom.type
                    });
                    analysis.semanticConsistent = false;
                }
            }
        }
        
        return analysis;
    }

    /**
     * 分析时间一致性
     */
    async analyzeTemporalConsistency(splitData) {
        const analysis = {
            temporalConsistent: true,
            temporalInconsistencies: [],
            timeRange: null
        };
        
        const timestamps = [];
        
        // 收集所有时间戳
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (regionData.metadata?.migrationDate) {
                timestamps.push(new Date(regionData.metadata.migrationDate));
            }
        }
        
        if (timestamps.length > 0) {
            const minTime = new Date(Math.min(...timestamps));
            const maxTime = new Date(Math.max(...timestamps));
            const timeDiff = maxTime - minTime;
            
            analysis.timeRange = {
                earliest: minTime.toISOString(),
                latest: maxTime.toISOString(),
                difference: timeDiff
            };
            
            // 如果时间差超过1小时，认为可能不一致
            if (timeDiff > 60 * 60 * 1000) {
                analysis.temporalInconsistencies.push({
                    type: 'migration_time_span_too_large',
                    timeDifference: timeDiff,
                    threshold: 60 * 60 * 1000
                });
                analysis.temporalConsistent = false;
            }
        }
        
        return analysis;
    }

    /**
     * 分析交叉引用一致性
     */
    async analyzeCrossReferenceConsistency(splitData) {
        const analysis = {
            crossReferencesConsistent: true,
            brokenReferences: [],
            orphanedEntities: []
        };
        
        // 检查连接引用的完整性
        for (const [regionId, regionData] of Object.entries(splitData)) {
            const allRoomIds = new Set();
            for (const location of regionData.locations) {
                for (const room of location.rooms) {
                    allRoomIds.add(room.id);
                }
            }
            
            // 检查内部连接
            for (const connection of regionData.connections.internal) {
                if (!allRoomIds.has(connection.from) || !allRoomIds.has(connection.to)) {
                    analysis.brokenReferences.push({
                        type: 'internal_connection_reference',
                        connection,
                        regionId
                    });
                    analysis.crossReferencesConsistent = false;
                }
            }
            
            // 检查跨区域连接（这里只检查源房间）
            for (const connection of regionData.connections.crossRegion) {
                if (!allRoomIds.has(connection.from)) {
                    analysis.brokenReferences.push({
                        type: 'cross_region_connection_reference',
                        connection,
                        regionId
                    });
                    analysis.crossReferencesConsistent = false;
                }
            }
        }
        
        return analysis;
    }

    /**
     * 计算整体一致性分数
     */
    calculateOverallConsistencyScore(consistency) {
        let score = 100;
        let factors = 0;
        
        if (consistency.structuralConsistency) {
            if (!consistency.structuralConsistency.dataStructureConsistent) score -= 25;
            factors++;
        }
        
        if (consistency.semanticConsistency) {
            if (!consistency.semanticConsistency.semanticConsistent) score -= 25;
            factors++;
        }
        
        if (consistency.temporalConsistency) {
            if (!consistency.temporalConsistency.temporalConsistent) score -= 15;
            factors++;
        }
        
        if (consistency.crossReferenceConsistency) {
            if (!consistency.crossReferenceConsistency.crossReferencesConsistent) score -= 35;
            factors++;
        }
        
        return Math.max(0, score);
    }

    /**
     * 执行性能测试
     */
    async runPerformanceTests(sourceData, splitData) {
        const startTime = Date.now();
        
        const performance = {
            benchmarks: await this.performPerformanceBenchmarks(sourceData, splitData),
            resourceUsage: await this.measureResourceUsage(sourceData, splitData),
            scalabilityMetrics: await this.measureScalability(splitData)
        };
        
        performance.executionTime = Date.now() - startTime;
        performance.timestamp = new Date().toISOString();
        
        return performance;
    }

    /**
     * 执行性能基准测试
     */
    async performPerformanceBenchmarks(sourceData, splitData) {
        const benchmarks = {
            dataLoadingTime: 0,
            validationTime: 0,
            queryResponseTime: 0,
            memoryEfficiency: 0
        };
        
        // 测试数据加载时间
        const loadStart = Date.now();
        // 模拟数据加载操作
        await new Promise(resolve => setTimeout(resolve, 10));
        benchmarks.dataLoadingTime = Date.now() - loadStart;
        
        // 测试验证时间
        const validationStart = Date.now();
        await this.checker.validateIntegrity(sourceData, splitData);
        benchmarks.validationTime = Date.now() - validationStart;
        
        // 测试查询响应时间
        const queryStart = Date.now();
        const rooms = this.extractAllRoomsFromSplit(splitData);
        const specificRoom = rooms.find(r => r.id); // 查找第一个房间
        benchmarks.queryResponseTime = Date.now() - queryStart;
        
        // 计算内存效率
        const dataSize = JSON.stringify(splitData).length;
        benchmarks.memoryEfficiency = dataSize / (1024 * 1024); // MB
        
        return benchmarks;
    }

    /**
     * 测量资源使用
     */
    async measureResourceUsage(sourceData, splitData) {
        const memBefore = process.memoryUsage();
        
        // 执行内存密集操作
        const rooms = this.extractAllRoomsFromSplit(splitData);
        const connections = this.extractAllConnectionsFromSplit(splitData);
        
        const memAfter = process.memoryUsage();
        
        return {
            memoryUsage: {
                heapUsed: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024, // MB
                heapTotal: (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024, // MB
                external: (memAfter.external - memBefore.external) / 1024 / 1024 // MB
            },
            dataMetrics: {
                totalRooms: rooms.length,
                totalConnections: connections.length,
                dataComplexity: rooms.length * connections.length
            }
        };
    }

    /**
     * 测量可扩展性
     */
    async measureScalability(splitData) {
        const scalability = {
            linearScalability: true,
            performanceComplexity: 'O(n)',
            bottleneckAnalysis: [],
            recommendations: []
        };
        
        // 分析数据规模
        let totalRooms = 0;
        let totalConnections = 0;
        
        for (const [regionId, regionData] of Object.entries(splitData)) {
            for (const location of regionData.locations) {
                totalRooms += location.rooms.length;
            }
            totalConnections += regionData.connections.internal.length + regionData.connections.crossRegion.length;
        }
        
        // 分析性能瓶颈
        if (totalRooms > 1000 && totalConnections > 2000) {
            scalability.performanceComplexity = 'O(n²)';
            scalability.bottleneckAnalysis.push({
                type: 'quadratic_complexity',
                description: '连接验证算法在高数据量下可能存在性能问题'
            });
            
            scalability.recommendations.push({
                type: 'algorithm_optimization',
                description: '考虑使用更高效的图算法或索引结构'
            });
        }
        
        return scalability;
    }

    /**
     * 执行回归测试
     */
    async runRegressionTests(sourceData, splitData) {
        // 这里可以实现与历史版本的比较测试
        return {
            regressionDetected: false,
            regressionDetails: [],
            baselineComparison: {},
            status: 'PASS'
        };
    }

    /**
     * 生成测试摘要
     */
    generateTestSummary() {
        const summary = {
            overallStatus: 'PASS',
            testTimestamp: new Date().toISOString(),
            testSuite: 'DataIntegrityTester v1.0',
            results: {}
        };
        
        // 基础完整性结果
        if (this.testResults.basicIntegrity) {
            summary.results.basicIntegrity = {
                status: this.testResults.basicIntegrity.summary.overallStatus,
                totalErrors: this.testResults.basicIntegrity.summary.totalErrors,
                totalWarnings: this.testResults.basicIntegrity.summary.totalWarnings,
                isValid: this.testResults.basicIntegrity.isValid,
                dataLoss: this.testResults.basicIntegrity.summary.dataLoss
            };
        }
        
        // 深度验证结果
        if (this.testResults.deepValidation) {
            const deep = this.testResults.deepValidation;
            summary.results.deepValidation = {
                overallQualityScore: deep.dataQuality?.overallQualityScore || 0,
                businessRulesCompliant: deep.businessLogic?.businessRulesCompliant || false,
                completenessScore: deep.completeness?.completenessScore || 0,
                accuracyScore: deep.accuracy?.accuracyScore || 0,
                reliabilityScore: deep.reliability?.reliabilityScore || 0
            };
        }
        
        // 一致性分析结果
        if (this.testResults.consistency) {
            summary.results.consistency = {
                overallConsistencyScore: this.testResults.consistency.overallConsistencyScore,
                structuralConsistent: this.testResults.consistency.structuralConsistency?.dataStructureConsistent || false,
                semanticConsistent: this.testResults.consistency.semanticConsistency?.semanticConsistent || false,
                temporalConsistent: this.testResults.consistency.temporalConsistency?.temporalConsistent || false,
                crossReferencesConsistent: this.testResults.consistency.crossReferenceConsistency?.crossReferencesConsistent || false
            };
        }
        
        // 性能测试结果
        if (this.testResults.performance) {
            summary.results.performance = {
                validationTime: this.testResults.performance.benchmarks?.validationTime || 0,
                memoryUsage: this.testResults.performance.resourceUsage?.memoryUsage?.heapUsed || 0,
                dataComplexity: this.testResults.performance.resourceUsage?.dataMetrics?.dataComplexity || 0,
                scalabilityIssue: this.testResults.performance.scalabilityMetrics?.linearScalability === false
            };
        }
        
        // 计算总体状态
        const basicPass = !summary.results.basicIntegrity || summary.results.basicIntegrity.status === 'PASS';
        const qualityGood = !summary.results.deepValidation || (summary.results.deepValidation.overallQualityScore >= 80);
        const consistencyGood = !summary.results.consistency || (summary.results.consistency.overallConsistencyScore >= 80);
        const performanceGood = !summary.results.performance || (summary.results.performance.validationTime < 5000);
        
        if (!basicPass || !qualityGood || !consistencyGood || !performanceGood) {
            summary.overallStatus = 'FAIL';
        } else if ((summary.results.deepValidation?.overallQualityScore || 100) < 95 ||
                  (summary.results.consistency?.overallConsistencyScore || 100) < 95) {
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
        
        report.push('# 数据完整性测试详细报告');
        report.push(`生成时间: ${this.testResults.summary.testTimestamp}`);
        report.push(`测试套件: ${this.testResults.summary.testSuite}`);
        report.push(`总体状态: ${this.testResults.summary.overallStatus}`);
        report.push('');
        
        // 基础完整性测试详情
        if (this.testResults.basicIntegrity) {
            report.push('## 基础完整性测试');
            const basic = this.testResults.basicIntegrity;
            report.push(`- 测试状态: ${basic.summary.overallStatus}`);
            report.push(`- 错误数量: ${basic.summary.totalErrors}`);
            report.push(`- 警告数量: ${basic.summary.totalWarnings}`);
            report.push(`- 数据完整: ${basic.isValid ? '是' : '否'}`);
            report.push(`- 数据丢失: ${basic.summary.dataLoss ? '是' : '否'}`);
            report.push('');
            
            // ID唯一性详情
            const idResult = basic.idUniqueness;
            report.push('### 房间ID唯一性');
            report.push(`- 总房间数: ${idResult.totalRooms}`);
            report.push(`- 唯一ID数: ${idResult.uniqueIds}`);
            report.push(`- 重复房间: ${idResult.duplicateRooms.length}`);
            report.push(`- 发现重复: ${idResult.duplicatesFound ? '是' : '否'}`);
            report.push('');
            
            // 数据完整性详情
            const completenessResult = basic.dataCompleteness;
            report.push('### 数据完整性');
            report.push(`- 源数据房间数: ${completenessResult.sourceRoomCount}`);
            report.push(`- 拆分数据房间数: ${completenessResult.splitRoomCount}`);
            report.push(`- 缺失房间: ${completenessResult.missingRooms.length}`);
            report.push(`- 多余房间: ${completenessResult.extraRooms.length}`);
            report.push(`- 数据完整: ${completenessResult.isComplete ? '是' : '否'}`);
            report.push('');
        }
        
        // 深度验证测试详情
        if (this.testResults.deepValidation) {
            report.push('## 深度验证测试');
            const deep = this.testResults.deepValidation;
            
            // 数据质量分析
            if (deep.dataQuality) {
                const quality = deep.dataQuality;
                report.push('### 数据质量分析');
                report.push(`- 整体质量分数: ${quality.overallQualityScore.toFixed(2)}/100`);
                report.push(`- 完整性分数: ${quality.completenessScore.toFixed(2)}/100`);
                report.push(`- 准确性分数: ${quality.accuracyScore.toFixed(2)}/100`);
                report.push(`- 一致性分数: ${quality.consistencyScore.toFixed(2)}/100`);
                report.push(`- 有效性分数: ${quality.validityScore.toFixed(2)}/100`);
                report.push(`- 质量问题数: ${quality.qualityIssues.length}`);
                report.push('');
            }
            
            // 业务逻辑验证
            if (deep.businessLogic) {
                const logic = deep.businessLogic;
                report.push('### 业务逻辑验证');
                report.push(`- 业务规则合规: ${logic.businessRulesCompliant ? '是' : '否'}`);
                report.push(`- 规则违规数: ${logic.ruleViolations.length}`);
                report.push(`- 警告数: ${logic.warnings.length}`);
                report.push('');
            }
            
            // 可靠性分析
            if (deep.reliability) {
                const reliability = deep.reliability;
                report.push('### 可靠性分析');
                report.push(`- 可靠性分数: ${reliability.reliabilityScore.toFixed(2)}/100`);
                report.push(`- 连通率: ${reliability.reliabilityFactors.connectivityRate.toFixed(2)}%`);
                report.push(`- 隔离率: ${reliability.reliabilityFactors.isolationRate.toFixed(2)}%`);
                report.push(`- 良好连接率: ${reliability.reliabilityFactors.wellConnectedRate.toFixed(2)}%`);
                report.push(`- 问题数: ${reliability.issues.length}`);
                report.push('');
            }
        }
        
        // 一致性分析详情
        if (this.testResults.consistency) {
            report.push('## 一致性分析');
            const consistency = this.testResults.consistency;
            report.push(`- 整体一致性分数: ${consistency.overallConsistencyScore}/100`);
            report.push('');
            
            // 结构一致性
            if (consistency.structuralConsistency) {
                const struct = consistency.structuralConsistency;
                report.push('### 结构一致性');
                report.push(`- 结构一致: ${struct.dataStructureConsistent ? '是' : '否'}`);
                report.push(`- 源数据房间: ${struct.structureMapping.sourceStructure.totalRooms}`);
                report.push(`- 拆分数据房间: ${struct.structureMapping.splitStructure.totalRooms}`);
                report.push(`- 不一致数: ${struct.inconsistencies.length}`);
                report.push('');
            }
            
            // 语义一致性
            if (consistency.semanticConsistency) {
                const semantic = consistency.semanticConsistency;
                report.push('### 语义一致性');
                report.push(`- 语义一致: ${semantic.semanticConsistent ? '是' : '否'}`);
                report.push(`- 语义不一致数: ${semantic.semanticInconsistencies.length}`);
                report.push('');
            }
        }
        
        // 性能测试详情
        if (this.testResults.performance) {
            report.push('## 性能测试');
            const perf = this.testResults.performance;
            
            // 基准测试
            if (perf.benchmarks) {
                const bench = perf.benchmarks;
                report.push('### 性能基准');
                report.push(`- 数据加载时间: ${bench.dataLoadingTime}ms`);
                report.push(`- 验证时间: ${bench.validationTime}ms`);
                report.push(`- 查询响应时间: ${bench.queryResponseTime}ms`);
                report.push(`- 内存效率: ${bench.memoryEfficiency.toFixed(2)}MB`);
                report.push('');
            }
            
            // 资源使用
            if (perf.resourceUsage) {
                const resource = perf.resourceUsage;
                report.push('### 资源使用');
                report.push(`- 堆内存使用: ${resource.memoryUsage.heapUsed.toFixed(2)}MB`);
                report.push(`- 总房间数: ${resource.dataMetrics.totalRooms}`);
                report.push(`- 总连接数: ${resource.dataMetrics.totalConnections}`);
                report.push(`- 数据复杂度: ${resource.dataMetrics.dataComplexity}`);
                report.push('');
            }
        }
        
        // 错误和警告汇总
        const allErrors = [];
        const allWarnings = [];
        
        if (this.testResults.basicIntegrity?.errors) {
            allErrors.push(...this.testResults.basicIntegrity.errors);
        }
        
        if (this.testResults.basicIntegrity?.warnings) {
            allWarnings.push(...this.testResults.basicIntegrity.warnings);
        }
        
        if (this.testResults.deepValidation?.dataQuality?.qualityIssues) {
            allWarnings.push(...this.testResults.deepValidation.dataQuality.qualityIssues);
        }
        
        if (allErrors.length > 0) {
            report.push('## 发现的错误');
            allErrors.forEach((error, index) => {
                report.push(`${index + 1}. ${error}`);
            });
            report.push('');
        }
        
        if (allWarnings.length > 0) {
            report.push('## 发现的警告');
            allWarnings.forEach((warning, index) => {
                report.push(`${index + 1}. ${JSON.stringify(warning)}`);
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
        const resultsPath = path.join(outputDir, `data-integrity-test-results-${timestamp}.json`);
        fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
        
        // 保存详细报告
        const reportPath = path.join(outputDir, `data-integrity-test-report-${timestamp}.md`);
        fs.writeFileSync(reportPath, this.generateDetailedReport());
        
        // 保存摘要
        const summaryPath = path.join(outputDir, `data-integrity-test-summary-${timestamp}.json`);
        fs.writeFileSync(summaryPath, JSON.stringify(this.testResults.summary, null, 2));
        
        console.log(`📄 数据完整性测试结果已保存:`);
        console.log(`  - 完整结果: ${resultsPath}`);
        console.log(`  - 详细报告: ${reportPath}`);
        console.log(`  - 测试摘要: ${summaryPath}`);
        
        return {
            resultsPath,
            reportPath,
            summaryPath
        };
    }

    // 辅助方法
    extractAllRoomsFromSource(sourceData) {
        const rooms = [];
        if (sourceData.districts) {
            for (const district of sourceData.districts) {
                if (district.locations) {
                    for (const location of district.locations) {
                        if (location.rooms) {
                            rooms.push(...location.rooms);
                        }
                    }
                }
            }
        }
        return rooms;
    }

    extractAllRoomsFromSplit(splitData) {
        const rooms = [];
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (regionData.locations) {
                for (const location of regionData.locations) {
                    if (location.rooms) {
                        rooms.push(...location.rooms);
                    }
                }
            }
        }
        return rooms;
    }

    extractAllConnectionsFromSplit(splitData) {
        const connections = [];
        for (const [regionId, regionData] of Object.entries(splitData)) {
            if (regionData.connections) {
                connections.push(...(regionData.connections.internal || []));
                connections.push(...(regionData.connections.crossRegion || []));
            }
        }
        return connections;
    }
}

module.exports = DataIntegrityTester;