import definitions from "@/tasks/task-definitions.json";
import basePrompt from "@/tasks/profiles/standard.md";
import reasoningPrompt from "@/tasks/profiles/reasoning.md";
import replicaPrompt from "@/tasks/profiles/replica.md";
import svgPrompt from "@/tasks/profiles/svg.md";
import webglPrompt from "@/tasks/profiles/webgl.md";
import threejsPrompt from "@/tasks/profiles/threejs.md";
import { taskPrompts } from "@/lib/generated-task-prompts";

export type PromptProfile = "standard" | "reasoning" | "replica" | "svg" | "webgl" | "threejs";
export type RenderKind = "html" | "text";

export type TaskSpec = {
  id: string;
  label: string;
  objective: string;
  renderKind: RenderKind;
  submissionFiles: string[];
  lineLimit: number | null;
  forbidBitmap: boolean;
  promptProfile: PromptProfile;
  language: string;
  questionText?: string;
  prompt: string;
};

export type ThemeMeta = Pick<TaskSpec, "id" | "label" | "objective" | "lineLimit" | "forbidBitmap">;

const basePrompts: Record<PromptProfile, string> = {
  standard: basePrompt,
  reasoning: reasoningPrompt,
  replica: replicaPrompt,
  svg: svgPrompt,
  webgl: webglPrompt,
  threejs: threejsPrompt
};

export const TASKS: TaskSpec[] = definitions.tasks.map((definition) => {
  const prompt = taskPrompts[definition.id];
  if (!prompt) {
    throw new Error(`Task ${definition.id} has no prompt module`);
  }

  return { ...definition, prompt } as TaskSpec;
});

export const TASKS_BY_ID = new Map(TASKS.map((task) => [task.id, task]));
export const THEMES: ThemeMeta[] = TASKS.map(({ prompt, ...theme }) => theme);

export function getTask(taskId: string): TaskSpec | undefined {
  return TASKS_BY_ID.get(taskId);
}

export function buildTaskPrompt(task: TaskSpec, maxLines = task.lineLimit): string {
  const base = basePrompts[task.promptProfile]
    .replaceAll("{{LANGUAGE}}", task.language)
    .replaceAll("{{MAX_LINES}}", maxLines === null ? "不限" : String(maxLines));

  return `${base}\n\n===== 主题要求 =====\n${task.prompt}`;
}
