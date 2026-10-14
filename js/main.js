/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * ملف البرمجة الرئيسي للواجهات العامة مع محرك الرندرة الديناميكية الحية (Main Script v3 - Live Dynamic Rendering Engine)
 * الرندرة التلقائية والفورية لكافة الغرف والأسعار والمميزات والمعرض والتقييمات والتصميم اللحظي
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLanguage();
  initMobileNav();
  initBookingModal();
  initGalleryLightbox();
  initContactForm();

  // الرندرة الديناميكية الشاملة لكافة البيانات
  renderAllDynamicComponents();

  // تفعيل محرك المزامنة اللحظية بين التبويبات المفتوحة
  initLiveSyncListeners();
});

// ==========================================
// 1. LIVE SYNC ENGINE (المزامنة اللحظية بين التبويبات)
// ==========================================
function initLiveSyncListeners() {
  // الاستماع عبر BroadcastChannel
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("rose1_hotel_live_sync");
      bc.onmessage = (event) => {
        console.log("Live Sync Event Received:", event.data);
        renderAllDynamicComponents();
      };
    }
  } catch (e) {
    console.warn("BroadcastChannel error:", e);
  }

  // الاستماع لحدث التخزين المحلي (cross-window storage event)
  window.addEventListener("storage", (e) => {
    if (e.key === "rose_aden_1_data") {
      console.log("Storage event detected, re-rendering...");
      renderAllDynamicComponents();
    }
  });
}

// دالة التشغيل المركزي لكافة التحديثات الحية
function renderAllDynamicComponents() {
  applyDynamicHotelData();
  applyDesignCustomizations();
  renderDynamicRooms();
  renderDynamicReviews();
  renderDynamicGallery();
  renderDynamicExtensions();
}

// ==========================================
// 2. THEME SWITCHER (Dark / Light)
// ==========================================
let currentTheme = localStorage.getItem("rose1_theme") || "dark";

function initTheme() {
  const html = document.documentElement;
  html.setAttribute("data-theme", currentTheme);
  updateThemeUI();
}

function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("rose1_theme", currentTheme);
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeUI();
}

function updateThemeUI() {
  const themeIcon = document.getElementById("themeBtnIcon");
  const themeText = document.getElementById("themeBtnText");
  const isArabic = document.documentElement.lang !== "en";

  if (themeIcon && themeText) {
    if (currentTheme === "dark") {
      themeIcon.textContent = "☀️";
      themeText.textContent = isArabic ? "النهاري" : "Light";
    } else {
      themeIcon.textContent = "🌙";
      themeText.textContent = isArabic ? "الليلي" : "Dark";
    }
  }
}

// ==========================================
// 3. BILINGUAL SWITCHER (Arabic / English)
// ==========================================
let currentLang = localStorage.getItem("rose1_lang") || "ar";

function initLanguage() {
  document.documentElement.lang = currentLang;
  document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
  applyTranslations();
}

function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem("rose1_lang", currentLang);
  document.documentElement.lang = currentLang;
  document.body.dir = currentLang === "ar" ? "rtl" : "ltr";
  applyTranslations();
  updateThemeUI();
  // إعادة رندرة الغرف والتقييمات باللغة المختارة
  renderDynamicRooms();
  renderDynamicReviews();
  renderDynamicGallery();
}

