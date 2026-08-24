/**
 * stratamesh-fund — fund.calhegasmorais.pt
 * v0.2.1 — bugfix + hybrid style (calhegasmorais.pt × GitHub minimal)
 *
 * GitHub = evidence · Fund = stats + payout routing
 * No STRATA / no GDA in V0 · no iframe embed of /pagamentos (XFO SAMEORIGIN)
 */
const VERSION = "0.2.1-hybrid-ui";

const ORG = "StrataMesh-Laboratory";
const REPOS = [
  { owner: ORG, name: "stratamesh-core", role: "Protocol core" },
  { owner: ORG, name: "stratamesh-laboratory", role: "Lab charter & posture" },
  { owner: ORG, name: "calhegas-morais-node", role: "Reference Fog Node registry" },
  { owner: ORG, name: "stratamesh-impact-fund", role: "This fund application" },
];

const OPERATOR_PAYOUT = {
  github_login: "amcmorais",
  github_user_id: 121771985,
  display_name: "André M. Calhegas Morais",
  method: "eni_pagamentos",
  status: "active",
  widget_url: "https://calhegasmorais.pt/pagamentos",
  widget_note:
    "AMCM ENI payment portal — unique bank-transfer instruction (IBAN not published on the public page). Purpose: donation to the Calhegas Morais Node / StrataMesh project.",
  payment_intent_api: "https://calhegasmorais.pt/api/payment-intent",
  payment_intent_purpose: "donation",
  contact: "geral@eni.calhegasmorais.pt",
};

const PREPAID_PROVIDERS = [
  {
    id: "wise_receive",
    name: "Wise (receive / card path)",
    kind: "prepaid_or_receive",
    description: "Grantor completes purchase on the provider site; delivery uses the email confirmed after GitHub claim.",
    redirect_url: null,
    status: "planned",
  },
  {
    id: "stripe_issuing_slot",
    name: "Stripe Issuing (virtual/physical card slot)",
    kind: "prepaid_card",
    description: "API-integrated issuing when credentials are bound; details delivered to the registered email.",
    redirect_url: null,
    status: "planned",
  },
  {
    id: "manual_grantor_card",
    name: "Grantor-selected prepaid (redirect catalog)",
    kind: "prepaid_card",
    description: "Grantor buys a supported prepaid product and ships to the contributor’s GitHub public-domain email.",
    redirect_url: null,
    status: "available_process",
  },
];

const METHODOLOGY_V01 = {
  version: "0.1",
  title: "Descriptive statistics emphasis (not scientific value)",
  currency: "EUR",
  notes: "Weights guide human allocation discussion in early epochs — not a proven measure of engineering value.",
  metrics: {
    merged_pr: 1.0,
    review: 0.25,
    issue_closed: 0.5,
    commit: 0.1,
    release_participation: 0.75,
  },
  caps: { max_share_per_contributor: 0.35 },
  requires_human_approval: true,
};

