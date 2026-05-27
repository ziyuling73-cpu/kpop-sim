import { NextRequest, NextResponse } from "next/server";
import { jsonrepair } from "jsonrepair";

export const runtime = "nodejs";

function fallbackState(input: any, reason = "生成失败") {
  const prev = input?.state || {};
  const config = prev.config || input?.config || {};
  const idol = config.idolName || "TA";
  const nextRound = (prev.round || 0) + 1;
  return {
    round: nextRound,
    time: "2025年 · 首尔 · 夜",
    chapterTitle: `第${nextRound}章：已读之后`,
    story:
`首尔的夜色压得很低。

你看着手机屏幕，刚才发出去的那句话还停在聊天框里。${idol}没有立刻回复，只有“已读”两个字安静地挂在那里。

窗外有车经过，光从玻璃上滑过去。你忽然意识到，这段关系最折磨人的地方不是不能公开，而是你永远不知道沉默到底代表什么。

是行程太忙，还是公司在旁边。
是保护你，还是把你推远。

几分钟后，泡泡和社交平台几乎同时更新。粉丝在讨论今晚的动线，X上有人搬运模糊的饭拍，热搜榜尾出现了${idol}的名字。

而KakaoTalk终于震了一下。

${idol}：先别乱想。

只有四个字。

可你盯着它，看了很久。`,
    choices: [
      "A. 装作轻松，回一句“我没乱想”。",
      "B. 直接问TA是不是公司已经知道了。",
      "C. 不回复，先观察平台风向。"
    ],
    memory: [...(prev.memory || []), `备用生成：${reason}`].slice(-12),
    phone: prev.phone || {
      bubble: [{ from: "ta", text: "刚结束。", status: "" }],
      kakao: [{ from: "ta", text: "到了吗？", status: "" }],
      weverse: [],
      x: [],
      ins: [],
      hot: []
    },
    config
  };
}

function findJsonBlock(text: string) {
  let s = text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s;
}

function extractJson(text: string) {
  const s = findJsonBlock(text);

  try {
    return JSON.parse(s);
  } catch {}

  try {
    return JSON.parse(jsonrepair(s));
  } catch {}

  const escaped = s.replace(/[\u0000-\u001F]+/g, (m) => {
    return m
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  });

  return JSON.parse(jsonrepair(escaped));
}


function isInsufficientBalanceMessage(message: string) {
  return /insufficient\s*balance|余额不足|balance/i.test(message || "");
}

function parseDeepSeekError(raw: string) {
  try {
    const data = JSON.parse(raw);
    const message = data?.error?.message || data?.message || raw;
    return String(message);
  } catch {
    return raw;
  }
}

function normalizeState(next: any, prev: any) {
  const config = prev?.config || next?.config || {};
  const phone = next?.phone || prev?.phone || {};
  return {
    round: Number(next?.round || (prev?.round || 0) + 1),
    time: String(next?.time || "2025年 · 首尔 · 夜"),
    chapterTitle: String(next?.chapterTitle || `第${(prev?.round || 0) + 1}章`),
    story: String(next?.story || prev?.story || ""),
    choices: Array.isArray(next?.choices) && next.choices.length >= 3
      ? next.choices.slice(0, 3).map(String)
      : ["A. 回复。", "B. 查看手机。", "C. 暂时沉默。"],
    memory: Array.isArray(next?.memory) ? next.memory.slice(-12).map(String) : (prev?.memory || []),
    phone: {
      bubble: Array.isArray(phone.bubble) ? phone.bubble : [],
      kakao: Array.isArray(phone.kakao) ? phone.kakao : [],
      weverse: Array.isArray(phone.weverse) ? phone.weverse : [],
      x: Array.isArray(phone.x) ? phone.x : [],
      ins: Array.isArray(phone.ins) ? phone.ins : [],
      hot: Array.isArray(phone.hot) ? phone.hot : []
    },
    config
  };
}

