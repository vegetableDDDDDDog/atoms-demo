export type QueryIntent = "consult" | "build" | "revise";

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
const reviseWords = ["修改", "修复", "增加", "删除", "改成", "调整", "优化", "change", "update", "revise", "remove", "add"];
const gameWords = ["游戏", "game", "魂斗罗", "射击", "跳跃", "关卡", "敌人", "玩家"];
const contentWords = ["官网", "网站", "落地页", "介绍页", "页面", "landing", "website", "homepage"];

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

function hasRevisionIntent(query: string) {
  return includesAny(query, reviseWords);
}

function isGameRequest(query: string, subject: string) {
  return includesAny(`${query} ${subject}`, gameWords);
}

function isContentPageRequest(query: string, subject: string) {
  return !isGameRequest(query, subject) && includesAny(`${query} ${subject}`, contentWords);
}

function extractFeatures(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const marker = cleaned.match(/(?:需要|支持|包含|包括)(.+)$/);
  if (!marker) return [];

  const source = marker[1];
  return source
    .split(/[、,，和及]/)
    .map((part) => part.replace(/[。.!！?？]/g, "").trim())
    .filter((part) => part.length >= 2)
    .slice(0, 6);
}

function inferGameFeatures(query: string) {
  if (includesAny(query, ["魂斗罗", "射击", "敌人", "子弹", "横版"])) {
    return ["横版移动", "跳跃与射击", "敌人生成", "生命值与得分"];
  }

  return ["玩家控制", "目标收集", "障碍挑战", "得分与重开"];
}

function inferContentFeatures() {
  return ["核心卖点", "内容展示", "行动按钮", "联系入口"];
}

function buildPages(subject: string, features: string[], mode: "workflow" | "game" | "content") {
  if (mode === "content") {
    return ["首屏展示", "内容分区", "行动按钮", "联系入口"];
  }

  if (mode === "game") {
    return ["游戏舞台", "状态栏", "控制说明", "重新开始入口"];
  }

  const pages = [`${subject}首页`];
  if (features.length > 0) {
    pages.push(`${features[0]}管理页`);
  }
  if (features.length > 1) {
    pages.push(`${features[1]}详情页`);
  }
  return [...new Set(pages)];
}

function buildDataObjects(subject: string, features: string[], mode: "workflow" | "game" | "content") {
  if (mode === "content") {
    return ["页面内容", "内容区块", "行动按钮", "联系信息"];
  }

  if (mode === "game") {
    return ["玩家状态", "子弹状态", "敌人状态", "得分与生命值"];
  }

  const core = subject.replace(/系统|应用|页面|工具|平台|网站|小程序|游戏/g, "") || "业务";
  return [`${core}记录`, ...features.map((feature) => `${feature}状态`)].slice(0, 5);
}

function buildTaskSteps(mode: "workflow" | "game" | "content") {
  if (mode === "content") {
    return ["设计信息层级", "生成内容区块", "配置行动按钮", "完成响应式页面"];
  }

  if (mode === "game") {
    return ["创建游戏舞台", "实现玩家控制", "实现游戏循环", "加入碰撞检测", "渲染得分与生命值"];
  }

  return ["创建页面骨架", "实现表单和列表", "接入本地状态", "生成预览检查"];
}

export function analyzeUserQuery(query: string, attachmentNames: string[] = []): QueryAnalysis {
  const trimmed = query.trim();
  const isRevision = hasRevisionIntent(trimmed);
  const isBuild = hasExplicitBuildIntent(trimmed);
  const subject = extractSubject(trimmed);
  const isGame = isGameRequest(trimmed, subject);
  const isContent = isContentPageRequest(trimmed, subject);
  const mode = isGame ? "game" : isContent ? "content" : "workflow";
  const attachmentContext =
    attachmentNames.length > 0 ? `附件上下文：${attachmentNames.join("、")}` : "无附件";

  if (isRevision) {
    return {
      intent: "revise",
      summary: `修改需求：${subject}`,
      context: attachmentContext,
      steps: ["理解变更目标", "定位影响范围", "更新生成文件", "重新检查预览"],
      sections: [
        { title: "变更理解", items: [`用户希望调整：${subject}`] },
        { title: "影响范围", items: ["页面文案", "交互结构", "生成文件", "预览结果"] },
        { title: "任务步骤", items: ["读取当前生成结果", "更新生成文件", "重新渲染预览", "记录变更摘要"] },
        { title: "预期生成文件", items: ["index.html", "styles.css", "app.js"] }
      ]
    };
  }

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
  const normalizedFeatures =
    features.length > 0
      ? features
      : mode === "game"
        ? inferGameFeatures(trimmed)
        : mode === "content"
          ? inferContentFeatures()
          : ["核心信息录入", "列表查看", "状态流转", "结果确认"];

  return {
    intent: "build",
    summary: `准备实现：${subject}`,
    context: attachmentContext,
    steps: ["理解实现目标", "整理需求理解", "制定实施计划", "生成界面与交互", "检查预览并给出修复入口"],
    sections: [
      { title: "需求理解", items: [`目标应用：${subject}`, `核心上下文：${attachmentContext}`] },
      { title: "功能拆解", items: normalizedFeatures },
      { title: "页面结构", items: buildPages(subject, normalizedFeatures, mode) },
      { title: "数据结构", items: buildDataObjects(subject, normalizedFeatures, mode) },
      { title: "任务步骤", items: buildTaskSteps(mode) },
      { title: "预期文件", items: ["index.html", "styles.css", "app.js"] }
    ]
  };
}