const SECURITY = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data: https://avatars.githubusercontent.com https://github.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.github.com; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60",
      ...SECURITY,
    },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      ...SECURITY,
    },
  });
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Hybrid: site tokens + GitHub-like density */
function css() {
  return `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
:root{
  --bg:#0a0a0b;--fg:#e8e6e3;--muted:#8a8780;--line:#1c1c1f;--line2:#2a2a2e;
  --accent:#c4b5a0;--card:#111113;--ok:#6b8f71;--warn:#c4a35a;--err:#c47a6a;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:'IBM Plex Sans',system-ui,sans-serif;font-weight:300;line-height:1.55;min-height:100vh}
a{color:var(--accent);text-decoration:none}
a:hover{color:var(--fg)}
.wrap{max-width:880px;margin:0 auto;padding:0 1.25rem 3.5rem}
.top{position:sticky;top:0;z-index:20;background:rgba(10,10,11,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);margin:0 -1.25rem 1.75rem;padding:0 1.25rem}
.top-inner{display:flex;justify-content:space-between;align-items:center;gap:1rem;min-height:48px;flex-wrap:wrap}
.brand{font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.brand strong{color:var(--fg);font-weight:500}
.nav{font-family:'IBM Plex Mono',monospace;font-size:.65rem;letter-spacing:.08em;display:flex;flex-wrap:wrap;gap:.15rem .85rem;align-items:center}
.nav a{color:var(--muted)}.nav a:hover,.nav a.active{color:var(--fg)}
.nav .sep{opacity:.35;user-select:none}
.kicker{font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:0 0 .65rem}
h1{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:clamp(1.85rem,4.5vw,2.55rem);letter-spacing:-.02em;line-height:1.15;margin:0 0 .55rem;color:var(--fg)}
h2{font-family:'IBM Plex Mono',monospace;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;font-weight:500;color:var(--fg);margin:0 0 .75rem;padding-bottom:.45rem;border-bottom:1px solid var(--line)}
.lead{font-size:1.02rem;color:var(--muted);max-width:40rem;margin:0 0 1.25rem}
.tag{color:var(--muted);font-size:.95rem;margin:0 0 1rem}
.muted{color:var(--muted)}
.mono{font-family:'IBM Plex Mono',monospace;font-size:.78rem}
.actions{display:flex;flex-wrap:wrap;gap:.55rem;margin:1.1rem 0 1.5rem}
.btn{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;padding:.55rem .9rem;border:1px solid var(--line2);border-radius:3px;background:transparent;color:var(--fg);font-weight:500}
.btn:hover{border-color:var(--accent);color:var(--fg);text-decoration:none}
.btn.primary{background:var(--card);border-color:var(--accent);color:var(--fg)}
.btn.primary:hover{background:#18181b}
.section{margin:1.35rem 0;padding:0}
.card{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:1rem 1.1rem;margin:1rem 0}
.grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin:1rem 0 1.35rem}
.stat-box{border:1px solid var(--line);border-radius:4px;padding:.85rem 1rem;background:var(--card)}
.stat{font-family:'IBM Plex Mono',monospace;font-size:1.25rem;font-weight:500;color:var(--fg)}
.stat-label{font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:.25rem}
.pill{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;padding:.25rem .5rem;border:1px solid var(--line2);border-radius:2px;color:var(--muted)}
.pill.ok{border-color:#2a3a2c;color:var(--ok)}
.pill.warn{border-color:#3a3420;color:var(--warn)}
table{width:100%;border-collapse:collapse;font-size:.9rem}
th,td{text-align:left;padding:.55rem .4rem;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:'IBM Plex Mono',monospace;font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
tr:hover td{background:rgba(255,255,255,.015)}
.avatar{width:28px;height:28px;border-radius:50%;vertical-align:middle;margin-right:.45rem;border:1px solid var(--line)}
.steps{margin:.4rem 0 0;padding-left:1.15rem;color:var(--muted)}
.steps li{margin:.35rem 0}
.note{font-size:.88rem;border-left:2px solid var(--line2);padding:.45rem 0 .45rem .85rem;margin:1rem 0;color:var(--muted)}
footer{margin-top:2.75rem;padding-top:1.25rem;border-top:1px solid var(--line);font-size:.8rem;color:var(--muted)}
footer .mono{font-size:.65rem;letter-spacing:.04em;margin-top:.4rem}
.hr{border:0;border-top:1px solid var(--line);margin:1.5rem 0}
code{font-family:'IBM Plex Mono',monospace;font-size:.8rem;background:var(--card);padding:.1rem .3rem;border-radius:2px;border:1px solid var(--line)}
ul.plain{margin:.4rem 0;padding-left:1.1rem;color:var(--muted)}
  `.trim();
}

