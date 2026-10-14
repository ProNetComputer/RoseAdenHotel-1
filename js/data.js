
// مخزن احتياطي في الذاكرة في حال فتح الملفات محلياً (file://) مع حظر المتصفح لـ localStorage
window._roseMemoryStore = window._roseMemoryStore || {};

function safeGetLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return window._roseMemoryStore[key] || null;
  }
}

function safeSetLocal(key, val) {
  window._roseMemoryStore[key] = String(val);
  try {
    localStorage.setItem(key, String(val));
  } catch (e) {}
}

function safeGetSession(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    return window._roseMemoryStore['sess_' + key] || null;
  }
}

function safeSetSession(key, val) {
  if (val === null) {
    delete window._roseMemoryStore['sess_' + key];
    try { sessionStorage.removeItem(key); } catch (e) {}
    return;
  }
  window._roseMemoryStore['sess_' + key] = String(val);
  try {
    sessionStorage.setItem(key, String(val));
  } catch (e) {}
}

/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * قاعدة البيانات المركزية المتطورة ومحرك المزامنة والحفظ الاحترافي (Centralized Data & Save Engine v4)
 * يدعم: المزامنة مع data.json، البث اللحظي عبر BroadcastChannel، وتوليد ملفات الحفظ (JSON / data.js / CSV)
 */

const STORAGE_KEY = 'rose_aden_1_data';
const SYNC_CHANNEL_NAME = 'rose1_hotel_live_sync';

let syncChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  console.warn("BroadcastChannel not supported:", e);
}

// 1. الإعدادات العامة لهوية الفندق
const defaultHotelConfig = {
  nameAr: "فندق روز عدن السياحي",
  nameEn: "Rose Aden Tourist Hotel",
  branchAr: "الفرع الأول (الأقدم والأعرق - ساحل أبين)",
  branchEn: "Branch 1 (Heritage & Seashore - Abyan Beach)",
  sloganAr: "راحتك وأمانك في قلب الفخامة على ساحل أبين",
  sloganEn: "Your Comfort & Luxury on the Shores of Abyan Beach",
  phone: "02-238800",
  whatsapp: "+967 780000676",
  whatsappClean: "967780000676",
  email: "roseadenhotel1@gmail.com",
  addressAr: "العاصمة عدن - مديرية خور مكسر - ساحل أبين - كورنيش قحطان الشعبي",
  addressEn: "Aden Capital - Khormaksar District - Abyan Coast - Qahtan Al-Shaabi Corniche",
  googleMapsUrl: "https://maps.app.goo.gl/uP6U2BwVzC2J2",
  roomsCount: 72,
  floorsCount: 6,
  foundedYear: "2020 (يوليو)",
  starlinkActive: true,
  fiberActive: true,
  power24Active: true,
  extensions: [
    { number: "701", titleAr: "استقبال الطيرمانات والمجلس العام", titleEn: "VIP Tairmanah & Majlis Reception", icon: "🛎️" },
    { number: "444", titleAr: "خدمة الغرف والمطعم (24 ساعة)", titleEn: "24/7 Room Service & Dining", icon: "🍽️" },
    { number: "100", titleAr: "الاستقبال العام وخدمات النزلاء", titleEn: "General Reception & Guest Relations", icon: "🏢" },
    { number: "200", titleAr: "إدارة الحجوزات والتسكين", titleEn: "Reservations & Booking Management", icon: "📑" }
  ],
  pronet: {
    nameAr: "برونت كمبيوتر | ProNet Computer",
    nameEn: "ProNet Computer Technology",
    managerAr: "المهندس عمار محمد سعيد الأسدي",
    managerEn: "Eng. Ammar M. S. Alasadi",
    phone: "02-241004",
    mobile: "775043020 - 771992544",
    addressAr: "اليمن - عدن - المعلا - الشارع الرئيسي (شارع الشهيد مدرم) - أمام بنك الكريمي",
    addressEn: "Aden - Al-Mualla - Main Street (Madram St.) - In front of Al-Kuraimi Bank"
  }
};

