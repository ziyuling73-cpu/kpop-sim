# 韩娱关系模拟器 · DeepSeek 公网上线版

这个版本使用 DeepSeek API，适合部署到 Vercel，让朋友打开链接就能玩。

## 需要准备

1. GitHub 账号
2. Vercel 账号
3. DeepSeek API Key
4. Node.js 20+（本地测试才需要）

## DeepSeek 配置

到 DeepSeek 平台申请 API Key，然后在环境变量里填写：

```bash
DEEPSEEK_API_KEY=你的DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

模型说明：
- `deepseek-v4-flash`：推荐，便宜、速度快
- `deepseek-v4-pro`：更强，但成本更高

## 本地运行

```bash
npm install
cp .env.local.example .env.local
# 打开 .env.local 填 key
npm run dev
```

打开：

```bash
http://localhost:3000
```

手机同 WiFi 下可打开终端里的 Network 地址。

## Vercel 上线步骤

1. 把整个项目上传到 GitHub
2. 打开 Vercel
3. New Project
4. Import 这个 GitHub 仓库
5. 在 Environment Variables 里添加：

```bash
DEEPSEEK_API_KEY=你的DeepSeek Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

6. 点击 Deploy
7. 得到 `https://xxx.vercel.app` 链接，发给朋友即可

## 重要提醒

- 不要把 `.env.local` 上传到 GitHub
- 朋友玩会消耗你的 DeepSeek API 额度
- 真实人物互动是虚构模拟，不代表现实事实
- 为了避免 JSON 出错，接口中已启用 `response_format: { type: "json_object" }`


## 2026-05 修复版说明

本版修复：
- DeepSeek 偶尔返回不标准 JSON 导致的 `Bad control character in string literal`
- 增加 `jsonrepair` 自动修复
- 强化换行转义提示
- 接口兜底，不会因为 JSON 错误直接崩溃

更新后请在 Vercel 重新部署。
如果手机上仍显示旧错误，请点击网页右上角“重设”，或清除浏览器缓存后重新打开。


## 余额不足暂停版说明

本版新增：
- 如果 DeepSeek 返回 `Insufficient Balance` 或 HTTP 402，不再使用备用剧情。
- 游戏会暂停在当前进度，显示“余额不足，请充值后继续”。
- 充值完成后，点击页面里的“我已充值，继续生成”，会从当前剧情继续。
- 其他 API 错误只显示错误，不会破坏存档。

更新方式：
1. 解压本包。
2. 上传里面这一层的 `app`、`lib`、`package.json` 等全部文件到 GitHub 覆盖原仓库。
3. Vercel → Deployments → Redeploy。
4. 打开网站后点“重设”或刷新测试。


## 小说主导版更新说明

本版根据反馈调整：
- 正文只写细腻言情小说，不再把 Bubble/社区/X/KakaoTalk 内容塞进正文。
- 正文只出现“手机有更新”等轻提示。
- Bubble 修正为艺人向所有订阅粉丝发送的消息感，不默认一对一私聊。
- KakaoTalk 只有剧情合理后才出现艺人私聊。
- 小手机平台评论区要求更丰富，增加粉丝回复粉丝、转发、热评、搬运。
- 隐藏“剧情状态”卡片，减少出戏。
- 开局改成弱交集，不再一上来认识/私聊。
