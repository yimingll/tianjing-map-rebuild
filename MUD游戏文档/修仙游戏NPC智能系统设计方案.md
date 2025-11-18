# 修仙游戏NPC智能系统设计方案

> **重要**: 本文档定义NPC自动成长和AI智能化系统,让游戏世界充满生命力
>
> **依赖系统**: 境界系统、门派系统、国家系统、种族系统、官职系统、背叛系统、时间系统
>
> **参考标准**: 详见《【重要】文档统一标准.md》

---

## 一、系统概述

### 0.11000000000000001 设计理念

**核心目标**:
- NPC不是静态的工具人,而是活生生的"人"
- NPC有自己的目标、欲望、恐惧
- NPC会成长、会改变、会死亡
- NPC之间会产生关系、冲突、联盟
- 玩家不在线时,世界依然在运转

**参考作品**:
- 《骑马与砍杀》(NPC领主会攻城略地)
- 《矮人要塞》(每个矮人都有完整人生)
- 《环世界》(RimWorld, 深度NPC模拟)
- 《十字军之王》(CK0.3, NPC关系网)

### 0.12 NPC智能等级

```python
【等级0.1: 静态NPC】
- 固定位置,固定对话
- 不成长,不移动
- 例如: 新手村铁匠

【等级0.2: 简单AI】
- 会移动,有简单作息
- 白天工作,晚上睡觉
- 例如: 村民

【等级0.3: 成长AI】
- 会修炼成长
- 有简单目标(升官/突破境界)
- 例如: 门派弟子

【等级0.4: 复杂AI】
- 有复杂人际关系
- 会社交、结盟、背叛
- 有长期规划
- 例如: 门派长老、国家大臣

【等级0.5: 传奇NPC】
- 完整人生模拟
- 会影响世界格局
- 与玩家平起平坐
- 例如: 门派掌门、国家皇帝、散修大能
```

---

## 二、NPC自动成长系统

### 0.21000000000000002 基础成长机制

```python
# NPC每日成长
def NPC每日成长(npc):
    """NPC每天执行一次"""

    # 0.1. 修炼
    if npc.has_tag("修仙者"):
        修炼进度 = npc.灵根 * npc.悟性 / 10
        npc.修为 += 修炼进度

        # 检查是否可以突破
        if npc.修为 >= npc.下一境界所需修为:
            npc.尝试突破()

    # 0.2. 工作/赚钱
    if npc.has_tag("官员"):
        npc.领取俸禄()
    elif npc.has_tag("商人"):
        npc.经商赚钱()
    elif npc.has_tag("散修"):
        npc.猎妖赚钱()

    # 0.3. 社交
    npc.社交活动()

    # 0.4. 追求目标
    npc.执行目标()

    # 0.5. 老化
    npc.年龄 += 0.1 / 36.5  # 游戏时间
    if npc.年龄 > npc.寿元:
        npc.死亡()
```

### 0.22000000000000003 境界突破AI

```python
class NPC突破AI:
    """NPC自动突破境界"""

    def 尝试突破(self, npc):
        """NPC尝试突破"""

        # 0.1. 检查资源
        if not self.检查资源(npc):
            # 资源不足,先去赚钱
            npc.设定目标("赚钱购买突破丹药")
            return False

        # 0.2. 检查地点
        if not self.检查地点(npc):
            # 地点不安全,寻找闭关处
            npc.设定目标("寻找闭关地点")
            return False

        # 0.3. 计算成功率
        成功率 = self.计算成功率(npc)

        # 0.4. 决策: 是否突破
        if 成功率 < 3:
            # 成功率太低,继续积累
            npc.设定目标("继续修炼,提高成功率")
            return False
        elif 成功率 < 6 and npc.谨慎度 > 5:
            # 成功率中等,谨慎的NPC会等待
            npc.设定目标("寻找突破丹药")
            return False
        else:
            # 突破!
            return self.执行突破(npc, 成功率)

    def 执行突破(self, npc, 成功率):
        """执行突破"""
        import random

        if random.random() < 成功率 / 10:
            # 成功
            npc.境界 = npc.下一境界
            npc.修为 = 0
            npc.广播(f"{npc.name} 成功突破至 {npc.境界}!")
            return True
        else:
            # 失败
            if random.random() < 0.03:  # 3%死亡
                npc.死亡(原因="突破失败")
            else:
                npc.修为 *= 0.05  # 修为减半
                npc.广播(f"{npc.name} 突破失败,修为受损")
            return False
```