function shell({ lang, path, title, active, body }) {
  const pt = lang === "pt";
  const enQ = pt ? "" : "?lang=en";
  const homeHref = pt ? "/" : "/en";
  const nav = `
    <nav class="nav" aria-label="primary">
      <a href="${homeHref}" class="${active === "home" ? "active" : ""}">${pt ? "Início" : "Home"}</a>
      <span class="sep">·</span>
      <a href="/contributors${enQ}" class="${active === "contributors" ? "active" : ""}">${pt ? "Contribuidores" : "Contributors"}</a>
      <span class="sep">·</span>
      <a href="/claim${enQ}" class="${active === "claim" ? "active" : ""}">${pt ? "Reclamar" : "Claim"}</a>
      <span class="sep">·</span>
      <a href="${pt ? "/en" : "/"}">${pt ? "EN" : "PT"}</a>
      <span class="sep">·</span>
      <a href="https://calhegasmorais.pt/">Nó</a>
      <span class="sep">·</span>
      <a href="https://github.com/StrataMesh-Laboratory/stratamesh-impact-fund">GitHub</a>
    </nav>`;
  return `<!DOCTYPE html>
<html lang="${pt ? "pt-PT" : "en-GB"}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${pt
    ? "Fundo agrupado StrataMesh — evidência GitHub, estatísticas comparáveis, bolsas EUR/USD."
    : "StrataMesh pooled fund — GitHub evidence, comparable statistics, EUR/USD grants."}"/>
  <link rel="canonical" href="https://fund.calhegasmorais.pt${path.split("?")[0]}"/>
  <link rel="alternate" hreflang="pt-PT" href="https://fund.calhegasmorais.pt/"/>
  <link rel="alternate" hreflang="en-GB" href="https://fund.calhegasmorais.pt/en"/>
  <style>${css()}</style>
</head>
<body>
  <div class="wrap">
    <header class="top">
      <div class="top-inner">
        <a class="brand" href="${homeHref}" style="text-decoration:none"><strong>StrataMesh</strong> · Impact Fund</a>
        ${nav}
      </div>
    </header>
    ${body}
    <footer>
      AMCM ENI · <a href="https://github.com/StrataMesh-Laboratory">StrataMesh Laboratory</a> · ${pt ? "Lisboa" : "Lisbon"} · lab<br/>
      <div class="mono">stratamesh-fund ${VERSION} · no STRATA in V0</div>
    </footer>
  </div>
</body>
</html>`;
}

