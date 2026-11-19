/*
  SweatsApp — page interactions (plain JavaScript, no build step needed).
  - Header menu (hamburger) and the "Join waitlist" links
  - Scroll effects: compact header, photo reveals, word-by-word text highlight
  - Lower-left section navigator (01 / 02 … and the round arrow)
  - Waitlist forms: checks the email, then saves it to your SweatsApp waitlist
*/

// Where waitlist emails are sent. Every signup is saved to your list and emailed to team@sweats.app.
// Leave this address as it is, even if you host the pages on GitHub Pages or Vercel.
// It is the online service that saves signups; it keeps working as long as the Lovable site stays published.
const WAITLIST_ENDPOINT = "https://fit-friends-fitness-network.lovable.app/api/public/waitlist";

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const tpl = (id) => document.getElementById(id)?.innerHTML ?? "";

/* ---------- Header menu ---------- */
const navTrigger = document.querySelector(".nav-trigger");
const header = document.querySelector(".site-header");
let menuOpen = false;
function setMenu(open) {
  menuOpen = open;
  root.dataset.menuOpen = String(open);
  navTrigger.innerHTML = tpl(open ? "icon-navOpen" : "icon-navClosed");
  navTrigger.setAttribute("aria-expanded", String(open));
  navTrigger.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  document.getElementById("site-navigation")?.remove();
  if (open) {
    header.insertAdjacentHTML("beforeend", tpl("nav-drawer-template"));
    header
      .querySelectorAll("#site-navigation a")
      .forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }
}
navTrigger?.addEventListener("click", () => setMenu(!menuOpen));

/* ---------- Section navigator (lower left) ---------- */
const chapterNav = document.querySelector(".chapter-nav");
const sections = JSON.parse(chapterNav?.dataset.sections || "[]");
const chapterToggle = chapterNav?.querySelector(".chapter-toggle");
const chapterNext = chapterNav?.querySelector(".chapter-next");
const pad = (n) => String(n).padStart(2, "0");
let activeIndex = 0;
let chaptersOpen = false;

function renderChapters() {
  const active = sections[activeIndex];
  const next = sections[activeIndex + 1];
  chapterToggle.querySelector(".chapter-number").textContent = pad(activeIndex + 1);
  chapterToggle.querySelector(".chapter-label").textContent = active?.label ?? "";
  chapterToggle.querySelector("svg")?.remove();
  chapterToggle.insertAdjacentHTML(
    "beforeend",
    tpl(chaptersOpen ? "icon-chOpen" : "icon-chClosed"),
  );
  chapterToggle.setAttribute("aria-expanded", String(chaptersOpen));
  chapterNext.setAttribute("href", "#" + (next?.id ?? sections[0]?.id));
  chapterNext.setAttribute("aria-label", next ? "Next section: " + next.label : "Back to start");
  chapterNext.querySelector("svg")?.classList.toggle("rotate-180", !next);

  chapterNav.querySelector(".chapter-menu")?.remove();
  if (!chaptersOpen) return;
  const menu = document.createElement("div");
  menu.className = "chapter-menu";
  menu.id = "page-chapters";
  menu.innerHTML =
    "<p>Explore SweatsApp</p>" +
    sections
      .map(
        (s, i) =>
          `<a href="#${s.id}" aria-label="Go to ${s.label}"${i === activeIndex ? ' class="is-active" aria-current="location"' : ""}><span>${pad(i + 1)}</span><strong>${s.label}</strong></a>`,
      )
      .join("");
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      chaptersOpen = false;
      renderChapters();
    }),
  );
  chapterNav.prepend(menu);
}
chapterToggle?.addEventListener("click", () => {
  chaptersOpen = !chaptersOpen;
  renderChapters();
});

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (menuOpen) setMenu(false);
  if (chaptersOpen) {
    chaptersOpen = false;
    renderChapters();
  }
});

