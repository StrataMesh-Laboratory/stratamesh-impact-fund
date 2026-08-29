/**
 * stratamesh-fund — fund.calhegasmorais.pt
 * V0: public explorer shell + read API stubs.
 * GitHub = evidence · Fund = statistics + (later) grants.
 * No STRATA · no GDA · no AI impact scores in V0.
 */
const VERSION = "0.1.0-explorer";

const ORG = "StrataMesh-Laboratory";
const REPOS = [
  { owner: ORG, name: "stratamesh-core", role: "Protocol core" },
  { owner: ORG, name: "stratamesh-laboratory", role: "Lab charter & posture" },
  { owner: ORG, name: "calhegas-morais-node", role: "Reference Fog Node registry" },
  { owner: ORG, name: "stratamesh-impact-fund", role: "This fund application" },
];

const SECURITY = {
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.github.com; frame-ancestors 'none'",
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
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...SECURITY,
    },
  });
}

function page(lang, path) {
  const pt = lang === "pt";
  const t = pt
    ? {
        title: "StrataMesh Impact Fund",
        tag: "Por agora o Impact Fund segue o GitHub Sponsors e cada recipiente individualmente. O fundo agrupado será libertado mais tarde. Evidência pública no GitHub.",
        lead:
          "Recolhemos dados de contribuição publicamente verificáveis no GitHub, tornamo-los comparáveis e usamos essa evidência para informar bolsas transparentes a contribuidores.",
        fund: "Financiar contribuidores",
        explore: "Explorar contribuições",
        how: "Como funciona",
        howBody: "GitHub → Evidência → Comparação → Bolsas",
        stats: "Estatísticas de contribuição",
        statsNote:
          "A V0 expõe estatísticas descritivas (commits, PRs, revisões…). Não atribui um «score de impacto» nem converte linhas de código em euros.",
        phase: "Fase 1 — Explorer",
        phaseNote:
          "Sem pagamentos ainda. A prioridade é representar com precisão o grafo de contribuições da organização StrataMesh-Laboratory.",
        repos: "Repositórios no âmbito",
        transparency: "Transparência",
        transBody:
          "Cada estatística material deve poder ser rastreada até evidência no GitHub. Cada época de financiamento publicará metodologia e resultados.",
        principle:
          "O Fundo não substitui o GitHub como registo do desenvolvimento. Consome dados verificáveis, normaliza-os e acrescenta a camada financeira necessária para remunerar contribuidores.",
        noToken: "Sem STRATA nesta camada · sem GDA · sem liquidação on-chain autónoma na V0",
        api: "API (leitura)",
        footer: "AMCM ENI · StrataMesh Laboratory · Lisboa · laboratório",
        langOther: "English",
        langHref: "/en",
        homeHref: "/",
      }
    : {
        title: "StrataMesh Impact Fund",
        tag: "For now the Impact Fund follows GitHub Sponsors and each recipient individually. The pooled fund will be released later. Public GitHub evidence.",
        lead:
          "We collect publicly verifiable contribution data from GitHub, make it comparable, and use the resulting evidence to inform transparent contributor grants.",
        fund: "Fund the Contributors",
        explore: "Explore Contributions",
        how: "How it works",
        howBody: "GitHub → Evidence → Comparison → Grants",
        stats: "Contribution statistics",
        statsNote:
          "V0 exposes descriptive statistics (commits, PRs, reviews…). It does not publish an “impact score” or convert lines of code into euros.",
        phase: "Phase 1 — Explorer",
        phaseNote:
          "No payments yet. The goal is to accurately represent the StrataMesh-Laboratory contribution graph.",
        repos: "In-scope repositories",
        transparency: "Transparency",
        transBody:
          "Every material statistic should link back to GitHub evidence. Every funding epoch will publish its methodology and results.",
        principle:
          "The Fund does not replace GitHub as the record of software development. It consumes verifiable data, normalizes it, and adds the financial layer required to remunerate contributors.",
        noToken: "No STRATA in this layer · no GDA · no autonomous on-chain settlement in V0",
        api: "Read API",
        footer: "AMCM ENI · StrataMesh Laboratory · Lisbon · laboratory",
        langOther: "Português",
        langHref: "/",
        homeHref: "/en",
      };

  const repoRows = REPOS.map(
    (r) =>
      `<tr><td><a href="https://github.com/${r.owner}/${r.name}" rel="noopener">${r.name}</a></td><td>${r.role}</td></tr>`
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="${pt ? "pt-PT" : "en-GB"}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${t.title}</title>
  <meta name="description" content="${t.lead}"/>
  <link rel="canonical" href="https://fund.calhegasmorais.pt${path}"/>
  <link rel="alternate" hreflang="pt-PT" href="https://fund.calhegasmorais.pt/"/>
  <link rel="alternate" hreflang="en-GB" href="https://fund.calhegasmorais.pt/en"/>
  <style>
    :root {
      --bg: #0b0f14;
      --card: #121821;
      --text: #e8eef6;
      --muted: #9aabbd;
      --accent: #5b9fd4;
      --line: #243041;
      --ok: #6bcb8b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: radial-gradient(1200px 600px at 10% -10%, #1a2740 0%, var(--bg) 55%);
      color: var(--text); line-height: 1.55; min-height: 100vh;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    header { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; flex-wrap: wrap; margin-bottom: 2rem; }
    .brand { font-weight: 700; letter-spacing: .02em; }
    .muted { color: var(--muted); }
    h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); margin: 0 0 .5rem; }
    .tag { color: var(--muted); font-size: 1.05rem; margin-bottom: 1.25rem; }
    .lead { font-size: 1.05rem; max-width: 62ch; }
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin: 1.5rem 0 2rem; }
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
    h2 { font-size: 1.1rem; margin: 0 0 .6rem; }
    table { width: 100%; border-collapse: collapse; font-size: .95rem; }
    th, td { text-align: left; padding: .45rem .3rem; border-bottom: 1px solid var(--line); }
    th { color: var(--muted); font-weight: 600; }
    .pill {
      display: inline-block; font-size: .75rem; padding: .15rem .5rem; border-radius: 999px;
      border: 1px solid var(--line); color: var(--ok); margin-bottom: .75rem;
    }
    code, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .85rem; }
    ul.flow { list-style: none; padding: 0; margin: .5rem 0 0; display: flex; flex-wrap: wrap; gap: .5rem; }
    ul.flow li {
      background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: .4rem .7rem; font-size: .9rem;
    }
    footer { margin-top: 2.5rem; color: var(--muted); font-size: .85rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
    .stat { font-size: 1.4rem; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand"><a href="${t.homeHref}" style="color:inherit;text-decoration:none">${t.title}</a></div>
      <div class="muted"><a href="${t.langHref}">${t.langOther}</a> · <a href="https://calhegasmorais.pt/">calhegasmorais.pt</a> · <a href="https://github.com/StrataMesh-Laboratory/stratamesh-impact-fund">GitHub</a></div>
    </header>

    <p class="pill">${t.phase}</p>
    <h1>${t.title}</h1>
    <p class="tag">${t.tag}</p>
    <p class="lead">${t.lead}</p>

    <div class="actions">
      <a class="btn primary" href="#fund">${t.fund}</a>
      <a class="btn ghost" href="/api/v1/repositories">${t.explore}</a>
      <a class="btn ghost" href="#how">${t.how}</a>
    </div>

    <div class="grid">
      <section>
        <div class="stat muted">—</div>
        <div class="muted">EUR pooled (Phase 3)</div>
      </section>
      <section>
        <div class="stat" id="c-count">…</div>
        <div class="muted">contributors (discovered)</div>
      </section>
      <section>
        <div class="stat">${REPOS.length}</div>
        <div class="muted">repositories in scope</div>
      </section>
    </div>

    <section id="how">
      <h2>${t.how}</h2>
      <ul class="flow">
        <li>GitHub</li><li>→</li><li>Evidence</li><li>→</li><li>Comparison</li><li>→</li><li>Grants</li>
      </ul>
      <p class="muted" style="margin-top:1rem">${t.howBody}</p>
    </section>

    <section>
      <h2>${t.stats}</h2>
      <p>${t.statsNote}</p>
      <p class="muted">${t.phaseNote}</p>
    </section>

    <section>
      <h2>${t.repos}</h2>
      <table>
        <thead><tr><th>Repository</th><th>Role</th></tr></thead>
        <tbody>${repoRows}</tbody>
      </table>
    </section>

    <section>
      <h2>${t.transparency}</h2>
      <p>${t.transBody}</p>
      <p class="muted">${t.principle}</p>
      <p class="mono muted">${t.noToken}</p>
    </section>

    <section id="fund">
      <h2>${t.fund}</h2>
      <p class="muted">${pt
        ? "A angariação e o desembolso abrem na Fase 3 (Fundo), após o Explorer e o registo de contribuidores. Contacto do operador: AMCM ENI."
        : "Fundraising and disbursement open in Phase 3 (Fund), after Explorer and contributor registration. Operator contact: AMCM ENI."}</p>
      <p><a href="https://eni.calhegasmorais.pt/">eni.calhegasmorais.pt</a> · <a href="mailto:amcmorais@icloud.com">amcmorais@icloud.com</a></p>
    </section>

    <section>
      <h2>${t.api}</h2>
      <p class="mono">
        GET /api/v1/health<br/>
        GET /api/v1/epochs<br/>
        GET /api/v1/repositories<br/>
        GET /api/v1/contributors<br/>
        GET /api/v1/methodology/current
      </p>
    </section>

    <footer>
      ${t.footer}<br/>
      <span class="mono">stratamesh-fund ${VERSION}</span>
    </footer>
  </div>
  <script>
    fetch('/api/v1/contributors').then(r=>r.json()).then(d=>{
      const el=document.getElementById('c-count');
      if(el) el.textContent = (d.contributors && d.contributors.length) || 0;
    }).catch(()=>{});
  </script>
</body>
</html>`;
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256",
        },
      });
    }

    // --- API ---
    if (path === "/api/v1/health" || path === "/health") {
      return json({
        ok: true,
        service: "stratamesh-fund",
        version: VERSION,
        phase: "1-explorer",
        principle: "GitHub is the evidence layer; the Fund is interpretation, transparency and payment.",
        no_strata_in_v0: true,
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
      return json({
        epochs: [],
        note: "No epoch frozen yet — Phase 1 Explorer.",
      });
    }

    if (path === "/api/v1/contributors") {
      // Optional live discovery via GitHub API (public)
      let contributors = [];
      try {
        const loginSeen = new Map();
        for (const r of REPOS) {
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
            };
            prev.contributions_hint += c.contributions || 0;
            if (!prev.repositories.includes(r.name)) prev.repositories.push(r.name);
            loginSeen.set(c.id, prev);
          }
        }
        contributors = [...loginSeen.values()].sort(
          (a, b) => b.contributions_hint - a.contributions_hint
        );
      } catch (e) {
        contributors = [];
      }
      return json({
        phase: "1-explorer",
        note: "Live GitHub contributor hints (not a frozen epoch). Statistics are descriptive only.",
        contributors,
      });
    }

    if (path.startsWith("/api/v1/contributors/")) {
      const key = path.split("/").pop();
      return json({
        github_login: key,
        epoch: null,
        note: "Per-contributor frozen stats land after epoch pipeline (Phase 1→3).",
        stats: null,
      });
    }

    if (path === "/api/v1/methodology/current") {
      return json(METHODOLOGY_V01);
    }

    if (path === "/api/github/webhook" && request.method === "POST") {
      // Record-only stub — full queue in Phase 1 workers
      const delivery = request.headers.get("X-GitHub-Delivery") || null;
      const event = request.headers.get("X-GitHub-Event") || "unknown";
      return json({
        accepted: true,
        delivery,
        event,
        note: "Webhook accepted for future async processing. V0 explorer does not score on the request path.",
      });
    }

    // --- Pages ---
    if (path === "/" || path === "/pt") return html(page("pt", "/"));
    if (path === "/en") return html(page("en", "/en"));

    if (path === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return json({ error: "not_found", path }, 404);
  },
};