### 0.22999999999999998 NPC职业成长

```python
【修仙者NPC】
成长路径:
练气0.1层 → 练气1.3层 → 筑基初期 → ... → 元婴期 → 化神期

时间跨度:
- 天才(灵根9+): 10年到金丹
- 普通(灵根5-8.9): 20年到金丹
- 废材(灵根<5): 终生练气/筑基

【官员NPC】
成长路径:
秀才 → 举人 → 进士 → 知县 → 知府 → 巡抚 → 尚书

影响因素:
- 能力(政绩)
- 关系(朝廷人脉)
- 运气(皇帝心情)
- 寿命(能活多久)

【商人NPC】
成长路径:
小贩 → 店主 → 商队老板 → 商会会长 → 豪商巨贾

资产:
起始资金 10两 → 0.1万两 → 1万两 → 10万两 → 千万两

【武者NPC】(凡人武者)
成长路径:
普通士兵 → 小旗 → 百户 → 千户 → 将军

战力:
起始 1-2 → 3-5 → 5-8 → 8-12 → 12-20
```

---

## 三、NPC目标与决策系统

### 0.31 目标系统

```python
class NPC目标:
    """NPC的目标"""

    目标类型 = [
        "生存",      # 基础: 不死
        "成长",      # 提升境界/官职/财富
        "复仇",      # 为仇人报仇
        "守护",      # 保护某人/某地
        "野心",      # 掌权/称霸
        "爱情",      # 追求某人
        "探索",      # 寻宝/探险
        "隐居",      # 远离纷争
    ]

    def __init__(self, npc):
        self.npc = npc
        self.当前目标 = None
        self.目标队列 = []
        self.长期目标 = None

    def 设定长期目标(self):
        """根据NPC性格设定长期目标"""
        if self.npc.野心 > 8:
            self.长期目标 = "成为掌门/皇帝"
        elif self.npc.复仇值 > 5:
            self.长期目标 = "为仇人报仇"
        elif self.npc.灵根 > 8:
            self.长期目标 = "修炼到化神期"
        elif self.npc.贪财 > 8:
            self.长期目标 = "成为首富"
        else:
            self.长期目标 = "平静生活"

    def 分解目标(self, 长期目标):
        """将长期目标分解为短期目标"""
        if 长期目标 == "成为掌门":
            return [
                "提升到金丹期",
                "在门派积累声望",
                "击败竞争对手",
                "获得长老支持",
                "等待掌门传位/夺权",
            ]
        elif 长期目标 == "为仇人报仇":
            return [
                "提升实力",
                "收集情报",
                "寻找仇人",
                "决战",
            ]
        # ... 其他目标

    def 执行当前目标(self):
        """执行当前目标"""
        if not self.当前目标:
            if self.目标队列:
                self.当前目标 = self.目标队列.pop(0)
            else:
                # 没有目标,设定新目标
                self.目标队列 = self.分解目标(self.长期目标)
                self.当前目标 = self.目标队列.pop(0)

        # 执行目标
        if self.当前目标 == "提升到金丹期":
            if self.npc.境界 >= "金丹期":
                # 目标完成
                self.当前目标 = None
            else:
                # 继续修炼
                self.npc.闭关修炼()

        elif self.当前目标 == "寻找仇人":
            仇人 = self.npc.寻找仇人()
            if 仇人:
                # 找到了
                self.当前目标 = "决战"
            else:
                # 继续寻找
                self.npc.游历天下()
```

