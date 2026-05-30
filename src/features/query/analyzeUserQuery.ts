export type QueryIntent = "consult" | "build";

export type QueryAnalysis = {
  intent: QueryIntent;
  summary: string;
  context: string;
  steps: string[];
};

const buildWords = [
  "做",
  "实现",
  "生成",
  "开发",
  "写一个",
  "搭建",
  "修改",
  "修复",
  "发布",
  "build",
  "create",
  "implement",
  "generate",
  "fix"
];

const consultWords = ["分析", "解释", "建议", "怎么", "如何", "方案", "区别", "review", "explain", "analyze", "suggest"];

function includesAny(value: string, words: string[]) {
  const normalized = value.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function extractSubject(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const systemMatch = cleaned.match(/(?:一个|个|套|款)?([^，。,.、\s]*(?:系统|应用|页面|工具|平台|网站|小程序|游戏))/);
  return systemMatch?.[1] ?? cleaned.slice(0, 36);
}

export function analyzeUserQuery(query: string, attachmentNames: string[] = []): QueryAnalysis {
  const trimmed = query.trim();
  const isBuild = includesAny(trimmed, buildWords) || !includesAny(trimmed, consultWords);
  const subject = extractSubject(trimmed);
  const attachmentContext =
    attachmentNames.length > 0 ? `附件上下文：${attachmentNames.join("、")}` : "无附件";

  if (!isBuild) {
    return {
      intent: "consult",
      summary: `分析问题：${subject}`,
      context: attachmentContext,
      steps: ["理解问题和背景", "拆解关键概念", "给出可执行建议", "列出下一步选择"]
    };
  }

  return {
    intent: "build",
    summary: `准备实现：${subject}`,
    context: attachmentContext,
    steps: ["解析用户需求", "生成需求规格", "制定实施计划", "生成界面与交互", "检查预览并给出修复入口"]
  };
}
