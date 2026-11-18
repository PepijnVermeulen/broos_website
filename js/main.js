// =========================================================
// BROOS: site script
// =========================================================

// ---------- SHOWS ----------
// This list is the only thing you need to edit when you have a new gig.
// Dates are written as "YYYY-MM-DD". Only shows from today onwards are
// shown; once a date has passed the show disappears from the site by itself
// (no need to delete it here, though you can to keep the list short).
// `tickets` is optional: leave it out (or "") if there's no link.
// `soldOut: true` shows a "Sold out" stamp instead of the ticket button.

const SHOWS = [
  { date: "2026-02-15", venue: "Trapop!",              city: "Utrecht" },
  { date: "2026-04-17", venue: "Rabo Open Stage @ Tivoli", city: "Utrecht" },
  { date: "2026-10-25", venue: "USBB Festival, de Nijverheid",        city: "Utrecht" },
  { date: "2026-11-19", venue: "Nablijfklub, Kantine", city: "Utrecht", tickets: "https://broedutrecht.nl/event/nablijf-klup-broed-editie/?utm_source=ig&utm_medium=social&utm_content=link_in_bios"},
  { date: "2027-02-05", venue: "Tivoli Vredeburg",      city: "Utrecht", tickets: "https://www.tivolivredenburg.nl/agenda/88615750/broos-05-02-2027", soldOut: true },
  { date: "2027-01-17", venue: "Cafe Averechts", city: "Utrecht" },
  { date: "2027-06-05", venue: "Moira ft. Sophie Josephine ", city: "Utrecht" },
  { date: "2027-06-11", venue: "Luxor", city: "Arnhem"},
  
  // Example of an upcoming show:
  // { date: "2027-01-20", venue: "Some Venue", city: "Amsterdam", tickets: "http://..." },
];

function formatDate(iso) {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDate();
  // Dutch short month names, e.g. "FEB" (toLocaleString adds a dot, "feb.", so we strip it)
  const month = d.toLocaleString("nl-NL", { month: "short" }).replace(".", "").toUpperCase();
  return `${day} ${month}<br>${d.getFullYear()}`;
}

function showToHTML(show) {
  let tickets = "<span></span>";
  if (show.soldOut) {
    tickets = `<span class="sold-out">Uitverkocht</span>`;
  } else if (show.tickets) {
    tickets = `<a class="tickets" href="${show.tickets}" target="_blank" rel="noopener">Tickets</a>`;
  }
  return `<li class="${show.soldOut ? "is-sold-out" : ""}">
      <span class="date">${formatDate(show.date)}</span>
      <span class="where">${show.venue}<span class="city">${show.city}</span></span>
      ${tickets}
    </li>`;
}

function todayISO() {
  // Today's date in the visitor's own timezone, as "YYYY-MM-DD".
  // A show stays visible for the whole day it takes place.
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function renderShows() {
  const today = todayISO();
  const upcoming = SHOWS
    .filter(s => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("shows-upcoming").innerHTML = upcoming.length
    ? upcoming.map(showToHTML).join("")
    : `<li class="empty">Nieuwe data volgen snel. BROOS op jouw podium?
         <a href="#contact">Neem contact op</a>.</li>`;
}

// ---------- GALLERY LIGHTBOX ----------
function setupLightbox() {
  const box = document.getElementById("lightbox");
  const big = box.querySelector("img");

  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      big.src = img.src;
      big.alt = img.alt;
      box.showModal();
    });
  });
  // Close on button click or clicking anywhere
  box.addEventListener("click", () => box.close());
}

// ---------- RUN ----------
renderShows();
setupLightbox();
document.getElementById("year").textContent = new Date().getFullYear();
