/**
 * NPC交互Action函数
 */

import { useNpcStore } from './npcStore';
import { talkToNpc, getNpcInfo } from './npcApi';

/**
 * 开始与NPC对话
 */
export async function startDialogueWithNpc(npcId: string, playerId: string) {
  const { setCurrentNpc, setCurrentDialogue, openDialogue, setLoading, setError } = useNpcStore.getState();

  try {
    setLoading(true);
    setError(null);

    // 获取NPC信息
    const npcInfo = await getNpcInfo(npcId);
    setCurrentNpc(npcInfo);

    // 开始对话
    const response = await talkToNpc({
      npcId,
      playerId,
    });

    if (response.success) {
      setCurrentDialogue(response.dialogue);
      openDialogue();
    } else {
      setError(response.message || '对话失败');
    }
  } catch (error) {
    console.error('开始对话失败:', error);
    setError('无法与NPC对话');
  } finally {
    setLoading(false);
  }
}

/**
 * 快速测试 - 与客栈老板对话
 */
export async function testTalkToInnkeeper(playerId: string) {
  return startDialogueWithNpc('npc_001', playerId);
}

/**
 * 快速测试 - 与铁匠对话
 */
export async function testTalkToBlacksmith(playerId: string) {
  return startDialogueWithNpc('npc_002', playerId);
}

/**
 * 快速测试 - 与药铺老者对话
 */
export async function testTalkToHerbalist(playerId: string) {
  return startDialogueWithNpc('npc_003', playerId);
}