function homePage(lang) {
  const pt = lang === "pt";
  const path = pt ? "/" : "/en";
  const enQ = pt ? "" : "?lang=en";
  const body = `
    <p class="kicker">${pt ? "Fase 1–2 · Explorer + contas de desembolso" : "Phase 1–2 · Explorer + payout accounts"}</p>
    <h1>StrataMesh Impact Fund</h1>
    <p class="tag">${pt ? "Fundo agrupado para quem constrói a StrataMesh" : "A pooled fund for the people building StrataMesh"}</p>
    <p class="lead">${
      pt
        ? "Recolhemos dados publicamente verificáveis no GitHub, tornamo-los comparáveis e ligamos cada contribuidor a uma conta de desembolso — para bolsas transparentes em EUR/USD."
        : "We collect publicly verifiable GitHub contribution data, make it comparable, and link each contributor to a payout account — for transparent EUR/USD grants."
    }</p>
    <div class="actions">
      <a class="btn primary" href="https://calhegasmorais.pt/pagamentos" rel="noopener">${pt ? "Donativo (operador)" : "Donate (operator)"}</a>
      <a class="btn" href="/contributors${enQ}">${pt ? "Contribuidores" : "Contributors"}</a>
      <a class="btn" href="/api/v1/repositories">${pt ? "API · repos" : "API · repos"}</a>
    </div>
    <div class="grid">
      <div class="stat-box"><div class="stat muted">—</div><div class="stat-label">${pt ? "EUR agrupado (fase 3)" : "EUR pooled (phase 3)"}</div></div>
      <div class="stat-box"><div class="stat" id="c-count">—</div><div class="stat-label">${pt ? "contribuidores" : "contributors"}</div></div>
      <div class="stat-box"><div class="stat">${REPOS.length}</div><div class="stat-label">${pt ? "repositórios" : "repositories"}</div></div>
    </div>
    <div class="section">
      <h2>${pt ? "Como funciona o desembolso" : "How payout works"}</h2>
      <ol class="steps">
        <li><strong>${pt ? "Operador" : "Operator"}</strong> — <a href="https://calhegasmorais.pt/pagamentos">/pagamentos</a> (AMCM ENI · instrução bancária com referência única).</li>
        <li><strong>${pt ? "Outros contribuidores" : "Other contributors"}</strong> — ${pt ? "login GitHub → registar conta (ids opacos no Fundo)." : "GitHub login → register account (opaque ids in the Fund)."}</li>
        <li><strong>${pt ? "Cartão pré-pago" : "Prepaid card"}</strong> — ${pt ? "o grantor escolhe um fornecedor do catálogo; envio para o email público registado no GitHub." : "grantor picks a catalog provider; delivery to the GitHub-registered public-domain email."}</li>
      </ol>
      <p class="note">${
        pt
          ? "O Fundo não substitui o GitHub. Consome evidência pública, agrega estatísticas e encaminha pagamentos — sem STRATA, sem GDA e sem liquidação on-chain na V0."
          : "The Fund does not replace GitHub. It consumes public evidence, aggregates statistics, and routes payments — no STRATA, no GDA, no on-chain settlement in V0."
      }</p>
    </div>
    <div class="section">
      <h2>${pt ? "Repositórios no âmbito" : "In-scope repositories"}</h2>
      <table>
        <thead><tr><th>Repository</th><th>Role</th></tr></thead>
        <tbody>
          ${REPOS.map(
            (r) =>
              `<tr><td><a href="https://github.com/${r.owner}/${r.name}" rel="noopener">${esc(r.name)}</a></td><td class="muted">${esc(r.role)}</td></tr>`
          ).join("")}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2>API</h2>
      <p class="mono muted">
        GET /api/v1/health<br/>
        GET /api/v1/contributors<br/>
        GET /api/v1/contributors/:login<br/>
        GET /api/v1/payout-methods<br/>
        GET /api/v1/prepaid-providers<br/>
        GET /api/v1/methodology/current
      </p>
    </div>
    <script>
      fetch('/api/v1/contributors').then(function(r){return r.json()}).then(function(d){
        var el=document.getElementById('c-count');
        if(el) el.textContent = (d.contributors && d.contributors.length) ? d.contributors.length : '0';
      }).catch(function(){});
    </script>
  `;
  return shell({ lang, path, title: "StrataMesh Impact Fund", active: "home", body });
}

