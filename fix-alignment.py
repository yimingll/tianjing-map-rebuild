#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复欢迎界面对齐问题
使用 wcwidth 库精确计算字符显示宽度
"""

import unicodedata

def get_char_width(char):
    """获取字符的显示宽度"""
    # 获取字符的 East Asian Width 属性
    ea = unicodedata.east_asian_width(char)

    # F (Fullwidth) 和 W (Wide) 占2个宽度
    if ea in ('F', 'W'):
        return 2
    # A (Ambiguous) 根据情况，在等宽字体中通常是2
    elif ea == 'A':
        # 检查是否是某些特殊字符
        code = ord(char)
        # 边框字符
        if code in [0x2500, 0x2501, 0x2503, 0x250F, 0x2513, 0x2517, 0x251B,
                    0x2523, 0x252B, 0x253B, 0x254B, 0x2550, 0x2551, 0x2554,
                    0x2557, 0x255A, 0x255D, 0x2560, 0x2563, 0x2566, 0x2569,
                    0x256C, 0x250C, 0x2510, 0x2514, 0x2518, 0x251C, 0x2524,
                    0x252C, 0x2534, 0x253C]:
            return 1
        # 其他 Ambiguous 字符在等宽字体中占2
        return 2
    # N (Neutral), Na (Narrow), H (Halfwidth) 占1个宽度
    else:
        return 1

def get_string_width(s):
    """计算字符串的显示宽度"""
    return sum(get_char_width(c) for c in s)

def test_line(line, line_num):
    """测试一行的宽度"""
    width = get_string_width(line)
    expected = 72
    if width != expected:
        print(f"❌ 第 {line_num} 行: 宽度 {width} (期望 {expected}), 差值 {width - expected}")
        print(f"   {repr(line)}")
        return False
    else:
        print(f"✅ 第 {line_num} 行: 宽度正确 ({width})")
        return True

# 测试用例
test_lines = [
    '╔══════════════════════════════════════════════════════════════════════╗',
    '║                                                                      ║',
    '║         ╔═══╗                                          ╔═══╗         ║',
    '║         ║ ✦ ║          X I U X I A N    M U D          ║ ✦ ║         ║',
    '║           ✿~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~✿             ║',
    '║                     "以玄鉴之眼,观万世沉浮"                         ║',
    '║    ║  ✦ 仙界实时 ✦                                                ║  ║',
    '║    ┃  ⚡ 新手修士 - 创建账号                                     ┃  ║',
]

print("测试字符宽度计算:\n")
for i, line in enumerate(test_lines, 1):
    test_line(line, i)

# 输出特殊字符的宽度
print("\n特殊字符宽度:")
special_chars = ['✦', '✿', '⚡', '✨', '📖', '║', '╔', '═', '┃', '━']
for char in special_chars:
    print(f"  '{char}' (U+{ord(char):04X}): {get_char_width(char)} 宽")
