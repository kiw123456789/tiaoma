/* ==========================================================
   script.js : ไฟล์ JavaScript หลักของเว็บไซต์ "เที่ยวมะ"
   ใช้ร่วมกันทุกหน้า
   ต้องโหลด places-data.js ก่อนไฟล์นี้ในหน้าที่ใช้ข้อมูลสถานที่
========================================================== */

/* ----- ปุ่มเลื่อนกลับขึ้นบนสุด (ทุกหน้า) ----- */
window.addEventListener('scroll', () => {
  const btn = document.getElementById('back-to-top');
  if (btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ----- เลื่อนไปยังส่วนสถานที่ท่องเที่ยว (หน้าแรก) ----- */
function scrollToPlaces() {
  const el = document.getElementById('places');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ==========================================================
   ระบบสมัครสมาชิก / เข้าสู่ระบบ / บันทึกที่เที่ยวโปรด
   เก็บข้อมูลด้วย localStorage (ฝั่ง client ล้วนๆ ยังไม่มีฐานข้อมูลจริง)
========================================================== */

const STORAGE_USERS = 'tiaoma_users';
const STORAGE_SESSION = 'tiaoma_session';
const STORAGE_LIKES_PREFIX = 'tiaoma_likes_';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; }
  catch (e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_SESSION)); }
  catch (e) { return null; }
}
function setSession(user) {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify({ name: user.name, email: user.email }));
}
function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
}
function getLikes(email) {
  try { return JSON.parse(localStorage.getItem(STORAGE_LIKES_PREFIX + email)) || []; }
  catch (e) { return []; }
}
function saveLikes(email, likes) {
  localStorage.setItem(STORAGE_LIKES_PREFIX + email, JSON.stringify(likes));
}

/* ----- สมัครสมาชิก (register.html) ----- */
function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;

  const errorBox = document.getElementById('regError');
  const successBox = document.getElementById('regSuccess');
  errorBox.style.display = 'none';

  if (!name || !email || !password || !confirm) {
    errorBox.textContent = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
    errorBox.style.display = 'block';
    return false;
  }
  if (!email.includes('@')) {
    errorBox.textContent = 'กรุณากรอกอีเมลให้ถูกต้อง';
    errorBox.style.display = 'block';
    return false;
  }
  if (password.length < 6) {
    errorBox.textContent = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    errorBox.style.display = 'block';
    return false;
  }
  if (password !== confirm) {
    errorBox.textContent = 'รหัสผ่านทั้งสองช่องไม่ตรงกัน';
    errorBox.style.display = 'block';
    return false;
  }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    errorBox.textContent = 'อีเมลนี้มีผู้ใช้งานสมัครไว้แล้ว กรุณาเข้าสู่ระบบแทน';
    errorBox.style.display = 'block';
    return false;
  }

  users.push({ name, email, password });
  saveUsers(users);

  successBox.textContent = `สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${name} — กำลังพาไปหน้าเข้าสู่ระบบ...`;
  successBox.style.display = 'block';

  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1500);

  return false;
}

/* ----- เข้าสู่ระบบ (login.html) ----- */
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  const errorBox = document.getElementById('loginError');
  const successBox = document.getElementById('loginSuccess');
  errorBox.style.display = 'none';

  if (!email || !password) {
    errorBox.textContent = 'กรุณากรอกอีเมลและรหัสผ่าน';
    errorBox.style.display = 'block';
    return false;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    errorBox.textContent = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หากยังไม่มีบัญชี กรุณาสมัครสมาชิกก่อน';
    errorBox.style.display = 'block';
    return false;
  }

  setSession(user);
  successBox.textContent = `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${user.name} — กำลังพาไปหน้าที่เหมาะสม...`;
  successBox.style.display = 'block';

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || 'index.html';

  setTimeout(() => {
    window.location.href = redirect;
  }, 1200);

  return false;
}

function logoutUser() {
  clearSession();
  window.location.href = 'index.html';
}

/* ----- บังคับให้เข้าสู่ระบบก่อนบันทึกที่เที่ยวโปรด ----- */
function requireLogin(nextUrl) {
  const goTo = nextUrl || (window.location.pathname.split('/').pop() + window.location.search);
  const ok = confirm('ต้องเข้าสู่ระบบก่อนจึงจะบันทึกที่เที่ยวโปรดได้ ต้องการไปหน้าเข้าสู่ระบบตอนนี้เลยไหม?');
  if (ok) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(goTo);
  }
  return false;
}