function contributorsPage(lang, list) {
  const pt = lang === "pt";
  const path = pt ? "/contributors" : "/contributors?lang=en";
  const enQ = pt ? "" : "?lang=en";
  const rows = (list || [])
    .map((c) => {
      const pay = c.payout || {};
      let status = `<span class="pill">—</span>`;
      if (pay.status === "active") status = `<span class="pill ok">${esc(pay.method || "active")}</span>`;
      else if (pay.status === "claimable") status = `<span class="pill warn">${pt ? "por reclamar" : "unclaimed"}</span>`;
      const link =
        pay.method === "eni_pagamentos"
          ? `<a href="${esc(pay.widget_url || "https://calhegasmorais.pt/pagamentos")}">/pagamentos</a>`
          : `<a href="/claim?${pt ? "" : "lang=en&"}login=${encodeURIComponent(c.github_login)}">${pt ? "Reclamar" : "Claim"}</a>`;
      const hint =
        c.contributions_hint && c.contributions_hint > 0
          ? String(c.contributions_hint)
          : "—";
      return `<tr>
        <td>${c.avatar_url ? `<img class="avatar" src="${esc(c.avatar_url)}" alt="" width="28" height="28"/>` : ""}
          <a href="/contributors/${esc(c.github_login)}${enQ}">@${esc(c.github_login)}</a></td>
        <td class="mono">${hint}</td>
        <td class="muted">${esc((c.repositories || []).join(", ") || "—")}</td>
        <td>${status}<div style="margin-top:.35rem">${link}</div></td>
      </tr>`;
    })
    .join("");

  const body = `
    <p class="kicker">${pt ? "Contas de desembolso" : "Payout accounts"}</p>
    <h1>${pt ? "Contribuidores" : "Contributors"}</h1>
    <p class="lead">${
      pt
        ? "Descoberta a partir do GitHub (organização StrataMesh-Laboratory). Cada linha liga à conta de desembolso quando existir."
        : "Discovered from GitHub (StrataMesh-Laboratory org). Each row links to a payout account when one exists."
    }</p>
    <div class="card" style="padding:0;overflow:auto">
      <table>
        <thead>
          <tr>
            <th>${pt ? "Contribuidor" : "Contributor"}</th>
            <th>${pt ? "Actividade" : "Activity"}</th>
            <th>${pt ? "Repositórios" : "Repos"}</th>
            <th>${pt ? "Desembolso" : "Payout"}</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows ||
            `<tr><td colspan="4" class="muted">${pt ? "Sem dados GitHub neste momento (rate limit ou rede)." : "No GitHub data right now (rate limit or network)."}</td></tr>`
          }
        </tbody>
      </table>
    </div>
    <p class="note">${
      pt
        ? "«Actividade» é um hint em tempo real da API pública do GitHub — não uma época congelada nem um score de impacto."
        : "“Activity” is a live GitHub public API hint — not a frozen epoch or an impact score."
    }</p>
    <div class="actions">
      <a class="btn primary" href="/claim${enQ}">${pt ? "Reclamar perfil" : "Claim profile"}</a>
      <a class="btn" href="/api/v1/contributors">JSON</a>
    </div>
  `;
  return shell({
    lang,
    path,
    title: pt ? "Contribuidores · Impact Fund" : "Contributors · Impact Fund",
    active: "contributors",
    body,
  });
}

function contributorDetailPage(lang, profile) {
  const pt = lang === "pt";
  const login = profile.github_login;
  const path = `/contributors/${login}`;
  const enQ = pt ? "" : "?lang=en";
  const pay = profile.payout || {};
  let payBlock = "";
  if (pay.method === "eni_pagamentos") {
    payBlock = `
      <div class="section">
        <h2>${pt ? "Conta de desembolso (operador)" : "Payout account (operator)"}</h2>
        <p class="muted">${esc(pay.widget_note || "")}</p>
        <div class="actions">
          <a class="btn primary" href="${esc(pay.widget_url)}" rel="noopener">${pt ? "Abrir /pagamentos" : "Open /pagamentos"}</a>
          <a class="btn" href="mailto:${esc(pay.contact || "geral@eni.calhegasmorais.pt")}">${esc(pay.contact || "")}</a>
        </div>
        <p class="note">${
          pt
            ? "O portal de pagamentos não pode ser embutido em iframe (X-Frame-Options). Use o botão para abrir a página oficial."
            : "The payment portal cannot be embedded in an iframe (X-Frame-Options). Use the button to open the official page."
        }</p>
      </div>`;
  } else if (pay.status === "active") {
    payBlock = `
      <div class="section">
        <h2>${pt ? "Conta de desembolso" : "Payout account"}</h2>
        <p class="mono">${esc(pay.method)} · ${esc(pay.status)}</p>
        <p class="muted">${pt ? "Identificadores bancários completos não são publicados." : "Full bank identifiers are not published."}</p>
      </div>`;
  } else {
    payBlock = `
      <div class="section">
        <h2>${pt ? "Ainda sem conta ligada" : "No payout account linked yet"}</h2>
        <ol class="steps">
          <li><a href="/claim?${pt ? "" : "lang=en&"}login=${encodeURIComponent(login)}">${pt ? "Reclamar via GitHub OAuth" : "Claim via GitHub OAuth"}</a></li>
          <li>${pt ? "Registar dados de conta (opacos no Fundo), ou" : "Register account details (opaque in the Fund), or"}</li>
          <li>${pt ? "receber cartão pré-pago no email GitHub de domínio público (escolha do grantor)." : "receive a prepaid card at the GitHub public-domain email (grantor’s choice)."}</li>
        </ol>
      </div>`;
  }

  const hint =
    profile.contributions_hint && profile.contributions_hint > 0
      ? String(profile.contributions_hint)
      : "—";

  const body = `
    <p class="kicker">${profile.claimed ? (pt ? "perfil reclamado" : "claimed") : (pt ? "descoberta GitHub" : "GitHub discovery")}</p>
    <h1>
      ${profile.avatar_url ? `<img class="avatar" src="${esc(profile.avatar_url)}" alt="" width="28" height="28"/>` : ""}
      @${esc(login)}
    </h1>
    <p class="muted">
      <a href="${esc(profile.profile_url || "https://github.com/" + login)}" rel="noopener">GitHub</a>
      ${profile.display_name ? " · " + esc(profile.display_name) : ""}
    </p>
    <div class="grid">
      <div class="stat-box"><div class="stat">${hint}</div><div class="stat-label">${pt ? "actividade (hint)" : "activity (hint)"}</div></div>
      <div class="stat-box"><div class="stat">${(profile.repositories || []).length}</div><div class="stat-label">${pt ? "repositórios" : "repositories"}</div></div>
      <div class="stat-box"><div class="stat mono" style="font-size:.85rem">${esc((pay.method || pay.status || "—").toString())}</div><div class="stat-label">payout</div></div>
    </div>
    <p class="muted">${pt ? "Repositórios:" : "Repositories:"} ${esc((profile.repositories || []).join(", ") || "—")}</p>
    ${payBlock}
  `;
  return shell({
    lang,
    path,
    title: `@${login} · Impact Fund`,
    active: "contributors",
    body,
  });
}

