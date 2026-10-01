// Portfólio: filtros, linhas justificadas e visualização ampliada (setas discretas, arrastar, deslize)
(() => {
  const dados = window.PORTFOLIO || [];
  const alvo = document.querySelector("[data-galeria]");
  const filtros = document.querySelector("[data-filtros]");
  if (!alvo || !dados.length) return;

  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const suave = "cubic-bezier(.16,.84,.32,1)";
  const NOMES = { tudo: "Tudo", sobrancelhas: "Sobrancelhas", pestanas: "Pestanas", unhas: "Unhas", pes: "Pés" };
  const ROTULO = { sobrancelhas: "Sobrancelhas", pestanas: "Pestanas", unhas: "Unhas", pes: "Pés" };
  const base = "assets/portfolio/";

  /* ---------- filtros ---------- */
  let cat = (location.hash.slice(1) in NOMES) ? location.hash.slice(1) : "tudo";
  Object.keys(NOMES).forEach((k) => {
    const n = k === "tudo" ? dados.length : dados.filter((d) => d.c === k).length;
    if (!n) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "filtro";
    b.dataset.cat = k;
    b.innerHTML = `${NOMES[k]} <span>${n}</span>`;
    b.setAttribute("aria-pressed", String(k === cat));
    b.onclick = () => {
      if (k === cat) return;
      cat = k;
      history.replaceState(null, "", k === "tudo" ? location.pathname : "#" + k);
      filtros.querySelectorAll(".filtro").forEach((f) => f.setAttribute("aria-pressed", String(f.dataset.cat === k)));
      montar(true);
    };
    filtros.append(b);
  });

  /* ---------- miniaturas ---------- */
  let lista = [];
  function montar(animar) {
    lista = cat === "tudo" ? dados : dados.filter((d) => d.c === cat);
    const els = lista.map((d, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "foto";
      b.dataset.razao = d.w / d.h;
      b.setAttribute("aria-label", `Ampliar foto ${i + 1}: ${ROTULO[d.c]}`);
      const img = new Image(d.w, d.h);
      img.alt = "";
      img.decoding = "async";
      img.loading = i < 10 ? "eager" : "lazy";
      img.addEventListener("load", () => b.classList.add("pronta"), { once: true });
      img.src = base + "t/" + d.f;
      if (img.complete) b.classList.add("pronta");
      b.append(img);
      b.addEventListener("click", () => abrir(i));
      return b;
    });
    const trocar = () => { justificar(els); if (animar && !calmo) alvo.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: suave }); };
    if (animar && !calmo) alvo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease-in" }).finished.then(trocar);
    else trocar();
  }

  // Linhas justificadas: a foto aparece inteira e cada linha fecha exatamente na largura.
  function alturaAlvo(l) { return l < 420 ? 150 : l < 640 ? 180 : l < 900 ? 220 : l < 1200 ? 260 : 290; }
  let atuais = [];
  function justificar(els = atuais) {
    atuais = els;
    const largura = alvo.clientWidth;
    if (!largura) return;
    const vao = largura < 640 ? 6 : 10;
    const alvoH = alturaAlvo(largura);
    const razao = (el) => Math.min(2.2, Math.max(0.5, Number(el.dataset.razao)));
    const alturaDe = (ls) => (largura - vao * (ls.length - 1)) / ls.reduce((s, el) => s + razao(el), 0);
    const linhas = [];
    let linha = [];
    els.forEach((el) => {
      linha.push(el);
      if (linha.reduce((s, e) => s + razao(e), 0) * alvoH + vao * (linha.length - 1) < largura) return;
      const hSem = linha.length > 1 ? alturaDe(linha.slice(0, -1)) : Infinity;
      if (Math.abs(hSem - alvoH) < Math.abs(alturaDe(linha) - alvoH)) { linhas.push(linha.slice(0, -1)); linha = [el]; }
      else { linhas.push(linha); linha = []; }
    });
    let ultima = null;
    if (linha.length) {
      if (alturaDe(linha) <= alvoH * 1.5) linhas.push(linha);
      else { linhas.push(linha); ultima = alvoH; }
    }
    alvo.replaceChildren();
    linhas.forEach((ls, i) => {
      const h = i === linhas.length - 1 && ultima ? ultima : alturaDe(ls);
      const div = document.createElement("div");
      div.className = "galeria-linha";
      div.style.gap = vao + "px";
      ls.forEach((el) => {
        el.style.width = (razao(el) * h).toFixed(2) + "px";
        el.style.height = h.toFixed(2) + "px";
        div.append(el);
      });
      alvo.append(div);
    });
    alvo.style.setProperty("--vao", vao + "px");
  }
  let larguraAnt = 0;
  new ResizeObserver(() => {
    const w = alvo.clientWidth;
    if (Math.abs(w - larguraAnt) < 2) return;
    larguraAnt = w;
    justificar();
  }).observe(alvo);
  montar(false);

  /* ---------- visualização ampliada ---------- */
  let caixa, pos = 0, arrastou = false;
  function montarCaixa() {
    caixa = document.createElement("dialog");
    caixa.className = "caixa";
    caixa.setAttribute("aria-label", "Foto ampliada");
    caixa.innerHTML = `
      <div class="caixa-topo"><span class="caixa-cont" aria-live="polite"></span>
        <button class="caixa-btn" data-fechar aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button></div>
      <div class="caixa-palco">
        <button class="caixa-nav ant" aria-label="Anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8"/></svg></button>
        <img alt="">
        <button class="caixa-nav prox" aria-label="Próxima"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg></button>
      </div>
      <div class="caixa-rodape"><span class="caixa-legenda"></span><a class="caixa-cta" data-go="booksy" href="#">Marcar</a></div>`;
    document.body.append(caixa);
    const cta = caixa.querySelector(".caixa-cta");
    cta.href = window.RYMMA?.booksy || "#"; cta.target = "_blank"; cta.rel = "noopener";
    caixa.querySelector("[data-fechar]").onclick = fechar;
    caixa.addEventListener("cancel", (e) => { e.preventDefault(); fechar(); });
    caixa.querySelector(".ant").onclick = () => ir(-1);
    caixa.querySelector(".prox").onclick = () => ir(1);
    caixa.addEventListener("click", (e) => {
      if (arrastou) { arrastou = false; return; }
      if (e.target === caixa || e.target.classList.contains("caixa-palco")) fechar();
    });
    caixa.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") ir(1);
    });
    const palco = caixa.querySelector(".caixa-palco");
    const foto = palco.querySelector("img");
    foto.addEventListener("load", () => foto.classList.remove("trocando"));
    let x0 = null, y0 = 0, t0 = 0, dx = 0;
    palco.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".caixa-nav") || lista.length < 2) return;
      x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); dx = 0; arrastou = false;
    });
    palco.addEventListener("pointermove", (e) => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      if (!arrastou && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) {
        arrastou = true;
        try { palco.setPointerCapture(e.pointerId); } catch {}
        foto.getAnimations().forEach((a) => a.cancel());
      }
      if (arrastou) {
        foto.style.transform = `translateX(${dx}px)`;
        foto.style.opacity = String(1 - Math.min(Math.abs(dx) / 700, 0.35));
      }
    });
    const soltar = () => {
      if (x0 === null) return;
      x0 = null;
      if (!arrastou) return;
      const rapido = Math.abs(dx) / Math.max(performance.now() - t0, 1) > 0.45;
      if (Math.abs(dx) > 70 || (rapido && Math.abs(dx) > 24)) ir(dx < 0 ? 1 : -1, dx);
      else {
        const de = foto.style.transform;
        foto.style.transform = ""; foto.style.opacity = "";
        if (!calmo) foto.animate([{ transform: de }, { transform: "none" }], { duration: 260, easing: suave });
      }
    };
    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);
    caixa.addEventListener("close", () => { document.documentElement.style.overflow = ""; });
  }
  function mostrar() {
    const d = lista[pos];
    const img = caixa.querySelector(".caixa-palco img");
    const src = base + "g/" + d.f;
    if (img.getAttribute("src") !== src) img.classList.add("trocando");
    img.src = src;
    if (img.complete) img.classList.remove("trocando");
    img.width = d.w; img.height = d.h;
    img.alt = `${ROTULO[d.c]}, trabalho RYMMAPROF`;
    caixa.classList.toggle("uma", lista.length < 2);
    caixa.querySelector(".caixa-cont").textContent = `${pos + 1} / ${lista.length}`;
    caixa.querySelector(".caixa-legenda").textContent = ROTULO[d.c];
    [1, -1].forEach((k) => { new Image().src = base + "g/" + lista[(pos + k + lista.length) % lista.length].f; });
  }
  function ir(d, deArrasto = 0) {
    if (lista.length < 2) return;
    pos = (pos + d + lista.length) % lista.length;
    const foto = caixa.querySelector(".caixa-palco img");
    foto.style.transform = ""; foto.style.opacity = "";
    mostrar();
    if (calmo) return;
    foto.getAnimations().forEach((a) => a.cancel());
    const inicio = d * Math.max(60, Math.min(Math.abs(deArrasto) * 0.6, 140));
    foto.animate([{ transform: `translateX(${inicio}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 340, easing: suave });
  }
  function abrir(i) {
    if (!caixa) montarCaixa();
    pos = i;
    mostrar();
    document.documentElement.style.overflow = "hidden";
    caixa.showModal();
  }
  function fechar() {
    if (!caixa.open) return;
    if (calmo) return caixa.close();
    caixa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-in" }).finished.then(() => caixa.close());
  }
})();
