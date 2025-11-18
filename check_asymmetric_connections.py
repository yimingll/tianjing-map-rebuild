#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import io
import json

# 设置标准输出编码为UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def load_room_data(file_paths):
    """加载所有房间数据"""
    rooms = {}
    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            for district in data.get('districts', []):
                for location in district.get('locations', []):
                    for room in location.get('rooms', []):
                        room_id = room['id']
                        rooms[room_id] = room
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    return rooms

def check_connection(room_id, rooms, visited=None, path=None):
    """递归检查房间连通性"""
    if visited is None:
        visited = set()
    if path is None:
        path = []

    if room_id in visited:
        return False, []

    visited.add(room_id)
    path.append(room_id)

    if room_id not in rooms:
        return False, path

    room = rooms[room_id]
    exits = room.get('exits', [])

    for exit_info in exits:
        target = exit_info['targetRoomId']
        direction = exit_info['direction']

        # 检查这个连接是否对称
        if target in rooms:
            target_room = rooms[target]
            has_reverse = False
            reverse_direction = None

            for target_exit in target_room.get('exits', []):
                if target_exit['targetRoomId'] == room_id:
                    has_reverse = True
                    reverse_direction = target_exit['direction']
                    break

            if not has_reverse:
                return False, [room_id, target, direction]

    # 递归检查所有连接
    for exit_info in exits:
        target = exit_info['targetRoomId']
        if target != room_id:  # 避免自循环
            is_symmetric, problematic_path = check_connection(target, rooms, visited.copy(), path.copy())
            if not is_symmetric:
                return False, problematic_path

    return True, []

def main():
    map_files = [
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part1.json",
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part2.json",
        "D:\\mud\\ceshi3\\packages\\server\\data\\maps\\dazhou\\tianjing_fu\\tianjing_cheng_part3.json"
    ]

    print("正在详细检查不对称连接...")

    rooms = load_room_data(map_files)
    print(f"加载了 {len(rooms)} 个房间")

    asymmetric_connections = []

    # 检查所有连接
    for room_id, room in rooms.items():
        room_name = room.get('name', room_id)
        exits = room.get('exits', [])

        for exit_info in exits:
            direction = exit_info['direction']
            target_id = exit_info['targetRoomId']
            target_desc = exit_info.get('description', '')

            if target_id not in rooms:
                continue  # 跳过不存在的目标

            target_room = rooms[target_id]
            target_name = target_room.get('name', target_id)

            # 检查是否有反向连接
            has_reverse = False
            reverse_direction = None
            reverse_desc = None

            for target_exit in target_room.get('exits', []):
                if target_exit['targetRoomId'] == room_id:
                    has_reverse = True
                    reverse_direction = target_exit['direction']
                    reverse_desc = target_exit.get('description', '')
                    break

            if not has_reverse:
                asymmetric_connections.append({
                    'from_id': room_id,
                    'from_name': room_name,
                    'from_type': room.get('type', 'unknown'),
                    'from_district': room.get('district', 'unknown'),
                    'direction': direction,
                    'description': target_desc,
                    'to_id': target_id,
                    'to_name': target_name,
                    'to_type': target_room.get('type', 'unknown'),
                    'to_district': target_room.get('district', 'unknown')
                })

    print(f"\n发现 {len(asymmetric_connections)} 个不对称连接:\n")

    for i, conn in enumerate(asymmetric_connections, 1):
        print(f"{i}. {conn['from_name']} ({conn['from_id']})")
        print(f"   类型: {conn['from_type']}")
        print(f"   区域: {conn['from_district']}")
        print(f"   方向: {conn['direction']} -> {conn['to_name']} ({conn['to_id']})")
        print(f"   描述: {conn['description']}")
        print(f"   目标类型: {conn['to_type']}")
        print(f"   目标区域: {conn['to_district']}")
        print(f"   问题: {conn['to_name']} 没有返回 {conn['from_name']} 的连接\n")

    # 检查具体的两个已知问题
    print("=" * 80)
    print("详细分析已知问题:")
    print("=" * 80)

    problems = [
        ('tj_palace_square', 'tj_ministry_plaza'),
        ('tj_gate_north_inside', 'tj_palace_square')
    ]

    for from_id, to_id in problems:
        if from_id in rooms and to_id in rooms:
            from_room = rooms[from_id]
            to_room = rooms[to_id]

            print(f"\n检查连接: {from_room['name']} -> {to_room['name']}")

            # 找到具体的出口
            from_exit = None
            for exit_info in from_room.get('exits', []):
                if exit_info['targetRoomId'] == to_id:
                    from_exit = exit_info
                    break

            if from_exit:
                print(f"  出口信息: {from_exit['direction']} - {from_exit['description']}")

            # 检查反向
            has_reverse = False
            reverse_exit = None
            for exit_info in to_room.get('exits', []):
                if exit_info['targetRoomId'] == from_id:
                    has_reverse = True
                    reverse_exit = exit_info
                    break

            if has_reverse:
                print(f"  反向连接: {reverse_exit['direction']} - {reverse_exit['description']}")
            else:
                print(f"  [ERROR] 缺少反向连接!")
                print(f"  建议添加: 在 {to_room['name']} 中添加指向 {from_room['name']} 的连接")

    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()