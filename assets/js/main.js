// RYMMAPROF — links de conversão num só lugar
const CONFIG = {
  booksy: "https://booksy.com/pt-pt/3665_rymmaprof_salao-de-manicures-pedicures_157422_lisboa?do=invite",
  whatsapp: "351968435735", // CONFIRMAR: o telemóvel é o mesmo do WhatsApp?
  formacao: "https://docs.google.com/forms/d/e/1FAIpQLSfe1JBf4j5_oL9HY5wt6Gx5GV6ub-QkP0KeII6t3ljS-NOtww/viewform",
  telegram: "https://t.me/+TwFY6OHsb7k4YmY8",
  instagram: "https://www.instagram.com/rymma_pmu.artist/",
};
window.RYMMA = CONFIG;

document.documentElement.classList.remove("no-js");

// links por data-attribute: data-go="booksy" | data-wa="mensagem"
document.querySelectorAll("[data-go]").forEach((a) => {
  const url = CONFIG[a.dataset.go];
  if (!url) return;
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
});

// header + menu
// "top" é reservado no navegador (window.top): declará-lo derrubava o script inteiro
const cabecalho = document.querySelector(".top");
const burger = document.querySelector(".burger");
burger?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav a").forEach((a) =>
  a.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    burger?.setAttribute("aria-expanded", "false");
  })
);

// barra fixa no telemóvel: aparece depois do hero, some no rodapé
const mbar = document.querySelector(".mbar");
const hero = document.querySelector(".hero");
const foot = document.querySelector(".foot");
let pastHero = false, atFoot = false;
const syncBar = () => mbar?.classList.toggle("is-on", pastHero && !atFoot);
if (hero) new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; syncBar(); }).observe(hero);
if (foot) new IntersectionObserver(([e]) => { atFoot = e.isIntersecting; syncBar(); }).observe(foot);

addEventListener("scroll", () => cabecalho?.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

// revelar ao rolar
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }),
  { rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".rv").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 70}ms`;
  io.observe(el);
});

document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