const translations = {
  ar: {
    navTitle: "فندق روز عدن السياحي",
    navSub: "ساحل أبين - خور مكسر - العاصمة عدن",
    nlHome: "الرئيسية",
    nlAbout: "عن الفندق",
    nlRooms: "الغرف والأجنحة",
    nlVip: "طيرمانات VIP والمجلس",
    nlServices: "الخدمات والمرافق",
    nlGallery: "معرض الصور",
    nlContact: "التواصل والحجز",
    nlAdmin: "لوحة التحكم",
    langBtnText: "English",
    navBookText: "واتساب: 780000676",
    heroBadge: "✨ فندق روز عدن السياحي - ساحل أبين",
    heroTitle: "فندق <span>روز عدن السياحي</span><br>راحتك وأمانك في قلب الفخامة",
    heroSub: "استمتع بإقامة استثنائية وإطلالة بحرية خلابة مباشرة على كورنيش ساحل أبين في العاصمة عدن؛ 72 غرفة وجناحاً راقياً، كهرباء وتكييف مستمر 24 ساعة، انترنت فائق السرعة - فايبر وستارلينك، وطيرمانات VIP ومجلس عام تمنحكم أروع الذكريات.",
    heroBtnWa: "حجز واتساب: 780000676",
    heroBtnRooms: "استكشف الغرف والأجنحة",
    bldgBadgeT: "المبنى الفندقي الرسمي",
    bldgBadgeS: "6 طوابق مجهزة بمصاعد سريعة وإطلالة بحرية",
    mbRooms: "غرفة وجناح فندقي بأرقى المفروشات",
    mbFloors: "طوابق فندقية مجهزة بمصاعد سريعة",
    mbPower: "كهرباء وتكييف مستمر دون انقطاع",
    mbNet: "انترنت فائق السرعة - فايبر وستارلينك",
    extH1: "استقبال الطيرمانات والمجلس العام",
    extH2: "خدمة الغرف والمطعم (24 ساعة)",
    extH3: "واتساب الحجوزات المعتمد",
    extH4: "الهاتف الثابت المباشر",
    bookBtnLabel: "طلب الحجز",
    detailsBtnLabel: "تفاصيل أكثر"
  },
  en: {
    navTitle: "Rose Aden Tourist Hotel",
    navSub: "Abyan Beach - Khormaksar - Aden Capital",
    nlHome: "Home",
    nlAbout: "About Us",
    nlRooms: "Rooms & Suites",
    nlVip: "VIP Tairmanah & Majlis",
    nlServices: "Services & Amenities",
    nlGallery: "Gallery",
    nlContact: "Contact & Booking",
    nlAdmin: "Control Panel",
    langBtnText: "العربية",
    navBookText: "WhatsApp: +967 780000676",
    heroBadge: "✨ Rose Aden Tourist Hotel - Abyan Beach",
    heroTitle: "Rose Aden <span>Tourist Hotel</span><br>Your Comfort & Luxury on Abyan Beach",
    heroSub: "Experience exceptional hospitality and stunning direct sea views on Abyan Beach Corniche in Aden; 72 deluxe rooms & suites, 24/7 continuous electricity and cooling, high-speed fiber & Starlink internet, and top-floor VIP Tairmanah & public majlis.",
    heroBtnWa: "WhatsApp: +967 780000676",
    heroBtnRooms: "Explore Rooms & Suites",
    bldgBadgeT: "Official Hotel Building",
    bldgBadgeS: "6 Floors with Fast Elevators & Direct Sea View",
    mbRooms: "Deluxe Rooms & Suites with Luxury Furnishings",
    mbFloors: "Hotel Floors Equipped with Fast Elevators",
    mbPower: "24/7 Uninterrupted Electricity & AC",
    mbNet: "High-Speed Internet - Fiber & Starlink",
    extH1: "VIP Tairmanah & Majlis Reception",
    extH2: "24/7 Room Service & Dining (EXT: 444)",
    extH3: "Certified WhatsApp Booking",
    extH4: "Direct Landline Phone",
    bookBtnLabel: "Book Now",
    detailsBtnLabel: "View Details"
  }
};

