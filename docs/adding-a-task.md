# 新增评测任务

任务的唯一元数据来源是 `tasks/task-definitions.json`。页面、扫描器、构建 manifest 和 prompt CLI 都读取它；不要再在各处维护任务 ID 或特殊主题集合。

## 新增步骤

1. 在 `tasks/task-definitions.json` 的 `tasks` 数组添加一条记录。
2. 创建任务目录与题面：`tasks/<task-id>/prompt.md`。
3. 执行 `npm run tasks:sync && npm run check:tasks`，生成静态 prompt 注册表并确认配置一致。
4. 放入首个作品：`public/submissions/<task-id>/<model>/<file>`。
5. 执行 `npm run manifest`（部署前 `npm run build` 会自动执行）。

## 字段

- `renderKind`：`html` 或 `text`。
- `submissionFiles`：按优先顺序接受的文件名；视觉任务通常为 `["index.html"]`。
- `lineLimit`：数字代表行数上限；`null` 代表不限。
- `forbidBitmap`：`true` 时会检查 `<img>`、data image 和常见位图 CSS URL。
- `promptProfile`：`standard`、`reasoning`、`svg`、`replica` 或 `webgl`，决定基础约束模板。
- `language`：填入基础 prompt 的运行语言说明。

例子：

```json
{
  "id": "music-player",
  "label": "音乐播放器",
  "objective": "交互状态、视觉层级、播放反馈",
  "renderKind": "html",
  "submissionFiles": ["index.html"],
  "lineLimit": 220,
  "forbidBitmap": false,
  "promptProfile": "standard",
  "language": "HTML + CSS + JavaScript"
}
```
