#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import io

# 设置标准输出编码为UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
"""
天京城地图连通性分析脚本
分析所有房间的连接情况、检查孤岛房间、连接对称性等
"""

import json
import sys
from collections import defaultdict, deque
from typing import Dict, List, Set, Tuple, Any

def load_map_data(file_paths: List[str]) -> Dict:
    """加载地图数据"""
    all_rooms = {}
    room_exits = {}
    room_info = {}

    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # 遍历所有区域和位置
            for district in data.get('districts', []):
                for location in district.get('locations', []):
                    for room in location.get('rooms', []):
                        room_id = room['id']
                        room_name = room['name']

                        # 收集房间信息
                        all_rooms[room_id] = room
                        room_info[room_id] = {
                            'name': room_name,
                            'type': room.get('type', 'unknown'),
                            'district': district.get('name', 'unknown'),
                            'location': location.get('name', 'unknown'),
                            'coordinates': room.get('coordinates', {}),
                            'description': room.get('description', '')
                        }

                        # 收集出口信息
                        exits = []
                        for exit_info in room.get('exits', []):
                            direction = exit_info['direction']
                            target = exit_info['targetRoomId']
                            description = exit_info.get('description', '')

                            exits.append({
                                'direction': direction,
                                'target': target,
                                'description': description
                            })

                        room_exits[room_id] = exits

        except Exception as e:
            print(f"错误：无法加载文件 {file_path}: {e}")
            continue

    return all_rooms, room_exits, room_info

def analyze_connectivity(room_exits: Dict[str, List[Dict]], room_info: Dict[str, Dict]) -> Dict:
    """分析地图连通性"""

    # 1. 总房间数
    total_rooms = len(room_exits)

    # 2. 构建连接图
    connection_graph = defaultdict(set)
    exit_details = defaultdict(list)

    for room_id, exits in room_exits.items():
        for exit_info in exits:
            target = exit_info['target']
            direction = exit_info['direction']
            description = exit_info['description']

            connection_graph[room_id].add(target)
            exit_details[(room_id, target)].append({
                'direction': direction,
                'description': description
            })

    # 3. 检查连接对称性
    asymmetric_connections = []
    missing_reverse_connections = []

    for room_id, targets in connection_graph.items():
        for target in targets:
            if target not in room_exits:
                # 目标房间不存在
                missing_reverse_connections.append({
                    'from': room_id,
                    'to': target,
                    'type': 'missing_target'
                })
            elif room_id not in connection_graph[target]:
                # 没有反向连接
                missing_reverse_connections.append({
                    'from': room_id,
                    'to': target,
                    'type': 'no_reverse',
                    'from_exit': exit_details[(room_id, target)][0] if (room_id, target) in exit_details else None
                })

    # 4. 找出核心枢纽房间（连接最多的房间）
    room_connections = {room_id: len(targets) for room_id, targets in connection_graph.items()}
    top_hub_rooms = sorted(room_connections.items(), key=lambda x: x[1], reverse=True)[:10]

    # 5. 检查连通性（使用BFS）
    if room_exits:
        start_room = next(iter(room_exits.keys()))
        reachable_rooms = bfs_connected_rooms(connection_graph, start_room)
        isolated_rooms = set(room_exits.keys()) - reachable_rooms

        # 如果有孤立房间，检查每个连通分量
        connected_components = []
        if isolated_rooms:
            visited = set()
            for room in room_exits:
                if room not in visited:
                    component = bfs_connected_rooms(connection_graph, room)
                    connected_components.append(component)
                    visited.update(component)
        else:
            connected_components = [reachable_rooms]

    # 6. 房间类型统计
    room_types = defaultdict(int)
    district_stats = defaultdict(int)

    for room_id, info in room_info.items():
        room_types[info['type']] += 1
        district_stats[info['district']] += 1

    # 7. 方向统计
    direction_stats = defaultdict(int)
    for room_id, exits in room_exits.items():
        for exit_info in exits:
            direction_stats[exit_info['direction']] += 1

    return {
        'total_rooms': total_rooms,
        'connection_graph': dict(connection_graph),
        'asymmetric_connections': asymmetric_connections,
        'missing_reverse_connections': missing_reverse_connections,
        'top_hub_rooms': top_hub_rooms,
        'isolated_rooms': list(isolated_rooms) if 'isolated_rooms' in locals() else [],
        'connected_components': connected_components if 'connected_components' in locals() else [],
        'room_types': dict(room_types),
        'district_stats': dict(district_stats),
        'direction_stats': dict(direction_stats),
        'room_connections': room_connections
    }