function applyTranslations() {
  const dict = translations[currentLang] || translations.ar;
  for (const [key, val] of Object.entries(dict)) {
    const el = document.getElementById(key);
    if (el) {
      if (key === "heroTitle") {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  }
}

// ==========================================
// 4. DYNAMIC DATA & CONTENT SYNC
// ==========================================
function applyDynamicHotelData() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const cfg = data.config;

  document.querySelectorAll("[data-bind='hotelName']").forEach(el => {
    el.textContent = currentLang === "en" ? cfg.nameEn : cfg.nameAr;
  });
  document.querySelectorAll("[data-bind='phone']").forEach(el => {
    el.textContent = cfg.phone;
    if (el.tagName === "A") el.href = `tel:${cfg.phone.replace(/[^0-9]/g, '')}`;
  });
  document.querySelectorAll("[data-bind='whatsapp']").forEach(el => {
    el.textContent = cfg.whatsapp;
    if (el.tagName === "A") el.href = `https://wa.me/${cfg.whatsappClean}?text=مرحبا_فندق_روز_عدن`;
  });
  document.querySelectorAll("[data-bind='roomsCount']").forEach(el => {
    el.textContent = cfg.roomsCount;
  });
}

function renderDynamicExtensions() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const exts = data.config.extensions || [];
  if (exts.length >= 2) {
    const ext701El = document.querySelector(".ext-box:nth-child(1) .ext-info span");
    if (ext701El) ext701El.textContent = `EXT: ${exts[0].number}`;
    const ext444El = document.querySelector(".ext-box:nth-child(2) .ext-info span");
    if (ext444El) ext444El.textContent = `EXT: ${exts[1].number}`;
  }
}

// ==========================================
// 5. DYNAMIC ROOMS RENDERING (رندرة حية للغرف والأسعار)
// ==========================================
function renderDynamicRooms() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const rooms = data.rooms || [];

  const grids = document.querySelectorAll(".rooms-grid");
  if (!grids || grids.length === 0) return;

  const isRoomsPage = window.location.pathname.includes("rooms.html");

  grids.forEach(grid => {
    // إذا كنا في الصفحة الرئيسية نعرض أبرز 3 غرف، وإذا كنا في صفحة الغرف نعرض الكل
    const displayRooms = isRoomsPage ? rooms : rooms.slice(0, 3);
    grid.innerHTML = "";

    displayRooms.forEach(r => {
      const roomCard = document.createElement("div");
      roomCard.className = "room-card";
      roomCard.setAttribute("data-type", r.type);

      const title = currentLang === "en" ? (r.nameEn || r.nameAr) : r.nameAr;
      const isNumericPrice = r.priceYER && r.priceYER > 0 && !r.priceCustom;
      const priceMainText = isNumericPrice 
        ? `${r.priceYER.toLocaleString()} ر.ي`
        : (currentLang === "en" ? "Upon Request / Special Rates" : "حسب الطلب / أسعار خاصة");
      const priceSubText = isNumericPrice
        ? `(${r.priceSAR} ر.س / ليلة)`
        : (currentLang === "en" ? "Special Direct Rate" : "تواصل للحصول على أفضل سعر خاص");

      const statusBadge = r.status === "متاحة" 
        ? `<span class="room-tag" style="background:#059669; border-color:#34d399; color:#fff;">✓ ${r.status}</span>`
        : (r.status === "محجوزة" 
            ? `<span class="room-tag" style="background:#d97706; border-color:#fbbf24; color:#fff;">⏳ ${r.status}</span>`
            : `<span class="room-tag" style="background:#dc2626; border-color:#f87171; color:#fff;">⚙️ ${r.status}</span>`);

      const amenitiesHtml = (r.amenities || []).slice(0, 4).map(a => `<span class="amenity-chip">${a}</span>`).join("");

      roomCard.innerHTML = `
        <div class="room-img-box">
          <img src="${r.image}" alt="${title}" loading="lazy">
          ${statusBadge}
        </div>
        <div class="room-info">
          <h3 class="room-title">${title}</h3>
          <p class="room-desc" style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${r.view} - ${r.beds}</p>
          <div class="room-meta-specs">
            <span>📍 ${r.floor}</span>
            <span>👥 ${r.capacity}</span>
          </div>
          <div class="room-amenities">
            ${amenitiesHtml}
          </div>
          <div class="room-footer">
            <div class="room-pricing">
              <span class="room-price-main" style="font-size:1.05rem; color:#c5a059; font-weight:900;">${priceMainText}</span>
              <span class="room-price-sub" style="font-size:0.78rem; color:#94a3b8;">${priceSubText}</span>
            </div>
            <button class="btn-book-room" onclick="openBookingModal(${r.id})">
              ${currentLang === "en" ? "Book Now" : "طلب الحجز"}
            </button>
          </div>
        </div>
      `;
      grid.appendChild(roomCard);
    });
  });

  // Re-initialize filter listeners after re-rendering
  initRoomFilter();
}

