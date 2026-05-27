"use client";

import { useEffect, useState } from "react";
import type { GameConfig, GameState, ChatMsg, PhonePost } from "@/lib/types";

const blankPhone = { bubble: [], kakao: [], weverse: [], x: [], ins: [], hot: [] };

function initialState(config: GameConfig): GameState {
  return {
    round: 1,
    time: "2025年 · 首尔 · 夜",
    chapterTitle: "第一章：灯光熄灭之后",
    story: `雨从傍晚开始下，到夜里也没有停。

电视台外的路面被灯光照得发亮，水迹一层一层铺开，像有人把整座城市的霓虹都揉碎了，铺在你脚下。

你站在粉丝线以外的位置，手里的相机已经有些发沉。周围的人还没有散，低声交换着刚才拍到的图，雨伞碰着雨伞，塑料应援袋被风吹得轻轻响。有人在讨论妆造，有人在抱怨动线，也有人一边发抖一边盯着出口，等一个也许只会出现几秒的人。

你也在等。

但这份等待并不特别。

至少现在还不特别。

以你的身份——${config.role}，你只是这个夜晚里无数个追逐镜头的人之一。你知道艺人会从哪一扇门离开，知道经纪人通常会站在哪个角度挡镜头，也知道再漂亮的照片，最终也只是被转发、收藏、夸一句“氛围感好”，然后很快被下一场行程覆盖。

直到${config.idolName}从侧门里走出来。

人群几乎在同一瞬间往前涌了一点。保安抬手拦住，快门声在雨里密密地响。你没有立刻按下快门，只是隔着镜头，看见TA被伞影和工作人员包围，脸上还留着舞台妆，眼神却比屏幕里安静很多。

那一秒很短。

短到没有任何故事发生。

TA没有看你，也不可能认识你。

可你后来总会想起这个夜晚。想起雨落在镜头上的声音，想起你差点错过的那张照片，想起手机屏幕上方弹出的第一条平台推送。

右侧手机里，似乎有什么更新了。``,
    choices: [
      "A. 继续留在原地，等人群散开后再走。",
      "B. 打开手机，先看刚刚那条平台推送。",
      "C. 低头检查相机里那张差点错过的照片。"
    ],
    memory: ["关系未公开", "玩家无上帝视角", "不显示数值"],
    phone: {
      bubble: [{ from: "ta", text: "今天录制结束了。" }, { from: "ta", text: "外面下雨了，回去的时候小心。" }, { from: "system", text: "这类消息会发送给所有订阅粉丝，并不代表单独私聊。" }],
      kakao: [{ from: "system", text: "暂无艺人私聊。KakaoTalk 会显示你的现实联系人、朋友或工作消息。" }],
      weverse: [{ user: `${config.idolName} Official`, text: "今天也辛苦了。大家回去路上小心。", meta: "❤️ 18.2万　💬 4.6万" }],
      x: [{ user: "趋势", text: `#${config.idolName} 录制状态\n#后台动线\n#回归舞台`, meta: "正在上升" }],
      ins: [{ user: config.idolName, text: "[图片 1 张]\n练习室镜子，没有露脸。", meta: "❤️ 328万　💬 14.6万" }],
      hot: [{ user: "实时榜", text: `1. ${config.idolName} 今日状态\n2. 回归期动线争议\n3. 后台动线饭拍`, meta: "随章节更新" }]
    },
    config
  };
}

const emptyConfig: GameConfig = {
  playerName: "",
  age: "",
  nationality: "",
  role: "",
  idolName: "",
  idolType: "",
  myNick: "",
  theirNick: "",
  publicImage: "",
  intensity: "",
  extra: ""
};

