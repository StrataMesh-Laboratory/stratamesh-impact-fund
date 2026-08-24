/**
 * stratamesh-fund — fund.calhegasmorais.pt
 * V0.2: Explorer + contributor payout accounts
 *
 * GitHub = evidence layer
 * Fund = statistics + payout routing (no STRATA / no GDA in V0)
 *
 * Payout paths:
 *  1. Operator (amcmorais): widget → https://calhegasmorais.pt/pagamentos (ENI payment-intent)
 *  2. Claimed contributors: GitHub OAuth → register payout account (opaque provider id)
 *  3. Grantor prepaid card: choose integrated provider → purchase redirect → ship to
 *     contributor GitHub-registered public-domain email
 */
const VERSION = "0.2.0-payout-accounts";

const ORG = "StrataMesh-Laboratory";
const REPOS = [
  { owner: ORG, name: "stratamesh-core", role: "Protocol core" },
  { owner: ORG, name: "stratamesh-laboratory", role: "Lab charter & posture" },
  { owner: ORG, name: "calhegas-morais-node", role: "Reference Fog Node registry" },
  { owner: ORG, name: "stratamesh-impact-fund", role: "This fund application" },
];

/** Known operator payout — already live on /pagamentos */
const OPERATOR_PAYOUT = {
  github_login: "amcmorais",
  github_user_id: 121771985,
  display_name: "André M. Calhegas Morais",
  method: "eni_pagamentos",
  status: "active",
  widget_url: "https://calhegasmorais.pt/pagamentos",
  widget_note:
    "AMCM ENI payment portal — generates a unique bank-transfer instruction (IBAN not published on the public page). Purpose: donation to the Calhegas Morais Node / StrataMesh project.",
  payment_intent_api: "https://calhegasmorais.pt/api/payment-intent",
  payment_intent_purpose: "donation",
  contact: "geral@eni.calhegasmorais.pt",
};

/**
 * Prepaid card catalog (grantor chooses; redirect to provider purchase page).
 * Card is then sent to the contributor's GitHub-registered public-domain email.
 * Providers are integration slots — configure real product URLs/API keys in env when live.
 */
const PREPAID_PROVIDERS = [
  {
    id: "wise_receive",
    name: "Wise (receive / card path)",
    kind: "prepaid_or_receive",
    description:
      "Grantor completes purchase or transfer on the provider site; delivery uses the contributor email confirmed after GitHub claim.",
    redirect_url: null, // set via env or ops when contract is active
    status: "planned",
  },
  {
    id: "stripe_issuing_slot",
    name: "Stripe Issuing (virtual/physical card slot)",
    kind: "prepaid_card",
    description:
      "API-integrated issuing when credentials are bound; card details delivered out-of-band to the registered email.",
    redirect_url: null,
    status: "planned",
  },
  {
    id: "manual_grantor_card",
    name: "Grantor-selected prepaid (redirect catalog)",
    kind: "prepaid_card",
    description:
      "Grantor picks a supported retail prepaid product, buys on the provider page, and ships to the contributor's GitHub public-domain email.",
    redirect_url: null,
    status: "available_process",
  },
];

const SECURITY = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.github.com https://calhegasmorais.pt; frame-src https://calhegasmorais.pt https://eni.calhegasmorais.pt; frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...SECURITY,
      ...extra,
    },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...SECURITY },
  });
}

