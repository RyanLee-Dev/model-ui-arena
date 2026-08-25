import { Dirent, promises as fs } from "node:fs";
import path from "node:path";
import generatedSubmissions from "@/lib/generated-submissions.json";
import { compareModels } from "@/lib/model-order";
import { getTask, TASKS, THEMES } from "@/lib/task-registry";

export { THEMES } from "@/lib/task-registry";
export type { ThemeMeta } from "@/lib/task-registry";

export type Submission = {
  id: string;
  theme: string;
  model: string;
  filename: string;
  path: string;
  publicPath: string;
  renderKind: "html" | "text";
  linesTotal: number;
  linesCss: number;
  linesJs: number;
  sizeBytes: number;
  withinLineLimit: boolean;
  unlimitedLines?: boolean;
  usesBitmap?: boolean;
  updatedAt: string;
  questionText?: string;
  answerText?: string;
};

export const LINE_LIMIT = 220;

export const UNLIMITED_LINE_THEMES = new Set(
  TASKS.filter((task) => task.lineLimit === null).map((task) => task.id)
);

export const BITMAP_AUDIT_THEMES = new Set(
  TASKS.filter((task) => task.forbidBitmap).map((task) => task.id)
);

const THEME_ORDER = new Map(TASKS.map((task, index) => [task.id, index]));

function sharePathForSubmission(themeId: string, model: string, filename: string): string {
  const base = `/submissions/${themeId}/${model}`;
  return filename.toLowerCase() === "index.html" ? `${base}/` : `${base}/${filename}`;
}

function countInlineTagLines(html: string, tagName: "style" | "script"): number {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  let lines = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const content = match[1] ?? "";
    const trimmed = content.trim();
    if (!trimmed) {
      continue;
    }
    lines += trimmed.split(/\r?\n/).length;
  }

  return lines;
}

function usesBitmapAsset(content: string): boolean {
  if (/<img\b/i.test(content)) {
    return true;
  }
  if (/data:image\//i.test(content)) {
    return true;
  }
  if (/url\(\s*['"]?[^'")]+\.(?:png|jpe?g|gif|webp|bmp|avif)\b/i.test(content)) {
    return true;
  }
  return false;
}

async function scanFilesystemSubmissions(): Promise<Submission[]> {
  const submissionsRoot = path.join(process.cwd(), "public", "submissions");

  let themeDirs: Dirent[] = [];
  try {
    themeDirs = await fs.readdir(submissionsRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const output: Submission[] = [];

  for (const themeDir of themeDirs) {
    if (!themeDir.isDirectory()) {
      continue;
    }

    const themeId = themeDir.name;
    const task = getTask(themeId);
    if (!task) {
      continue;
    }

    const themePath = path.join(submissionsRoot, themeId);
    const modelDirs = await fs.readdir(themePath, { withFileTypes: true });

    for (const modelDir of modelDirs) {
      if (!modelDir.isDirectory()) {
        continue;
      }

      const model = modelDir.name;
      const candidates = task.submissionFiles;

      let filename = "";
      let content = "";
      let stats: Awaited<ReturnType<typeof fs.stat>> | null = null;

      for (const candidate of candidates) {
        const absoluteFile = path.join(themePath, model, candidate);
        try {
          const [fileText, fileStats] = await Promise.all([
            fs.readFile(absoluteFile, "utf8"),
            fs.stat(absoluteFile)
          ]);
          filename = candidate;
          content = fileText;
          stats = fileStats;
          break;
        } catch {
          continue;
        }
      }

      if (!filename || !stats) {
        continue;
      }

      const isHtml = filename.toLowerCase().endsWith(".html");
      const linesTotal = content.split(/\r?\n/).length;
      const linesCss = isHtml ? countInlineTagLines(content, "style") : 0;
      const linesJs = isHtml ? countInlineTagLines(content, "script") : 0;
      const unlimitedLines = task.lineLimit === null;
      const usesBitmap = isHtml ? usesBitmapAsset(content) : false;

      output.push({
        id: `${themeId}:${model}`,
        theme: themeId,
        model,
        filename,
        path: sharePathForSubmission(themeId, model, filename),
        publicPath: `/submissions/${themeId}/${model}/${filename}`,
        renderKind: isHtml ? "html" : "text",
        linesTotal,
        linesCss,
        linesJs,
        sizeBytes: stats.size,
        withinLineLimit: task.lineLimit === null || linesTotal <= task.lineLimit,
        unlimitedLines,
        usesBitmap,
        updatedAt: stats.mtime.toISOString(),
        questionText: !isHtml ? task.questionText : undefined,
        answerText: !isHtml ? content.trim() : undefined
      });
    }
  }

  output.sort((a, b) => {
    const themeDelta =
      (THEME_ORDER.get(a.theme) ?? Number.MAX_SAFE_INTEGER) -
      (THEME_ORDER.get(b.theme) ?? Number.MAX_SAFE_INTEGER);
    if (themeDelta !== 0) {
      return themeDelta;
    }
    return compareModels(a.model, b.model);
  });

  return output;
}

export async function scanSubmissions(): Promise<Submission[]> {
  const filesystemSubmissions = await scanFilesystemSubmissions();

  if (filesystemSubmissions.length > 0) {
    return filesystemSubmissions;
  }

  return generatedSubmissions as Submission[];
}
