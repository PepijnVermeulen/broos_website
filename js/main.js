// ---------- SHOWS ----------
// Upcoming shows appear in the calendar and the news strip. Past shows move
// to "Eerder gespeeld" automatically, so keep them in the list.
//
//   date     "YYYY-MM-DD"                          (required)
//   venue    name of the venue / event             (required)
//   city                                           (required)
//   time     "20:30", start time of BROOS's set    (optional)
//   type     "akoestisch" adds an "Akoestisch" label   (optional)
//   support  ["Artist A", "Artist B"]                  (optional)
//   tickets  ticket link; none = "Gratis", "tba" = "Tickets t.b.a."
//   soldOut  true shows "Uitverkocht"                  (optional)

const SHOWS = [
  { date: "2026-02-15", time: "21:00", venue: "Trapop!", city: "Utrecht" },
  { date: "2026-04-17", time: "21:00", venue: "Rabo Open Stage, Tivoli", city: "Utrecht" },
  { date: "2026-04-21", venue: "de Helling", city: "Utrecht", support: ["Camera Musica"] },
  { date: "2026-07-31", venue: "Trapop!", city: "Utrecht", support: ["Jeez Louise", "Role Models"] },
  { date: "2026-09-11", venue: "Teatro", city: "Utrecht", support: ["Deodaat", "Irma", "Roadman", "Feitz"] },
  { date: "2026-10-04", venue: "Folk Fusion Fest, Moira", city: "Utrecht", support: ["Hayden Rose", "Ash C", "Copper King"] },
  { date: "2026-10-25", time: "21:00", venue: "USBB Festival, de Nijverheid", city: "Utrecht" },
  { date: "2026-11-01", time: "16:30", venue: "Gigant muziekcafe", city: "Apeldoorn" },
  { date: "2026-11-19", time: "21:30", venue: "Nablijfklub, Kantine", city: "Utrecht", tickets: "https://broedutrecht.nl/event/nablijf-klup-broed-editie/?utm_source=ig&utm_medium=social&utm_content=link_in_bios" },
  { date: "2027-01-17", time: "16:30", venue: "Cafe Averechts", city: "Utrecht", type: "akoestisch" },
  { date: "2027-02-05", time: "20:00", venue: "Tivoli Vredenburg", city: "Utrecht", tickets: "https://www.tivolivredenburg.nl/agenda/88615750/broos-05-02-2027", soldOut: true },
  // { date: "2027-06-05", time: "21:00", venue: "Moira", city: "Utrecht", support: ["Sophie Josephine"], tickets: "tba" },
  { date: "2027-06-11", time: "19:00", venue: "Luxor", city: "Arnhem", tickets: "https://www.luxorlive.nl/agenda/broos/" },
];

// ---------- NEWS (scrolling strip) ----------
// Shown before the upcoming shows. `href` is optional.
const NEWS = [
  { text: "Nieuwe single “Rode Wijn” nu te streamen", href: "https://open.spotify.com/artist/0oiVr79iOP4RkkBZZbMYUB" },
];
const MARQUEE_SHOWS = 3;    // how many upcoming shows to show in the strip
const MARQUEE_SPEED = 70;   // pixels per second

// ---------- helpers ----------
const MONTHS = ["JAN", "FEB", "MRT", "APR", "MEI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEC"];
const DAYS = ["ZO", "MA", "DI", "WO", "DO", "VR", "ZA"];

function parseDate(iso) { return new Date(iso + "T12:00:00"); }