// ==========================================
// 6. DYNAMIC REVIEWS RENDERING
// ==========================================
function renderDynamicReviews() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const reviews = data.reviews || [];

  const grid = document.querySelector(".reviews-grid");
  if (!grid) return;

  grid.innerHTML = "";
  reviews.forEach(rev => {
    const author = currentLang === "en" ? (rev.authorEn || rev.authorAr) : rev.authorAr;
    const comment = currentLang === "en" ? (rev.commentEn || rev.commentAr) : rev.commentAr;
    const initial = author.trim().charAt(0) || "ن";

    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="stars">${'★'.repeat(rev.rating)}</div>
      <p class="review-quote">"${comment}"</p>
      <div class="reviewer">
        <div class="reviewer-avatar">${initial}</div>
        <div class="reviewer-info">
          <h5>${author}</h5>
          <span>${rev.date || 'نزيل موثق'}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ==========================================
// 7. DYNAMIC GALLERY RENDERING
// ==========================================
function renderDynamicGallery() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const gallery = data.gallery || [];

  const grid = document.querySelector(".gallery-grid");
  if (!grid) return;

  grid.innerHTML = "";
  gallery.forEach((g, idx) => {
    const title = currentLang === "en" ? (g.titleEn || g.titleAr) : g.titleAr;
    const item = document.createElement("div");
    item.className = `gallery-item ${idx === 0 ? 'featured' : ''}`;
    item.setAttribute("data-cat", g.category);
    item.innerHTML = `
      <img src="${g.image}" alt="${title}" loading="lazy">
      <div class="gallery-overlay">
        <h5>${title}</h5>
      </div>
    `;
    grid.appendChild(item);
  });

  initGalleryLightbox();
}

// ==========================================
// 8. LIVE DESIGN STUDIO APPLICATION
// ==========================================
function applyDesignCustomizations() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const d = data.design;
  if (!d) return;

  const root = document.documentElement;
  if (d.primaryGold) root.style.setProperty("--accent-gold", d.primaryGold);
  if (d.goldLight) root.style.setProperty("--accent-gold-light", d.goldLight);
  if (d.oceanBlue) root.style.setProperty("--primary-blue", d.oceanBlue);
  if (d.oceanBlueHover) root.style.setProperty("--primary-blue-hover", d.oceanBlueHover);
  if (d.whatsappGreen) root.style.setProperty("--whatsapp-green", d.whatsappGreen);
  if (d.borderRadius) root.style.setProperty("--radius", d.borderRadius);
  if (d.fontFamily) {
    document.body.style.fontFamily = `'${d.fontFamily}', sans-serif`;
  }

  // إظهار أو إخفاء أقسام الموقع بناءً على إعدادات لوحة التحكم
  if (d.sections) {
    const secMap = {
      hero: "#home",
      metrics: ".metrics-bar",
      extensions: ".extensions-banner",
      about: "#about",
      rooms: "#rooms",
      vip: "#vip",
      services: "#services",
      gallery: "#gallery",
      reviews: "#reviews",
      contact: "#contact"
    };

    for (const [key, isVisible] of Object.entries(d.sections)) {
      const sel = secMap[key];
      if (sel) {
        const el = document.querySelector(sel);
        if (el) {
          el.style.display = isVisible ? "" : "none";
        }
      }
    }
  }
}

// ==========================================
// 9. MOBILE NAVIGATION TOGGLE
// ==========================================
function initMobileNav() {
  const toggleBtn = document.querySelector(".mobile-nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-active");
    });
  }
}

