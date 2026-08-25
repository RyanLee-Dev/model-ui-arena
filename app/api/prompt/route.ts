import { NextResponse } from "next/server";
import { buildTaskPrompt, getTask } from "@/lib/task-registry";

export async function GET(request: Request) {
  const theme = new URL(request.url).searchParams.get("theme") ?? "";

  // 仅允许安全字符，防路径遍历
  if (!/^[a-z0-9-]+$/i.test(theme)) {
    return NextResponse.json({ error: "invalid theme" }, { status: 400 });
  }

  const task = getTask(theme);
  if (!task) {
    return NextResponse.json({ error: "theme prompt not found" }, { status: 404 });
  }

  return NextResponse.json({
    theme: task.id,
    promptProfile: task.promptProfile,
    prompt: buildTaskPrompt(task)
  });
}
