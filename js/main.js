/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * ملف البرمجة الرئيسي للواجهات العامة والصفحات المتعددة
 * Main Frontend Script (Bilingual, Dark/Light, Modals, WhatsApp, Storage Sync)
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initLanguage();
  initMobileNav();
  applyDynamicHotelData();
  initRoomFilter();
  initBookingModal();
  initGalleryLightbox();
  initContactForm();
});

// ==========================================
// 1. THEME SWITCHER (Dark / Light)
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
// 2. BILINGUAL SWITCHER (Arabic / English)
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
    bookBtnLabel: "طلب الحجز عبر واتساب",
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
    bookBtnLabel: "Book via WhatsApp",
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
// 3. DYNAMIC CONTENT SYNCHRONIZATION
// ==========================================
function applyDynamicHotelData() {
  if (typeof getHotelData !== "function") return;
  const data = getHotelData();
  const cfg = data.config;

  // Update dynamic elements if present
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

// ==========================================
// 4. MOBILE NAVIGATION TOGGLE
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
// 5. ROOMS FILTER (for rooms.html & index.html)
// ==========================================
function initRoomFilter() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const roomCards = document.querySelectorAll(".room-card");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");

      roomCards.forEach(card => {
        const type = card.getAttribute("data-type");
        if (category === "all" || type === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

// ==========================================
// 6. BOOKING MODAL & WHATSAPP INTEGRATION
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

  // Calculate total on date/guest change
  const checkInInput = document.getElementById("bmCheckIn");
  const checkOutInput = document.getElementById("bmCheckOut");
  if (checkInInput && checkOutInput) {
    checkInInput.addEventListener("change", recalculatePrice);
    checkOutInput.addEventListener("change", recalculatePrice);
  }

  // Handle form submit
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
    titleEl.textContent = currentLang === "en" ? room.nameEn : room.nameAr;
  }

  // Set default dates
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

  const totalYER = activeRoomData.priceYER * nights;
  const totalSAR = activeRoomData.priceSAR * nights;
  priceDisplay.textContent = `${totalYER.toLocaleString()} ر.ي (${totalSAR.toLocaleString()} ر.س) - [${nights} ليلة]`;
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

  const roomName = currentLang === "en" ? activeRoomData.nameEn : activeRoomData.nameAr;

  // Calculate nights
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  let nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  if (isNaN(nights) || nights < 1) nights = 1;

  const totalYER = (activeRoomData.priceYER * nights).toLocaleString();
  const totalSAR = (activeRoomData.priceSAR * nights).toLocaleString();

  // Create booking object and persist
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

  // Build WhatsApp Message
  const waMsg = `*طلب حجز جديد - فندق روز عدن السياحي (ساحل أبين)*%0A` +
    `-----------------------------------------%0A` +
    `👤 *اسم الضيف:* ${encodeURIComponent(guestName)}%0A` +
    `📱 *رقم التواصل:* ${encodeURIComponent(guestPhone)}%0A` +
    `🏨 *الوحدة المطلوبة:* ${encodeURIComponent(roomName)}%0A` +
    `📅 *تاريخ الدخول:* ${encodeURIComponent(checkIn)}%0A` +
    `📅 *تاريخ المغادرة:* ${encodeURIComponent(checkOut)}%0A` +
    `🌙 *عدد الليالي:* ${nights}%0A` +
    `👥 *عدد النزلاء:* ${encodeURIComponent(guests)}%0A` +
    `💰 *الإجمالي المقدر:* ${totalYER} ر.ي (${totalSAR} ر.س)%0A` +
    `📝 *ملاحظات الضيف:* ${encodeURIComponent(notes)}%0A` +
    `-----------------------------------------%0A` +
    `✨ أرجو تأكيد توفر الغرفة وتفاصيل الدفع. شكراً لكم!`;

  closeModal();

  // Redirect to official WhatsApp
  window.open(`https://wa.me/${cfg.whatsappClean}?text=${waMsg}`, "_blank");
}

// ==========================================
// 7. LIGHTBOX GALLERY
// ==========================================
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  galleryItems.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (img) openLightbox(img.src, img.alt);
    });
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
// 8. CONTACT FORM SUBMISSION
// ==========================================
function initContactForm() {
  const form = document.getElementById("publicContactForm");
  if (!form || typeof getHotelData !== "function") return;

  form.addEventListener("submit", (e) => {
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
  });
}
