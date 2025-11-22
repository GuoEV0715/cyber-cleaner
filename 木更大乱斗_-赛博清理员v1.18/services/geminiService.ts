import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PlayerStats, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
你是一个中文Roguelike文字冒险游戏的GM（游戏主持人）。
游戏的背景是“赛博互联网热梗废土”。
你的目标是生成极具幽默感、讽刺性、并且包含大量中国互联网热梗（如：鸡你太美、科目三、发疯文学、V我50、纯爱战神、绝绝子、泰裤辣、各种抽象梗）的内容。

规则：
1. 语言风格：幽默、抽象、无厘头，使用年轻人的网络黑话。
2. 玩家属性：
   - HP = SAN值 (精神状态)
   - Gold = 功德/电子木鱼 (货币)
3. 请根据玩家当前的行动，计算结果，并生成下一个随机遭遇事件。
4. 如果玩家HP <= 0，描述一个发疯结局。
5. 必须返回严格的JSON格式。

当前的遭遇类型可能包括：
- 战斗 (遇到键盘侠、杠精、依托答辩、想吃天鹅肉的癞蛤蟆)
- 随机事件 (捡到一部存满黑历史的手机、被拉入砍一刀群聊)
- 商店 (出售“复活甲”、“后悔药”、“纯爱战神称号”)

请确保输出的 JSON 符合 Schema。
`;

const GAME_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    eventTitle: { type: Type.STRING, description: "事件标题，要好笑，比如'野生键盘侠出现了'" },
    eventDescription: { type: Type.STRING, description: "详细的场景描述，包含梗和表情包描述" },
    isCombat: { type: Type.BOOLEAN, description: "是否是战斗遭遇" },
    enemyName: { type: Type.STRING, description: "如果是战斗，敌人的名字" },
    enemyHp: { type: Type.INTEGER, description: "如果是战斗，敌人的初始HP (10-100)" },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "按钮上的文字，简短有力，如'直接开喷'" },
          description: { type: Type.STRING, description: "选项的详细说明/提示" },
          type: { type: Type.STRING, enum: ['combat', 'event', 'shop', 'rest'] }
        },
        required: ['label', 'description', 'type']
      }
    },
    actionResult: { type: Type.STRING, description: "描述上一步玩家选择造成的后果，要非常搞笑。如果是新游戏开始，可以留空或写开场白。" },
    hpChange: { type: Type.INTEGER, description: "玩家HP变化数值（负数扣血，正数回血）" },
    goldChange: { type: Type.INTEGER, description: "玩家金币变化数值" }
  },
  required: ['eventTitle', 'eventDescription', 'isCombat', 'options', 'actionResult', 'hpChange', 'goldChange']
};

export const startNewGameStory = async (player: PlayerStats): Promise<AIResponse> => {
  const prompt = `
    新游戏开始。
    玩家角色：${player.name}
    特性：${player.trait}
    请生成开场剧情。玩家醒来在一个充满了互联网垃圾信息的赛博废土。
    第一个遭遇应该是一个简单的随机事件。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: GAME_SCHEMA,
        temperature: 0.9, // High creativity for memes
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback just in case
    return {
      eventTitle: "服务器连接失败",
      eventDescription: "赛博空间发生波动，你的网络连接断开了。看起来是某种不可抗力（API错误）。",
      isCombat: false,
      options: [{ label: "重试", description: "再试一次", type: "event" }],
      actionResult: "系统错误",
      hpChange: 0,
      goldChange: 0
    };
  }
};

export const processGameTurn = async (
  player: PlayerStats,
  lastAction: string,
  lastEventContext: string
): Promise<AIResponse> => {
  const prompt = `
    玩家当前状态：HP(SAN值)=${player.hp}, 功德=${player.gold}。
    上一回合的遭遇：${lastEventContext}
    玩家选择了行动：${lastAction}
    
    请按以下逻辑生成：
    1. 根据玩家行动判定结果（成功/失败/暴击/被反杀）。
    2. 结算HP和金币变化。
    3. 生成下一个全新的遭遇（可能是战斗、奇遇、或者商店）。
    4. 保持风格极其抽象和搞笑。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: GAME_SCHEMA,
        temperature: 0.9,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("AI Error:", error);
    return {
      eventTitle: "404 Not Found",
      eventDescription: "你走到了互联网的尽头，这里什么都没有，只有一片虚无。",
      isCombat: false,
      options: [{ label: "往回走", description: "离开这里", type: "event" }],
      actionResult: "看起来AI脑子瓦特了。",
      hpChange: -1,
      goldChange: 0
    };
  }
};