function claimPage(lang) {
  const pt = lang === "pt";
  const path = pt ? "/claim" : "/claim?lang=en";
  const body = `
    <p class="kicker">${pt ? "Gateway GitHub · fase 2" : "GitHub gateway · phase 2"}</p>
    <h1>${pt ? "Reclamar perfil" : "Claim profile"}</h1>
    <p class="lead">${
      pt
        ? "O login GitHub identifica o contribuidor pelo user id estável. O email de contacto deve ser confirmado explicitamente (preferência: domínio público registado no GitHub)."
        : "GitHub login identifies the contributor by stable user id. Contact email must be confirmed explicitly (prefer: public-domain email registered on GitHub)."
    }</p>
    <div class="section">
      <h2>${pt ? "Fluxo" : "Flow"}</h2>
      <ol class="steps">
        <li>OAuth GitHub (<code>read:user</code>, <code>user:email</code>)</li>
        <li>${pt ? "Confirmar email para comunicações e envio de cartão" : "Confirm email for communications and card delivery"}</li>
        <li>${pt ? "Escolher método" : "Choose method"}:
          <ul class="plain">
            <li><code>registered_account</code> — ${pt ? "registo junto de um prestador (id opaco)" : "provider registration (opaque id)"}</li>
            <li><code>prepaid_card</code> — ${pt ? "aguardar escolha do grantor no catálogo" : "await grantor choice from the catalog"}</li>
          </ul>
        </li>
      </ol>
      <p class="note">${
        pt
          ? "OAuth completo activa-se com GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET no worker. Até lá, use a lista de contribuidores e o portal /pagamentos do operador."
          : "Full OAuth activates when GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are bound on the worker. Until then, use the contributor list and the operator /pagamentos portal."
      }</p>
      <div class="actions">
        <a class="btn" href="/api/v1/payout-methods">${pt ? "Métodos (API)" : "Methods (API)"}</a>
        <a class="btn" href="/api/v1/prepaid-providers">${pt ? "Catálogo pré-pago" : "Prepaid catalog"}</a>
        <a class="btn primary" href="https://calhegasmorais.pt/pagamentos" rel="noopener">/pagamentos</a>
      </div>
    </div>
  `;
  return shell({
    lang,
    path,
    title: pt ? "Reclamar · Impact Fund" : "Claim · Impact Fund",
    active: "claim",
    body,
  });
}

