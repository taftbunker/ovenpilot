/* Ovenpilot pricing: single source of truth for the pricing cards and the comparison table.
   - AUTOMATIONS: the 9 automations (ids are referenced by TIERS.includes).
   - TIERS: one object per package. Edit prices/includes here; the cards + table re-render.
   - split: optional payment plan that spreads the setup over the opening months
     (n payments of `amount` = setup + n months; then the normal monthly fee).
   - ADDON: a la carte price for each extra automation, so any count 1–9 is possible.
*/
const AUTOMATIONS = [
  { id: "receptionist", name: "AI Phone Receptionist", short: "24/7 calls, reservations, FAQs, to-go orders" },
  { id: "reservations", name: "Reservations", short: "WhatsApp/text booking 24/7, floor-plan check, confirmation + map pin" },
  { id: "orders", name: "Orders", short: "Delivery apps + website in one queue, kitchen tickets" },
  { id: "noshow", name: "No-show Shield", short: "Auto-confirm 2 hours before, release no-shows to the waitlist" },
  { id: "reviews", name: "Review Booster", short: "Next-morning check-in; every guest gets your Google review link, and low scores alert you first" },
  { id: "promos", name: "Slow-Hour Promos", short: "Spot dips, text a deal to regulars; includes the QR text-list signup" },
  { id: "stock", name: "Stock & Supplier", short: "Inventory from orders, draft supplier order for your approval" },
  { id: "rosters", name: "Smart Rosters", short: "Shifts built around peaks, sick-call cover" },
  { id: "morning", name: "Morning Page", short: "A daily owner brief from all your automations" }
];
const TIERS = [
  { name: "Basic",   count: 1, setup: 1000, monthly: 200,  pickAny: true, includes: ["receptionist"],
    cap: "800 call minutes/month included, then $0.15 per extra minute",
    summary: "Pick any 1 automation. We recommend the AI Phone Receptionist." },
  { name: "Starter", count: 3, setup: 2500, monthly: 500,  split: { n: 2, amount: 1250 }, includes: ["receptionist", "reservations", "reviews"],
    summary: "Answer every call, book every table, and grow your reviews." },
  { name: "Growth",  count: 5, setup: 4500, monthly: 1000, split: { n: 2, amount: 2250 }, featured: true, badge: "Most popular", includes: ["receptionist", "reservations", "reviews", "noshow", "promos"],
    summary: "Fill the seats you have: fewer no-shows and busier slow hours." },
  { name: "Pro",     count: 7, setup: 7000, monthly: 1400, split: { n: 4, amount: 1750 }, includes: ["receptionist", "reservations", "reviews", "noshow", "promos", "orders", "morning"],
    summary: "Adds one order queue for every channel and a daily brief." },
  { name: "Max",     count: 9, setup: 10000, monthly: 2000, split: { n: 4, amount: 2500 }, badge: "All 9 automations", includes: AUTOMATIONS.map(a => a.id),
    summary: "The Full Restaurant Growth System: all 9, including stock and staff rosters." }
];
const ADDON = { setup: 900, monthly: 175 };
const PRICING_NOTE = "Every package can swap in any automations you prefer; the bundles above are our recommendation. Basic includes 800 call minutes/month, then $0.15 per extra minute. Other packages include a fair-use allowance of AI call minutes and texts; heavy usage is billed at cost, with notice first. Third-party software you already use (POS, delivery apps, booking or payroll tools) is billed by those providers. Starter, Growth, Pro and Max setup can be paid in 2 to 4 monthly installments (no payment over $2,500); the monthly fee is billed separately from the start. Prices in USD, no long-term contract.";

const usd = n => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nameOf = id => AUTOMATIONS.find(a => a.id === id).name;

(function render() {
  const el = document.getElementById("tiers");
  if (el) {
    el.dataset.count = TIERS.length;
    el.innerHTML = TIERS.map(t => {
      const list = t.pickAny ? [`Any 1 of 9 (we recommend ${nameOf(t.includes[0])})`] : t.includes.map(nameOf);
      return `
      <article class="tier${t.featured ? " featured" : ""}${t.count === 9 ? " max" : ""}">
        <p class="tier-badge">${esc(t.count === 9 ? (t.badge || "All 9") : `${t.count} automation${t.count > 1 ? "s" : ""}`)}${t.featured ? ` <span class="pill">${esc(t.badge || "Most popular")}</span>` : ""}</p>
        <h3>${esc(t.name)}</h3>
        <p class="tier-price"><b>${usd(t.monthly)}</b><span>/month</span></p>
        <p class="tier-setup">+ ${usd(t.setup)} one-time setup</p>
        ${t.split ? `<p class="tier-split">or pay the setup in ${t.split.n} monthly payments of ${usd(t.split.amount)}</p>` : ""}
        ${t.cap ? `<p class="tier-cap">${esc(t.cap)}</p>` : ""}
        <p class="tier-summary">${esc(t.summary)}</p>
        <ul>${list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <a class="btn ${t.featured ? "btn-primary" : "btn-ghost"} btn-block" href="https://whop.com/ovenpilot">${t.featured ? "Book a call" : "Choose " + esc(t.name)}</a>
      </article>`;
    }).join("");
  }
  const tb = document.getElementById("compare");
  if (tb) {
    const head = `<thead><tr><th scope="col">Automation</th>${TIERS.map(t => `<th scope="col"${t.featured ? ' class="feat"' : ""}>${esc(t.name)}<small>${t.count} of 9</small></th>`).join("")}</tr></thead>`;
    const rows = AUTOMATIONS.map((a, i) => `<tr><th scope="row"><span class="n">${String(i + 1).padStart(2, "0")}</span><b>${esc(a.name)}</b><small>${esc(a.short)}</small></th>${TIERS.map(t => {
      const inc = t.includes.includes(a.id);
      const cell = t.pickAny ? (inc ? '<span class="dot" aria-label="Recommended"></span><small>recommended</small>' : '<span class="or">or</span>') : (inc ? '<span class="dot" aria-label="Included"></span>' : '<span class="dash" aria-label="Add-on">+</span>');
      return `<td${t.featured ? ' class="feat"' : ""}>${cell}</td>`;
    }).join("")}</tr>`).join("");
    const money = (label, fn) => `<tr class="money"><th scope="row">${label}</th>${TIERS.map(t => `<td${t.featured ? ' class="feat"' : ""}>${fn(t)}</td>`).join("")}</tr>`;
    const foot = money("Setup (one-time)", t => usd(t.setup)) + money("Monthly", t => usd(t.monthly));
    tb.innerHTML = head + `<tbody>${rows}</tbody><tfoot>${foot}</tfoot>`;
  }
  const ad = document.getElementById("addon");
  if (ad) ad.innerHTML = `<b>Need a number in between?</b> Add any extra automation to any package for ${usd(ADDON.setup)} setup + ${usd(ADDON.monthly)}/mo, so 2, 4, 6, or 8 automations work too. <span class="key"><span class="dot"></span> included · <span class="dash">+</span> available as an add-on</span>`;
  const note = document.getElementById("pricing-note"); if (note) note.textContent = PRICING_NOTE;
})();