function todayISO() {
  // Today's date in the visitor's own timezone, as "YYYY-MM-DD".
  // A show stays "upcoming" for the whole day it takes place.
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysFromToday(iso) {
  return Math.round((parseDate(iso) - parseDate(todayISO())) / 86400000);
}

// Escape text before putting it into HTML (venue names with "&" etc.)
function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

const isAcoustic = show => (show.type || "").toLowerCase().startsWith("akoest");

// ---------- calendar ----------
function showToHTML(show) {
  const d = parseDate(show.date);
  const days = daysFromToday(show.date);
  const when = days === 0 ? "Vanavond" : days === 1 ? "Morgen" : "";

  let action;
  if (show.soldOut)      action = `<span class="sold-out">Uitverkocht</span>`;
  else if (String(show.tickets).toLowerCase() === "tba")
                         action = `<span class="tba">Tickets t.b.a.</span>`;
  else if (show.tickets) action = `<a class="tickets" data-track="${esc(`tickets: ${show.venue} (${show.city}, ${show.date})`)}" href="${esc(show.tickets)}" target="_blank" rel="noopener">Tickets <span class="arrow" aria-hidden="true">→</span></a>`;
  else                   action = `<span class="free">Gratis</span>`;

  const meta = [esc(show.city), show.time ? `${esc(show.time)} uur` : ""].filter(Boolean).join(" · ");
  const support = show.support && show.support.length
    ? `<span class="support">+ ${show.support.map(esc).join(" + ")}</span>` : "";
  const type = isAcoustic(show)
    ? `<span class="type type--acoustic">Akoestisch</span>`
    : `<span class="type"></span>`;   // keeps the grid column for full-band shows

  return `<li class="${show.soldOut ? "is-sold-out" : ""}${when ? " is-soon" : ""}">
      <span class="date">
        <span class="date__day">${DAYS[d.getDay()]}</span>
        <span class="date__num">${d.getDate()} ${MONTHS[d.getMonth()]}</span>
        <span class="date__year">${d.getFullYear()}</span>
      </span>
      <span class="where">
        ${when ? `<span class="soon">${when}</span>` : ""}
        <span class="venue">${esc(show.venue)}</span>
        <span class="meta">${meta}</span>
        ${support}
      </span>
      ${type}
      ${action}
    </li>`;
}

function pastShowToHTML(show) {
  const d = parseDate(show.date);
  const support = (show.support || []).map(s => "+ " + s).join(" ");
  const extra = [isAcoustic(show) ? "akoestisch" : "", support]
    .filter(Boolean).map(esc).join(" · ");
  return `<li>
      <span class="past__date">${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}</span>
      <span>${esc(show.venue)} · ${esc(show.city)}${extra ? ` <span class="past__extra">(${extra})</span>` : ""}</span>
    </li>`;
}

function upcomingShows() {
  const today = todayISO();
  return SHOWS.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

function renderShows() {
  const today = todayISO();
  const upcoming = upcomingShows();
  const past = SHOWS.filter(s => s.date < today).sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById("shows-upcoming").innerHTML = upcoming.length
    ? upcoming.map(showToHTML).join("")
    : `<li class="empty">Nieuwe data volgen snel. BROOS op jouw podium?
         <a href="#contact">Neem contact op</a>.</li>`;

  if (past.length) {
    document.getElementById("past-shows").hidden = false;
    document.getElementById("past-count").textContent = `(${past.length})`;
    document.getElementById("shows-past").innerHTML = past.map(pastShowToHTML).join("");
  }
}

// ---------- marquee ----------
// One set of items is repeated to fill the screen, then doubled so the
// -50% scroll animation loops seamlessly.
function marqueeItems() {
  const items = NEWS.map(n => ({ text: n.text, href: n.href }));
  upcomingShows().slice(0, MARQUEE_SHOWS).forEach(s => {
    const d = parseDate(s.date);
    const days = daysFromToday(s.date);
    const when = days === 0 ? "Vanavond" : days === 1 ? "Morgen" : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
    let text = `${when}: ${s.venue} · ${s.city}`;
    if (isAcoustic(s)) text += " (akoestisch)";
    if (s.soldOut) text += " · uitverkocht";
    items.push({ text, href: "#live" });
  });
  if (!items.length) items.push({ text: "BROOS" });
  return items;
}

function renderMarquee() {
  const strip = document.getElementById("marquee");
  const track = strip.querySelector(".marquee__track");
  const setHTML = marqueeItems().map(i =>
    (i.href ? `<a href="${esc(i.href)}"${i.href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${esc(i.text)}</a>`
            : `<span>${esc(i.text)}</span>`) + `<span class="marquee__star" aria-hidden="true">•</span>`
  ).join("");

  function build() {
    track.innerHTML = `<div class="marquee__group">${setHTML}</div>`;
    const groupWidth = track.firstElementChild.getBoundingClientRect().width || 1;
    const copies = Math.max(1, Math.ceil(strip.clientWidth / groupWidth));
    const half = Array.from({ length: copies }, () => `<div class="marquee__group">${setHTML}</div>`).join("");
    track.innerHTML = half + half;
    // Duplicates are hidden from screen readers and keyboard focus
    track.querySelectorAll(".marquee__group").forEach((g, i) => {
      if (i > 0) { g.setAttribute("aria-hidden", "true"); g.querySelectorAll("a").forEach(a => a.tabIndex = -1); }
    });
    track.style.animationDuration = `${(groupWidth * copies) / MARQUEE_SPEED}s`;
  }

  build();
  let lastWidth = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWidth) { lastWidth = window.innerWidth; build(); }
  });
  // Re-measure once web fonts have loaded
  if (document.fonts) document.fonts.ready.then(build);
}

// ---------- navigation ----------
function setupNav() {
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Highlight the menu item of the visible section
  const links = [...nav.querySelectorAll("nav a")];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(a => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) observer.observe(target);
  });
}

// ---------- gallery lightbox ----------
function setupLightbox() {
  const box = document.getElementById("lightbox");
  const big = box.querySelector("img");

  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      big.src = img.dataset.full || img.src;
      big.alt = img.alt;
      box.showModal();
    });
  });
  box.addEventListener("click", () => box.close());
}

// ---------- click tracking (GoatCounter) ----------
// Outbound clicks (tickets per show, mail, socials, downloads) as events.
function trackingName(a) {
  if (a.dataset.track) return a.dataset.track;
  const href = a.getAttribute("href") || "";
  if (href.startsWith("mailto:")) return "mail";
  if (href.endsWith(".pdf")) return "download: " + href.split("/").pop();
  if (href.includes("instagram.com")) return "instagram";
  if (href.includes("spotify.com")) return "spotify";
  if (href.startsWith("http")) return "link: " + new URL(href).hostname;
  return null;   // in-page links are not counted
}

function setupTracking() {
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    const name = a && trackingName(a);
    if (!name || !window.goatcounter || !window.goatcounter.count) return;
    window.goatcounter.count({ path: name, title: name, event: true });
  });
}

// ---------- RUN ----------
renderShows();
renderMarquee();
setupNav();
setupLightbox();
setupTracking();
document.getElementById("year").textContent = new Date().getFullYear();
