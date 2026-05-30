import type { AppType, GeneratedAppFiles, Locale } from "./types";

type TemplateInput = {
  prompt: string;
  appType: AppType;
  locale?: Locale;
  fixRequested?: boolean;
};

type TemplateContent = {
  title: string;
  description: string;
  metrics: string[];
  rows: string[];
};

type TemplateUiCopy = {
  addItem: string;
  allStatuses: string;
  active: string;
  paused: string;
  newItem: string;
  newTag: string;
  qualityGenerated: string;
  qualityFixed: string;
  searchLabel: string;
  statusLabel: string;
};

const baseCss = `
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f5f7fb; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: #f5f7fb; }
main { padding: 24px; max-width: 1120px; margin: 0 auto; }
.hero { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 18px; }
h1 { font-size: 28px; margin: 0 0 6px; letter-spacing: 0; }
p { margin: 0; color: #647084; line-height: 1.5; }
button { border: 0; border-radius: 8px; background: #111827; color: #fff; padding: 10px 13px; font-weight: 700; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.card { border: 1px solid #dde4ef; border-radius: 10px; background: #fff; padding: 14px; box-shadow: 0 10px 24px rgba(15, 23, 42, .06); }
.card strong { display: block; font-size: 22px; margin-bottom: 5px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
input, select { border: 1px solid #d3dbe8; border-radius: 8px; padding: 10px; min-width: 0; }
.list { display: grid; gap: 8px; }
.row { display: flex; justify-content: space-between; align-items: center; border: 1px solid #e0e6ef; border-radius: 9px; background: #fff; padding: 10px 12px; }
.tag { border-radius: 999px; background: #eaf3ff; color: #1158c7; padding: 4px 8px; font-size: 12px; font-weight: 700; }
@media (max-width: 760px) { main { padding: 16px; } .hero { align-items: flex-start; flex-direction: column; } .grid { grid-template-columns: 1fr; } .row { align-items: flex-start; flex-direction: column; gap: 8px; } }
`;

function createScript(labels: Pick<TemplateUiCopy, "active" | "paused" | "newItem" | "newTag">) {
  return `
const labels = ${JSON.stringify(labels)};

document.querySelectorAll("[data-add-row]").forEach((button) => {
  button.addEventListener("click", () => {
    const list = document.querySelector(".list");
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = "<span>" + labels.newItem + "</span><span class='tag'>" + labels.newTag + "</span>";
    list?.prepend(row);
  });
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = button.textContent === labels.active ? labels.paused : labels.active;
  });
});
`;
}

const uiByLocale: Record<Locale, TemplateUiCopy> = {
  en: {
    addItem: "Add item",
    allStatuses: "All statuses",
    active: "Active",
    paused: "Paused",
    newItem: "New generated item",
    newTag: "New",
    qualityGenerated: "Generated from prompt.",
    qualityFixed: "QA repair pass applied with clearer empty states and stronger mobile spacing.",
    searchLabel: "Search generated data",
    statusLabel: "Status"
  },
  zh: {
    addItem: "新增记录",
    allStatuses: "全部状态",
    active: "进行中",
    paused: "已暂停",
    newItem: "新生成记录",
    newTag: "新增",
    qualityGenerated: "根据需求生成。",
    qualityFixed: "QA 修复版：优化空状态和移动端间距。",
    searchLabel: "搜索生成数据",
    statusLabel: "状态"
  }
};

const contentByLocale: Record<Locale, Record<AppType, TemplateContent>> = {
  en: {
    crm: {
      title: "Booking CRM",
      description: "Manage customer bookings, revenue, and follow-ups from one generated workspace.",
      metrics: ["12 bookings", "$8.4k revenue", "4 follow-ups"],
      rows: ["Ada Chen - Product consultation", "Northwind Studio - Renewal call", "Kai Liu - Onboarding"]
    },
    portfolio: {
      title: "Portfolio Monitor",
      description: "Track holdings, watchlist movement, and allocation signals in a compact dashboard.",
      metrics: ["$42.8k value", "+3.2% today", "8 assets"],
      rows: ["NVDA - Watch momentum", "BTC - Rebalance alert", "Cash - Reserve target"]
    },
    operations: {
      title: "Operations Board",
      description: "Prioritize work, assign owners, and keep internal execution visible.",
      metrics: ["18 tasks", "6 in progress", "3 blocked"],
      rows: ["Prepare launch checklist", "Review support backlog", "Sync vendor contract"]
    },
    commerce: {
      title: "Commerce Console",
      description: "Manage products, orders, and merchandising actions for a small storefront.",
      metrics: ["32 orders", "$12.1k sales", "9 products"],
      rows: ["Coffee kit - Restock", "Gift box - Feature item", "Ceramic cup - Price test"]
    }
  },
  zh: {
    crm: {
      title: "预约 CRM",
      description: "在一个生成工作台里管理客户预约、收入和跟进事项。",
      metrics: ["12 个预约", "¥8.4k 收入", "4 个待跟进"],
      rows: ["Ada Chen - 产品咨询", "Northwind Studio - 续约沟通", "Kai Liu - 入门引导"]
    },
    portfolio: {
      title: "投资组合监控",
      description: "紧凑呈现持仓、关注列表走势和资产配置提醒。",
      metrics: ["¥42.8k 资产", "今日 +3.2%", "8 个资产"],
      rows: ["NVDA - 观察动量", "BTC - 再平衡提醒", "现金 - 储备目标"]
    },
    operations: {
      title: "运营任务看板",
      description: "安排优先级、分配负责人，并保持内部执行过程可见。",
      metrics: ["18 个任务", "6 个进行中", "3 个阻塞"],
      rows: ["准备发布清单", "复盘支持工单", "同步供应商合同"]
    },
    commerce: {
      title: "电商控制台",
      description: "管理商品、订单和小型店铺的运营动作。",
      metrics: ["32 个订单", "¥12.1k 销售额", "9 个商品"],
      rows: ["咖啡套装 - 补货", "礼盒 - 主推商品", "陶瓷杯 - 价格测试"]
    }
  }
};

export function createTemplate({ prompt, appType, locale = "en", fixRequested }: TemplateInput): GeneratedAppFiles {
  const content = contentByLocale[locale][appType];
  const ui = uiByLocale[locale];
  const qualityNote = fixRequested ? ui.qualityFixed : ui.qualityGenerated;

  return {
    title: content.title,
    description: content.description,
    appType,
    css: baseCss,
    js: createScript(ui),
    html: `
<main>
  <section class="hero">
    <div>
      <h1>${content.title}</h1>
      <p>${content.description}</p>
      <p>${qualityNote}</p>
    </div>
    <button data-add-row>${ui.addItem}</button>
  </section>
  <section class="grid">
    ${content.metrics.map((metric) => `<article class="card"><strong>${metric}</strong><p>${prompt}</p></article>`).join("")}
  </section>
  <section class="toolbar">
    <input aria-label="${ui.searchLabel}">
    <select aria-label="${ui.statusLabel}"><option>${ui.allStatuses}</option><option>${ui.active}</option><option>${ui.paused}</option></select>
  </section>
  <section class="list">
    ${content.rows.map((row) => `<div class="row"><span>${row}</span><button data-toggle>${ui.active}</button></div>`).join("")}
  </section>
</main>`
  };
}