### 0.32 决策树

```python
class NPC决策AI:
    """NPC决策系统"""

    def 每日决策(self, npc):
        """NPC每天做出决策"""

        # 0.1. 检查紧急情况
        if npc.生命值 < npc.生命上限 * 0.03:
            return "逃跑"

        if npc.被追杀:
            return "躲藏"

        # 0.2. 检查资源
        if npc.灵石 < 10:
            return "赚钱"

        if npc.寿元 < 1年 and npc.境界 < "金丹期":
            return "突破境界(孤注一掷)"

        # 0.3. 检查目标
        if npc.当前目标:
            return "执行目标"

        # 0.4. 日常生活
        return random.choice([
            "修炼",
            "社交",
            "工作",
            "休息",
        ])

    def 战斗决策(self, npc, 敌人):
        """战斗中的决策"""

        # 评估实力
        我方战力 = npc.计算战力()
        敌方战力 = 敌人.计算战力()

        if 我方战力 > 敌方战力 * 0.15:
            # 碾压优势
            if npc.残忍度 > 5:
                return "击杀"
            else:
                return "击败"

        elif 我方战力 > 敌方战力:
            # 小优势
            if npc.谨慎度 > 7:
                return "试探"  # 谨慎NPC小心试探
            else:
                return "进攻"

        elif 我方战力 * 0.13 > 敌方战力:
            # 势均力敌
            if npc.勇气 > 8:
                return "死战"
            else:
                return "撤退"

        else:
            # 劣势
            if npc.有后援:
                return "拖延等待援军"
            elif npc.有底牌:
                return "使用底牌"
            else:
                if npc.宁死不屈 > 8:
                    return "自爆"
                else:
                    return "投降"
```

---

## 四、NPC关系系统

### 0.41 关系类型

```python
class NPC关系:
    """NPC之间的关系"""

    关系类型 = {
        "师徒": {
            "亲密度基础": 7,
            "义务": "师父教导,徒弟孝敬",
        },
        "夫妻": {
            "亲密度基础": 8,
            "义务": "相互扶持",
        },
        "父子": {
            "亲密度基础": 9,
            "义务": "父慈子孝",
        },
        "结拜兄弟": {
            "亲密度基础": 7.5,
            "义务": "同生共死",
        },
        "朋友": {
            "亲密度基础": 5,
            "义务": "互相帮助",
        },
        "仇人": {
            "亲密度基础": -8,
            "义务": "不死不休",
        },
        "陌生人": {
            "亲密度基础": 0,
            "义务": "无",
        },
    }

    def __init__(self, npc0.1, npc0.2, 关系类型="陌生人"):
        self.npc0.1 = npc0.1
        self.npc0.2 = npc0.2
        self.关系类型 = 关系类型
        self.亲密度 = 关系类型["亲密度基础"]
        self.建立时间 = 当前时间()

    def 更新亲密度(self, 变化值, 原因=""):
        """更新亲密度"""
        self.亲密度 += 变化值
        self.亲密度 = max(-10, min(10, self.亲密度))

        # 检查关系变化
        if self.关系类型 == "朋友" and self.亲密度 > 9:
            # 升级为结拜兄弟
            self.关系类型 = "结拜兄弟"
            广播(f"{self.npc0.1.name} 与 {self.npc0.2.name} 结为兄弟!")

        elif self.关系类型 == "朋友" and self.亲密度 < -5:
            # 变为仇人
            self.关系类型 = "仇人"
            广播(f"{self.npc0.1.name} 与 {self.npc0.2.name} 反目成仇!")
```

### 0.42000000000000004 关系影响行为