function attachPayout(c) {
  if (
    c.github_login === OPERATOR_PAYOUT.github_login ||
    c.github_user_id === OPERATOR_PAYOUT.github_user_id
  ) {
    return {
      ...c,
      display_name: c.display_name || OPERATOR_PAYOUT.display_name,
      claimed: true,
      payout: {
        method: OPERATOR_PAYOUT.method,
        status: OPERATOR_PAYOUT.status,
        widget_url: OPERATOR_PAYOUT.widget_url,
        widget_note: OPERATOR_PAYOUT.widget_note,
        payment_intent_purpose: OPERATOR_PAYOUT.payment_intent_purpose,
        contact: OPERATOR_PAYOUT.contact,
      },
    };
  }
  return {
    ...c,
    payout: {
      method: null,
      status: "claimable",
      options: ["registered_account", "prepaid_card"],
    },
  };
}

async function discoverContributors(env) {
  const loginSeen = new Map();
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "stratamesh-impact-fund",
  };
  if (env && env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  for (const r of REPOS) {
    try {
      const api = `https://api.github.com/repos/${r.owner}/${r.name}/contributors?per_page=100&anon=false`;
      const res = await fetch(api, { headers });
      if (res.status === 204 || res.status === 202) continue;
      if (!res.ok) continue;
      const list = await res.json();
      if (!Array.isArray(list)) continue;
      for (const c of list) {
        if (!c || c.type === "Bot") continue;
        const prev = loginSeen.get(c.id) || {
          github_user_id: c.id,
          github_login: c.login,
          avatar_url: c.avatar_url,
          profile_url: c.html_url,
          contributions_hint: 0,
          repositories: [],
          claimed: false,
        };
        prev.contributions_hint += Number(c.contributions) || 0;
        if (!prev.repositories.includes(r.name)) prev.repositories.push(r.name);
        loginSeen.set(c.id, prev);
      }
    } catch (_) {
      /* network / rate limit — continue */
    }
  }

  // Ensure operator always present
  const hasOp = [...loginSeen.values()].some(
    (c) => c.github_login === OPERATOR_PAYOUT.github_login
  );
  if (!hasOp) {
    loginSeen.set(OPERATOR_PAYOUT.github_user_id, {
      github_user_id: OPERATOR_PAYOUT.github_user_id,
      github_login: OPERATOR_PAYOUT.github_login,
      avatar_url: "https://avatars.githubusercontent.com/u/121771985?v=4",
      profile_url: "https://github.com/amcmorais",
      display_name: OPERATOR_PAYOUT.display_name,
      contributions_hint: 0,
      repositories: REPOS.map((r) => r.name),
      claimed: true,
    });
  }

  return [...loginSeen.values()]
    .map(attachPayout)
    .sort((a, b) => (b.contributions_hint || 0) - (a.contributions_hint || 0));
}

