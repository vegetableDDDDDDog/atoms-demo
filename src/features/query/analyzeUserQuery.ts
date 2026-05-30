export type QueryIntent = "consult" | "build";

export type QueryAnalysis = {
  intent: QueryIntent;
  summary: string;
  context: string;
  steps: string[];
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

const consultWords = ["分析", "解释", "建议", "怎么", "如何", "方案", "区别", "review", "explain", "analyze", "suggest"];

function includesAny(value: string, words: string[]) {
  const normalized = value.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function extractSubject(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const systemMatch = cleaned.match(/(?:帮我|请)?(?:做|实现|生成|开发|搭建|写)?(?:一个|个|套|款)?([^，。,.、\s]+(?:系统|应用|页面|工具|平台|网站|小程序|游戏))/);
  return systemMatch?.[1] ?? cleaned.slice(0, 36);
}

function hasExplicitBuildIntent(query: string) {
  const normalized = query.toLowerCase();
  return (
    /(?:做|写)(?:一个|个|套|款)[^？?。]*(?:系统|应用|页面|工具|平台|网站|小程序|游戏)/.test(query) ||
    /(?:实现|生成|开发|搭建|创建|构建)(?:一个|个|套|款)?[^？?。]*(?:系统|应用|页面|工具|平台|网站|小程序|游戏|功能|代码)/.test(
      query
    ) ||
    /(?:修改|修复|发布)[^？?。]*(?:页面|代码|bug|问题|功能|应用|系统)/.test(query) ||
    /\b(build|create|implement|generate|fix)\b/.test(normalized)
  );
}

function extractFeatures(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const marker = cleaned.match(/(?:需要|支持|包含|包括)(.+)$/);
  const source = marker?.[1] ?? cleaned;
  return source
    .split(/[、,，和及]/)
    .map((part) => part.replace(/[。.!！?？]/g, "").trim())
    .filter((part) => part.length >= 2)
    .slice(0, 6);
}

function buildPages(subject: string, features: string[]) {
  const pages = [`${subject}首页`];
  if (features.length > 0) {
    pages.push(`${features[0]}管理页`);
  }
  if (features.length > 1) {
    pages.push(`${features[1]}详情页`);
  }
  return [...new Set(pages)];
}

function buildDataObjects(subject: string, features: string[]) {
  const core = subject.replace(/系统|应用|页面|工具|平台|网站|小程序|游戏/g, "") || "业务";
  return [`${core}记录`, ...features.map((feature) => `${feature}状态`)].slice(0, 5);
}

export function analyzeUserQuery(query: string, attachmentNames: string[] = []): QueryAnalysis {
  const trimmed = query.trim();
  const hasConsultIntent = includesAny(trimmed, consultWords);
  const isBuild = hasExplicitBuildIntent(trimmed) || !hasConsultIntent;
  const subject = extractSubject(trimmed);
  const attachmentContext =
    attachmentNames.length > 0 ? `附件上下文：${attachmentNames.join("、")}` : "无附件";

  if (!isBuild) {
    return {
      intent: "consult",
      summary: `分析问题：${subject}`,
      context: attachmentContext,
      steps: ["理解问题和背景", "拆解关键概念", "给出可执行建议", "列出下一步选择"],
      sections: [
        { title: "问题理解", items: [`当前问题聚焦在：${subject}`] },
        { title: "分析建议", items: ["先明确目标用户", "再拆出核心流程", "最后决定是否进入实现"] },
        { title: "下一步", items: ["继续追问", "补充附件", "确认后转入实现计划"] }
      ]
    };
  }

  const features = extractFeatures(trimmed);
  const normalizedFeatures = features.length > 0 ? features : ["核心信息录入", "列表查看", "状态流转", "结果确认"];

  return {
    intent: "build",
    summary: `准备实现：${subject}`,
    context: attachmentContext,
    steps: ["解析用户需求", "生成需求规格", "制定实施计划", "生成界面与交互", "检查预览并给出修复入口"],
    sections: [
      { title: "需求规格", items: normalizedFeatures },
      { title: "页面结构", items: buildPages(subject, normalizedFeatures) },
      { title: "数据结构", items: buildDataObjects(subject, normalizedFeatures) },
      { title: "任务步骤", items: ["创建页面骨架", "实现表单和列表", "接入本地状态", "生成预览检查"] },
      { title: "预期文件", items: ["app/spec.json", "app/page.tsx", "app/actions.ts", "tests/smoke.spec.ts"] }
    ]
  };
}
