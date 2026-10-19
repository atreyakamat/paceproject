/* THE PACE PROJECT GOA — site scripts */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  const THEME_KEY = "tpp-theme";
  const applyTheme = (t) => {
    root.setAttribute("data-theme", t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === "light" ? "#fafafa" : "#0a0a0a";
  };
  $$(".theme-toggle").forEach((btn) =>
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
      toast(next === "light" ? "Light mode on ☀️" : "Dark mode on 🌙");
    })
  );
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", (e) => {
    try { if (localStorage.getItem(THEME_KEY)) return; } catch (_) {}
    applyTheme(e.matches ? "light" : "dark");
  });

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $(".toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  /* ---------- nav ---------- */
  const nav = $(".nav");
  const progress = $(".progress");
  const toTop = $(".to-top");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    toTop.classList.toggle("is-visible", y > 700);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const burger = $(".burger");
  const menu = $(".mobile-menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // active link highlighting
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".reveal, .map-card");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in-view"));

  /* ---------- count up ---------- */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const dur = reduceMotion ? 1 : 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach((c) => co.observe(c));
  } else counters.forEach(runCounter);

  /* ---------- next Sunday run countdown (IST, 6:00 AM) ---------- */
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const RUN_HOUR = 6;       // 06:00 IST
  const RUN_WINDOW = 3;     // show "live" for 3 hours
  function nextRun() {
    const nowUTC = Date.now();
    const ist = new Date(nowUTC + IST_OFFSET); // treat UTC fields as IST wall clock
    const day = ist.getUTCDay(); // 0 = Sunday
    const target = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), RUN_HOUR, 0, 0));
    const daysAhead = (7 - day) % 7;
    target.setUTCDate(target.getUTCDate() + daysAhead);
    let live = false;
    if (day === 0) {
      const hoursSinceStart = (ist.getTime() - target.getTime()) / 36e5;
      if (hoursSinceStart >= 0 && hoursSinceStart < RUN_WINDOW) live = true;
      else if (hoursSinceStart >= RUN_WINDOW) target.setUTCDate(target.getUTCDate() + 7);
    }
    return { live, ms: target.getTime() - IST_OFFSET - nowUTC, target };
  }
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  const nextRunCard = $(".next-run");
  const nextRunDate = $("#next-run-date");
  const pad = (n) => String(n).padStart(2, "0");
  function tick() {
    if (!cd.d) return;
    const { live, ms, target } = nextRun();
    nextRunCard.classList.toggle("is-live", live);
    const sec = Math.max(0, Math.floor(ms / 1000));
    cd.d.textContent = pad(Math.floor(sec / 86400));
    cd.h.textContent = pad(Math.floor((sec % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((sec % 3600) / 60));
    cd.s.textContent = pad(sec % 60);
    if (nextRunDate) {
      const d = new Date(target.getTime());
      nextRunDate.textContent = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }) + " · 6:00 AM IST";
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- events filter ---------- */
  const filterBtns = $$(".filters button");
  const events = $$(".event");
  const applyFilter = (f) => {
    let shown = 0;
    events.forEach((ev) => {
      const show = f === "all" || ev.dataset.type === f;
      ev.hidden = !show;
      if (show) shown++;
    });
    const empty = $("#events-empty");
    if (empty) empty.hidden = shown > 0;
  };
  filterBtns.forEach((b) =>
    b.addEventListener("click", () => {
      filterBtns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      applyFilter(b.dataset.filter);
    })
  );
  const initialFilter = filterBtns.find((b) => b.getAttribute("aria-pressed") === "true");
  if (initialFilter) applyFilter(initialFilter.dataset.filter);

  /* ---------- pace calculator ---------- */
  const DIST = { "5K": 5, "10K": 10, HM: 21.0975, FM: 42.195 };
  const calc = $("#calc");
  if (calc) {
    let mode = "time";
    let distance = 10;
    const tabs = $$(".calc__tabs button", calc);
    const chips = $$(".chip", calc);
    const customDist = $("#custom-dist");
    const timeFields = $("#time-fields");
    const paceFields = $("#pace-fields");
    const fmt = (sec) => {
      sec = Math.round(sec);
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
    };
    const fmtPace = (secPerKm) => { const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60); return `${m}:${pad(s)}`; };
    const getTime = () => (+$("#t-h").value || 0) * 3600 + (+$("#t-m").value || 0) * 60 + (+$("#t-s").value || 0);
    const getPace = () => (+$("#p-m").value || 0) * 60 + (+$("#p-s").value || 0);

    function compute() {
      const out = $("#calc-out");
      let paceSec; // seconds per km
      let totalSec;
      if (mode === "time") {
        totalSec = getTime();
        if (!totalSec || !distance) { out.hidden = true; return; }
        paceSec = totalSec / distance;
      } else {
        paceSec = getPace();
        if (!paceSec || !distance) { out.hidden = true; return; }
        totalSec = paceSec * distance;
      }
      out.hidden = false;
      $("#r-pace").textContent = fmtPace(paceSec);
      $("#r-mile").textContent = fmtPace(paceSec * 1.609344);
      $("#r-speed").textContent = (3600 / paceSec).toFixed(1);
      $("#r-total").textContent = fmt(totalSec);
      $("#r-dist").textContent = distance % 1 ? distance.toFixed(2) : distance;
      // Riegel projections from the computed effort
      const proj = (d) => totalSec * Math.pow(d / distance, 1.06);
      $("#r-5k").textContent = fmt(proj(5));
      $("#r-10k").textContent = fmt(proj(10));
      $("#r-hm").textContent = fmt(proj(21.0975));
      $("#r-fm").textContent = fmt(proj(42.195));
    }
    tabs.forEach((t) => t.addEventListener("click", () => {
      mode = t.dataset.mode;
      tabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
      timeFields.hidden = mode !== "time";
      paceFields.hidden = mode !== "pace";
      compute();
    }));
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      if (c.dataset.dist === "custom") { customDist.hidden = false; distance = +$("#d-custom").value || 0; $("#d-custom").focus(); }
      else { customDist.hidden = true; distance = DIST[c.dataset.dist]; }
      compute();
    }));
    $("#d-custom").addEventListener("input", (e) => { distance = +e.target.value || 0; compute(); });
    $$("input", calc).forEach((i) => i.addEventListener("input", compute));
    compute();
  }

  /* ---------- instagram embeds (lazy) ---------- */
  const igCards = $$(".ig-card[data-permalink]");
  const loadEmbed = (card) => {
    if (card.dataset.loaded) return;
    card.dataset.loaded = "1";
    const f = document.createElement("iframe");
    f.src = card.dataset.permalink.replace(/\/?$/, "/") + "embed/";
    f.loading = "lazy";
    f.title = "Instagram post from @thepaceprojectgoa";
    f.allow = "encrypted-media";
    f.setAttribute("scrolling", "no");
    f.addEventListener("load", () => card.classList.add("is-loaded"));
    card.appendChild(f);
  };
  if ("IntersectionObserver" in window) {
    const eo = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { loadEmbed(en.target); eo.unobserve(en.target); } });
    }, { rootMargin: "300px" });
    igCards.forEach((c) => eo.observe(c));
  } else igCards.forEach(loadEmbed);

  /* ---------- cursor glow ---------- */
  const glow = $(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0, raf;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add("has-cursor");
      if (!raf) loop();
    }, { passive: true });
    function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx - 210}px, ${gy - 210}px)`;
      raf = requestAnimationFrame(loop);
    }
  }

  /* ---------- netlify form (ajax) ---------- */
  const form = $("#hello-form");
  if (form) {
    const status = $(".form-status", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("button[type=submit]", form);
      btn.disabled = true;
      status.className = "form-status";
      status.textContent = "Sending…";
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error("bad response");
        form.reset();
        status.classList.add("ok");
        status.textContent = "Got it! See you on Sunday. 🏃";
        toast("Message sent ✔");
      } catch (err) {
        status.classList.add("err");
        status.textContent = "Couldn't send right now — DM us on Instagram instead.";
      } finally { btn.disabled = false; }
    });
  }

  /* ---------- share ---------- */
  $$("[data-share]").forEach((b) =>
    b.addEventListener("click", async () => {
      const data = { title: "The Pace Project Goa — Run Club", text: "Run. Connect. Repeat. Join South Goa's run club.", url: location.href.split("#")[0] };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(data.url); toast("Link copied 🔗"); }
      } catch (_) {}
    })
  );

  /* ---------- footer year ---------- */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
})();
