# Agent Instructions

## Adding a benchmark task

`tasks/task-definitions.json` is the single source of truth for active tasks. Do not add task IDs, submission rules, prompt profiles, or display metadata in page components, API routes, scanners, or build scripts.

To add a task:

1. Add one object to the `tasks` array in `tasks/task-definitions.json`.
2. Create `tasks/<task-id>/prompt.md` with the task-specific requirements.
3. Run `npm run tasks:sync && npm run check:tasks`.
4. Add submissions under `public/submissions/<task-id>/<model>/<submission-file>`.
5. Run `npm run manifest` before verifying or deploying.

Task ID requirements: lowercase letters, numbers, and hyphens only. The ID must match the task directory, submission directory, and URL segment.

Required task fields:

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

- `renderKind`: `html` or `text`.
- `submissionFiles`: accepted names in priority order.
- `lineLimit`: positive integer, or `null` for unlimited.
- `forbidBitmap`: enables bitmap-asset auditing.
- `promptProfile`: one of `standard`, `reasoning`, `svg`, `replica`, `webgl`, or `threejs`; profiles live in `tasks/profiles/`.

Never modify generated files manually: `lib/generated-task-prompts.ts` and `lib/generated-submissions.json`.
