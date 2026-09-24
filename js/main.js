/* ===== CONFIG ===== */
const SERVER_DOMAIN = "play.bgms-network.ru";
const SERVER_PORT = 25565;
const SERVER_FULL = SERVER_DOMAIN;
const STATUS_REFRESH_MS = 60000;

/* ===== COPY IP ===== */
function copyServerIP() {
    const showCopied = () => {
        const ipEl = document.getElementById('ip-display');
        if (!ipEl) return;
        const original = ipEl.innerText;
        ipEl.innerText = "IP скопирован!";
        ipEl.style.color = "#2ecc71";
        setTimeout(() => {
            ipEl.innerText = original;
            ipEl.style.color = "";
        }, 2000);
    };

    const fallbackCopy = () => {
        const ta = document.createElement('textarea');
        ta.value = SERVER_FULL;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showCopied();
        } catch (e) {
            console.error('Copy failed', e);
        }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(SERVER_FULL).then(showCopied).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

/* ===== SERVER STATUS ===== */
async function fetchStatus(host, port) {
    // API 1: mcsrvstat.us
    try {
        const r = await fetch(`https://api.mcsrvstat.us/3/${host}:${port}`, { cache: 'no-store' });
        if (r.ok) {
            const d = await r.json();
            if (typeof d.online === 'boolean') {
                return {
                    online: d.online,
                    players: d.players ? { online: d.players.online, max: d.players.max } : null
                };
            }
        }
    } catch (e) { /* ignore */ }

    // API 2: mcstatus.io (fallback)
    try {
        const r = await fetch(`https://api.mcstatus.io/v2/status/java/${host}:${port}`, { cache: 'no-store' });
        if (r.ok) {
            const d = await r.json();
            return {
                online: d.online,
                players: d.players ? { online: d.players.online, max: d.players.max } : null
            };
        }
    } catch (e) { /* ignore */ }

    return { online: false };
}

function setStatus(online, onlinePlayers = 0, maxPlayers = 0) {
    const textEl = document.getElementById('server-status');
    const dotEl = document.getElementById('status-dot');
    if (!textEl || !dotEl) return;

    if (online) {
        textEl.innerHTML = `В сети: <strong>${onlinePlayers}/${maxPlayers}</strong> игроков`;
        dotEl.style.backgroundColor = '#2ecc71';
        dotEl.style.boxShadow = '0 0 12px #2ecc71';
        dotEl.classList.remove('offline');
    } else {
        textEl.innerHTML = `Сервер: <strong>Офлайн</strong>`;
        dotEl.style.backgroundColor = '#e74c3c';
        dotEl.style.boxShadow = '0 0 12px #e74c3c';
        dotEl.classList.add('offline');
    }
}

async function updateServerStatus() {
    const data = await fetchStatus(SERVER_DOMAIN, SERVER_PORT);
    if (data.online) {
        const p = data.players || { online: 0, max: 0 };
        setStatus(true, p.online, p.max);
    } else {
        setStatus(false);
    }
}

/* ===== MOBILE MENU ===== */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
}

/* ===== HEADER SCROLL ===== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
    updateServerStatus();
    setInterval(updateServerStatus, STATUS_REFRESH_MS);
    initMobileMenu();
    initHeaderScroll();
    initSmoothScroll();
});