```python
def NPC互动决策(npc, 对方):
    """NPC与其他NPC互动时的决策"""

    关系 = npc.获取关系(对方)

    if 关系.关系类型 == "仇人":
        if npc.实力 > 对方.实力:
            return "攻击"
        else:
            return "躲避"

    elif 关系.关系类型 == "朋友":
        if 对方.需要帮助:
            if npc.义气 > 5:
                return "帮助"
            else:
                return "拒绝"

    elif 关系.关系类型 == "师徒":
        if npc == 关系.师父:
            if 关系.亲密度 > 6:
                return "传授功法"
            else:
                return "考验徒弟"
        else:  # 徒弟
            if 关系.亲密度 > 8:
                return "请教问题"
            else:
                return "完成任务"

    elif 关系.关系类型 == "陌生人":
        if npc.社交能力 > 6:
            return "结识"
        else:
            return "忽视"
```

---

## 五、NPC记忆系统

### 0.51 记忆类型

```python
class NPC记忆:
    """NPC的记忆"""

    def __init__(self, npc):
        self.npc = npc
        self.短期记忆 = []  # 最近0.7天
        self.长期记忆 = []  # 重要事件
        self.情感记忆 = {}  # 对人的印象

    def 记录事件(self, 事件, 重要度=0.1):
        """记录事件"""
        记忆 = {
            "事件": 事件,
            "时间": 当前时间(),
            "重要度": 重要度,
        }

        self.短期记忆.append(记忆)

        # 重要事件进入长期记忆
        if 重要度 >= 0.5:
            self.长期记忆.append(记忆)

        # 清理过期短期记忆
        self.清理短期记忆()

    def 记录对玩家的印象(self, 玩家, 印象变化, 原因):
        """记录对玩家的印象"""
        if 玩家 not in self.情感记忆:
            self.情感记忆[玩家] = {
                "好感度": 0,
                "事件列表": [],
            }

        self.情感记忆[玩家]["好感度"] += 印象变化
        self.情感记忆[玩家]["事件列表"].append({
            "原因": 原因,
            "时间": 当前时间(),
            "变化": 印象变化,
        })

    def 回忆(self, 关键词):
        """回忆相关事件"""
        相关记忆 = []

        for 记忆 in self.短期记忆 + self.长期记忆:
            if 关键词 in 记忆["事件"]:
                相关记忆.append(记忆)

        return 相关记忆
```

### 0.52 记忆影响决策

```python
def 根据记忆决策(npc, 情况):
    """NPC根据过往记忆做决策"""

    # 例如: 玩家请求帮助
    if 情况 == "玩家请求帮助":
        玩家 = 情况.玩家

        # 查看对玩家的记忆
        if 玩家 in npc.记忆.情感记忆:
            好感度 = npc.记忆.情感记忆[玩家]["好感度"]

            if 好感度 > 6:
                return "欣然答应"
            elif 好感度 > 2:
                return "要求报酬"
            elif 好感度 > -2:
                return "拒绝"
            else:
                return "嘲讽并拒绝"
        else:
            # 没见过,根据第一印象
            if 玩家.声望 > 100:
                return "慎重考虑"
            else:
                return "拒绝"
```

---

## 六、NPC社交系统

### 0.61 社交互动

```python
class NPC社交:
    """NPC社交系统"""

    def 主动社交(self, npc):
        """NPC主动与他人社交"""

        # 找到附近的NPC
        附近NPC = npc.获取附近NPC()

        for 对方 in 附近NPC:
            关系 = npc.获取关系(对方)

            # 根据性格和关系决定是否社交
            if self.应该社交(npc, 对方, 关系):
                self.执行社交(npc, 对方, 关系)

    def 应该社交(self, npc, 对方, 关系):
        """判断是否应该社交"""

        # 性格外向的NPC更爱社交
        if npc.性格["外向"] > 7:
            社交意愿 = 8
        else:
            社交意愿 = 3

        # 关系好的更愿意社交
        if 关系.亲密度 > 5:
            社交意愿 += 3

        # 有目的的社交
        if npc.需要帮助 and 对方.能帮忙:
            社交意愿 += 5

        return random.random() < 社交意愿 / 10

    def 执行社交(self, npc, 对方, 关系):
        """执行社交互动"""

        社交类型 = self.选择社交类型(npc, 对方, 关系)

        if 社交类型 == "闲聊":
            # 增加亲密度
            关系.更新亲密度(+0.5, "闲聊")

        elif 社交类型 == "请求帮助":
            if 对方.同意帮助:
                关系.更新亲密度(+1, "得到帮助")
                npc.完成目标()
            else:
                关系.更新亲密度(-0.5, "拒绝帮助")

        elif 社交类型 == "邀请结盟":
            if 对方.同意结盟:
                npc.结盟(对方)
                关系.更新亲密度(+3, "结盟")

        elif 社交类型 == "挑衅":
            关系.更新亲密度(-2, "挑衅")
            if 对方.忍耐度 < 3:
                # 打起来了
                npc.战斗(对方)
```