/* ----- กดปุ่มหัวใจ บันทึก/ยกเลิกสถานที่โปรด (ผูกกับผู้ใช้ที่ล็อกอินอยู่) ----- */
function toggleLike(button) {
  const session = getSession();
  const card = button.closest('.card');
  const placeId = card ? card.dataset.id : null;

  if (!session) {
    requireLogin();
    return;
  }
  if (!placeId) return;

  let likes = getLikes(session.email);
  const isLiked = likes.includes(placeId);

  if (isLiked) {
    likes = likes.filter(id => id !== placeId);
  } else {
    likes.push(placeId);
  }
  saveLikes(session.email, likes);

  card.classList.toggle('liked', !isLiked);
  button.textContent = !isLiked ? '❤️' : '🤍';
}

/* ----- ทำให้หัวใจในการ์ดตรงกับสถานะที่บันทึกไว้จริงของผู้ใช้ปัจจุบัน ----- */
function syncLikedIcons() {
  const session = getSession();
  const likes = session ? getLikes(session.email) : [];
  document.querySelectorAll('.card[data-id]').forEach(card => {
    const liked = likes.includes(card.dataset.id);
    card.classList.toggle('liked', liked);
    const btn = card.querySelector('.like-btn');
    if (btn) btn.textContent = liked ? '❤️' : '🤍';
  });
}

/* ----- ปรับส่วนหัวเว็บไซต์ตามสถานะการล็อกอิน (ทุกหน้า) ----- */
function renderAuthHeader() {
  const area = document.getElementById('authArea');
  if (!area) return;
  const session = getSession();

  if (session) {
    area.innerHTML = `
      <a href="liked.html" class="btn-outline">💚 ที่เที่ยวโปรดของฉัน</a>
      <span class="user-chip">สวัสดี, ${session.name.split(' ')[0]}</span>
      <button class="btn-primary" onclick="logoutUser()">ออกจากระบบ</button>
    `;
  } else {
    area.innerHTML = `
      <a href="login.html"><button class="btn-primary">สมัครสมาชิก/เข้าสู่ระบบ</button></a>
    `;
  }
}

/* ==========================================================
   การแสดงผลสถานที่ท่องเที่ยว (หน้า index.html / places.html)
========================================================== */

function placeCardHTML(place) {
  const imageInner = place.image
    ? `<img src="${place.image}" alt="${place.name}" loading="lazy">`
    : `<div class="placeholder-label">รูป: ${place.name}</div>`;
  return `
    <div class="card" data-name="${place.name}" data-id="${place.id}">
      <div class="thumb">${imageInner}</div>
      <div class="card-body">
        <button class="like-btn" onclick="toggleLike(this)">🤍</button>
        <span class="badge-category">${place.category}</span>
        <h3>${place.name}</h3>
        <p>${place.short}</p>
        <a class="read-more" href="place-detail.html?id=${place.id}">อ่านเพิ่มเติม ›</a>
      </div>
    </div>
  `;
}

function renderPlacesGrid(containerId, placeList) {
  const grid = document.getElementById(containerId);
  if (!grid || typeof PLACES === 'undefined') return;
  grid.innerHTML = placeList.map(placeCardHTML).join('');
  syncLikedIcons();
}

/* ----- ค้นหาสถานที่ท่องเที่ยวจากคำค้นหา (ใช้ได้ทั้งช่องค้นหาบน header และในหน้า) ----- */
function searchPlaces(keywordFromHero) {
  const input = document.getElementById('searchInput');
  const keyword = (keywordFromHero !== undefined ? keywordFromHero : (input ? input.value : ''))
    .trim().toLowerCase();
  const categorySelect = document.getElementById('categoryFilter');
  const category = categorySelect ? categorySelect.value : '';

  const grid = document.getElementById('places');
  if (!grid) return;
  const cards = grid.querySelectorAll('.card');
  let found = 0;

  cards.forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const place = typeof PLACES !== 'undefined' ? getPlaceById(card.dataset.id) : null;
    const cardCategory = place ? place.category : '';
    const nameMatch = keyword === '' || name.includes(keyword);
    const categoryMatch = category === '' || cardCategory.includes(category);
    const match = nameMatch && categoryMatch;
    card.style.display = match ? '' : 'none';
    if (match) found++;
  });

  let noResult = grid.querySelector('.no-result');
  if (found === 0) {
    if (!noResult) {
      noResult = document.createElement('p');
      noResult.className = 'no-result';
      grid.appendChild(noResult);
    }
    noResult.textContent = `ไม่พบสถานที่ที่ตรงกับ "${keyword}"`;
  } else if (noResult) {
    noResult.remove();
  }
}

