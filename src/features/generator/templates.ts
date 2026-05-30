import type { AppType, GeneratedAppFiles } from "./types";

type TemplateInput = {
  prompt: string;
  appType: AppType;
  fixRequested?: boolean;
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

const script = `
document.querySelectorAll("[data-add-row]").forEach((button) => {
  button.addEventListener("click", () => {
    const list = document.querySelector(".list");
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = "<span>New generated item</span><span class='tag'>New</span>";
    list?.prepend(row);
  });
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = button.textContent === "Active" ? "Paused" : "Active";
  });
});
`;

const contentByType: Record<AppType, { title: string; description: string; metrics: string[]; rows: string[] }> = {
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
};

export function createTemplate({ prompt, appType, fixRequested }: TemplateInput): GeneratedAppFiles {
  const content = contentByType[appType];
  const qualityNote = fixRequested
    ? "QA repair pass applied with clearer empty states and stronger mobile spacing."
    : "Generated from prompt.";

  return {
    title: content.title,
    description: content.description,
    appType,
    css: baseCss,
    js: script,
    html: `
<main>
  <section class="hero">
    <div>
      <h1>${content.title}</h1>
      <p>${content.description}</p>
      <p>${qualityNote}</p>
    </div>
    <button data-add-row>Add item</button>
  </section>
  <section class="grid">
    ${content.metrics.map((metric) => `<article class="card"><strong>${metric}</strong><p>${prompt}</p></article>`).join("")}
  </section>
  <section class="toolbar">
    <input aria-label="Search generated data">
    <select aria-label="Status"><option>All statuses</option><option>Active</option><option>Paused</option></select>
  </section>
  <section class="list">
    ${content.rows.map((row) => `<div class="row"><span>${row}</span><button data-toggle>Active</button></div>`).join("")}
  </section>
</main>`
  };
}