// 2. مستخدمو لوحة التحكم وإدارة الصلاحيات
const defaultAdminUsers = [
  {
    id: 1,
    username: "admin",
    fullName: "م. عمار محمد سعيد الأسدي",
    role: "super_admin",
    roleNameAr: "مدير النظام العام (Super Admin)",
    email: "prontech.co@gmail.com",
    phone: "775043020",
    password: "rose1admin",
    status: "active",
    avatar: "👑",
    lastLogin: "2026-10-14 06:45"
  },
  {
    id: 2,
    username: "manager",
    fullName: "مدير العمليات الفندقية",
    role: "hotel_manager",
    roleNameAr: "مدير الفندق (Hotel Manager)",
    email: "manager@roseadenhotel.com",
    phone: "780000676",
    password: "hotel2026",
    status: "active",
    avatar: "🏨",
    lastLogin: "2026-10-13 22:15"
  },
  {
    id: 3,
    username: "reception",
    fullName: "مسؤول الاستقبال والحجوزات",
    role: "receptionist",
    roleNameAr: "موظف استقبال (Receptionist)",
    email: "reception@roseadenhotel.com",
    phone: "02-238800",
    password: "rec123",
    status: "active",
    avatar: "🛎️",
    lastLogin: "2026-10-14 05:30"
  }
];

// 3. تخصيص تصميم ومظهر الموقع
const defaultDesignSettings = {
  primaryGold: "#c5a059",
  goldLight: "#dfbe7d",
  oceanBlue: "#1e60c4",
  oceanBlueHover: "#0b4da2",
  bgBodyDark: "#07132c",
  bgCardDark: "#0d1e3d",
  whatsappGreen: "#25d366",
  fontFamily: "Tajawal",
  borderRadius: "18px",
  cardStyle: "glassmorphism",
  sections: {
    hero: true,
    metrics: true,
    extensions: true,
    about: true,
    rooms: true,
    vip: true,
    services: true,
    gallery: true,
    reviews: true,
    contact: true
  }
};

// 4. خيارات القوائم المنسدلة ومحسنات الإدخال
const inputCatalogs = {
  floors: [
    "الدور الأرضي (الاستقبال واللوبي)",
    "الدور الأول الفندقي",
    "الدور الثاني الفندقي",
    "الدور الثالث الفندقي",
    "الدور الرابع الفندقي",
    "الدور الخامس (أجنحة VIP الملكية)",
    "الدور السادس (السطح الملكي وطيرمانة VIP)"
  ],
  roomTypes: [
    { value: "vip", labelAr: "جناح VIP الملكي الفاخر", labelEn: "VIP Royal Suite" },
    { value: "family", labelAr: "الجناح العائلي الفسيح", labelEn: "Deluxe Family Suite" },
    { value: "double", labelAr: "الغرفة المزدوجة الفاخرة", labelEn: "Deluxe Twin / Double Room" },
    { value: "seaview", labelAr: "غرفة الاستجمام بإطلالة بحرية", labelEn: "Sea View Leisure Room" },
    { value: "tairmanah", labelAr: "طيرمانة روز عدن VIP والمجلس", labelEn: "Top-Floor Royal Tairmanah" }
  ],
  bedOptions: [
    "سرير كينج ملكي كبير + صالون ضيافة",
    "سرير كينج رئيسي + سريران مفردان + كنب سرير",
    "سرير مزدوج فاخر كبير",
    "سريران مفردان منفصلان",
    "سرير كينج كبير + ركن كنب للاسترخاء",
    "طنافس ومساند تراثية يمنية مذهبة (طيرمانة VIP)"
  ],
  viewOptions: [
    "إطلالة بانورامية كاملة على ساحل أبين وبحر العرب",
    "إطلالة مواجهة لأمواج بحر العرب وشاطئ أبين",
    "إطلالة بحرية عريضة على أفق ساحل خورمكسر",
    "إطلالة على نسيم البحر والشارع السياحي الحيوي",
    "إطلالة بانورامية بزاوية 360 درجة كاشفة لشاطئ أبين ومعالم عدن"
  ],
  amenityCatalog: [
    "تكييف سبليت مستمر 24 ساعة",
    "شاشة ذكية 55 بوصة",
    "إنترنت فايبر وستارلينك فائق السرعة",
    "ثلاجة ميني بار",
    "هاتف داخلي للخدمات",
    "حمام رخامي مجهز بأحدث التجهيزات",
    "صالون جلوس فاخر ومكتب عمل",
    "غلاية شاي وقهوة وضيافة عدنية",
    "خزانة ملابس عريضة",
    "خدمة تنظيف وتطهير يومية",
    "تحويلة خاصة 701",
    "تحويلة خاصة 444",
    "واجهة زجاجية عريضة كاشفة للبحر",
    "إطلالة 360 درجة"
  ],
  statusOptions: [
    { value: "متاحة", label: "متاحة للحجز الفوري", badgeClass: "badge-success" },
    { value: "محجوزة", label: "محجوزة حالياً", badgeClass: "badge-warning" },
    { value: "صيانة", label: "تحت الصيانة الدورية", badgeClass: "badge-danger" }
  ]
};