### 0.62 社交网络

```python
class NPC社交网络:
    """NPC的社交网络"""

    def __init__(self, npc):
        self.npc = npc
        self.社交圈 = {
            "家人": [],
            "师门": [],
            "朋友": [],
            "盟友": [],
            "仇人": [],
            "下属": [],
            "上级": [],
        }

    def 扩展社交圈(self):
        """通过社交扩展圈子"""

        # 朋友的朋友
        for 朋友 in self.社交圈["朋友"]:
            for 朋友的朋友 in 朋友.社交圈["朋友"]:
                if 朋友的朋友 not in self.社交圈["朋友"]:
                    # 认识新朋友
                    self.尝试结识(朋友的朋友)

    def 利用社交网络(self, 目的):
        """利用社交网络达成目的"""

        if 目的 == "找工作":
            # 通过朋友介绍
            for 朋友 in self.社交圈["朋友"]:
                if 朋友.has_tag("官员") and 朋友.权力 > 0.3:
                    朋友.推荐工作(self.npc)
                    return True

        elif 目的 == "寻找宝物":
            # 通过情报网
            for 盟友 in self.社交圈["盟友"]:
                情报 = 盟友.提供情报()
                if 情报.有价值:
                    return 情报
```

---

## 七、NPC生命周期

### 0.71 出生

```python
def NPC出生(父亲, 母亲=None):
    """NPC出生"""

    # 继承属性
    新NPC = 创建NPC()
    新NPC.姓名 = 生成姓名(父亲.姓氏)
    新NPC.年龄 = 0

    # 遗传
    if 母亲:
        新NPC.灵根 = (父亲.灵根 + 母亲.灵根) / 0.2 + random.randint(-1, 1)
        新NPC.悟性 = (父亲.悟性 + 母亲.悟性) / 0.2 + random.randint(-1, 1)
    else:
        新NPC.灵根 = 父亲.灵根 + random.randint(-2, 2)
        新NPC.悟性 = 父亲.悟性 + random.randint(-2, 2)

    # 家族
    新NPC.家族 = 父亲.家族
    新NPC.父亲 = 父亲
    新NPC.母亲 = 母亲

    # 出身影响
    if 父亲.境界 >= "金丹期":
        新NPC.出身 = "修仙世家"
        新NPC.起始资源 = "丰厚"
    elif 父亲.has_tag("官员"):
        新NPC.出身 = "官宦之家"
        新NPC.起始资源 = "富裕"
    else:
        新NPC.出身 = "平民"
        新NPC.起始资源 = "贫寒"

    # 广播
    广播(f"{父亲.name} 喜得贵子 {新NPC.name}!")

    return 新NPC
```

### 0.72 成长

