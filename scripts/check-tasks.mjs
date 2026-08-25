import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const definitionsPath = path.join(projectRoot, "tasks", "task-definitions.json");
const definitions = JSON.parse(await readFile(definitionsPath, "utf8"));
const profiles = new Set(["standard", "reasoning", "replica", "svg", "webgl"]);

if (!Array.isArray(definitions.tasks) || definitions.tasks.length === 0) {
  throw new Error("Task registry must contain at least one task");
}

const ids = new Set();
for (const task of definitions.tasks) {
  if (!/^[a-z0-9-]+$/.test(task.id ?? "")) {
    throw new Error(`Invalid task id: ${task.id}`);
  }
  if (ids.has(task.id)) {
    throw new Error(`Duplicate task id: ${task.id}`);
  }
  ids.add(task.id);

  if (!task.label || !task.objective || !["html", "text"].includes(task.renderKind)) {
    throw new Error(`Task ${task.id} is missing required display or render fields`);
  }
  if (!Array.isArray(task.submissionFiles) || task.submissionFiles.length === 0) {
    throw new Error(`Task ${task.id} must declare accepted submissionFiles`);
  }
  if (task.lineLimit !== null && (!Number.isInteger(task.lineLimit) || task.lineLimit < 1)) {
    throw new Error(`Task ${task.id} has an invalid lineLimit`);
  }
  if (!profiles.has(task.promptProfile)) {
    throw new Error(`Task ${task.id} has an invalid promptProfile`);
  }

  await access(path.join(projectRoot, "tasks", task.id, "prompt.md"));
}

console.log(`Task registry OK: ${definitions.tasks.length} tasks`);