const METHODOLOGY_V01 = {
  version: "0.1",
  title: "Descriptive statistics emphasis (not scientific value)",
  currency: "EUR",
  notes:
    "Weights guide human allocation discussion in early epochs. They are not a proven measure of engineering value.",
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

function css() {
  return `
    :root {
      --bg: #0b0f14; --card: #121821; --text: #e8eef6; --muted: #9aabbd;
      --accent: #5b9fd4; --line: #243041; --ok: #6bcb8b; --warn: #e0b35a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1a2740 0%, var(--bg) 55%);
      color: var(--text); line-height: 1.55; min-height: 100vh;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 960px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    header { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .brand { font-weight: 700; letter-spacing: .02em; }
    .muted { color: var(--muted); }
    h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); margin: 0 0 .5rem; }
    h2 { font-size: 1.1rem; margin: 0 0 .6rem; }
    .tag { color: var(--muted); font-size: 1.05rem; margin-bottom: 1rem; }
    .lead { font-size: 1.05rem; max-width: 65ch; }
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin: 1.25rem 0 1.5rem; }
    .btn {
      display: inline-block; padding: .65rem 1rem; border-radius: 8px;
      border: 1px solid var(--line); background: var(--card); color: var(--text); font-weight: 600;
    }
    .btn.primary { background: #1e4f7a; border-color: #2a6aa3; }
    .btn.ghost { background: transparent; }
    section {
      background: color-mix(in srgb, var(--card) 88%, transparent);
      border: 1px solid var(--line); border-radius: 12px; padding: 1.25rem 1.35rem; margin: 1rem 0;
    }
    table { width: 100%; border-collapse: collapse; font-size: .95rem; }
    th, td { text-align: left; padding: .5rem .35rem; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { color: var(--muted); font-weight: 600; }
    .pill {
      display: inline-block; font-size: .75rem; padding: .15rem .5rem; border-radius: 999px;
      border: 1px solid var(--line); margin-bottom: .75rem;
    }
    .pill.ok { color: var(--ok); }
    .pill.warn { color: var(--warn); }
    code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .85rem; }
    footer { margin-top: 2.5rem; color: var(--muted); font-size: .85rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .stat { font-size: 1.35rem; font-weight: 700; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; vertical-align: middle; margin-right: .5rem; }
    iframe.pay-widget {
      width: 100%; min-height: 520px; border: 1px solid var(--line); border-radius: 10px; background: #fff;
    }
    .steps { margin: .5rem 0 0; padding-left: 1.2rem; }
    .steps li { margin: .35rem 0; }
  `;
}

function shell({ lang, path, title, body }) {
  const pt = lang === "pt";
  return `<!DOCTYPE html>
<html lang="${pt ? "pt-PT" : "en-GB"}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <link rel="canonical" href="https://fund.calhegasmorais.pt${path}"/>
  <link rel="alternate" hreflang="pt-PT" href="https://fund.calhegasmorais.pt/"/>
  <link rel="alternate" hreflang="en-GB" href="https://fund.calhegasmorais.pt/en"/>
  <style>${css()}</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand"><a href="${pt ? "/" : "/en"}" style="color:inherit;text-decoration:none">StrataMesh Impact Fund</a></div>
      <div class="muted">
        <a href="${pt ? "/en" : "/"}">${pt ? "English" : "Português"}</a> ·
        <a href="/contributors${pt ? "" : "?lang=en"}">${pt ? "Contribuidores" : "Contributors"}</a> ·
        <a href="https://calhegasmorais.pt/">calhegasmorais.pt</a> ·
        <a href="https://github.com/StrataMesh-Laboratory/stratamesh-impact-fund">GitHub</a>
      </div>
    </header>
    ${body}
    <footer>
      AMCM ENI · StrataMesh Laboratory · ${pt ? "Lisboa" : "Lisbon"} · ${pt ? "laboratório" : "laboratory"}<br/>
      <span class="mono">stratamesh-fund ${VERSION}</span>
    </footer>
  </div>
</body>
</html>`;
}

function homePage(lang) {
  const pt = lang === "pt";
  const path = pt ? "/" : "/en";
  const t = pt
    ? {
        title: "StrataMesh Impact Fund",
        tag: "Fundo agrupado para quem constrói a StrataMesh",
        lead:
          "Recolhemos dados de contribuição publicamente verificáveis no GitHub, tornamo-los comparáveis e ligamos cada contribuidor a uma conta de desembolso — para bolsas transparentes em EUR/USD.",
        phase: "Fase 1–2 · Explorer + contas de desembolso",
        fund: "Donativo ao operador",
        explore: "Lista de contribuidores",
        how: "Como funciona o desembolso",
        principle:
          "O Fundo não substitui o GitHub. Consome evidência pública, agrega estatísticas e encaminha pagamentos para contas registadas ou cartões pré-pagos escolhidos pelo grantor.",
      }
    : {
        title: "StrataMesh Impact Fund",
        tag: "A pooled fund for the people building StrataMesh",
        lead:
          "We collect publicly verifiable GitHub contribution data, make it comparable, and link each contributor to a payout account — for transparent EUR/USD grants.",
        phase: "Phase 1–2 · Explorer + payout accounts",
        fund: "Donate to operator",
        explore: "Contributor list",
        how: "How payout works",
        principle:
          "The Fund does not replace GitHub. It consumes public evidence, aggregates statistics, and routes payments to registered accounts or grantor-chosen prepaid cards.",
      };

  const body = `
    <p class="pill ok">${t.phase}</p>
    <h1>${t.title}</h1>
    <p class="tag">${t.tag}</p>
    <p class="lead">${t.lead}</p>
    <div class="actions">
      <a class="btn primary" href="#operator-pay">${t.fund}</a>
      <a class="btn ghost" href="/contributors${pt ? "" : "?lang=en"}">${t.explore}</a>
      <a class="btn ghost" href="#payout">${t.how}</a>
    </div>
    <div class="grid">
      <section><div class="stat muted">—</div><div class="muted">EUR pooled (Phase 3)</div></section>
      <section><div class="stat" id="c-count">…</div><div class="muted">${pt ? "contribuidores (descobertos)" : "contributors (discovered)"}</div></section>
      <section><div class="stat">${REPOS.length}</div><div class="muted">${pt ? "repositórios no âmbito" : "repositories in scope"}</div></section>
    </div>
    <section id="payout">
      <h2>${t.how}</h2>
      <ol class="steps">
        <li><strong>${pt ? "Operador (já activo)" : "Operator (already live)"}</strong> —
          ${pt ? "widget" : "widget"} <a href="https://calhegasmorais.pt/pagamentos">/pagamentos</a>
          ${pt ? "(AMCM ENI · instrução bancária com referência única)." : "(AMCM ENI · bank instruction with unique reference)."}</li>
        <li><strong>${pt ? "Outros contribuidores" : "Other contributors"}</strong> —
          ${pt ? "login GitHub → registar conta de desembolso (dados opacos no Fundo)." : "GitHub login → register payout account (opaque ids only in the Fund)."}</li>
        <li><strong>${pt ? "Cartão pré-pago" : "Prepaid card"}</strong> —
          ${pt ? "o grantor escolhe um fornecedor integrado, compra na página do fornecedor; o cartão é enviado ao email público de domínio registado no GitHub do contribuidor." : "grantor picks an integrated provider, buys on the provider page; the card is sent to the contributor’s GitHub-registered public-domain email."}</li>
      </ol>
      <p class="muted">${t.principle}</p>
    </section>
    <section id="operator-pay">
      <h2>${pt ? "Donativo ao projecto (operador)" : "Donate to the project (operator)"}</h2>
      <p class="muted">${OPERATOR_PAYOUT.widget_note}</p>
      <p>
        <a class="btn primary" href="${OPERATOR_PAYOUT.widget_url}" target="_blank" rel="noopener">${pt ? "Abrir /pagamentos" : "Open /pagamentos"}</a>
        <a class="btn ghost" href="/contributors/amcmorais${pt ? "" : "?lang=en"}">@amcmorais</a>
      </p>
      <iframe class="pay-widget" title="AMCM ENI Pagamentos" src="${OPERATOR_PAYOUT.widget_url}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <p class="mono muted" style="margin-top:.75rem">${pt ? "Se o iframe for bloqueado pelo browser, use o botão acima." : "If the iframe is blocked by the browser, use the button above."}</p>
    </section>
    <section>
      <h2>${pt ? "API" : "API"}</h2>
      <p class="mono">
        GET /api/v1/health<br/>
        GET /api/v1/contributors<br/>
        GET /api/v1/contributors/:login<br/>
        GET /api/v1/payout-methods<br/>
        GET /api/v1/prepaid-providers<br/>
        GET /api/v1/methodology/current<br/>
        POST /api/github/webhook
      </p>
    </section>
    <script>
      fetch('/api/v1/contributors').then(r=>r.json()).then(d=>{
        const el=document.getElementById('c-count');
        if(el) el.textContent = (d.contributors && d.contributors.length) || 0;
      }).catch(()=>{});
    </script>
  `;
  return shell({ lang, path, title: t.title, body });
}

function contributorsPage(lang, list) {
  const pt = lang === "pt";
  const path = pt ? "/contributors" : "/contributors?lang=en";
  const rows = (list || [])
    .map((c) => {
      const pay = c.payout || {};
      const status =
        pay.status === "active"
          ? `<span class="pill ok">${pay.method || "active"}</span>`
          : pay.status === "claimable"
            ? `<span class="pill warn">${pt ? "por reclamar" : "unclaimed"}</span>`
            : `<span class="pill muted">${pay.status || "—"}</span>`;
      const link =
        pay.method === "eni_pagamentos"
          ? `<a href="${pay.widget_url || "https://calhegasmorais.pt/pagamentos"}">/pagamentos</a>`
          : pay.method
            ? `<span class="mono">${pay.method}</span>`
            : `<a href="/claim?login=${encodeURIComponent(c.github_login)}">${pt ? "Reclamar / registar" : "Claim / register"}</a>`;
      return `<tr>
        <td>${c.avatar_url ? `<img class="avatar" src="${c.avatar_url}" alt=""/>` : ""}
          <a href="/contributors/${c.github_login}${pt ? "" : "?lang=en"}">@${c.github_login}</a></td>
        <td>${c.contributions_hint ?? "—"}</td>
        <td>${(c.repositories || []).join(", ") || "—"}</td>
        <td>${status}<br/>${link}</td>
      </tr>`;
    })
    .join("\n");

  const body = `
    <p class="pill ok">${pt ? "Contas de desembolso" : "Payout accounts"}</p>
    <h1>${pt ? "Contribuidores" : "Contributors"}</h1>
    <p class="lead">${
      pt
        ? "Lista descoberta a partir do GitHub (organização StrataMesh-Laboratory). Cada linha liga à conta de desembolso quando existir."
        : "Discovered from GitHub (StrataMesh-Laboratory org). Each row links to a payout account when one exists."
    }</p>
    <section>
      <table>
        <thead>
          <tr>
            <th>${pt ? "Contribuidor" : "Contributor"}</th>
            <th>${pt ? "Actividade (hint)" : "Activity (hint)"}</th>
            <th>${pt ? "Repositórios" : "Repos"}</th>
            <th>${pt ? "Desembolso" : "Payout"}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="4" class="muted">${pt ? "Sem dados GitHub neste momento." : "No GitHub data right now."}</td></tr>`}
        </tbody>
      </table>
    </section>
    <section>
      <h2>${pt ? "Registar conta" : "Register account"}</h2>
      <p>${
        pt
          ? "Faça login com GitHub (gateway OAuth). Confirme o email de domínio público. Depois registe o método de desembolso ou aguarde um cartão pré-pago escolhido pelo grantor."
          : "Sign in with GitHub (OAuth gateway). Confirm your public-domain email. Then register a payout method, or wait for a grantor-chosen prepaid card."
      }</p>
      <a class="btn primary" href="/claim">${pt ? "Reclamar perfil (GitHub)" : "Claim profile (GitHub)"}</a>
    </section>
  `;
  return shell({
    lang,
    path,
    title: pt ? "Contribuidores · Impact Fund" : "Contributors · Impact Fund",
    body,
  });
}

function contributorDetailPage(lang, profile) {
  const pt = lang === "pt";
  const login = profile.github_login;
  const path = `/contributors/${login}`;
  const pay = profile.payout || {};
  let payBlock = "";
  if (pay.method === "eni_pagamentos") {
    payBlock = `
      <section id="pay">
        <h2>${pt ? "Conta de desembolso (operador)" : "Payout account (operator)"}</h2>
        <p>${pay.widget_note || ""}</p>
        <p><a class="btn primary" href="${pay.widget_url}" target="_blank" rel="noopener">/pagamentos</a></p>
        <iframe class="pay-widget" title="AMCM ENI Pagamentos" src="${pay.widget_url}" loading="lazy"></iframe>
      </section>`;
  } else if (pay.status === "active") {
    payBlock = `
      <section id="pay">
        <h2>${pt ? "Conta de desembolso" : "Payout account"}</h2>
        <p class="mono">${pay.method} · ${pay.status}</p>
        <p class="muted">${pt ? "Identificadores bancários completos não são publicados." : "Full bank identifiers are not published."}</p>
      </section>`;
  } else {
    payBlock = `
      <section id="pay">
        <h2>${pt ? "Ainda sem conta ligada" : "No payout account linked yet"}</h2>
        <ol class="steps">
          <li><a href="/claim?login=${encodeURIComponent(login)}">${pt ? "Reclamar via GitHub OAuth" : "Claim via GitHub OAuth"}</a></li>
          <li>${pt ? "Registar dados de conta (opacos no Fundo) ou" : "Register account details (opaque in the Fund) or"}</li>
          <li>${pt ? "receber cartão pré-pago no email GitHub de domínio público (escolha do grantor)." : "receive a prepaid card at the GitHub public-domain email (grantor’s choice)."}</li>
        </ol>
      </section>`;
  }

  const body = `
    <p class="pill">${profile.claimed ? (pt ? "perfil reclamado" : "claimed") : (pt ? "descoberta GitHub" : "GitHub discovery")}</p>
    <h1>
      ${profile.avatar_url ? `<img class="avatar" src="${profile.avatar_url}" alt=""/>` : ""}
      @${login}
    </h1>
    <p class="muted">
      <a href="${profile.profile_url || "https://github.com/" + login}" rel="noopener">GitHub</a>
      ${profile.display_name ? " · " + profile.display_name : ""}
    </p>
    <section>
      <h2>${pt ? "Estatísticas (hint em tempo real)" : "Statistics (live hint)"}</h2>
      <p>${pt ? "Actividade agregada (não é época congelada):" : "Aggregated activity (not a frozen epoch):"}
        <strong>${profile.contributions_hint ?? "—"}</strong></p>
      <p class="muted">${pt ? "Repositórios:" : "Repositories:"} ${(profile.repositories || []).join(", ") || "—"}</p>
    </section>
    ${payBlock}
  `;
  return shell({
    lang,
    path,
    title: `@${login} · Impact Fund`,
    body,
  });
}

function claimPage(lang) {
  const pt = lang === "pt";
  const body = `
    <p class="pill warn">${pt ? "Gateway GitHub (fase 2)" : "GitHub gateway (phase 2)"}</p>
    <h1>${pt ? "Reclamar perfil e registar desembolso" : "Claim profile and register payout"}</h1>
    <p class="lead">${
      pt
        ? "O login GitHub identifica o contribuidor pelo user id estável. O email de contacto deve ser confirmado explicitamente (preferência: domínio público registado no GitHub)."
        : "GitHub login identifies the contributor by stable user id. Contact email must be confirmed explicitly (prefer: public-domain email registered on GitHub)."
    }</p>
    <section>
      <h2>${pt ? "Fluxo" : "Flow"}</h2>
      <ol class="steps">
        <li>OAuth GitHub (scopes: read:user, user:email)</li>
        <li>${pt ? "Confirmar email para comunicações e envio de cartão" : "Confirm email for communications and card delivery"}</li>
        <li>${pt ? "Escolher método:" : "Choose method:"}
          <ul>
            <li><code>registered_account</code> — ${pt ? "registo de conta junto de um prestador (id opaco)" : "account registration with a provider (opaque id)"}</li>
            <li><code>prepaid_card</code> — ${pt ? "aguardar escolha do grantor no catálogo integrado" : "await grantor choice from the integrated catalog"}</li>
          </ul>
        </li>
      </ol>
      <p class="muted">${
        pt
          ? "O endpoint OAuth completo activa-se com GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET no worker. Até lá, use a lista de contribuidores e o widget do operador."
          : "Full OAuth activates when GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET are bound on the worker. Until then, use the contributor list and the operator widget."
      }</p>
      <a class="btn ghost" href="/api/v1/payout-methods">${pt ? "Ver métodos (API)" : "View methods (API)"}</a>
      <a class="btn ghost" href="/api/v1/prepaid-providers">${pt ? "Catálogo pré-pago" : "Prepaid catalog"}</a>
    </section>
  `;
  return shell({
    lang,
    path: "/claim",
    title: pt ? "Reclamar · Impact Fund" : "Claim · Impact Fund",
    body,
  });
}

async function discoverContributors(env) {
  const loginSeen = new Map();
  for (const r of REPOS) {
    try {
      const api = `https://api.github.com/repos/${r.owner}/${r.name}/contributors?per_page=100`;
      const res = await fetch(api, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "stratamesh-impact-fund",
          ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
        },
      });
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
        prev.contributions_hint += c.contributions || 0;
        if (!prev.repositories.includes(r.name)) prev.repositories.push(r.name);
        loginSeen.set(c.id, prev);
      }
    } catch (_) {}
  }

  // Always ensure operator is present
  if (![...loginSeen.values()].some((c) => c.github_login === OPERATOR_PAYOUT.github_login)) {
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
    .map((c) => attachPayout(c))
    .sort((a, b) => (b.contributions_hint || 0) - (a.contributions_hint || 0));
}