export default function Page() {
  const [config, setConfig] = useState<GameConfig>(emptyConfig);
  const [state, setState] = useState<GameState | null>(null);
  const [active, setActive] = useState<keyof GameState["phone"]>("bubble");
  const [custom, setCustom] = useState("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [paused, setPaused] = useState<{reason:string; message:string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kpop-deepseek-sim-state");
    if (saved) {
      try { setState(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (state) localStorage.setItem("kpop-deepseek-sim-state", JSON.stringify(state));
  }, [state]);

  const demo = () => {
    setConfig({
      playerName: "凌子瑜",
      age: "20",
      nationality: "中国",
      role: "站姐，拍图出圈但不做私生",
      idolName: "韩国艺人",
      idolType: "男爱豆",
      myNick: "哥哥",
      theirNick: "子瑜",
      publicImage: "事业心强，舞台上很会营业，私下慢热克制，粉丝服务好，但很怕恋情影响团队。",
      intensity: "最真实，可以有公司施压、舆论、误会、冷淡、暧昧对象、复合，但不要超自然血腥。",
      extra: "2025年现代韩娱，隐秘恋爱，小说感强，章节要长，手机平台随剧情更新，粉丝评论区要丰富。"
    });
  };

  const start = async () => {
    const cfg = {
      ...config,
      playerName: config.playerName || "你",
      age: config.age || "20",
      nationality: config.nationality || "中国",
      role: config.role || "普通人",
      idolName: config.idolName || "TA",
      idolType: config.idolType || "艺人",
      myNick: config.myNick || "TA",
      theirNick: config.theirNick || "你",
      publicImage: config.publicImage || "公开克制，私下慢热。",
      intensity: config.intensity || "现实但偏恋爱。",
      extra: config.extra || "现代韩娱隐秘恋爱。"
    };
    const st = initialState(cfg);
    setState(st);
    await generate("开局后继续写下一段，让手机内容同步刷新。", st);
  };

  const reset = () => {
    localStorage.removeItem("kpop-deepseek-sim-state");
    setState(null);
    setErr("");
    setPaused(null);
  };

  const generate = async (action: string, baseState = state, phoneAction: any = null) => {
    if (!baseState) return;
    setLoading(true);
    setErr("");
    setPaused(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: baseState, action, phoneAction })
      });
      const data = await res.json();
      if (data.paused) {
        setPaused({ reason: data.reason || "PAUSED", message: data.message || "游戏已暂停。" });
        if (data.state) setState(data.state);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (data.error) setErr(data.error);
      if (data.state) setState(data.state);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setErr(e?.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  const sendPhone = async (app: keyof GameState["phone"]) => {
    if (!state) return;
    const text = (inputs[app] || "").trim();
    if (!text) return;
    setInputs({ ...inputs, [app]: "" });

    const next = structuredClone(state) as GameState;
    if (app === "bubble" || app === "kakao") {
      (next.phone[app] as ChatMsg[]).push({ from: "me", text, status: app === "bubble" ? "1" : "已读" });
    } else {
      (next.phone[app] as PhonePost[]).push({ user: "你", text, meta: "刚刚发布" });
    }
    next.lastAction = `在${app}发送：${text}`;
    setState(next);
    await generate(`玩家刚刚在${app}发送/发布：“${text}”。如果平台是bubble，请理解为玩家作为订阅粉丝回复艺人的群发消息，不要默认艺人单独看见；如果是KakaoTalk，只有关系合理时才出现艺人私聊。请让对应平台真实回应，并推进纯小说正文。`, next, { app, text });
  };

  if (!state) {
    return (
      <div className="app">
        <Header onReset={reset} />
        <section className="setup card">
          <h2>DeepSeek 小说主导版</h2>
          <p>这个版本以正文小说为主体，手机平台只承担补充信息层。默认不是一上来认识，而是从弱交集慢慢推进。AI Key 放在后端环境变量里，不会暴露在网页里。</p>
          <label>我的信息</label>
          <div className="row">
            <input placeholder="姓名" value={config.playerName} onChange={e=>setConfig({...config, playerName:e.target.value})}/>
            <input placeholder="年龄" value={config.age} onChange={e=>setConfig({...config, age:e.target.value})}/>
          </div>
          <div className="row">
            <input placeholder="国籍" value={config.nationality} onChange={e=>setConfig({...config, nationality:e.target.value})}/>
            <input placeholder="身份" value={config.role} onChange={e=>setConfig({...config, role:e.target.value})}/>
          </div>
          <label>恋人信息</label>
          <div className="row">
            <input placeholder="艺人姓名" value={config.idolName} onChange={e=>setConfig({...config, idolName:e.target.value})}/>
            <input placeholder="男爱豆 / 女爱豆 / 演员 / 歌手 / 团体成员" value={config.idolType} onChange={e=>setConfig({...config, idolType:e.target.value})}/>
          </div>
          <div className="row">
            <input placeholder="我对TA的爱称" value={config.myNick} onChange={e=>setConfig({...config, myNick:e.target.value})}/>
            <input placeholder="TA对我的爱称" value={config.theirNick} onChange={e=>setConfig({...config, theirNick:e.target.value})}/>
          </div>
          <label>公开形象 / 网上印象 / 人物内核</label>
          <textarea value={config.publicImage} onChange={e=>setConfig({...config, publicImage:e.target.value})} placeholder="越具体越贴：冷淡慢热、事业心强、综艺感、营业感、粉丝服务、回避型、温柔照顾、舞台反差等。" />
          <label>本局现实强度与可出现内容</label>
          <textarea value={config.intensity} onChange={e=>setConfig({...config, intensity:e.target.value})} placeholder="例：最真实；可以有公司施压、误会、暧昧、冷淡、复合；不要超自然、血腥、阴谋论。" />
          <label>额外设定</label>
          <textarea value={config.extra} onChange={e=>setConfig({...config, extra:e.target.value})} placeholder="例：2025年现代韩娱，隐秘恋爱，小说要长，手机平台真实，粉丝评论多，不显示数值。" />
          <div className="row">
            <button onClick={start} disabled={loading}>{loading ? "生成中..." : "开始"}</button>
            <button className="secondary" onClick={demo}>填入示例</button>
          </div>
          {err && <div className="error">{err}</div>}
        </section>
      </div>
    );
  }

  return (
    <div className={loading ? "app loading" : "app"}>
      <Header onReset={reset} />
      <section className="layout">
        <main className="main card">
          <div className="meta"><span>{state.time}</span><span>第 {state.round} 回合</span></div>
          <div className="chapter">{state.chapterTitle}</div>
          <div className="story">{state.story}</div>
          {paused && (
            <div className="balancePause">
              <h3>DeepSeek 余额不足，游戏已暂停</h3>
              <p>{paused.message}</p>
              <p>充值后不用重新开始，直接点击下面按钮继续生成。</p>
              <button onClick={() => generate("余额已充值，请从当前剧情继续生成。")}>我已充值，继续生成</button>
            </div>
          )}
          {err && <div className="error">{err}</div>}
          <div className="choices">
            {state.choices.slice(0,3).map((c, i) => (
              <div className="choice" key={i} onClick={()=>{ if(!paused) generate(c); }}>{c}</div>
            ))}
            <div className="customBox">
              <input placeholder="D. 自定义你的行动 / 对话" value={custom} onChange={e=>setCustom(e.target.value)} />
              <button onClick={()=>{ if(!paused && custom.trim()){ generate("D. " + custom.trim()); setCustom(""); }}}>确定</button>
            </div>
          </div>
        </main>

        <aside className="side">
          <div className="card">
            <h3>手机</h3>
            <div className="phoneFrame">
              <div className="phoneTop"><span>23:17</span><span>📶 🔋 82%</span></div>
              <div className="tabs">
                {(["bubble","weverse","x","ins","kakao","hot"] as const).map(t => (
                  <div key={t} className={active===t ? "tab on" : "tab"} onClick={()=>setActive(t)}>{label(t)}</div>
                ))}
              </div>
              <PhonePage active={active} state={state} inputs={inputs} setInputs={setInputs} sendPhone={sendPhone}/>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Header({ onReset }: { onReset: ()=>void }) {
  return <div className="header"><div className="logo">韩娱关系模拟器<span className="badge">DeepSeek版</span></div><button className="secondary" style={{width:"auto",margin:0,padding:"8px 12px",borderRadius:"999px",fontSize:13}} onClick={onReset}>重设</button></div>;
}

function label(t: string) {
  return ({ bubble:"泡泡", weverse:"社区", x:"X", ins:"社交", kakao:"聊天", hot:"热搜" } as any)[t] || t;
}

function PhonePage({ active, state, inputs, setInputs, sendPhone }: any) {
  const phone = state.phone || blankPhone;
  const title = label(active);
  const sub = active === "bubble" ? "艺人发给所有订阅粉丝的消息感" : active === "kakao" ? "现实聊天" : active === "x" ? "趋势 · 饭拍传播" : active === "weverse" ? "官方社区 · 粉丝信" : active === "ins" ? "快拍 · 评论 · 私信" : "娱乐新闻 · 韩网搬运";

  return (
    <div className="page on">
      <div className="appHeader">{title}<div className="sub">{sub}</div></div>
      {(active === "bubble" || active === "kakao") ? (
        <>
          <div className="chat">
            <div className="chatTime">今天</div>
            {(phone[active] || []).map((m: ChatMsg, i: number) => (
              <div key={i}>
                <div className={`msg ${m.from === "me" ? "me" : m.from === "system" ? "system" : "from"}`}>{m.text}</div>
                {m.status && <div className="read">{m.status}</div>}
              </div>
            ))}
          </div>
          <div className="inputbar">
            <input value={inputs[active] || ""} onChange={e=>setInputs({...inputs, [active]:e.target.value})} placeholder="输入消息" />
            <button onClick={()=>sendPhone(active)}>发送</button>
          </div>
        </>
      ) : (
        <>
          <div>
            {(phone[active] || []).map((p: PhonePost, i: number) => (
              <div className="feed" key={i}>
                <div className="name"><span className="avatar">{(p.user || "粉")[0]}</span>{p.user}</div>
                <div className="text">{p.text}</div>
                <div className="fm">{p.meta}</div>
              </div>
            ))}
          </div>
          {active !== "hot" && (
            <div className="inputbar">
              <input value={inputs[active] || ""} onChange={e=>setInputs({...inputs, [active]:e.target.value})} placeholder="发布/评论" />
              <button onClick={()=>sendPhone(active)}>发布</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