// 5. الغرف الافتراضية (السعر الافتراضي: حسب الطلب / أسعار خاصة)
const defaultRooms = [
  {
    id: 1,
    nameAr: "جناح VIP الملكي الفاخر",
    nameEn: "VIP Royal Sea View Suite",
    type: "vip",
    floor: "الدور الخامس (أجنحة VIP الملكية)",
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    priceYER: 0,
    priceSAR: 0,
    priceCustom: true,
    capacity: "2 - 4 أشخاص",
    beds: "سرير كينج ملكي كبير + صالون ضيافة",
    view: "إطلالة بانورامية كاملة على ساحل أبين وبحر العرب",
    amenities: [
      "شاشة ذكية 55 بوصة",
      "تكييف سبليت مستمر 24 ساعة",
      "ثلاجة ميني بار",
      "هاتف داخلي للخدمات",
      "حمام رخامي مجهز بأحدث التجهيزات",
      "إنترنت فايبر وستارلينك فائق السرعة",
      "صالون جلوس فاخر ومكتب عمل"
    ],
    image: "assets/suite_vip.jpg",
    status: "متاحة"
  },
  {
    id: 2,
    nameAr: "الجناح العائلي الفسيح",
    nameEn: "Deluxe Family Sea View Suite",
    type: "family",
    floor: "الدور الرابع الفندقي",
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    priceYER: 0,
    priceSAR: 0,
    priceCustom: true,
    capacity: "4 - 6 أشخاص",
    beds: "سرير كينج رئيسي + سريران مفردان + كنب سرير",
    view: "إطلالة بحرية عريضة على أفق ساحل خورمكسر",
    amenities: [
      "شاشات تلفزيون ذكية",
      "تكييف سبليت مستمر 24 ساعة",
      "ثلاجة ميني بار",
      "جلسة معيشة متكاملة",
      "إنترنت فايبر وستارلينك فائق السرعة",
      "هاتف داخلي للخدمات",
      "خدمة تنظيف وتطهير يومية"
    ],
    image: "assets/room_family.jpg",
    status: "متاحة"
  },
  {
    id: 3,
    nameAr: "الغرفة المزدوجة الفاخرة",
    nameEn: "Deluxe Twin / Double Room",
    type: "double",
    floor: "الدور الثاني الفندقي",
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    priceYER: 0,
    priceSAR: 0,
    priceCustom: true,
    capacity: "شخصين",
    beds: "سرير مزدوج فاخر كبير",
    view: "إطلالة على نسيم البحر والشارع السياحي الحيوي",
    amenities: [
      "تكييف سبليت مستمر 24 ساعة",
      "شاشة ذكية 55 بوصة",
      "خزانة ملابس عريضة",
      "ثلاجة ميني بار",
      "إنترنت فايبر وستارلينك فائق السرعة",
      "حمام رخامي مجهز بأحدث التجهيزات"
    ],
    image: "assets/room_twin.jpg",
    status: "متاحة"
  },
  {
    id: 4,
    nameAr: "غرفة الاستجمام بإطلالة بحرية مباشرة",
    nameEn: "Direct Sea View Leisure Room",
    type: "seaview",
    floor: "الدور الثالث الفندقي",
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    priceYER: 0,
    priceSAR: 0,
    priceCustom: true,
    capacity: "2 - 3 أشخاص",
    beds: "سرير كينج كبير + ركن كنب للاسترخاء",
    view: "إطلالة مواجهة لأمواج بحر العرب وشاطئ أبين",
    amenities: [
      "واجهة زجاجية عريضة كاشفة للبحر",
      "تكييف سبليت مستمر 24 ساعة",
      "شاشة ذكية 55 بوصة",
      "غلاية شاي وقهوة وضيافة عدنية",
      "ثلاجة ميني بار",
      "إنترنت فايبر وستارلينك فائق السرعة"
    ],
    image: "assets/room_seaview.jpg",
    status: "متاحة"
  },
  {
    id: 5,
    nameAr: "طيرمانة روز عدن VIP الملكية والمجلس العام",
    nameEn: "Top-Floor Royal VIP Tairmanah & Majlis",
    type: "tairmanah",
    floor: "الدور السادس (السطح الملكي وطيرمانة VIP)",
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    priceYER: 0,
    priceSAR: 0,
    priceCustom: true,
    capacity: "وفود وجلسات خاصة (حتى 15 شخصاً)",
    beds: "طنافس ومساند تراثية يمنية مذهبة (طيرمانة VIP)",
    view: "إطلالة بانورامية بزاوية 360 درجة كاشفة لشاطئ أبين ومعالم عدن",
    amenities: [
      "تحويلة خاصة 701",
      "تحويلة خاصة 444",
      "إطلالة 360 درجة",
      "شاشة ذكية 55 بوصة",
      "غلاية شاي وقهوة وضيافة عدنية",
      "تكييف سبليت مستمر 24 ساعة",
      "إنترنت فايبر وستارلينك فائق السرعة"
    ],
    image: "assets/tairmanah.jpg",
    status: "متاحة"
  }
];

