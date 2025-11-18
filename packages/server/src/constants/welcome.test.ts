/**
 * 欢迎信息测试
 * 可以运行此文件查看欢迎界面效果
 */

import { WELCOME_BANNER, generateStatusInfo, WELCOME_GUIDE, getFullWelcomeMessage } from './welcome';

console.log('=== 测试欢迎横幅 ===');
console.log(WELCOME_BANNER);
console.log('\n');

console.log('=== 测试实时状态信息 ===');
const statusInfo = generateStatusInfo({
  onlinePlayers: 42,
  version: '玄鉴初启 5.0.1',
  serverStatus: '稳定',
  lastUpdate: '炼丹系统已开放',
});
console.log(statusInfo);
console.log('\n');

console.log('=== 测试入门指引 ===');
console.log(WELCOME_GUIDE);
console.log('\n');

console.log('=== 测试完整欢迎信息 ===');
const fullMessage = getFullWelcomeMessage({
  onlinePlayers: 42,
  version: '玄鉴初启 5.0.1',
  serverStatus: '稳定',
  lastUpdate: '炼丹系统已开放',
});
console.log(fullMessage);