function buildMessages(body: any) {
  const system = `你是一个中文长篇言情互动小说引擎，生成“韩娱关系模拟器”的下一回合。

核心定位：
1. 正文是主体，必须像中国现代言情小说一样细腻、自然、慢热、重氛围、重心理体感，但不要写玩家未能知道的艺人内心。
2. 正文禁止写成平台汇总、资讯播报、列表、系统说明。Bubble、Weverse、X、Instagram、KakaoTalk、热搜等内容必须放在 phone 字段里。
3. 正文只允许出现很轻的提示，例如“手机震了一下”“屏幕上方弹出新的推送”“右侧手机里多了一条未读”，不要在正文里展开平台具体内容。
4. 开局和关系推进必须真实：不允许一上来就互相认识或恋爱。除非玩家设定明确写了“已经是恋人/已认识”。默认是弱交集：粉丝、工作人员、站姐、同行、偶然见过、被注意到但不熟，关系通过事件慢慢建立。
5. Bubble 的概念必须正确：Bubble 是艺人向所有订阅粉丝发送消息的平台，有“像私信”的沉浸感，但不是只发给玩家的一对一恋爱聊天。玩家可以作为粉丝回复，但艺人不一定能看见，也不应默认单独回应玩家。
6. KakaoTalk 才是现实生活聊天。只有剧情发展到合理阶段，才允许出现玩家和艺人的私下 KakaoTalk 对话。
7. Weverse 是官方社区与粉丝社区，必须有粉丝发帖、粉丝互相回复、热门评论、作者赞过、公告、直播/媒体/Artist/Fan 标签等感觉。
8. X 是舆论扩散与饭拍传播，必须有转发、引用、粉丝互相回复、路人、黑粉、站姐、CP粉或唯粉等多种声音。
9. Instagram 是营业、快拍、评论区和私信感；评论区要有粉丝回复粉丝，而不是只有单条评论。
10. 热搜/韩网搬运要像外部舆论层，提供论坛标题、楼层回复、搬运号口吻，但不要塞进正文。

硬性规则：
1. 只输出严格 JSON，不要 Markdown，不要代码块，不要解释。
2. 全文中文，禁止韩语和英文句子；平台名称可保留 Bubble、X、Instagram、Weverse、KakaoTalk。
3. 小说正文必须 1100-1800 个中文字符，细腻、有镜头感、有情绪流，不要流水账。
4. 玩家主视角：不能写艺人内心，不能给上帝视角，只能写玩家看见、听见、收到的消息、平台风向、人物行为。
5. 不显示任何数值。关系变化只能通过距离、措辞、回复速度、是否避嫌、公司态度、粉丝评论、平台风向体现。
6. 根据 config 中 idolName、idolType、publicImage、intensity、extra 生成。不同艺人/人设必须有不同语气、节奏、事件，不要套同一段。
7. 自动适配性别与称呼：如果 idolType 或称呼显示男艺人，用“他/他的/男团/哥哥”等；女艺人用“她/她的/女团/姐姐”等；不确定用“TA”。
8. 真实人物只能基于公开形象做虚构互动，不编造现实丑闻或现实私生活事实；争议必须以“游戏内虚构舆论/猜测/模拟”为表述。
9. 手机内容必须随章节变化。如果玩家刚在某个平台输入内容，必须让对应平台自然接住：粉丝回复、被淹没、被点赞、被误解、被搬运等。
10. 每次返回 3 个固定选项，第四个自定义由前端提供，不要写第四个。
11. phone 评论区要丰富：Weverse/X/Instagram/热搜每个平台至少 6 条内容，其中至少 2 条体现粉丝回复粉丝；Bubble 至少 4 条艺人消息或系统提示；KakaoTalk 按剧情合理性生成，没有私联阶段就只显示朋友/工作/系统，不要强行出现艺人私聊。
12. 绝对不要在 JSON 字符串中使用未转义换行。所有换行必须作为 \\n 出现在字符串里。
13. 严格返回一个 JSON 对象，必须包含 round、time、chapterTitle、story、choices、memory、phone。`;

  const schemaHint = `返回 JSON 结构：
{
  "round": number,
  "time": "2025年 · 地点 · 时间",
  "chapterTitle": "章节标题",
  "story": "纯小说正文，平台具体内容不要写在这里，只写手机更新提示，换行用\\\\n",
  "choices": ["A. ...", "B. ...", "C. ..."],
  "memory": ["长期记忆标签，不超过12条"],
  "phone": {
    "bubble": [{"from":"ta|me|system","text":"艺人面向所有订阅粉丝的消息/玩家粉丝回复/系统提示","status":"可选，如1/已发送"}],
    "kakao": [{"from":"ta|me|system","text":"现实聊天。未建立私联时不要强行出现艺人私聊","status":"可选，如已读"}],
    "weverse": [{"user":"用户名","text":"帖子/评论/粉丝回复粉丝","meta":"互动数据/标签"}],
    "x": [{"user":"用户名","text":"帖子/引用/粉丝互相回复/饭拍传播","meta":"互动数据/标签"}],
    "ins": [{"user":"用户名","text":"帖子/快拍/评论/粉丝回复粉丝","meta":"互动数据/标签"}],
    "hot": [{"user":"榜单/韩网/新闻","text":"标题/论坛楼层/搬运内容","meta":"标签"}]
  }
}`;

  const user = JSON.stringify({
    request: "根据 currentState 和 userAction 生成下一回合。请把正文写成细腻言情小说，不要把平台内容写进正文，平台全部放入 phone。",
    schemaHint,
    currentState: body.state,
    userAction: body.action,
    phoneAction: body.phoneAction || null
  });

  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  if (!apiKey) {
    return NextResponse.json(
      { error: "缺少 DEEPSEEK_API_KEY。请在 .env.local 或 Vercel 环境变量中填写。", state: fallbackState(body, "缺少API Key") },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: buildMessages(body),
        stream: false,
        temperature: 0.72,
        response_format: { type: "json_object" },
        max_tokens: 4200
      })
    });

    const raw = await res.text();

    if (!res.ok) {
      const apiMessage = parseDeepSeekError(raw);
      if (res.status === 402 || isInsufficientBalanceMessage(apiMessage)) {
        return NextResponse.json({
          paused: true,
          reason: "INSUFFICIENT_BALANCE",
          message: "DeepSeek API 余额不足。游戏已暂停，请充值后点击继续生成。",
          state: body.state
        });
      }
      throw new Error(`DeepSeek API 错误 ${res.status}: ${apiMessage.slice(0, 400)}`);
    }

    const data = JSON.parse(raw);
    const content = data?.choices?.[0]?.message?.content;

    if (!content) throw new Error("DeepSeek 返回为空");

    const parsed = extractJson(content);
    const next = normalizeState(parsed, body.state);
    return NextResponse.json({ state: next });
  } catch (err: any) {
    const message = err?.message || "DeepSeek生成失败。";
    if (isInsufficientBalanceMessage(message)) {
      return NextResponse.json({
        paused: true,
        reason: "INSUFFICIENT_BALANCE",
        message: "DeepSeek API 余额不足。游戏已暂停，请充值后点击继续生成。",
        state: body.state
      });
    }
    return NextResponse.json({
      error: message,
      state: body.state
    });
  }
}