function resolveLang(url, path) {
  const q = url.searchParams.get("lang");
  if (q === "en") return "en";
  if (q === "pt") return "pt";
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return "pt";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname.replace(/\/+$/, "") || "/";
    const lang = resolveLang(url, path);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256",
        },
      });
    }

    if (path === "/api/v1/health" || path === "/health") {
      return json({
        ok: true,
        service: "stratamesh-fund",
        version: VERSION,
        phase: "1-2-explorer-payout-accounts",
        principle:
          "GitHub is the evidence layer; the Fund is interpretation, transparency and payment.",
        no_strata_in_v0: true,
        operator_payout: {
          login: OPERATOR_PAYOUT.github_login,
          method: OPERATOR_PAYOUT.method,
          widget_url: OPERATOR_PAYOUT.widget_url,
        },
      });
    }

    if (path === "/api/v1/repositories") {
      return json({
        organization: ORG,
        repositories: REPOS.map((r) => ({
          ...r,
          url: `https://github.com/${r.owner}/${r.name}`,
        })),
      });
    }

    if (path === "/api/v1/epochs") {
      return json({ epochs: [], note: "No epoch frozen yet." });
    }

    if (path === "/api/v1/payout-methods") {
      return json({
        methods: [
          {
            id: "eni_pagamentos",
            who: "operator",
            description:
              "AMCM ENI /pagamentos — unique bank-transfer instruction via payment-intent (purpose=donation). Not embeddable (X-Frame-Options).",
            widget_url: OPERATOR_PAYOUT.widget_url,
            stores_iban_in_fund: false,
          },
          {
            id: "registered_account",
            who: "contributor_after_github_oauth",
            description:
              "Claim via GitHub OAuth; register payout with a provider; Fund stores opaque recipient id only.",
            stores_iban_in_fund: false,
          },
          {
            id: "prepaid_card",
            who: "grantor_choice",
            description:
              "Grantor selects an integrated prepaid option, redirects to provider purchase; card sent to GitHub-registered public-domain email.",
            delivery: "github_public_domain_email",
            providers_endpoint: "/api/v1/prepaid-providers",
          },
        ],
      });
    }

    if (path === "/api/v1/prepaid-providers") {
      return json({
        note: "Grantor chooses one option at grant time. Redirect URLs bind when provider contracts are active.",
        providers: PREPAID_PROVIDERS,
      });
    }

    if (path === "/api/v1/contributors") {
      const contributors = await discoverContributors(env);
      return json({
        phase: "1-2-explorer-payout-accounts",
        note: "Live GitHub hints + linked payout accounts where registered. Not a frozen epoch.",
        contributors,
      });
    }

    if (path.startsWith("/api/v1/contributors/")) {
      const key = decodeURIComponent(path.split("/").pop());
      const contributors = await discoverContributors(env);
      const found =
        contributors.find(
          (c) =>
            String(c.github_login).toLowerCase() === key.toLowerCase() ||
            String(c.github_user_id) === key
        ) || null;
      if (!found) return json({ error: "not_found", github_login: key }, 404);
      return json(found);
    }

    if (path === "/api/v1/methodology/current") {
      return json(METHODOLOGY_V01);
    }

    if (path === "/api/github/webhook" && request.method === "POST") {
      return json({
        accepted: true,
        delivery: request.headers.get("X-GitHub-Delivery") || null,
        event: request.headers.get("X-GitHub-Event") || "unknown",
        note: "Webhook accepted for async processing. No scoring on the request path.",
      });
    }

    // Pages
    if (path === "/" || path === "/pt") return html(homePage("pt"));
    if (path === "/en") return html(homePage("en"));

    if (path === "/contributors") {
      const list = await discoverContributors(env);
      return html(contributorsPage(lang, list));
    }

    if (path.startsWith("/contributors/")) {
      const key = decodeURIComponent(path.split("/").pop() || "");
      const list = await discoverContributors(env);
      let found = list.find((c) => c.github_login.toLowerCase() === key.toLowerCase());
      if (!found && key.toLowerCase() === "amcmorais") {
        found = attachPayout({
          github_user_id: OPERATOR_PAYOUT.github_user_id,
          github_login: "amcmorais",
          avatar_url: "https://avatars.githubusercontent.com/u/121771985?v=4",
          profile_url: "https://github.com/amcmorais",
          display_name: OPERATOR_PAYOUT.display_name,
          contributions_hint: 0,
          repositories: REPOS.map((r) => r.name),
          claimed: true,
        });
      }
      if (!found) {
        return html(
          shell({
            lang,
            path: `/contributors/${key}`,
            title: "Not found · Impact Fund",
            active: "contributors",
            body: `<h1>404</h1><p class="muted">@${esc(key)}</p><a class="btn" href="/contributors">${lang === "pt" ? "Voltar" : "Back"}</a>`,
          }),
          404
        );
      }
      return html(contributorDetailPage(lang, found));
    }

    if (path === "/claim") return html(claimPage(lang));

    if (path === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return json({ error: "not_found", path }, 404);
  },
};