const defaultBookings = [
  {
    id: "BK-101",
    guestName: "أحمد بن عبد الرحمن العمري",
    phone: "+967 771234567",
    roomTitle: "جناح VIP الملكي الفاخر",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    guests: "2 بالغين",
    status: "مؤكد",
    notes: "يرجى توفير باقة استقبال وإطلالة بحرية كاملة",
    dateCreated: "2026-10-14 02:30"
  },
  {
    id: "BK-102",
    guestName: "سالم محمد باعباد",
    phone: "+967 733987654",
    roomTitle: "طيرمانة روز عدن VIP الملكية والمجلس العام",
    checkIn: "2026-10-16",
    checkOut: "2026-10-16",
    guests: "وفد من 10 أشخاص",
    status: "قيد المراجعة",
    notes: "جلسة مسائية وتنسيق مع تحويلة 701",
    dateCreated: "2026-10-14 04:15"
  },
  {
    id: "BK-103",
    guestName: "د. خالد فضل اليافعي",
    phone: "+967 775112233",
    roomTitle: "الجناح العائلي الفسيح",
    checkIn: "2026-10-20",
    checkOut: "2026-10-25",
    guests: "عائلة 5 أفراد",
    status: "مؤكد",
    notes: "وصول متأخر من مطار عدن الدولي",
    dateCreated: "2026-10-13 18:40"
  }
];

const defaultReviews = [
  {
    id: 1,
    authorAr: "م. طارق العولقي",
    authorEn: "Eng. Tareq Al-Awlaqi",
    rating: 5,
    date: "أكتوبر 2026",
    commentAr: "فندق ممتاز جداً وهادئ، موقعه مباشرة على ساحل أبين يمنحك راحة نفسية منقطعة النظير. الكهرباء والتكييف لا ينقطعان إطلاقاً والإنترنت الفضائي فايبر وستارلينك سريع للغاية.",
    commentEn: "An exceptional and peaceful hotel. Its direct seafront location on Abyan Beach offers total serenity. 24/7 power and AC with superfast Starlink internet."
  },
  {
    id: 2,
    authorAr: "الشيخ عبد الله بن هرهرة",
    authorEn: "Sheikh Abdullah Bin Harhara",
    rating: 5,
    date: "سبتمبر 2026",
    commentAr: "طيرمانة الدور العلوي (تحويلة 701) تحفة تراثية لا مثيل لها في عدن، الإطلالة البحرية في قمة الروعة والاستقبال قمة في الذوق والكرم.",
    commentEn: "The top-floor VIP Tairmanah (EXT: 701) is a true Yemeni heritage masterpiece with breathtaking panoramic sea views. Outstanding staff hospitality."
  },
  {
    id: 3,
    authorAr: "د. نجوى عبدالكريم",
    authorEn: "Dr. Najwa Abdulkarim",
    rating: 5,
    date: "أغسطس 2026",
    commentAr: "أقمنا مع العائلة في الجناح العائلي وكان خياراً موفقاً للغاية. النظافة مستمرة، والخدمة عبر تحويلة المطعم 444 سريعة على مدار 24 ساعة.",
    commentEn: "Stayed with my family in the Family Suite. Extremely clean, very spacious, and room service via Ext 444 is available 24/7."
  }
];

