import { describe, expect, it } from "vitest";
import { analyzeUserQuery } from "./analyzeUserQuery";

describe("analyzeUserQuery", () => {
  it("detects consultation requests", () => {
    const result = analyzeUserQuery("帮我分析一下这个项目应该怎么设计");

    expect(result.intent).toBe("consult");
    expect(result.summary).toContain("分析");
    expect(result.steps[0]).toContain("理解问题");
    expect(result.sections.map((section) => section.title)).toEqual(["问题理解", "分析建议", "下一步"]);
  });

  it("keeps feature-planning questions as consult requests", () => {
    const result = analyzeUserQuery("帮我分析一下需求管理系统应该先做哪些功能");

    expect(result.intent).toBe("consult");
    expect(result.sections.map((section) => section.title)).toEqual(["问题理解", "分析建议", "下一步"]);
  });

  it("detects implementation requests", () => {
    const result = analyzeUserQuery("帮我做一个校园社团活动报名系统，需要活动发布、学生报名、名额限制和签到核销");

    expect(result.intent).toBe("build");
    expect(result.summary).toContain("校园社团活动报名系统");
    expect(result.steps).toContain("理解实现目标");
    expect(result.steps).toContain("整理需求理解");
    expect(result.steps).toContain("生成界面与交互");
    expect(result.sections.find((section) => section.title === "需求理解")?.items).toContain("目标应用：校园社团活动报名系统");
    expect(result.sections.find((section) => section.title === "功能拆解")?.items).toEqual([
      "活动发布",
      "学生报名",
      "名额限制",
      "签到核销"
    ]);
    expect(result.sections.find((section) => section.title === "页面结构")?.items).toContain("校园社团活动报名系统首页");
    expect(result.sections.find((section) => section.title === "预期文件")?.items).toEqual([
      "index.html",
      "styles.css",
      "app.js"
    ]);
  });

  it("derives concrete game planning from game requests", () => {
    const result = analyzeUserQuery("帮我写一个魂斗罗的游戏");

    expect(result.intent).toBe("build");
    expect(result.sections.find((section) => section.title === "功能拆解")?.items).toEqual([
      "横版移动",
      "跳跃与射击",
      "敌人生成",
      "生命值与得分"
    ]);
    expect(result.sections.find((section) => section.title === "页面结构")?.items).toEqual([
      "游戏舞台",
      "状态栏",
      "控制说明",
      "重新开始入口"
    ]);
    expect(result.sections.find((section) => section.title === "数据结构")?.items).toEqual([
      "玩家状态",
      "子弹状态",
      "敌人状态",
      "得分与生命值"
    ]);
    expect(result.sections.find((section) => section.title === "任务步骤")?.items).toContain("实现游戏循环");
  });

  it("derives content-page planning from website and page requests", () => {
    const result = analyzeUserQuery("帮我做一个产品官网页面，需要产品介绍、价格、联系入口");

    expect(result.intent).toBe("build");
    expect(result.sections.find((section) => section.title === "功能拆解")?.items).toEqual([
      "产品介绍",
      "价格",
      "联系入口"
    ]);
    expect(result.sections.find((section) => section.title === "页面结构")?.items).toEqual([
      "首屏展示",
      "内容分区",
      "行动按钮",
      "联系入口"
    ]);
    expect(result.sections.find((section) => section.title === "任务步骤")?.items).toContain("生成内容区块");
  });

  it("keeps full lifecycle features for workflow system requests", () => {
    const result = analyzeUserQuery("帮我写一个需求管理系统，包含的功能有需求创建、编辑、修改，提交、评审、排期、设计、开发、测试、关闭");

    expect(result.intent).toBe("build");
    expect(result.summary).toContain("需求管理系统");
    expect(result.sections.find((section) => section.title === "功能拆解")?.items).toEqual([
      "需求创建",
      "编辑",
      "修改",
      "提交",
      "评审",
      "排期",
      "设计",
      "开发",
      "测试",
      "关闭"
    ]);
    expect(result.sections.find((section) => section.title === "页面结构")?.items).toEqual([
      "工作台总览",
      "创建与编辑表单",
      "流程看板",
      "详情与操作记录"
    ]);
    expect(result.sections.find((section) => section.title === "任务步骤")?.items).toContain("根据功能拆解生成流程状态");
  });

  it("includes uploaded attachment names as context", () => {
    const result = analyzeUserQuery("根据附件帮我实现这个页面", ["需求说明.md", "首页截图.png"]);

    expect(result.intent).toBe("build");
    expect(result.context).toContain("需求说明.md");
    expect(result.context).toContain("首页截图.png");
  });

  it("detects revision requests", () => {
    const result = analyzeUserQuery("把页面改成移动端优先，并增加筛选功能");

    expect(result.intent).toBe("revise");
    expect(result.summary).toContain("修改需求");
    expect(result.sections.map((section) => section.title)).toEqual(["变更理解", "影响范围", "任务步骤", "预期生成文件"]);
    expect(result.sections.find((section) => section.title === "任务步骤")?.items).toContain("更新生成文件");
  });

  it("treats ambiguous product names as consult requests first", () => {
    const result = analyzeUserQuery("需求管理系统");

    expect(result.intent).toBe("consult");
    expect(result.sections.find((section) => section.title === "下一步")?.items).toContain("确认后转入实现计划");
  });
});
