# HBO AI Subtitles · Loon 0.4.0

## Loon 订阅地址

点击下面代码框右上角的复制按钮，然后粘贴到 **Loon → 插件 → 添加插件**。

```text
https://raw.githubusercontent.com/JerseyRiver/HBO-AI-Subtitles/main/HBO.AI.Subtitles.plugin
```

[打开插件文件](https://raw.githubusercontent.com/JerseyRiver/HBO-AI-Subtitles/main/HBO.AI.Subtitles.plugin) · [下载最新版 ZIP](https://github.com/JerseyRiver/HBO-AI-Subtitles/releases/latest)

为 HBO Max 添加独立字幕选项，保留原英文及官方字幕：有完整官方中文时不添加选项；无中文且可提取字幕时只添加 **AI 翻译**；提取失败时只添加 **外部字幕**，后者需要配置网关并自动识别影片信息。翻译仍按播放器请求的字幕段进行，首次跳到未翻译段需要等待，已翻译段使用缓存。

## 安装

Loon → 插件 → 添加插件，使用 [在线插件](https://raw.githubusercontent.com/JerseyRiver/HBO-AI-Subtitles/main/HBO.AI.Subtitles.plugin)。脚本自动从本仓库下载。

1. 启用脚本和 MITM，安装并信任证书。
2. 填写自己的 `GeminiAPIKey` 与账号可用的 `GeminiModel`。默认模型不保证所有账号都可用。
3. 外部字幕是可选功能：填写 `GatewayURL=https://你的域名/v1/你的令牌`。升级已有网关见 [SERVER.md](SERVER.md)，不要填写 SSH 密码或 SubDL Key。
4. 停用旧 HBO 字幕插件。若使用过 HBO iPad Highest Quality，也停用它，并开启本插件 `QualityCompatibility`；此项将原画质逻辑整合进同一脚本。
5. 重新导入 0.4.0 配置，完全退出 HBO，进入影片详情再播放；在字幕菜单选择新出现的选项。原 English / English CC 仍显示原文。

公版中的 Key 和网关地址均为空，不包含个人配置。无需填写片名、年份、季数或集数，也没有模式、源语言、翻译器、批大小及日志等级开关。保留翻译目标语言、双语上下位置、只显示译文与外部字幕偏移等实际设置。

[下载 ZIP](https://github.com/JerseyRiver/HBO-AI-Subtitles/releases/download/v0.4.0/HBO-AI-Subtitles.zip)。本地备用安装：把 `scripts/HBO.Local.js` 放入 iCloud Drive → Loon → Scripts，导入 `HBO.AI.Subtitles.local.plugin`。ZIP 本身不能作为插件导入。

## 工作方式

插件通过 `/cms/` 的 `video → edit/show` 关系自动识别电影/单集，并与播放请求 `editId` 关联。未取得完整详情时不会借用上一次影片或猜片名；AI 仍可使用，外部字幕需重新进入详情页以取得信息。

选项加入前检查原字幕列表和首段有效 WebVTT；优先英文，英文不可用时检查另一完整语言轨。检查结果短暂缓存，不在打开影片时调用 Gemini。有完整官方中文时直接保留官方字幕。

选择 AI 后，独立列表将正片字幕段映射到专用请求，获取原文、调用 Gemini、保留每条台词的时间及 `X-TIMESTAMP-MAP`。双语/只显示译文只改变字幕文字。片头、预告、强制字幕和空字幕不参与 AI 翻译。

选择外部字幕后，共用 AppleTV 网关的 `/hbo/` 路由，平台缓存分开。服务器匹配 HBO/HMAX/Max 发行字幕，已有合适中文时优先使用，否则翻译英文；整季包必须确认目标集。字幕沿原正片时间窗口返回，不套用 Apple 的 10 秒映射或 CC 校准。没有参考字幕时不会宣称已经自动对齐。首次下载和翻译可能需要等待，完成后可重新进入影片。

Loon 只执行首条匹配的 HTTP 脚本。旧画质插件也匹配播放信息和 HLS，因此应停用旧插件，通过 `QualityCompatibility` 整合；未使用过旧插件的用户保持默认关闭。见 [Loon 文档](https://nsloon.app/docs/Script/)。

## 20 个影片缓存

原文与译文在 `HBOAI.Library.v1` 按电影或单集归组，最多 20 个。不论保存一段还是整集均算一个影片；第 21 个加入时，整组淘汰最早加入影片的原文与译文。读取或新增片段不刷新加入顺序。

优先使用 editId 标识影片，缺少时使用 manifestationId；后续取得 editId 时合并对应旧组，不重复占用名额。原文及译文不固定过期；播放地址保存在 `HBOAI.Context.v1`，6 小时到期后刷新。重复拖回已缓存段不重新下载原文或请求 Gemini。

旧格式没有影片归属，能匹配的条目读取时归组迁移；首次整组淘汰时清理无法关联的旧格式条目，避免被淘汰内容又从旧缓存恢复。修改模型/目标语言会使用不同译文缓存。

## 验证与限制

真实设备最新抓包中的 5 次 AI 字幕请求均返回成功，台词时间与原字幕一致；首次翻译响应约 13～19 秒，重复请求命中译文缓存。新原文缓存优化及影片整组淘汰已通过本地测试，具体延迟取决于网络和 Gemini。

支持已观察到的 `playbackInfo → HLS → WebVTT`，不处理 DASH、加密字幕、内嵌 CEA、直播、未知插播或 DRM。新增菜单及外部字幕无轨回退依赖客户端支持。不同发行剪辑可能错位，外部字幕固定偏移不能修复删减。已检测到主片被额外内容打断的模板会拒绝生成。

本地验证包括六份私有 HAR 的 80 个响应回放、24 次主列表改写，以及中文优先、原文保留、换集、刷新、超时回归、重复拖动免请求、旧缓存迁移、20 个影片整组淘汰与画质整合；服务器另有 31 项测试。回放和合成测试不调用真实 Gemini/SubDL API。抓包不在公开仓库或 ZIP 中。

```sh
npm ci
npm run build
npm test
npm run test:server
```

上一级目录存在 `.har` 时测试会追加回放；可用 `HBO_HAR_PATH` 指定额外抓包。构建源码及依赖包含在 `src/`、`upstream/`、`vendor/` 中。

## 数据与许可

Gemini 接收字幕文本；使用外部字幕时网关接收影片信息。插件不向网关上传 HBO 登录头、Cookie、DRM 许可证或视频流。详情映射最多保留 120 项，位于 `HBOAI.Metadata.v1`。停用插件不会立即擦除本地存储；不要公开分享参数、持久存储或原始抓包。

插件组合遵循 GPL-3.0-only，保留 DualSubs 及依赖声明；原画质代码遵循 MIT；独立网关遵循 Apache-2.0。见 `LICENSE`、`NOTICE`、`scripts/LICENSES.txt` 和 `upstream/hbo-quality/LICENSE`。