// ==========================================
// 10. ROOMS FILTER
// ==========================================
function initRoomFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const roomCards = document.querySelectorAll(".room-card");

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");

      document.querySelectorAll(".room-card").forEach(card => {
        const type = card.getAttribute("data-type");
        if (category === "all" || type === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    };
  });
}

// ==========================================
// 11. BOOKING MODAL & WHATSAPP INTEGRATION
// ==========================================
let activeRoomData = null;

function initBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal());
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const checkInInput = document.getElementById("bmCheckIn");
  const checkOutInput = document.getElementById("bmCheckOut");
  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener("change", recalculatePrice);
    checkOutInput.addEventListener("change", recalculatePrice);
  }

  const form = document.getElementById("bookingModalForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      executeModalBooking();
    });
  }
}

function openBookingModal(roomId) {
  const modal = document.getElementById("bookingModal");
  if (!modal || typeof getHotelData !== "function") return;

  const data = getHotelData();
  const room = data.rooms.find(r => r.id === parseInt(roomId)) || data.rooms[0];
  activeRoomData = room;

  const titleEl = document.getElementById("bmRoomTitle");
  if (titleEl) {
    titleEl.textContent = currentLang === "en" ? (room.nameEn || room.nameAr) : room.nameAr;
  }

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const inEl = document.getElementById("bmCheckIn");
  const outEl = document.getElementById("bmCheckOut");
  if (inEl) inEl.value = today;
  if (outEl) outEl.value = tomorrow;

  recalculatePrice();
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) modal.classList.remove("active");
}

function recalculatePrice() {
  if (!activeRoomData) return;
  const inEl = document.getElementById("bmCheckIn");
  const outEl = document.getElementById("bmCheckOut");
  const priceDisplay = document.getElementById("bmTotalPrice");

  if (!inEl || !outEl || !priceDisplay) return;

  const d1 = new Date(inEl.value);
  const d2 = new Date(outEl.value);
  let nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  if (isNaN(nights) || nights < 1) nights = 1;

  if (activeRoomData.priceYER && activeRoomData.priceYER > 0 && !activeRoomData.priceCustom) {
    const totalYER = activeRoomData.priceYER * nights;
    const totalSAR = activeRoomData.priceSAR * nights;
    priceDisplay.textContent = `${totalYER.toLocaleString()} ر.ي (${totalSAR.toLocaleString()} ر.س) - [${nights} ليلة]`;
  } else {
    priceDisplay.textContent = currentLang === "en" 
      ? `Upon Request / Special Rates [${nights} Nights]`
      : `حسب الطلب / أسعار خاصة [${nights} ليالي - عرض خاص للنزيل]`;
  }
}