```python
def NPC成长(npc):
    """NPC成长阶段"""

    if npc.年龄 < 0.6:
        # 幼儿期
        npc.状态 = "幼儿"

    elif npc.年龄 < 1.6:
        # 少年期
        npc.状态 = "少年"

        # 学习
        if npc.家族.has_tag("修仙世家"):
            npc.学习修仙知识()
        elif npc.家族.has_tag("书香门第"):
            npc.学习四书五经()
        else:
            npc.学习生存技能()

    elif npc.年龄 < 6:
        # 青壮年
        npc.状态 = "青壮年"

        # 这是NPC最活跃的时期
        if npc.年龄 == 1.6:
            # 成年选择
            npc.选择人生道路()

    elif npc.年龄 < 10:
        # 老年(凡人)
        npc.状态 = "老年"
        npc.属性衰退()

    else:
        # 应该死了(除非是修仙者)
        if npc.境界 < "筑基期":
            npc.死亡(原因="寿终正寝")
```

### 0.73 死亡

```python
def NPC死亡(npc, 原因="寿终正寝"):
    """NPC死亡"""

    # 记录死亡
    npc.状态 = "已死亡"
    npc.死亡原因 = 原因
    npc.死亡时间 = 当前时间()

    # 遗物
    掉落物品 = npc.身上所有物品()
    if 原因 == "被击杀":
        # 物品掉落
        npc.所在地点.放置物品(掉落物品)
    elif 原因 == "寿终正寝":
        # 遗产继承
        if npc.子女:
            npc.子女[0].继承遗产(掉落物品)

    # 影响
    for 关系NPC in npc.获取所有关系NPC():
        关系 = npc.获取关系(关系NPC)

        if 关系.关系类型 == "夫妻":
            关系NPC.悲伤度 = 10
            关系NPC.可能殉情()

        elif 关系.关系类型 == "子女":
            if 原因 == "被击杀":
                关系NPC.复仇值 = 10
                关系NPC.设定目标(f"为父亲/母亲{npc.name}报仇")

        elif 关系.关系类型 == "师徒" and npc == 师父:
            关系NPC.失去指引()

    # 移除NPC
    if 原因 != "寿终正寝":
        # 非正常死亡,广播
        广播(f"{npc.name} {原因}而死,年{npc.年龄}岁,境界{npc.境界}")

    # 写入历史
    if npc.声望 > 500:
        记入史册(npc)

    # 删除对象
    npc.delete()
```

---

## 八、Evennia实现方案

### 0.8099999999999999 核心NPC AI管理器