function attachPayout(c) {
  if (c.github_login === OPERATOR_PAYOUT.github_login || c.github_user_id === OPERATOR_PAYOUT.github_user_id) {
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname.replace(/\/+$/, "") || "/";
    const langQ = url.searchParams.get("lang");
    const lang = langQ === "en" || path === "/en" || path.startsWith("/en/") ? "en" : "pt";

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
              "AMCM ENI /pagamentos widget — unique bank-transfer instruction via payment-intent (purpose=donation).",
            widget_url: OPERATOR_PAYOUT.widget_url,
            stores_iban_in_fund: false,
          },
          {
            id: "registered_account",
            who: "contributor_after_github_oauth",
            description:
              "Contributor claims profile via GitHub login API gateway and registers payout account info with a provider; Fund stores opaque recipient id only.",
            stores_iban_in_fund: false,
          },
          {
            id: "prepaid_card",
            who: "grantor_choice",
            description:
              "Grantor selects an API-integrated prepaid option, is redirected to the provider purchase page; card is sent to the contributor’s GitHub-registered public-domain email.",
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
      const delivery = request.headers.get("X-GitHub-Delivery") || null;
      const event = request.headers.get("X-GitHub-Event") || "unknown";
      return json({
        accepted: true,
        delivery,
        event,
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
      const key = decodeURIComponent(path.split("/").pop());
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
      if (!found) return json({ error: "not_found" }, 404);
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
