# 共用字幕服务器升级

结论：**保留一个服务、一个端口、同一套 Key 和访问令牌。** 新版本在旧 Apple 接口旁增加 HBO 接口，平台标记及缓存目录互相隔离。

本仓库和 ZIP 中的 `server/app.py` 是升级后的共用网关；工作区内 Apple 项目与原独立服务器目录也已同步同一代码。这不是另一个服务。尚未连接或修改远程 VPS。

## 已有 VPS

将新版 `server/app.py` 上传到 VPS 的临时位置，例如 `/tmp/subtitles-app.py`。按现有部署路径替换程序；下面路径对应 Apple 项目公开部署教程，如果 VPS 路径不同请按实际路径调整。

```sh
sudo cp /opt/apple-subtitles/app.py /opt/apple-subtitles/app.py.before-hbo
sudo install -m 644 /tmp/subtitles-app.py /opt/apple-subtitles/app.py
sudo systemctl restart apple-subtitles
curl http://127.0.0.1:8765/healthz
```

健康检查应返回版本 `0.12.0`，原有 SubDL/Gemini 配置状态保持符合预期。服务、环境文件、端口和缓存目录不需要新建。若 Caddy/其他反向代理只允许 `/apple/` 路由，需同时放行同一服务的 `/hbo/` 路由；公开教程中的整站反向代理不需要改。

先验证 Apple 原有影片，再让 HBO 插件连接同一 `GatewayURL`。回滚只需恢复备份的 `app.py` 并重启服务；旧 Apple 数字目录缓存没有迁移。

## 接口

- `GET /v1/{token}/apple/{asset_id}/…`：原 Apple 接口。
- `GET /v1/{token}/hbo/{manifestation_uuid}/playlist.m3u8?title=…&duration=…`：仅正片的标准字幕列表；Loon 常用本地合成列表保留片头时间段。
- `GET /v1/{token}/hbo/{manifestation_uuid}/subtitle.vtt?title=…&duration=…&type=tv&season=1&episode=2&from=0&to=600&offset=0`：返回该正片时间窗口的中文字幕，时间映射为 0。
- `GET /v1/{token}/hbo/{manifestation_uuid}/status.json?…`：影片参数需与字幕请求一致；报告 HBO 平台、缓存、来源和未验证的对齐状态。

`from/to/offset` 以秒计，仍然保持正片相对时间，不把片头加入 cue 时间。外部字幕首次计算共用整片文件锁；各个窗口复用同一成品。错片名、错季集或不同剪辑不可能只靠片长自动修正。

新部署按 [Apple 项目服务器教程](https://github.com/JerseyRiver/AppleTV-AI-Subtitles/blob/main/server/README.md) 与本仓库环境示例操作即可；本次无需另起 HBO 服务。