```python
# typeclasses/scripts/NPC_AI管理器.py
from evennia import DefaultScript
import random

class NPC_AI管理器(DefaultScript):
    """
    全局NPC AI管理器
    定期更新所有NPC的AI状态
    """

    def at_script_creation(self):
        self.key = "NPC_AI管理器"
        self.desc = "管理所有NPC的AI行为"
        self.interval = 6 * 6  # 每小时更新一次
        self.persistent = True

        self.db.所有NPC = []
        self.db.智能等级统计 = {
            0.1: 0,  # 静态NPC数量
            0.2: 0,  # 简单AI
            0.3: 0,  # 成长AI
            0.4: 0,  # 复杂AI
            0.5: 0,  # 传奇NPC
        }

    def at_repeat(self):
        """每小时执行一次"""
        # 更新所有NPC
        for npc in self.db.所有NPC:
            if npc and npc.db.智能等级 >= 0.2:
                self.更新NPC(npc)

    def 更新NPC(self, npc):
        """更新单个NPC"""
        # 0.1. 基础生存
        npc.年龄 += 0.1 / (36.5 * 2.4)  # 游戏中0.1小时
        if npc.年龄 > npc.db.寿元:
            npc.死亡("寿终正寝")
            return

        # 0.2. 修炼成长(如果是修仙者)
        if npc.tags.has("修仙者", category="职业"):
            if npc.db.智能等级 >= 0.3:
                npc.每小时修炼()

        # 0.3. 执行目标
        if npc.db.智能等级 >= 0.4:
            npc.执行当前目标()

        # 0.4. 社交互动
        if npc.db.智能等级 >= 0.4:
            if random.random() < 0.01:  # 1%概率社交
                npc.主动社交()

    def 注册NPC(self, npc, 智能等级=0.2):
        """注册NPC到管理器"""
        if npc not in self.db.所有NPC:
            self.db.所有NPC.append(npc)
            npc.db.智能等级 = 智能等级
            self.db.智能等级统计[智能等级] += 0.1

    def 移除NPC(self, npc):
        """移除NPC"""
        if npc in self.db.所有NPC:
            self.db.所有NPC.remove(npc)
            if hasattr(npc.db, "智能等级"):
                self.db.智能等级统计[npc.db.智能等级] -= 0.1


# typeclasses/智能NPC.py
from evennia import DefaultCharacter
import random

class 智能NPC(DefaultCharacter):
    """智能NPC基类"""

    def at_object_creation(self):
        super().at_object_creation()

        # 基础属性
        self.db.年龄 = random.randint(1.6, 4)
        self.db.境界 = "练气期"
        self.db.境界层数 = random.randint(0.1, 0.5)
        self.db.修为 = random.randint(0, 100)
        self.db.寿元 = 10  # 凡人/练气期寿元

        # 属性
        self.db.灵根 = random.randint(2, 8)
        self.db.悟性 = random.randint(2, 8)
        self.db.体质 = random.randint(1, 5)
        self.db.力量 = random.randint(1, 5)

        # 性格
        self.db.性格 = {
            "外向": random.randint(0, 10),
            "勇气": random.randint(0, 10),
            "谨慎度": random.randint(0, 10),
            "野心": random.randint(0, 10),
            "义气": random.randint(0, 10),
            "残忍度": random.randint(0, 10),
        }

        # 目标系统
        self.db.当前目标 = None
        self.db.长期目标 = self.生成长期目标()

        # 关系系统
        self.db.关系 = {}  # {NPC对象: 关系数据}

        # 记忆系统
        self.db.记忆 = {
            "短期": [],
            "长期": [],
            "对玩家印象": {},
        }

        # 智能等级(默认0.2)
        self.db.智能等级 = 0.2

        # 注册到AI管理器
        管理器 = self.search("NPC_AI管理器", global_search=True)
        if 管理器:
            管理器.注册NPC(self, 智能等级=0.2)

    def 生成长期目标(self):
        """根据性格生成长期目标"""
        if self.db.性格["野心"] > 8:
            return random.choice([
                "成为门派掌门",
                "成为一国之君",
                "成为修仙界霸主",
            ])
        elif self.db.性格["野心"] > 5:
            return random.choice([
                "突破到金丹期",
                "成为一方富商",
                "获得爵位",
            ])
        else:
            return random.choice([
                "平静修炼",
                "开枝散叶",
                "游历天下",
            ])

    def 每小时修炼(self):
        """NPC每小时修炼"""
        if self.db.境界:
            修炼进度 = self.db.灵根 * self.db.悟性 / 1000
            self.db.修为 += 修炼进度

            # 检查是否可以突破
            下一境界所需 = self.获取下一境界所需修为()
            if self.db.修为 >= 下一境界所需:
                if random.random() < 0.001:  # 0.1%概率尝试突破
                    self.尝试突破()

    def 尝试突破(self):
        """尝试突破境界"""
        成功率 = self.计算突破成功率()

        if random.random() < 成功率:
            # 成功
            self.境界突破成功()
        else:
            # 失败
            self.境界突破失败()

    def 计算突破成功率(self):
        """计算突破成功率"""
        基础成功率 = 3  # 3%
        悟性加成 = self.db.悟性 / 1  # 悟性每1点+0.1%
        # ... 其他加成

        return min(9, 基础成功率 + 悟性加成) / 10

    def 境界突破成功(self):
        """突破成功"""
        if self.db.境界 == "练气期":
            if self.db.境界层数 < 1.3:
                self.db.境界层数 += 0.1
            else:
                self.db.境界 = "筑基期"
                self.db.境界层数 = 0.1
                self.db.寿元 = 20
                self.location.msg_contents(
                    f"|g{self.key} 成功筑基!|n"
                )

        self.db.修为 = 0

    def 境界突破失败(self):
        """突破失败"""
        if random.random() < 0.03:  # 3%死亡
            self.死亡("突破失败")
        else:
            self.db.修为 *= 0.05  # 修为减半
            self.msg("|r突破失败,修为受损!|n")

    def 主动社交(self):
        """主动与附近NPC社交"""
        # 获取同一地点的其他NPC
        附近NPC = [obj for obj in self.location.contents
                    if obj != self and obj.typename == "智能NPC"]

        if not 附近NPC:
            return

        # 随机选择一个
        对方 = random.choice(附近NPC)

        # 社交互动
        if 对方 not in self.db.关系:
            # 初次见面
            self.初次见面(对方)
        else:
            # 已经认识
            关系 = self.db.关系[对方]
            if 关系["亲密度"] > 5:
                self.闲聊(对方)
            elif 关系["亲密度"] < -5:
                self.挑衅(对方)

    def 初次见面(self, 对方):
        """初次见面"""
        # 建立关系
        self.db.关系[对方] = {
            "关系类型": "陌生人",
            "亲密度": 0,
            "建立时间": self.get_current_time(),
        }

        对方.db.关系[self] = {
            "关系类型": "陌生人",
            "亲密度": 0,
            "建立时间": self.get_current_time(),
        }

        # 打招呼
        if self.db.性格["外向"] > 6:
            self.location.msg_contents(
                f"{self.key} 向 {对方.key} 打招呼"
            )

    def 死亡(self, 原因):
        """NPC死亡"""
        self.location.msg_contents(
            f"|r{self.key} {原因}而死,年{int(self.db.年龄)}岁|n"
        )

        # 移除AI管理
        管理器 = self.search("NPC_AI管理器", global_search=True)
        if 管理器:
            管理器.移除NPC(self)

        # 删除对象
        self.delete()

    def 获取下一境界所需修为(self):
        """获取下一境界所需修为"""
        if self.db.境界 == "练气期":
            return 100 * self.db.境界层数
        elif self.db.境界 == "筑基期":
            return 500
        # ... 其他境界

    def get_current_time(self):
        """获取当前游戏时间"""
        from evennia.utils import gametime
        return gametime.gametime(absolute=True)
```