const defaultGallery = [
  { id: 1, titleAr: "واجهة مبنى فندق روز عدن الرسمي (6 طوابق)", titleEn: "Official Hotel Building (6 Floors)", category: "building", image: "assets/building.jpg" },
  { id: 2, titleAr: "صالة الاستقبال واللوبي الفاخر", titleEn: "Hotel Lobby & Reception Desk", category: "lobby", image: "assets/lobby.jpg" },
  { id: 3, titleAr: "طيرمانات ومجالس VIP العلوية", titleEn: "VIP Royal Tairmanah & Majlis", category: "tairmanah", image: "assets/tairmanah.jpg" },
  { id: 4, titleAr: "جناح VIP الملكي الفاخر", titleEn: "VIP Royal Suite", category: "rooms", image: "assets/suite_vip.jpg" },
  { id: 5, titleAr: "الجناح العائلي الفسيح", titleEn: "Deluxe Family Suite", category: "rooms", image: "assets/room_family.jpg" },
  { id: 6, titleAr: "الغرفة المزدوجة الفاخرة", titleEn: "Deluxe Twin / Double Room", category: "rooms", image: "assets/room_twin.jpg" },
  { id: 7, titleAr: "غرف الاستجمام المطلة على البحر", titleEn: "Sea View Leisure Room", category: "rooms", image: "assets/room_seaview.jpg" },
  { id: 8, titleAr: "مدخل الفندق ولافتة روز عدن", titleEn: "Hotel Entrance & Main Signboard", category: "building", image: "assets/entrance.jpg" },
  { id: 9, titleAr: "إطلالة بانورامية على كورنيش ساحل أبين", titleEn: "Panoramic View of Abyan Beach", category: "views", image: "assets/seaview.jpg" }
];