/* ---------- Scroll effects ---------- */
const sectionEls = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
const clamp = (v) => Math.min(1, Math.max(0, v));
let frame = 0;
function updateScroll() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const vh = window.innerHeight;
    root.dataset.scrolled = String(window.scrollY > 80);
    const max = root.scrollHeight - vh;
    root.style.setProperty("--scroll-progress", String(max > 0 ? window.scrollY / max : 0));
    let current = 0;
    sectionEls.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= vh * 0.45) current = i;
      el.style.setProperty(
        "--scene-progress",
        String(clamp(-rect.top / Math.max(el.offsetHeight - vh, 1))),
      );
      el.style.setProperty(
        "--reveal-progress",
        String(reduceMotion.matches ? 1 : clamp((vh - rect.top) / vh)),
      );
      el.querySelectorAll(".wide-media, .hero-frame").forEach((m) => {
        const top = m.getBoundingClientRect().top;
        m.style.setProperty(
          "--media-reveal",
          String(reduceMotion.matches ? 1 : clamp((vh * 0.9 - top) / (vh * 0.8))),
        );
      });
      el.querySelectorAll("[data-scroll-highlight]").forEach((text) => {
        const reading = clamp((vh * 0.85 - text.getBoundingClientRect().top) / (vh * 0.45));
        const words = text.querySelectorAll("span");
        words.forEach((w, i) => {
          w.dataset.read = String(reduceMotion.matches || i / words.length <= reading);
        });
      });
    });
    if (current !== activeIndex) {
      activeIndex = current;
      renderChapters();
    }
  });
}
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { rootMargin: "-30% 0px -45%", threshold: 0 },
);
sectionEls.forEach((el) => observer.observe(el));
window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", updateScroll);
if (chapterNav) renderChapters();
updateScroll();

/* ---------- Waitlist forms ---------- */
const placeholderDomains = ["example.com", "example.net", "example.org"];
function checkEmail(raw) {
  const value = raw.trim().toLowerCase();
  if (value.length > 254) return { error: "Please enter an email address under 255 characters." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
    return { error: "Enter a valid email address, such as name@gmail.com." };
  const [local, domain] = value.split("@");
  if (
    local.length > 64 ||
    local.includes("..") ||
    /\.(invalid|test|localhost)$/.test(domain) ||
    placeholderDomains.includes(domain)
  )
    return { error: "Please use a real email address, not a placeholder." };
  return { email: value };
}
const checkIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M20 6 9 17l-5-5"/></svg>';

document.querySelectorAll("form").forEach((form) => {
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  if (!input || !button) return;
  const [, audience, placement] = input.id.split("-"); // id looks like "email-user-intro"
  const wrapper = form.parentElement;
  const buttonHtml = button.innerHTML;
  const showError = (message) => {
    wrapper.querySelector('[role="alert"]')?.remove();
    input.setAttribute("aria-invalid", String(Boolean(message)));
    if (message)
      (wrapper.insertAdjacentHTML(
        "beforeend",
        `<p role="alert" class="mt-3 text-sm font-semibold text-foreground"></p>`,
      ),
        (wrapper.lastElementChild.textContent = message));
  };
  input.addEventListener("input", () => showError(""));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const checked = checkEmail(input.value);
    if (checked.error) return showError(checked.error);
    showError("");
    button.disabled = input.disabled = true;
    button.textContent = "Joining…";
    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: checked.email, audience, placement }),
      });
      const result = await res.json();
      if (result.success) {
        const tone =
          audience === "coach" ? "border-coach/40 text-coach" : "border-primary/40 text-primary";
        wrapper.outerHTML = `<p role="status" class="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold ${tone}">${checkIcon} You’re on the list. Your email has been saved.</p>`;
        return;
      }
      showError(result.error || "Please try again.");
    } catch {
      showError("We couldn’t save your email. Please check your connection and try again.");
    }
    button.disabled = input.disabled = false;
    button.innerHTML = buttonHtml;
  });
});