def bfs_connected_rooms(graph: Dict[str, Set[str]], start: str) -> Set[str]:
    """使用BFS找出所有连通的房间"""
    visited = set()
    queue = deque([start])

    while queue:
        current = queue.popleft()
        if current not in visited:
            visited.add(current)
            # 只添加实际存在的房间
            for neighbor in graph.get(current, set()):
                if neighbor in graph:  # 确保目标房间存在
                    queue.append(neighbor)

    return visited

def print_connectivity_report(analysis: Dict, room_info: Dict[str, Dict]):
    """打印连通性分析报告"""

    print("=" * 80)
    print("天京城地图连通性分析报告")
    print("=" * 80)

    # 1. 基本统计
    print(f"\n1. 基本统计")
    print("-" * 40)
    print(f"总房间数: {analysis['total_rooms']}")
    print(f"预期房间数: 140")
    if analysis['total_rooms'] == 140:
        print("房间数量检查: [OK] 正确")
    else:
        print(f"房间数量检查: [ERROR] 错误 (相差 {140 - analysis['total_rooms']})")

    # 2. 连通性分析
    print(f"\n2. 连通性分析")
    print("-" * 40)
    if analysis['connected_components']:
        print(f"连通分量数量: {len(analysis['connected_components'])}")
        for i, component in enumerate(analysis['connected_components'], 1):
            print(f"  连通分量 {i}: {len(component)} 个房间")
            if len(component) <= 10:
                for room_id in component:
                    room_name = room_info.get(room_id, {}).get('name', room_id)
                    print(f"    - {room_name} ({room_id})")

    if analysis['isolated_rooms']:
        print(f"\n[WARNING] 发现 {len(analysis['isolated_rooms'])} 个孤立房间:")
        for room_id in analysis['isolated_rooms']:
            room_name = room_info.get(room_id, {}).get('name', room_id)
            print(f"  - {room_name} ({room_id})")
    else:
        print("[OK] 没有发现孤立房间，所有房间都是连通的")

    # 3. 连接对称性检查
    print(f"\n3. 连接对称性检查")
    print("-" * 40)
    missing_reverses = analysis['missing_reverse_connections']

    if missing_reverses:
        print(f"[WARNING] 发现 {len(missing_reverses)} 个不对称连接:")

        missing_targets = [c for c in missing_reverses if c['type'] == 'missing_target']
        no_reverse = [c for c in missing_reverses if c['type'] == 'no_reverse']

        if missing_targets:
            print(f"\n  指向不存在房间的连接 ({len(missing_targets)} 个):")
            for conn in missing_targets[:10]:  # 只显示前10个
                from_name = room_info.get(conn['from'], {}).get('name', conn['from'])
                print(f"    {from_name} -> {conn['to']} (目标不存在)")
            if len(missing_targets) > 10:
                print(f"    ... 还有 {len(missing_targets) - 10} 个")

        if no_reverse:
            print(f"\n  缺少反向连接的房间 ({len(no_reverse)} 个):")
            for conn in no_reverse[:10]:  # 只显示前10个
                from_name = room_info.get(conn['from'], {}).get('name', conn['from'])
                to_name = room_info.get(conn['to'], {}).get('name', conn['to'])
                exit_info = conn.get('from_exit', {})
                direction = exit_info.get('direction', 'unknown') if exit_info else 'unknown'
                print(f"    {from_name} ({direction}->) {to_name}")
                print(f"    但 {to_name} 没有返回 {from_name} 的连接")
            if len(no_reverse) > 10:
                print(f"    ... 还有 {len(no_reverse) - 10} 个")
    else:
        print("[OK] 所有连接都是对称的")

    # 4. 核心枢纽房间
    print(f"\n4. 核心枢纽房间 (连接最多的房间)")
    print("-" * 40)
    print("排名 房间名称 类型 连接数")
    print("-" * 50)

    for i, (room_id, connections) in enumerate(analysis['top_hub_rooms'], 1):
        room_name = room_info.get(room_id, {}).get('name', room_id)
        room_type = room_info.get(room_id, {}).get('type', 'unknown')
        print(f"{i:2d}. {room_name[:20]:20s} {room_type[:10]:10s} {connections:3d}")

    # 5. 房间类型分布
    print(f"\n5. 房间类型分布")
    print("-" * 40)
    room_types = analysis['room_types']
    sorted_types = sorted(room_types.items(), key=lambda x: x[1], reverse=True)

    for room_type, count in sorted_types:
        print(f"{room_type:20s}: {count:3d} 个房间")

    # 6. 区域分布
    print(f"\n6. 区域分布")
    print("-" * 40)
    district_stats = analysis['district_stats']
    sorted_districts = sorted(district_stats.items(), key=lambda x: x[1], reverse=True)

    for district, count in sorted_districts:
        print(f"{district:20s}: {count:3d} 个房间")

    # 7. 方向统计
    print(f"\n7. 方向使用统计")
    print("-" * 40)
    direction_stats = analysis['direction_stats']
    sorted_directions = sorted(direction_stats.items(), key=lambda x: x[1], reverse=True)

    print(f"{'方向':10s}: {'数量':5s}")
    print("-" * 20)
    for direction, count in sorted_directions:
        print(f"{direction:10s}: {count:5d}")

    # 8. 连接问题总结
    print(f"\n8. 连接问题总结")
    print("-" * 40)

    issues = []
    if analysis['total_rooms'] != 140:
        issues.append(f"房间数量不匹配 (实际: {analysis['total_rooms']}, 预期: 140)")

    if analysis['isolated_rooms']:
        issues.append(f"存在 {len(analysis['isolated_rooms'])} 个孤立房间")

    missing_count = len([c for c in analysis['missing_reverse_connections'] if c['type'] == 'missing_target'])
    if missing_count > 0:
        issues.append(f"存在 {missing_count} 个指向不存在房间的连接")

    no_reverse_count = len([c for c in analysis['missing_reverse_connections'] if c['type'] == 'no_reverse'])
    if no_reverse_count > 0:
        issues.append(f"存在 {no_reverse_count} 个不对称连接")

    if len(analysis['connected_components']) > 1:
        issues.append(f"地图不连通，有 {len(analysis['connected_components'])} 个连通分量")

    if not issues:
        print("[OK] 没有发现严重的连接问题")
    else:
        print("[WARNING] 发现以下问题:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")

    print("\n" + "=" * 80)

