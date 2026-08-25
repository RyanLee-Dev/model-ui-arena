import { readFile } from "node:fs/promises";
import path from "node:path";

const baseFiles = {
  standard: "standard.md",
  reasoning: "reasoning.md",
  replica: "replica.md",
  svg: "svg.md",
  webgl: "webgl.md",
  threejs: "threejs.md"
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const theme = args.theme ?? "clock";
  const model = args.model ?? "target-model";
  const root = process.cwd();
  const definitions = JSON.parse(
    await readFile(path.join(root, "tasks", "task-definitions.json"), "utf8")
  );
  const task = definitions.tasks.find((item) => item.id === theme);
  if (!task) {
    throw new Error(`unknown task: ${theme}`);
  }

  const language = args.language ?? task.language;
  const maxLines = args["max-lines"] ?? task.lineLimit;
  const baseFile = baseFiles[task.promptProfile];
  const basePath = path.join(root, "tasks", "profiles", baseFile);
  const themePath = path.join(root, "tasks", theme, "prompt.md");

  const [baseRaw, themeRaw] = await Promise.all([
    readFile(basePath, "utf8"),
    readFile(themePath, "utf8")
  ]);

  const base = baseRaw
    .replaceAll("{{LANGUAGE}}", language)
    .replaceAll("{{MAX_LINES}}", String(maxLines));

  const prompt = [
    `目标模型: ${model}`,
    `主题: ${theme}`,
    "",
    "===== 基础规则 =====",
    base,
    "",
    "===== 主题要求 =====",
    themeRaw
  ].join("\n");

  process.stdout.write(prompt + "\n");
}

run().catch((error) => {
  process.stderr.write(`prompt build failed: ${error.message}\n`);
  process.exit(1);
});
