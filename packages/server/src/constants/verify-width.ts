/**
 * 验证欢迎界面每一行的宽度
 * 在等宽字体中，中文字符占2个宽度，英文字符占1个宽度
 */

import { WELCOME_BANNER, generateStatusInfo, WELCOME_GUIDE } from './welcome';

// 计算字符串的显示宽度（考虑中文字符占2个宽度）
function getDisplayWidth(str: string): number {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // 中文字符、全角符号等占2个宽度
    if (
      (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK统一汉字
      (code >= 0x3000 && code <= 0x303F) ||  // CJK符号和标点
      (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角ASCII、全角标点
      code === 0x3001 || code === 0x3002 ||  // 、。
      code === 0x201C || code === 0x201D ||  // ""
      code === 0x300A || code === 0x300B ||  // 《》
      code === 0x3010 || code === 0x3011 ||  // 【】
      code === 0x2764 || code === 0x26A1 ||  // ❤⚡
      code === 0x2728 || code === 0x1F4D6 || // ✨📖
      code === 0x273F || code === 0x2726     // ✿✦
    ) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// 验证每一行
function verifyLines(text: string, sectionName: string) {
  console.log(`\n===== 验证 ${sectionName} =====`);
  const lines = text.split('\n');
  let allCorrect = true;

  lines.forEach((line, index) => {
    const width = getDisplayWidth(line);
    const expected = 72; // 包括两侧的 ║ 符号
    if (width !== expected) {
      console.log(`❌ 第 ${index + 1} 行宽度不正确: ${width} (期望 ${expected})`);
      console.log(`   内容: "${line}"`);
      allCorrect = false;
    }
  });

  if (allCorrect) {
    console.log(`✅ 所有 ${lines.length} 行宽度正确！`);
  }
}

// 验证所有部分
console.log('开始验证欢迎界面宽度...\n');

verifyLines(WELCOME_BANNER, 'WELCOME_BANNER');

const statusInfo = generateStatusInfo({
  onlinePlayers: 42,
  version: '玄鉴初启 5.0.1',
  serverStatus: '稳定',
  lastUpdate: '炼丹系统已开放',
});
verifyLines(statusInfo, 'STATUS_INFO');

verifyLines(WELCOME_GUIDE, 'WELCOME_GUIDE');

console.log('\n验证完成！\n');