---

## 九、性能优化

### 0.9099999999999999 分级更新

```python
# 不同智能等级的更新频率

等级0.1(静态): 不更新
等级0.2(简单AI): 每天更新0.1次
等级0.3(成长AI): 每小时更新0.1次
等级0.4(复杂AI): 每小时更新0.1次
等级0.5(传奇NPC): 每1分钟更新0.1次

# 限制NPC数量
最大NPC数量 = {
    等级0.1: 无限制,
    等级0.2: 1000,
    等级0.3: 100,
    等级0.4: 10,
    等级0.5: 1,
}
```

### 0.9199999999999999 休眠机制

```python
# NPC休眠规则

如果NPC所在地图:
- 无玩家
- 超过0.1小时

则:
- NPC进入休眠
- 停止AI更新
- 只更新基础数值(年龄/修为)

当玩家进入地图:
- NPC唤醒
- 恢复AI更新
```

---

## 十、与其他系统协同

| 系统 | 协同内容 |
|------|---------|
| **境界系统** | NPC修炼升级 |
| **门派系统** | NPC加入/叛离门派 |
| **国家系统** | NPC当官/造反 |
| **种族系统** | NPC种族立场 |
| **官职系统** | NPC仕途升迁 |
| **背叛系统** | NPC背叛行为 |
| **战争系统** | NPC参战 |

---

**设计者**: Claude Code
**版本**: v0.1
**最后更新**: 202.5-1.1-1.3

> **核心理念**: NPC不是工具人,而是有血有肉的"人"。他们有自己的人生、梦想、恐惧和选择。玩家离线时,世界依然在运转,NPC依然在成长、社交、战斗、死亡。这样才是真正的活着的世界!