def main():
    """主函数"""
    map_files = [
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part1.json",
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part2.json",
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part3.json"
    ]

    print("正在加载地图数据...")
    all_rooms, room_exits, room_info = load_map_data(map_files)

    if not room_exits:
        print("错误：未能加载任何房间数据")
        return

    print("正在分析连通性...")
    analysis = analyze_connectivity(room_exits, room_info)

    print("\n生成分析报告...")
    print_connectivity_report(analysis, room_info)

    # 可选：保存分析结果到文件
    try:
        with open("D:\\mud\\ceshi3\\connectivity_analysis_result.json", 'w', encoding='utf-8') as f:
            # 准备可序列化的数据
            serializable_analysis = {
                'total_rooms': analysis['total_rooms'],
                'isolated_rooms': analysis['isolated_rooms'],
                'connected_components_count': len(analysis['connected_components']),
                'missing_reverse_connections': analysis['missing_reverse_connections'],
                'top_hub_rooms': analysis['top_hub_rooms'][:20],  # 只保存前20个
                'room_types': analysis['room_types'],
                'district_stats': analysis['district_stats'],
                'direction_stats': analysis['direction_stats']
            }

            json.dump(serializable_analysis, f, ensure_ascii=False, indent=2)
            print(f"\n分析结果已保存到: D:\\mud\\ceshi3\\connectivity_analysis_result.json")
    except Exception as e:
        print(f"保存分析结果时出错: {e}")

if __name__ == "__main__":
    main()