// دالة جلب البيانات مع الفحص والدمج الذكي
function getHotelData() {
  try {
    const raw = safeGetLocal(STORAGE_KEY);
    if (!raw) {
      const initial = {
        version: 4,
        lastUpdated: new Date().toISOString(),
        config: defaultHotelConfig,
        adminUsers: defaultAdminUsers,
        design: defaultDesignSettings,
        rooms: defaultRooms,
        bookings: defaultBookings,
        reviews: defaultReviews,
        gallery: defaultGallery
      };
      safeSetLocal(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const data = JSON.parse(raw);
    let updated = false;

    if (!data.adminUsers || !Array.isArray(data.adminUsers) || data.adminUsers.length === 0) {
      data.adminUsers = defaultAdminUsers;
      updated = true;
    }
    if (!data.design) {
      data.design = defaultDesignSettings;
      updated = true;
    }
    if (!data.rooms || !Array.isArray(data.rooms) || data.rooms.length === 0) {
      data.rooms = defaultRooms;
      updated = true;
    } else {
      data.rooms.forEach(r => {
        if (!r.priceTextAr) {
          r.priceTextAr = "حسب الطلب / أسعار خاصة";
          r.priceTextEn = "Upon Request / Special Rates";
          r.priceCustom = true;
          updated = true;
        }
      });
    }
    if (updated) {
      safeSetLocal(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.error("Error reading localStorage, using defaults:", e);
    return {
      version: 4,
      config: defaultHotelConfig,
      adminUsers: defaultAdminUsers,
      design: defaultDesignSettings,
      rooms: defaultRooms,
      bookings: defaultBookings,
      reviews: defaultReviews,
      gallery: defaultGallery
    };
  }
}

// المزامنة السحابية التلقائية مع ملف data.json عند فتح الموقع على استضافة ويب (مثل GitHub Pages)
async function syncWithRemoteDataJSON() {
  if (window.location.protocol === 'file:') return false;
  try {
    const res = await fetch(`./data.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return false;
    const remoteData = await res.json();
    if (!remoteData || !remoteData.config || !remoteData.rooms) return false;

    const localRaw = safeGetLocal(STORAGE_KEY);
    if (!localRaw) {
      safeSetLocal(STORAGE_KEY, JSON.stringify(remoteData));
      return true;
    }
    const localData = JSON.parse(localRaw);
    const remoteVer = Number(remoteData.version || 0);
    const localVer = Number(localData.version || 0);

    // إذا كان ملف data.json المنشور على السيرفر أحدث من النسخة المحلية، نحدّث البيانات تلقائياً
    if (remoteVer > localVer) {
      safeSetLocal(STORAGE_KEY, JSON.stringify(remoteData));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'HOTEL_DATA_UPDATED', timestamp: remoteVer });
      }
      return true;
    }
  } catch (err) {
    // يعمل الموقع بكفاءة من الذاكرة المحلية في حال عدم توفر اتصال
  }
  return false;
}

// دالة الحفظ مع البث اللحظي لجميع التبويبات المفتوحة
function saveHotelData(data) {
  try {
    data.version = Date.now();
    data.lastUpdated = new Date().toISOString();
    safeSetLocal(STORAGE_KEY, JSON.stringify(data));

    if (syncChannel) {
      syncChannel.postMessage({
        type: 'HOTEL_DATA_UPDATED',
        timestamp: data.version
      });
    }
    return true;
  } catch (e) {
    console.error("Error saving data to localStorage:", e);
    return false;
  }
}

function resetHotelData() {
  const initial = {
    version: Date.now(),
    lastUpdated: new Date().toISOString(),
    config: defaultHotelConfig,
    adminUsers: defaultAdminUsers,
    design: defaultDesignSettings,
    rooms: defaultRooms,
    bookings: defaultBookings,
    reviews: defaultReviews,
    gallery: defaultGallery
  };
  safeSetLocal(STORAGE_KEY, JSON.stringify(initial));

  if (syncChannel) {
    syncChannel.postMessage({
      type: 'HOTEL_DATA_RESET',
      timestamp: initial.version
    });
  }
  return initial;
}

// 1. تصدير ملف قاعدة البيانات السحابية data.json
function exportDataAsJSON() {
  const data = getHotelData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 2. تصدير ملف البرمجة المدمج data.js محدثاً بكافة التعديلات (للعمل بدون إنترنت أو استبدال js/data.js)
function exportDataAsJSFile() {
  const d = getHotelData();
  const jsContent = `/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * ملف قاعدة البيانات المحدث والمولد آلياً من لوحة التحكم (${new Date().toLocaleString("ar-YE")})
 */

const STORAGE_KEY = 'rose_aden_1_data';
const SYNC_CHANNEL_NAME = 'rose1_hotel_live_sync';

let syncChannel = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {}

const defaultHotelConfig = ${JSON.stringify(d.config, null, 2)};
const defaultAdminUsers = ${JSON.stringify(d.adminUsers, null, 2)};
const defaultDesignSettings = ${JSON.stringify(d.design, null, 2)};
const inputCatalogs = ${JSON.stringify(inputCatalogs, null, 2)};
const defaultRooms = ${JSON.stringify(d.rooms, null, 2)};
const defaultBookings = ${JSON.stringify(d.bookings, null, 2)};
const defaultReviews = ${JSON.stringify(d.reviews, null, 2)};
const defaultGallery = ${JSON.stringify(d.gallery, null, 2)};

window._roseMemoryStore = window._roseMemoryStore || {};
${safeGetLocal.toString()}
${safeSetLocal.toString()}
${safeGetSession.toString()}
${safeSetSession.toString()}
${getHotelData.toString()}
${syncWithRemoteDataJSON.toString()}
${saveHotelData.toString()}
${resetHotelData.toString()}
${exportDataAsJSON.toString()}
${exportDataAsJSFile.toString()}
${exportBookingsAsCSV.toString()}
`;
  const blob = new Blob([jsContent], { type: "application/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data.js`;
  a.click();
  URL.revokeObjectURL(url);
}

// 3. تصدير سجل الحجوزات بصيغة Excel / CSV
function exportBookingsAsCSV() {
  const data = getHotelData();
  const bookings = data.bookings || [];
  const headers = ["رقم الحجز", "اسم الضيف", "رقم الهاتف", "الغرفة / الجناح", "تاريخ الدخول", "تاريخ المغادرة", "عدد النزلاء", "الحالة", "ملاحظات", "تاريخ الإنشاء"];
  const rows = bookings.map(b => [
    b.id, b.guestName, b.phone, b.roomTitle, b.checkIn, b.checkOut, b.guests, b.status, b.notes || "", b.dateCreated || ""
  ]);

  const csvLines = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
  ];
  // UTF-8 BOM for Arabic support in Microsoft Excel
  const csvString = "\uFEFF" + csvLines.join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RoseAden1_Bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