/* ----- ค้นหาจากช่องค้นหาใน Hero แล้วพาไปหน้ารายการสถานที่ ----- */
function heroSearchAndGo() {
  const heroInput = document.getElementById('heroSearchInput');
  const keyword = heroInput ? heroInput.value.trim() : '';
  window.location.href = 'places.html' + (keyword ? ('?q=' + encodeURIComponent(keyword)) : '');
}

/* ----- ช่องค้นหาบน header: กด Enter แล้วพาไปหน้ารายการสถานที่ ----- */
function headerSearchAndGo() {
  const input = document.getElementById('headerSearchInput');
  const keyword = input ? input.value.trim() : '';
  window.location.href = 'places.html' + (keyword ? ('?q=' + encodeURIComponent(keyword)) : '');
}

/* ==========================================================
   หน้ารายละเอียดสถานที่ (place-detail.html)
========================================================== */

function renderPlaceDetail() {
  const container = document.getElementById('placeDetailRoot');
  if (!container || typeof PLACES === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const place = getPlaceById(id);

  if (!place) {
    container.innerHTML = `
      <div class="not-found">
        <h2>ไม่พบสถานที่ที่คุณกำลังค้นหา</h2>
        <p>สถานที่นี้อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>
        <a href="places.html"><button class="btn-primary">กลับไปหน้าแนะนำที่เที่ยว</button></a>
      </div>
    `;
    document.title = 'ไม่พบสถานที่ | เที่ยวมะ';
    return;
  }

  document.title = place.name + ' | เที่ยวมะ';

  const session = getSession();
  const isLiked = session && getLikes(session.email).includes(place.id);
  const heroInner = place.image
    ? `<img src="${place.image}" alt="${place.name}">`
    : `<div class="placeholder-label detail-placeholder">รูป: ${place.name}</div>`;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(place.mapQuery)}&output=embed`;

  const related = PLACES.filter(p => p.id !== place.id && p.category === place.category).slice(0, 3);
  const relatedFallback = PLACES.filter(p => p.id !== place.id).slice(0, 3);
  const relatedList = related.length ? related : relatedFallback;

  container.innerHTML = `
    <div class="detail-breadcrumb">
      <a href="index.html">หน้าแรก</a> ›
      <a href="places.html">แนะนำที่เที่ยว</a> ›
      <span>${place.name}</span>
    </div>

    <div class="detail-hero">${heroInner}</div>

    <div class="detail-header">
      <div>
        <span class="badge-category">${place.category}</span>
        <span class="badge-province">📍 ${place.province}</span>
        <h1>${place.name}</h1>
        <p class="detail-short">${place.short}</p>
      </div>
      <button class="like-btn-lg ${isLiked ? 'liked' : ''}" id="detailLikeBtn" onclick="toggleDetailLike('${place.id}')">
        ${isLiked ? '❤️ บันทึกแล้ว' : '🤍 บันทึกเป็นที่เที่ยวโปรด'}
      </button>
    </div>

    <div class="detail-layout">
      <div class="detail-main">
        ${place.description.map(p => `<p>${p}</p>`).join('')}

        <h3 class="detail-subtitle">จุดเด่นที่ไม่ควรพลาด</h3>
        <ul class="highlight-list">
          ${place.highlights.map(h => `<li>✅ ${h}</li>`).join('')}
        </ul>

        <h3 class="detail-subtitle">แผนที่</h3>
        <div class="map-embed">
          <iframe src="${mapSrc}" width="100%" height="320" style="border:0;" loading="lazy"></iframe>
        </div>
      </div>

      <aside class="detail-sidebar">
        <div class="info-box">
          <h4>ข้อมูลสำหรับวางแผนทริป</h4>
          <div class="info-row"><span>🕒 เวลาเปิด-ปิด</span><p>${place.hours}</p></div>
          <div class="info-row"><span>💵 ค่าใช้จ่าย</span><p>${place.fee}</p></div>
          <div class="info-row"><span>📅 ช่วงเวลาแนะนำ</span><p>${place.bestTime}</p></div>
          <div class="info-row"><span>📍 จังหวัด</span><p>${place.province}</p></div>
        </div>
      </aside>
    </div>

    <h3 class="section-title" style="margin-top:40px;">สถานที่ใกล้เคียงที่น่าสนใจ</h3>
    <section class="places-grid" id="relatedPlaces"></section>
  `;

  renderPlacesGrid('relatedPlaces', relatedList);
}

function toggleDetailLike(placeId) {
  const session = getSession();
  if (!session) {
    requireLogin('place-detail.html?id=' + placeId);
    return;
  }
  let likes = getLikes(session.email);
  const isLiked = likes.includes(placeId);
  likes = isLiked ? likes.filter(id => id !== placeId) : [...likes, placeId];
  saveLikes(session.email, likes);

  const btn = document.getElementById('detailLikeBtn');
  if (btn) {
    btn.classList.toggle('liked', !isLiked);
    btn.innerHTML = !isLiked ? '❤️ บันทึกแล้ว' : '🤍 บันทึกเป็นที่เที่ยวโปรด';
  }
}

/* ==========================================================
   หน้าที่เที่ยวโปรดของฉัน (liked.html)
========================================================== */

function renderLikedPlaces() {
  const root = document.getElementById('likedRoot');
  if (!root || typeof PLACES === 'undefined') return;

  const session = getSession();

  if (!session) {
    root.innerHTML = `
      <div class="not-found">
        <h2>กรุณาเข้าสู่ระบบ</h2>
        <p>เข้าสู่ระบบเพื่อดูรายการที่เที่ยวโปรดที่คุณบันทึกไว้</p>
        <a href="login.html?redirect=liked.html"><button class="btn-primary">ไปหน้าเข้าสู่ระบบ</button></a>
      </div>
    `;
    return;
  }

  const likedIds = getLikes(session.email);
  const likedPlaces = PLACES.filter(p => likedIds.includes(p.id));

  if (likedPlaces.length === 0) {
    root.innerHTML = `
      <div class="not-found">
        <h2>ยังไม่มีที่เที่ยวโปรด</h2>
        <p>กดปุ่มหัวใจ 🤍 ที่การ์ดสถานที่ท่องเที่ยวเพื่อบันทึกไว้ดูภายหลัง</p>
        <a href="places.html"><button class="btn-primary">ไปเลือกที่เที่ยว</button></a>
      </div>
    `;
    return;
  }

  root.innerHTML = `<section class="places-grid" id="likedGrid"></section>`;
  renderPlacesGrid('likedGrid', likedPlaces);
}

/* ==========================================================
   การเริ่มทำงานเมื่อโหลดหน้าเว็บ (ทุกหน้า)
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderAuthHeader();

  // หน้าแรก: แสดงสถานที่แนะนำ 6 อันดับแรก
  const homeGrid = document.getElementById('places');
  if (homeGrid && homeGrid.dataset.mode === 'home' && typeof PLACES !== 'undefined') {
    renderPlacesGrid('places', PLACES.slice(0, 6));
  }
  // หน้าแนะนำที่เที่ยวทั้งหมด
  if (homeGrid && homeGrid.dataset.mode === 'all' && typeof PLACES !== 'undefined') {
    renderPlacesGrid('places', PLACES);
  }

  syncLikedIcons();

  // หน้ารายละเอียดสถานที่
  renderPlaceDetail();

  // หน้าที่เที่ยวโปรด
  renderLikedPlaces();

  // ช่องค้นหาในหน้าแนะนำที่เที่ยว
  const searchInput = document.getElementById('searchInput');
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (searchInput && q) {
    searchInput.value = q;
    searchPlaces(q);
  }
  if (searchInput) {
    searchInput.addEventListener('input', () => searchPlaces());
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') searchPlaces();
    });
  }
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => searchPlaces());
  }
});
