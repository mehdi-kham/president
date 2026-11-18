(() => {
  const STATS = ["sondages", "tresorerie", "cohesion", "credibilite"];
  const STAT_META = {
    sondages:    { icon: "📊", label: "Sondages" },
    tresorerie:  { icon: "💰", label: "Trésorerie" },
    cohesion:    { icon: "🤝", label: "Cohésion" },
    credibilite: { icon: "⚖️", label: "Crédibilité" }
  };
  const KEYMAP = { sond: "sondages", treso: "tresorerie", coh: "cohesion", cred: "credibilite" };
  const PARRAINAGES_REQUIS = 500;

  const screen = document.getElementById("screen");
  let S = null;
  document.getElementById("notif").onclick = () => hideNotif();

  /* ---------------- Utilitaires ---------------- */

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function fmt(str) {
    if (typeof str === "function") str = str(S);
    if (!S) return str;
    const f = S.civ === "F";
    const map = {
      nom: esc(S.name),
      titre: f ? "Madame la candidate" : "Monsieur le candidat",
      cand: f ? "candidate" : "candidat",
      e: f ? "e" : "",
      parti: S.arch.party,
      parr: S.parr,
      lepres: f ? "la présidente" : "le président",
      il: f ? "elle" : "il"
    };
    return String(str).replace(/\{(\w+)\}/g, (m, k) => (k in map ? map[k] : m));
  }

  const archName = (a, civ) => (civ === "F" ? a.nameF : a.name);
  const votePct = v => 6 + v * 0.3;

  function moralLabel(integ) {
    if (integ >= 75) return { label: "Intègre", cls: "good" };
    if (integ >= 50) return { label: "Pragmatique", cls: "mid" };
    if (integ >= 25) return { label: "Opportuniste", cls: "warn" };
    return { label: "Cynique", cls: "bad" };
  }

  function scandalRisk() {
    if (S.scandale >= 50) return { label: "Élevé", cls: "bad" };
    if (S.scandale >= 25) return { label: "Modéré", cls: "warn" };
    if (S.scandale > 0) return { label: "Faible", cls: "mid" };
    return { label: "Nul", cls: "good" };
  }

  /* ---------------- Notifications & horloge ---------------- */

  let notifTimer = null;
  function notify(text) {
    const n = document.getElementById("notif");
    document.getElementById("notif-text").innerHTML = text;
    n.classList.add("show");
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => n.classList.remove("show"), 4200);
    if (S) {
      S.feed.unshift({ date: S.date, text });
      renderFeed();
    }
  }

  function setDate(d) {
    if (S) S.date = d;
    document.getElementById("sb-date").textContent = d ? d + (/\d{4}/.test(d) ? "" : " 2027") : "";
  }

  function setTopbar(html) {
    document.getElementById("topbar-right").innerHTML = html || "";
  }

  function hideNotif() {
    clearTimeout(notifTimer);
    document.getElementById("notif").classList.remove("show");
  }

  /* ---------------- Écran titre ---------------- */

  function showTitle() {
    S = null;
    setDate("");
    setTopbar("");
    screen.innerHTML = `
      <div class="title-screen fade-in">
        <div class="title-kicker">Présidentielle 2027</div>
        <h1 class="title-main">Objectif Élysée</h1>
        <div class="title-sub">500 parrainages. 2 tours. 1 seul fauteuil.</div>
        <p class="title-pitch">Un thriller politique où chaque choix a un prix. Jusqu’où irez-vous pour gagner ?</p>
        <button class="btn btn-primary" id="btn-start">Entrer en campagne</button>
        <div class="title-foot">Prototype narratif — v0.1</div>
      </div>`;
    document.getElementById("btn-start").onclick = showCreate;
  }

  /* ---------------- Création du personnage ---------------- */

  function showCreate() {
    let selected = null;
    let civ = "F";

    screen.innerHTML = `
      <div class="create fade-in">
        <h2 class="page-title">Dossier de candidature</h2>
        <p class="page-sub">Votre origine politique détermine vos forces de départ et les crises que vous affronterez.</p>
        <label class="field-label">Identité</label>
        <div class="identity">
          <div class="civ-toggle">
            <button data-civ="F" class="active">Mme</button>
            <button data-civ="M">M.</button>
          </div>
          <input id="cand-name" maxlength="28" placeholder="Nom du candidat" value="Camille Laurent">
        </div>
        <label class="field-label">Origine politique</label>
        <div class="arch-list" id="arch-list"></div>
        <div class="create-foot">
          <button class="btn btn-primary" id="btn-go" disabled>Choisissez un profil</button>
        </div>
      </div>`;

    const list = document.getElementById("arch-list");
    const btnGo = document.getElementById("btn-go");

    const renderCards = () => {
      list.innerHTML = "";
      Object.values(ARCHETYPES).forEach(a => {
        const card = el("button", "arch-card" + (selected === a.id ? " selected" : ""));
        card.innerHTML = `
          <div class="arch-top">
            <span class="arch-emoji">${a.emoji}</span>
            <div>
              <div class="arch-name">${archName(a, civ)}</div>
              <div class="arch-tag">${a.tag} · ${a.party}</div>
            </div>
          </div>
          <div class="arch-details">
            <div class="arch-line plus">＋ ${a.plus}</div>
            <div class="arch-line minus">− ${a.minus}</div>
            <div class="arch-line challenge">🎯 ${a.challenge}</div>
            <div class="arch-stats">
              ${STATS.map(k => `
                <div class="mini-stat">
                  <span>${STAT_META[k].icon}</span>
                  <div class="mini-bar"><div style="width:${a.stats[k]}%"></div></div>
                </div>`).join("")}
              <div class="mini-stat parr">✍️ ${a.parrainages} parrainages au départ</div>
            </div>
            <div class="arch-mods">${a.modsDesc.map(m => `<span>${m}</span>`).join("")}</div>
          </div>`;
        card.onclick = () => {
          selected = a.id;
          btnGo.disabled = false;
          btnGo.textContent = `Lancer la campagne — ${archName(a, civ)}`;
          list.querySelectorAll(".arch-card").forEach(c => c.classList.toggle("selected", c === card));
        };
        list.appendChild(card);
      });
    };
    renderCards();

    screen.querySelectorAll(".civ-toggle button").forEach(b => {
      b.onclick = () => {
        civ = b.dataset.civ;
        screen.querySelectorAll(".civ-toggle button").forEach(x => x.classList.toggle("active", x === b));
        renderCards();
        if (selected) btnGo.textContent = `Lancer la campagne — ${archName(ARCHETYPES[selected], civ)}`;
      };
    });

    btnGo.onclick = () => {
      const name = document.getElementById("cand-name").value.trim() || "Camille Laurent";
      startGame(selected, name, civ);
    };
  }

  function candidateTopbar() {
    setTopbar(`<span class="tb-emoji">${S.arch.emoji}</span><span class="tb-name">${esc(S.name)}</span><span class="tb-party">${S.arch.party}</span>`);
  }

  /* ---------------- Partie ---------------- */

  function startGame(archId, name, civ) {
    const a = ARCHETYPES[archId];
    S = {
      arch: a, name, civ,
      stats: { ...a.stats },
      integ: a.integ ?? 70, dette: 0, scandale: a.scandale ?? 0,
      parr: a.parrainages,
      flags: new Set(),
      seen: new Set(),
      promises: [],
      feed: [],
      date: "",
      history: [{ act: 0, stats: { ...a.stats } }],
      act: -1, idx: -1,
      decisions: 0,
      round1: null, round2: null
    };
    startAct(0);
  }

  async function startAct(i) {
    S.act = i;
    S.idx = -1;
    const pool = ACTS[i].events.filter(e => e.pool && (!e.only || e.only.includes(S.arch.id)));
    pool.sort(() => Math.random() - 0.5);
    S.picked = new Set(pool.slice(0, ACTS[i].poolPick ?? pool.length).map(e => e.id));

    if (i === 2) {
      S.history.push({ act: 2, stats: { ...S.stats } });
      const p = S.scandale >= 60 ? 1 : S.scandale >= 25 ? (S.scandale - 20) / 70 : 0;
      if (Math.random() < p) S.flags.add("scandale_declenche");
    }

    const act = ACTS[i];
    hideNotif();
    setDate(act.period.split("–")[0].trim());
    screen.innerHTML = `
      <div class="act-intro fade-in">
        <div class="act-num">ACTE ${act.num}</div>
        <div class="act-name">${act.name}</div>
        <div class="act-sub">${act.sub}</div>
        <div class="act-period">${act.period}</div>
        <div class="act-objective"><span>Objectif</span>${act.objective}</div>
        <button class="btn btn-primary" id="btn-act">Commencer</button>
      </div>`;
    document.getElementById("btn-act").onclick = () => {
      renderGameShell();
      nextEvent();
    };
  }

  function renderGameShell() {
    const act = ACTS[S.act];
    candidateTopbar();
    screen.innerHTML = `
      <div class="game fade-in">
        <div class="m-hud">
          <div class="m-gauges">
            ${STATS.map(k => `
              <div class="m-gauge" data-stat="${k}">
                <div class="m-label">${STAT_META[k].label}</div>
                <div class="m-top"><span>${STAT_META[k].icon}</span><i class="g-dot"></i><b></b></div>
                <div class="m-bar"><div></div></div>
              </div>`).join("")}
          </div>
          <div class="m-row">
            <span id="m-info"></span>
            <button class="m-toggle" id="m-toggle">📋 Dossier</button>
          </div>
        </div>
        <aside class="side side-left">
          <div class="panel">
            <div class="hud-top">
              <span class="act-label">ACTE ${act.num} · ${act.name.toUpperCase()}</span>
            </div>
            <div class="act-goal">${act.objective}</div>
            <div class="parr-chip" id="parr-chip"></div>
          </div>
          <div class="panel">
            <div class="panel-title">Jauges</div>
            <div class="gauges">
              ${STATS.map(k => `
                <div class="gauge" data-stat="${k}">
                  <div class="g-icon">${STAT_META[k].icon}</div>
                  <div class="g-main">
                    <div class="g-label">${STAT_META[k].label}<span class="g-dot"></span></div>
                    <div class="g-bar"><div class="g-fill"></div></div>
                  </div>
                  <div class="g-val"></div>
                  <div class="g-delta"></div>
                </div>`).join("")}
            </div>
            <div class="panel-note">Une jauge à zéro, et la campagne s’arrête.</div>
          </div>
          <div id="dossier" class="side-stack"></div>
        </aside>
        <section class="stage">
          <div class="stage-head" id="chat-head"></div>
          <div class="chat" id="chat"></div>
          <div class="choices" id="choices"></div>
        </section>
        <aside class="side side-right">
          <div class="panel" id="polls"></div>
          <div class="panel feed-panel">
            <div class="panel-title">Fil d’actualité</div>
            <ul class="feed" id="feed"></ul>
          </div>
        </aside>
      </div>`;
    const game = screen.querySelector(".game");
    const toggle = document.getElementById("m-toggle");
    toggle.onclick = () => {
      const open = game.classList.toggle("panels-open");
      toggle.textContent = open ? "✕ Retour" : "📋 Dossier";
      window.scrollTo(0, 0);
    };
    updateHud();
    renderFeed();
  }

  function renderFeed() {
    const f = document.getElementById("feed");
    if (!f) return;
    f.innerHTML = S.feed.length
      ? S.feed.map((n, i) => `<li class="${i === 0 ? "fresh" : ""}"><span class="feed-date">${n.date}</span>${n.text}</li>`).join("")
      : `<li class="empty">Aucune dépêche pour l’instant.</li>`;
  }

  function updateHud(deltas) {
    STATS.forEach(k => {
      const g = screen.querySelector(`.gauge[data-stat="${k}"]`);
      if (!g) return;
      const v = S.stats[k];
      g.querySelector(".g-fill").style.width = v + "%";
      g.querySelector(".g-val").textContent = v;
      g.classList.toggle("danger", v <= 20);
      if (deltas && deltas[k]) {
        const d = g.querySelector(".g-delta");
        d.textContent = (deltas[k] > 0 ? "+" : "") + deltas[k];
        d.className = "g-delta show " + (deltas[k] > 0 ? "up" : "down");
        g.classList.remove("flash-up", "flash-down");
        void g.offsetWidth;
        g.classList.add(deltas[k] > 0 ? "flash-up" : "flash-down");
        setTimeout(() => (d.className = "g-delta"), 1800);
      }
      const m = screen.querySelector(`.m-gauge[data-stat="${k}"]`);
      if (m) {
        m.querySelector("b").textContent = v;
        m.querySelector(".m-bar div").style.width = v + "%";
        m.classList.toggle("danger", v <= 20);
        if (deltas && deltas[k]) {
          m.classList.remove("flash-up", "flash-down");
          void m.offsetWidth;
          m.classList.add(deltas[k] > 0 ? "flash-up" : "flash-down");
        }
      }
    });
    const info = document.getElementById("m-info");
    if (info) {
      info.textContent = S.act === 0
        ? `✍️ ${S.parr} / ${PARRAINAGES_REQUIS} parrainages`
        : S.act === 1
          ? `📊 ${votePct(S.stats.sondages).toFixed(1).replace(".", ",")} % au 1er tour`
          : `📊 ${round2Estimate(S.stats).toFixed(1).replace(".", ",")} % au 2nd tour`;
    }
    const chip = document.getElementById("parr-chip");
    if (chip) {
      if (S.act === 0) {
        const ok = S.parr >= PARRAINAGES_REQUIS;
        chip.innerHTML = `
          <div class="parr-line"><span>✍️ Parrainages</span><b>${S.parr} / ${PARRAINAGES_REQUIS}</b></div>
          <div class="dash-bar"><div style="width:${Math.min(100, (S.parr / PARRAINAGES_REQUIS) * 100)}%" class="${ok ? "ok" : ""}"></div></div>`;
        chip.classList.toggle("ok", ok);
      } else {
        chip.textContent = `✅ Candidature validée (${S.parr} parrainages)`;
        chip.classList.add("ok");
      }
    }
    renderPolls();
    renderDossier();
  }

  function effectiveDelta(stat, raw) {
    if (!raw) return 0;
    const m = S.arch.mods[stat];
    if (m) raw = raw > 0 ? raw * (m.pos ?? 1) : raw * (m.neg ?? 1);
    return Math.round(raw);
  }

  function previewChoice(fx) {
    Object.entries(KEYMAP).forEach(([short, k]) => {
      const v = fx ? effectiveDelta(k, fx[short]) : 0;
      screen.querySelectorAll(`[data-stat="${k}"] .g-dot`).forEach(g => {
        g.className = "g-dot" + (v ? (Math.abs(v) >= 7 ? " big" : " small") : "");
      });
    });
  }

  function nextEvent() {
    const list = ACTS[S.act].events;
    while (++S.idx < list.length) {
      const ev = list[S.idx];
      if (ev.only && !ev.only.includes(S.arch.id)) continue;
      if (ev.pool && !S.picked.has(ev.id)) continue;
      if (ev.condition && !ev.condition(S)) continue;
      return showEvent(ev);
    }
    endAct();
  }

  function avatarHtml(c) {
    const initials = c.name.split(/\s+/).filter(w => /^[A-ZÀ-Ý]/.test(w)).map(w => w[0]).slice(0, 2).join("");
    return `<div class="avatar" style="background:${c.color}">${initials}</div>`;
  }

  async function showEvent(ev) {
    const c = CHARACTERS[ev.from];
    S.seen.add(ev.id);
    setDate(ev.date);
    document.getElementById("chat-head").innerHTML = `
      ${avatarHtml(c)}
      <div><div class="ch-name">${c.name}</div><div class="ch-role">${fmt(c.role)}</div></div>
      <div class="ch-secure">🔒 chiffré</div>`;
    const chat = document.getElementById("chat");
    const choices = document.getElementById("choices");
    chat.innerHTML = `<div class="chat-date">${ev.date} 2027</div>`;
    choices.innerHTML = "";

    for (const t of ev.text) {
      const typing = el("div", "bubble them typing", "<span></span><span></span><span></span>");
      chat.appendChild(typing);
      chat.scrollTop = chat.scrollHeight;
      await sleep(450);
      typing.remove();
      chat.appendChild(el("div", "bubble them pop", fmt(t)));
      chat.scrollTop = chat.scrollHeight;
      await sleep(220);
    }

    const touch = matchMedia("(hover: none)").matches;
    ev.choices
      .filter(ch => !ch.condition || ch.condition(S))
      .forEach((ch, i) => {
        const b = el("button", "choice pop" + (ch.condition ? " special" : ""),
          `<span class="choice-key">${i + 1}</span><span>${fmt(ch.text)}</span>`);
        b.onmouseenter = () => previewChoice(ch.fx);
        b.onfocus = () => previewChoice(ch.fx);
        b.onmouseleave = () => previewChoice(null);
        b.onclick = () => {
          if (touch && !b.classList.contains("armed")) {
            choices.querySelectorAll(".choice.armed").forEach(x => x.classList.remove("armed"));
            b.classList.add("armed");
            previewChoice(ch.fx);
            return;
          }
          choose(ev, ch);
        };
        choices.appendChild(b);
      });
    chat.scrollTop = chat.scrollHeight;
  }

  function applyChoice(ch) {
    const fx = ch.fx || {};
    const deltas = {};
    Object.entries(KEYMAP).forEach(([short, stat]) => {
      const d = effectiveDelta(stat, fx[short]);
      if (!d) return;
      const before = S.stats[stat];
      S.stats[stat] = clamp(before + d, 0, 100);
      deltas[stat] = S.stats[stat] - before;
    });
    S.integ = clamp(S.integ + (fx.integ || 0), 0, 100);
    S.dette += fx.dette || 0;
    S.scandale = Math.max(0, S.scandale + (fx.scand || 0));
    if (fx.parr) S.parr = Math.max(0, S.parr + fx.parr);
    if (ch.flag) S.flags.add(ch.flag);
    if (ch.promise) S.promises.push(ch.promise);
    S.decisions++;
    S.history.push({ act: S.act, stats: { ...S.stats } });
    return deltas;
  }

  async function choose(ev, ch) {
    previewChoice(null);
    const chat = document.getElementById("chat");
    const choices = document.getElementById("choices");
    choices.innerHTML = "";
    chat.appendChild(el("div", "bubble me pop", fmt(ch.text)));
    chat.scrollTop = chat.scrollHeight;

    const deltas = applyChoice(ch);
    await sleep(500);
    updateHud(deltas);

    const typing = el("div", "bubble them typing", "<span></span><span></span><span></span>");
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
    await sleep(600);
    typing.remove();

    const res = el("div", "result pop");
    res.innerHTML = `<div class="result-text">${fmt(ch.result)}</div>`;
    const chips = STATS.filter(k => deltas[k]).map(k =>
      `<span class="chip ${deltas[k] > 0 ? "up" : "down"}">${STAT_META[k].icon} ${deltas[k] > 0 ? "+" : ""}${deltas[k]}</span>`);
    if (ch.fx && ch.fx.parr) chips.push(`<span class="chip ${ch.fx.parr > 0 ? "up" : "down"}">✍️ ${ch.fx.parr > 0 ? "+" : ""}${ch.fx.parr} parrainages</span>`);
    if (ch.promise) chips.push(`<span class="chip promise">🤞 Promesse : ${ch.promise}</span>`);
    if (chips.length) res.innerHTML += `<div class="chips">${chips.join("")}</div>`;
    chat.appendChild(res);
    chat.scrollTop = chat.scrollHeight;

    if (ch.news) setTimeout(() => notify(fmt(ch.news)), 300);

    const dead = STATS.find(k => S.stats[k] <= 0);
    const next = el("button", "btn btn-primary btn-next pop", "Continuer →");
    next.onclick = () => {
      if (ch.ending) return showEnding(ch.ending);
      if (dead) return showEnding("go_" + dead);
      nextEvent();
    };
    choices.appendChild(next);
  }

  /* ---------------- Vues secondaires ---------------- */

  function renderPolls() {
    const v = document.getElementById("polls");
    if (!v) return;
    const secondTour = S.act === 2;
    const pts = secondTour
      ? S.history.filter(h => h.act === 2).map(h => round2Estimate(h.stats))
      : S.history.map(h => votePct(h.stats.sondages));
    const W = 320, H = 150, P = 20;
    const [min, max] = secondTour ? [30, 70] : [0, 40];
    const seuil = secondTour ? 50 : qualifThreshold();
    const x = i => P + (pts.length === 1 ? 0 : (i * (W - 2 * P)) / (pts.length - 1));
    const y = p => H - P - ((clamp(p, min, max) - min) / (max - min)) * (H - 2 * P);
    const line = pts.map((p, i) => `${x(i)},${y(p)}`).join(" ");
    const threshold = y(seuil);
    const pct = n => n.toFixed(1).replace(".", ",") + " %";
    const last = pts[pts.length - 1];

    const head = secondTour
      ? `<div class="panel-title">Intentions de vote (2nd tour)</div>
         <div class="duel">
           <div class="duel-side me"><span>${esc(S.name)}</span><b>${pct(last)}</b></div>
           <div class="duel-side"><span>${OPPONENT}</span><b>${pct(100 - last)}</b></div>
         </div>
         <div class="duel-bar"><div style="width:${last}%"></div><i></i></div>`
      : `<div class="panel-title">Intentions de vote (1er tour)</div>
         <div class="big-number">${pct(last)}</div>`;

    v.innerHTML = `
      ${head}
      <svg viewBox="0 0 ${W} ${H}" class="chart">
        <line x1="${P}" x2="${W - P}" y1="${threshold}" y2="${threshold}" class="threshold"/>
        <text x="${W - P}" y="${threshold - 4}" class="threshold-label" text-anchor="end">${secondTour ? "majorité : 50 %" : `seuil de qualification ≈ ${pct(seuil)}`}</text>
        <polyline points="${line}" class="poll-line"/>
        ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p)}" r="3" class="poll-dot"/>`).join("")}
      </svg>
      <div class="panel-note">${secondTour
        ? `Estimation selon vos sondages, votre crédibilité et la cohésion de votre camp. Au premier tour : ${pct(S.round1.you)}.`
        : "Chaque point correspond à une de vos décisions."}</div>`;
  }

  function renderDossier() {
    const v = document.getElementById("dossier");
    if (!v) return;
    const moral = moralLabel(S.integ);
    const risk = scandalRisk();
    const secrets = [];
    if (S.flags.has("koval")) secrets.push("Dons fractionnés de Serge Koval");
    if (S.flags.has("cabinet")) secrets.push("« Cabinet de conseil aux élus »");
    if (S.flags.has("reveil")) secrets.push("Alliance avec le Collectif Réveil");
    if (S.flags.has("castagnet")) secrets.push("Pacte avec le sénateur Castagnet");
    if (S.flags.has("fuite")) secrets.push("Fuite anonyme sur Delmas");
    if (S.flags.has("lobby")) secrets.push("Accord avec les laboratoires");
    if (S.flags.has("baudoin")) secrets.push("Pacte avec Baudoin");
    if (S.flags.has("dossier_utilise")) secrets.push("Dossier Delmas sorti en plein débat");
    else if (S.flags.has("dossier_garde") || S.flags.has("dossier_debat")) secrets.push("Dossier Delmas au coffre");

    v.innerHTML = `
      <div class="panel two-col">
        <div><div class="panel-title">Boussole morale</div><span class="badge ${moral.cls}">${moral.label}</span></div>
        <div><div class="panel-title">Risque de scandale</div><span class="badge ${risk.cls}">${risk.label}</span></div>
      </div>
      <div class="panel">
        <div class="panel-title">Promesses faites (${S.promises.length})</div>
        ${S.promises.length ? `<ul class="list">${S.promises.map(p => `<li>🤞 ${p}</li>`).join("")}</ul>` : `<div class="panel-note">Aucune pour l’instant.</div>`}
      </div>
      <div class="panel">
        <div class="panel-title">Dossiers sensibles (${secrets.length})</div>
        ${secrets.length ? `<ul class="list secret">${secrets.map(p => `<li>🗄️ ${p}</li>`).join("")}</ul>` : `<div class="panel-note">Rien à cacher. Pour l’instant.</div>`}
      </div>`;
  }

  /* ---------------- Fins d’acte & résultats ---------------- */

  function endAct() {
    if (S.act === 0) {
      if (S.parr < PARRAINAGES_REQUIS) return showEnding("parrainages");
      return showInterstitial(
        "4 mars 2027",
        "Conseil constitutionnel",
        `Votre candidature est validée avec <b>${S.parr}</b> parrainages.<br>Vous figurez sur la liste officielle des candidats.`,
        "✅",
        () => startAct(1)
      );
    }
    if (S.act === 1) return firstRound();
    if (S.act === 2) return secondRound();
  }

  function showInterstitial(date, kicker, html, emoji, onNext) {
    setDate(date);
    screen.innerHTML = `
      <div class="interstitial fade-in">
        <div class="inter-emoji">${emoji}</div>
        <div class="inter-kicker">${kicker}</div>
        <div class="inter-text">${html}</div>
        <button class="btn btn-primary" id="btn-inter">Continuer</button>
      </div>`;
    document.getElementById("btn-inter").onclick = onNext;
  }

  /* Poids relatifs des adversaires, renormalisés sur (100 − votre score). */
  function firstRoundField() {
    const delmasHit = S.flags.has("fuite") || S.flags.has("dossier_utilise") ? 5 : 0;
    let autres = 4 + delmasHit;
    const field = [
      { name: OPPONENT, v: 27 - delmasHit },
      { name: "Hélène Marchal", v: 17 },
      { name: "Bruno Kessler", v: 11 },
      { name: "Jade Morel", v: 7 },
      { name: "Nadia Ferhat", v: 6 }
    ];
    if (S.flags.has("garnier_maintenu")) field.push({ name: "Mathieu Garnier", v: 6 });
    if (S.seen.has("a2_vallier") && !S.flags.has("vallier_ralliee")) {
      const v = S.flags.has("vallier_flop") ? 4 : 6;
      field.push({ name: "Catherine Vallier", v });
      autres += 6 - v;
    } else {
      autres += 6;
    }
    field.push({ name: "Autres candidats", v: autres, other: true });
    return field;
  }

  function qualifThreshold() {
    const field = firstRoundField();
    const total = field.reduce((a, c) => a + c.v, 0);
    const second = field.filter(c => !c.other).map(c => c.v).sort((a, b) => b - a)[1];
    return (100 * second) / (total + second);
  }

  function firstRound() {
    const you = votePct(S.stats.sondages) + rand(-1, 1);
    const field = firstRoundField();
    const total = field.reduce((a, b) => a + b.v, 0);
    const k = (100 - you) / total;
    const results = field.map(c => ({ ...c, v: c.v * k }));
    results.push({ name: S.name, v: you, me: true });
    const ranked = results.filter(r => !r.other).sort((a, b) => b.v - a.v);
    const rank = ranked.findIndex(r => r.me) + 1;
    const marchal = results.find(r => r.name === "Hélène Marchal").v;
    S.round1 = { you, rank, marchal };

    showResults(
      "10 avril 2027 · 20 h 00",
      "Résultats du 1er tour",
      results.sort((a, b) => b.v - a.v),
      rank <= 2 ? `Vous êtes qualifié${S.civ === "F" ? "e" : ""} pour le second tour face à ${OPPONENT} !` : "Vous n’êtes pas qualifié" + (S.civ === "F" ? "e" : "") + " pour le second tour.",
      rank <= 2,
      () => (rank <= 2 ? startAct(2) : showEnding("elimine"))
    );
  }

  function round2Estimate(st) {
    return clamp(50 + (st.sondages - 80) * 0.3 + (st.credibilite - 50) * 0.15 + (st.cohesion - 50) * 0.05 + (S.arch.round2 ?? 0), 28, 72);
  }

  function secondRound() {
    let you = clamp(round2Estimate(S.stats) + rand(-1.5, 1.5), 28, 72);
    if (Math.abs(you - 50) < 0.2) you += you >= 50 ? 0.3 : -0.3;
    S.round2 = { you };
    const won = you > 50;

    let ending;
    if (won) {
      if (S.integ >= 65 && S.dette === 0) ending = "victoire_absolue";
      else if (S.dette >= 2 || S.integ < 35) ending = "pacte";
      else ending = "victoire";
    } else {
      ending = you >= 46 ? "honorable" : "cuisante";
    }

    showResults(
      "24 avril 2027 · 20 h 00",
      "Résultats du 2nd tour",
      [{ name: S.name, v: you, me: true }, { name: OPPONENT, v: 100 - you }].sort((a, b) => b.v - a.v),
      won ? `${esc(S.name)} est élu${S.civ === "F" ? "e" : ""} ${S.civ === "F" ? "Présidente" : "Président"} de la République.` : `${OPPONENT} est élu Président de la République.`,
      won,
      () => showEnding(ending)
    );
  }

  async function showResults(date, title, rows, verdict, good, onNext) {
    hideNotif();
    setDate(date.split("·")[0].trim());
    const max = Math.max(...rows.map(r => r.v));
    screen.innerHTML = `
      <div class="results fade-in">
        <div class="tv-banner"><span class="live">● DIRECT</span> ${date}</div>
        <div class="results-title">${title}</div>
        <div class="results-list">
          ${rows.map(r => `
            <div class="res-row ${r.me ? "me" : ""}">
              <div class="res-name">${r.me ? "★ " : ""}${esc(r.name)}</div>
              <div class="res-bar"><div data-w="${(r.v / max) * 100}"></div></div>
              <div class="res-val" data-v="${r.v.toFixed(1)}">0 %</div>
            </div>`).join("")}
        </div>
        <div class="verdict ${good ? "good" : "bad"}" style="opacity:0">${verdict}</div>
        <button class="btn btn-primary" id="btn-res" style="opacity:0">Continuer</button>
      </div>`;
    await sleep(400);
    screen.querySelectorAll(".res-bar div").forEach(d => (d.style.width = d.dataset.w + "%"));
    screen.querySelectorAll(".res-val").forEach(d => {
      const target = parseFloat(d.dataset.v);
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / 1400);
        d.textContent = (target * p).toFixed(1).replace(".", ",") + " %";
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await sleep(1600);
    screen.querySelector(".verdict").style.opacity = 1;
    const btn = document.getElementById("btn-res");
    btn.style.opacity = 1;
    btn.onclick = onNext;
  }

  /* ---------------- Fins ---------------- */

  function showEnding(id) {
    const e = ENDINGS[id];
    const moral = moralLabel(S.integ);
    hideNotif();
    setDate("");
    screen.innerHTML = `
      <div class="ending tone-${e.tone} fade-in">
        <div class="ending-emoji">${e.emoji}</div>
        <div class="ending-kicker">Fin de partie</div>
        <h2 class="ending-title">${fmt(e.title)}</h2>
        <div class="ending-text">${e.text(S).map(p => `<p>${fmt(p)}</p>`).join("")}</div>
        <div class="panel ending-recap">
          <div class="panel-title">Bilan de campagne</div>
          ${STATS.map(k => `
            <div class="dash-row">
              <span>${STAT_META[k].icon} ${STAT_META[k].label}</span>
              <div class="dash-bar"><div style="width:${S.stats[k]}%" class="${S.stats[k] <= 20 ? "low" : ""}"></div></div>
              <b>${S.stats[k]}</b>
            </div>`).join("")}
          <div class="recap-grid">
            <div><span>Profil</span><b>${archName(S.arch, S.civ)}</b></div>
            <div><span>Décisions</span><b>${S.decisions}</b></div>
            <div><span>Boussole</span><b class="badge ${moral.cls}">${moral.label} (${S.integ})</b></div>
            <div><span>Dettes cachées</span><b>${S.dette}</b></div>
            <div><span>Risque de scandale</span><b>${S.scandale}</b></div>
            <div><span>Promesses</span><b>${S.promises.length}</b></div>
          </div>
          ${S.promises.length ? `<ul class="list">${S.promises.map(p => `<li>🤞 ${p}</li>`).join("")}</ul>` : ""}
        </div>
        <div class="panel share-box">
          <div class="panel-title">Défiez vos amis</div>
          <button class="btn btn-share" id="btn-share">📣 Partager mon résultat</button>
          <div class="share-links">
            <a id="share-x" target="_blank" rel="noopener">X / Twitter</a>
            <a id="share-wa" target="_blank" rel="noopener">WhatsApp</a>
            <a id="share-fb" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
        <div class="ending-actions">
          <button class="btn btn-primary" id="btn-replay">Rejouer avec ce profil</button>
          <button class="btn btn-ghost" id="btn-new">Nouveau candidat</button>
        </div>
      </div>`;
    setupShare(e);
    const { arch, name, civ } = S;
    document.getElementById("btn-replay").onclick = () => startGame(arch.id, name, civ);
    document.getElementById("btn-new").onclick = showTitle;
  }

  /* ---------------- Partage ---------------- */

  function shareUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    return /^https?:/.test(location.protocol) ? location.origin + location.pathname : canonical.href;
  }

  function shareText(e) {
    const f = S.civ === "F";
    const pct = n => n.toFixed(1).replace(".", ",") + " %";
    const title = el("div", null, fmt(e.title)).textContent;
    let score;
    if (S.round2) {
      score = S.round2.you > 50
        ? `Élu${f ? "e" : ""} ${f ? "présidente" : "président"} avec ${pct(S.round2.you)} au second tour.`
        : `Battu${f ? "e" : ""} au second tour avec ${pct(S.round2.you)}.`;
    } else if (S.round1 && S.round1.rank <= 2) {
      score = `Qualifié${f ? "e" : ""} pour le second tour avec ${pct(S.round1.you)}… avant que tout ne déraille.`;
    } else if (S.round1) {
      score = `${S.round1.rank}e au premier tour avec ${pct(S.round1.you)}.`;
    } else {
      score = S.act === 0 ? `Campagne stoppée avant le premier tour (${S.parr} parrainages).` : "Campagne stoppée avant le premier tour.";
    }
    return [
      `${e.emoji} Objectif Élysée — ${title}`,
      score,
      `Boussole morale : ${moralLabel(S.integ).label} · ${S.decisions} décisions`,
      "Et vous, jusqu’où irez-vous pour gagner ?"
    ].join("\n");
  }

  function setupShare(e) {
    const text = shareText(e);
    const url = shareUrl();
    const t = encodeURIComponent(text);
    const u = encodeURIComponent(url);
    document.getElementById("share-x").href = `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
    document.getElementById("share-wa").href = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;
    document.getElementById("share-fb").href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;

    const btn = document.getElementById("btn-share");
    btn.onclick = async () => {
      if (navigator.share) {
        try { await navigator.share({ title: "Objectif Élysée", text, url }); } catch (_) {}
        return;
      }
      try {
        await navigator.clipboard.writeText(text + "\n" + url);
        btn.textContent = "✅ Résultat copié — collez-le où vous voulez !";
      } catch (_) {
        btn.textContent = "Copie impossible — utilisez les liens ci-dessous";
      }
      setTimeout(() => (btn.textContent = "📣 Partager mon résultat"), 2500);
    };
  }

  document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") return;
    if (/^[1-9]$/.test(e.key)) {
      const c = screen.querySelectorAll(".choice")[+e.key - 1];
      if (c) c.click();
    } else if (e.key === "Enter") {
      const b = screen.querySelector(".btn-next, #btn-act, #btn-inter, #btn-start");
      const r = document.getElementById("btn-res");
      if (b) b.click();
      else if (r && r.style.opacity === "1") r.click();
    }
  });

  showTitle();
})();