function executeModalBooking() {
  if (!activeRoomData || typeof getHotelData !== "function") return;
  const data = getHotelData();
  const cfg = data.config;

  const guestName = document.getElementById("bmGuestName")?.value || "نزيل فندق روز عدن";
  const guestPhone = document.getElementById("bmGuestPhone")?.value || "";
  const checkIn = document.getElementById("bmCheckIn")?.value || "";
  const checkOut = document.getElementById("bmCheckOut")?.value || "";
  const guests = document.getElementById("bmGuests")?.value || "2";
  const notes = document.getElementById("bmNotes")?.value || "لا توجد ملاحظات إضافية";

  const roomName = currentLang === "en" ? (activeRoomData.nameEn || activeRoomData.nameAr) : activeRoomData.nameAr;

  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  let nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  if (isNaN(nights) || nights < 1) nights = 1;

  const isNumeric = activeRoomData.priceYER && activeRoomData.priceYER > 0 && !activeRoomData.priceCustom;
  const priceDisplaySummary = isNumeric 
    ? `${(activeRoomData.priceYER * nights).toLocaleString()} ر.ي (${(activeRoomData.priceSAR * nights).toLocaleString()} ر.س)`
    : "حسب الطلب / أسعار خاصة (طلب تسعيرة خاصة للنزيل)";

  const newBooking = {
    id: `BK-${Date.now().toString().slice(-4)}`,
    guestName,
    phone: guestPhone,
    roomTitle: roomName,
    checkIn,
    checkOut,
    guests: `${guests} أفراد`,
    status: "قيد المراجعة",
    notes,
    dateCreated: new Date().toLocaleString("ar-YE")
  };

  data.bookings.unshift(newBooking);
  saveHotelData(data);

  const waMsg = `*طلب حجز جديد - فندق روز عدن السياحي (ساحل أبين)*%0A` +
    `-----------------------------------------%0A` +
    `👤 *اسم الضيف:* ${encodeURIComponent(guestName)}%0A` +
    `📱 *رقم التواصل:* ${encodeURIComponent(guestPhone)}%0A` +
    `🏨 *الوحدة المطلوبة:* ${encodeURIComponent(roomName)}%0A` +
    `📅 *تاريخ الدخول:* ${encodeURIComponent(checkIn)}%0A` +
    `📅 *تاريخ المغادرة:* ${encodeURIComponent(checkOut)}%0A` +
    `🌙 *عدد الليالي:* ${nights}%0A` +
    `👥 *عدد النزلاء:* ${encodeURIComponent(guests)}%0A` +
    `💰 *التسعيرة:* ${encodeURIComponent(priceDisplaySummary)}%0A` +
    `📝 *ملاحظات الضيف:* ${encodeURIComponent(notes)}%0A` +
    `-----------------------------------------%0A` +
    `✨ أرجو تأكيد توفر الغرفة وتفاصيل الدفع. شكراً لكم!`;

  closeModal();
  window.open(`https://wa.me/${cfg.whatsappClean}?text=${waMsg}`, "_blank");
}

// ==========================================
// 12. LIGHTBOX GALLERY
// ==========================================
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryItems.forEach(item => {
    item.onclick = () => {
      const img = item.querySelector("img");
      if (img) openLightbox(img.src, img.alt);
    };
  });
}

function openLightbox(src, alt) {
  let box = document.getElementById("lightboxModal");
  if (!box) {
    box = document.createElement("div");
    box.id = "lightboxModal";
    box.className = "modal-overlay";
    box.innerHTML = `
      <div class="modal-box" style="max-width: 850px; text-align: center; padding: 1rem; background: #07132c;">
        <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">&times;</button>
        <img id="lbImg" src="" style="width: 100%; max-height: 75vh; object-fit: contain; border-radius: 12px; margin-top: 10px;">
        <h4 id="lbCaption" style="color: #dfbe7d; margin-top: 12px; font-weight: 800;"></h4>
      </div>
    `;
    document.body.appendChild(box);
    box.addEventListener("click", (e) => {
      if (e.target === box) box.classList.remove("active");
    });
  }
  document.getElementById("lbImg").src = src;
  document.getElementById("lbCaption").textContent = alt || "";
  box.classList.add("active");
}

// ==========================================
// 13. CONTACT FORM SUBMISSION
// ==========================================
function initContactForm() {
  const form = document.getElementById("publicContactForm");
  if (!form || typeof getHotelData !== "function") return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const data = getHotelData();
    const cfg = data.config;

    const name = form.querySelector("[name='name']").value;
    const phone = form.querySelector("[name='phone']").value;
    const subject = form.querySelector("[name='subject']").value;
    const msg = form.querySelector("[name='message']").value;

    const waMsg = `*رسالة استفسار جديدة - فندق روز عدن السياحي*%0A` +
      `👤 *الاسم:* ${encodeURIComponent(name)}%0A` +
      `📱 *الهاتف:* ${encodeURIComponent(phone)}%0A` +
      `📌 *الموضوع:* ${encodeURIComponent(subject)}%0A` +
      `💬 *نص الرسالة:* ${encodeURIComponent(msg)}`;

    window.open(`https://wa.me/${cfg.whatsappClean}?text=${waMsg}`, "_blank");
  };
}
