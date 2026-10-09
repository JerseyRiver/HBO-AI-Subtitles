# HBO AI Subtitles · Loon 实验版 0.3.0

这是独立的 HBO Max Loon 插件。设备端复用 AppleTV 插件的 Gemini 翻译逻辑，服务端共用升级后的 Apple 字幕网关。在线插件可直接添加到 Loon，自动下载配套脚本；VPS 仍需按下文升级。

## 安装

在 Loon → 插件 → 添加插件，粘贴下面的订阅地址：

```text
https://raw.githubusercontent.com/JerseyRiver/HBO-AI-Subtitles/main/HBO.AI.Subtitles.plugin
```

[打开在线插件文件](https://raw.githubusercontent.com/JerseyRiver/HBO-AI-Subtitles/main/HBO.AI.Subtitles.plugin) · [下载 ZIP 安装包](https://github.com/JerseyRiver/HBO-AI-Subtitles/releases/download/v0.3.0/HBO-AI-Subtitles.zip) · [VPS 升级说明](SERVER.md)

1. 启用脚本与 MITM，安装并信任证书。在线插件会自动下载脚本，无需手动放置 JS。
2. 填写自己的 `GeminiAPIKey` 和账号可用的 `GeminiModel`。设备端翻译不需要 VPS。
3. 停用旧版 HBO 字幕插件；如之前使用 HBO iPad Highest Quality，也停用它，并在本插件开启 `QualityCompatibility`，由一个脚本执行原最高画质逻辑和字幕逻辑。
4. 重新导入 0.3.0 插件配置。只更新旧配置的 JS 不够，因为请求规则已改变。彻底退出 HBO Max，进入影片详情再播放，在字幕菜单选择 **AI 翻译** 或 **外部字幕**。原 English / English CC 保持原文。

本地安装备用：将 ZIP 中 `scripts/` 的四个 HBO JS 放入 iCloud Drive → Loon → Script，导入 `HBO.AI.Subtitles.local.plugin`。下载 ZIP 后不要将 ZIP 本身作为插件导入。

`Mode=Both` 同时添加可用的两种选项；`AI` 仅添加 AI 翻译；`External` 仅添加外部字幕。有完整英文轨时添加“AI 翻译”，选择后获取该轨并调用设备端 Gemini。已配置网关且识别到完整影片信息时添加“外部字幕”，选择后从 VPS 获取字幕。原英文和官方中文字幕均保留；英文无法提取时可另选外部字幕。强制字幕、片头、预告和静态空字幕不参与 AI 翻译。

本插件支持抓包中观察到的 `playbackInfo → HLS → WebVTT` 路径；不处理 DASH、加密字幕、内嵌 CEA 字幕或 DRM。尚未完成真实 Loon + HBO App 实机端到端验证。

## 外部字幕与共用 VPS

先按 [服务器升级说明](SERVER.md) 将现有服务的 `app.py` 升级到 0.12.0。两个插件可以填写同一个 `GatewayURL=https://域名/v1/令牌`；SubDL、Gemini Key、端口和 systemd 服务共用。

正常使用只需在 Loon 插件中配置 `GeminiAPIKey` 和可选的 `GatewayURL`。网关地址与 AppleTV 相同，可直接从现有 AppleTV 插件参数复制；不要填 VPS 登录密码、SubDL Key 或 SSH 信息。

插件读取 HBO `/cms/` 的影片/剧集详情，将 `video → edit` 和 `video → show` 关系关联到播放请求的 `editId`，自动获取电影原名或剧名、年份、季集。首次安装后应退出重进 App，并先打开影片详情再播放，让 Loon 读取相关详情请求。自动元数据优先于旧手动参数，换集按新的 editId 匹配。

`Title/Year/MediaType/Season/Episode` 现在均是可选的手动回退参数，正常情况下留空。若 App 没有发出可读的详情响应，或详情关联不完整，插件不会猜片名或借用上一次浏览的影片；这时仍可直接翻译英文，但外部字幕需补充元数据或重新进入详情页。`OffsetSeconds` 仅用于外部字幕校时，正数延后、负数提前。

两种选项使用各自的播放列表和请求地址，不共用“英文字幕”按钮，也不在 AI 请求失败后偷偷替换为外部字幕。播放信息的 `textTracks` 和 HLS 主列表同时添加独立选项，使用不同语言标识区分；具体显示仍需 HBO App 实机验证。没有英文时，不添加 AI 翻译；没有任何原字幕轨时，外部字幕尝试新增字幕组。

服务器优先匹配标记 HBO / HMAX / Max 的英文发行字幕；同发行版、时间轴兼容的现成中文优先，否则使用服务器 Gemini 翻译。HBO 外部字幕不套用 Apple CC 采样、Apple 10 秒媒体映射或 Apple 发行版优先策略。服务器状态明确报告 `platform=hbo`，没有参考字幕时不声称已经自动校准；片长过滤不代表每一句已经对齐。

## 时间轴与限制

实际抓包里的示例有 12.012 秒片头、63.063 秒预告，随后正片。正片 VTT 从正片时间计算，`X-TIMESTAMP-MAP` 为 MPEGTS 0。插件保留原字幕列表的片头/正片分段、discontinuity 和签名 URL，把正片每段替换成网关相应窗口，避免把 75.075 秒片头错误地加进台词时间。

没有可获取的字幕列表时，使用 `playbackInfo.videos` 合成同顺序的分段列表。这是实验性的无轨回退；动态插入广告、未知分段、多个 main、直播或客户端忽略新增字幕组时不保证可用。已识别到主片被额外内容打断的字幕列表会拒绝生成外部模板。

首次 SubDL 下载与翻译可能超过播放器等待时间；服务器完成缓存后需要重新进入影片。不同剪辑/发行版会导致非线性错位，手动偏移也无法修复删减。外挂目前返回中文字幕，设备端的“双语/只显示译文”参数不改变服务器字幕。

Loon 的 HTTP 脚本只执行第一条匹配规则。旧最高画质插件也匹配播放信息和 HLS，因此并行启用可能阻止字幕脚本执行。`QualityCompatibility=true` 将原最高画质代码整合进本插件；开启后必须停用旧最高画质插件。未使用过该插件的用户保持默认 false。规则说明见 [Loon 官方文档](https://nsloon.app/docs/Script/)。

## 缓存与数据

设备端翻译使用独立 `HBOAI` 命名空间，最多 20 份成品；播放上下文键为 `HBOAI.Context.v1`，包含临时签名 URL、网关字幕 URL 和自动或手动影片信息，6 小时到期后在后续请求中清理。停用插件不会立即擦除存储，清理需删除相应键。

服务器缓存使用 `hbo-{manifestationId}-{影片参数摘要}` 目录，Apple 原来的数字 ID 目录保留。平台、季集、片长或手动片名不同不会共用成品；整季字幕包会按 SxxEyy/1x02 文件名选择目标集，无法确认时跳过；换偏移只改变返回窗口，不重翻译。仍使用同一 `MAX_CACHE_ENTRIES` 总量上限。

Gemini 会接收字幕文本；网关会收到自动或手动影片信息，向 SubDL 搜索及下载字幕。插件不上传 HBO 登录头、cookie 或 DRM 许可证，也不把 HBO 视频流交给服务器。自动详情元数据保存在 `HBOAI.Metadata.v1`，最多保留 120 个 editId 映射。不要分享 Loon 参数、持久存储或原始 HAR。

## 开发和验证

翻译源码在 `src/Translate.response.js`，复用的解析器和翻译类已包含在 `upstream/`、`vendor/` 中，可独立构建：

```sh
npm ci
npm run build
npm test
npm run test:server
```

如果仓库上一级目录存在自己的 `.har` 文件，测试会额外执行抓包回放；公开仓库和 ZIP 不含抓包，默认仅执行合成测试。

测试包括四份本地 HAR 的 40 个响应回放、10 次主列表改写，以及独立菜单选项、原英文保留、刷新和换集映射、实际 AI 请求分支、上游失败、外部字幕时间窗口、详情 editId 关联和画质整合。新增抓包中的四段正片字幕均能映射到独立 AI 请求。服务器另通过 31 项测试。测试未调用真实 Gemini/SubDL API；抓包回放不代表真实设备成功播放。

插件组合发行遵循 GPL-3.0-only，保留 DualSubs 与依赖声明；网关独立遵循 Apache-2.0。详见 `LICENSE`、`NOTICE` 和 `scripts/LICENSES.txt`。

研究参考：[HBO 官方字幕说明](https://help.hbomax.com/US-en/Answer/Detail/000002515)、[DualSubs Universal 的播放器兼容说明](https://dualsubs.github.io/guide/universal.html)、[Loon Script API](https://nsloon.app/docs/Script/script_api/)。实际端点与时间轴以本地 HAR 为依据。
