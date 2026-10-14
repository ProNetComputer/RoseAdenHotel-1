/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * ملف البرمجة الشامل للوحة التحكم الاحترافية (Admin Dashboard Logic)
 * Complete Management: CRUD for Rooms, Bookings, Content, Gallery, Reviews & JSON Backups
 */

const ADMIN_PASS = "rose1admin";

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  initSidebar();
  renderDashboard();
  renderRoomsTable();
  renderBookingsTable();
  renderContentSettings();
  renderGalleryManager();
  renderReviewsManager();
});

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================
function checkAdminAuth() {
  const isLogged = sessionStorage.getItem("rose1_admin_logged");
  const authModal = document.getElementById("adminAuthModal");
  if (!isLogged && authModal) {
    authModal.style.display = "flex";
  } else if (authModal) {
    authModal.style.display = "none";
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const input = document.getElementById("adminPassInput")?.value;
  if (input === ADMIN_PASS || input === "admin2026") {
    sessionStorage.setItem("rose1_admin_logged", "true");
    document.getElementById("adminAuthModal").style.display = "none";
    showAdminToast("تم تسجيل الدخول بنجاح! أهلاً بك في لوحة تحكم روز عدن 1");
    renderDashboard();
  } else {
    alert("كلمة المرور غير صحيحة! يرجى المحاولة مجدداً (الافتراضية: rose1admin)");
  }
}

function adminLogout() {
  if (confirm("هل ترغب بتسجيل الخروج من لوحة التحكم؟")) {
    sessionStorage.removeItem("rose1_admin_logged");
    window.location.reload();
  }
}

// ==========================================
// 2. SIDEBAR NAVIGATION
// ==========================================
function initSidebar() {
  const links = document.querySelectorAll(".sidebar-nav li a");
  const panes = document.querySelectorAll(".tab-pane");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-tab");
      if (!targetId) return;

      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      panes.forEach(pane => {
        if (pane.id === targetId) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });

      // Update topbar title
      const titleEl = document.querySelector(".topbar-title");
      if (titleEl) {
        titleEl.textContent = link.textContent.trim();
      }
    });
  });
}

function toggleMobileSidebar() {
  document.querySelector(".admin-sidebar")?.classList.toggle("open");
}

// ==========================================
// 3. DASHBOARD METRICS
// ==========================================
function renderDashboard() {
  const data = getHotelData();
  const rooms = data.rooms || [];
  const bookings = data.bookings || [];

  document.getElementById("statTotalRooms").textContent = data.config.roomsCount || 72;
  document.getElementById("statActiveRooms").textContent = rooms.filter(r => r.status === "متاحة").length;
  document.getElementById("statTotalBookings").textContent = bookings.length;
  document.getElementById("statPendingBookings").textContent = bookings.filter(b => b.status === "قيد المراجعة").length;

  // Render recent bookings on dashboard
  const listEl = document.getElementById("dashRecentBookingsList");
  if (listEl) {
    listEl.innerHTML = "";
    bookings.slice(0, 5).forEach(b => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${b.id}</strong></td>
        <td>${b.guestName}</td>
        <td>${b.roomTitle}</td>
        <td>${b.checkIn}</td>
        <td><span class="badge ${b.status === 'مؤكد' ? 'badge-success' : 'badge-warning'}">${b.status}</span></td>
      `;
      listEl.appendChild(tr);
    });
  }
}

// ==========================================
// 4. ROOMS MANAGER (CRUD)
// ==========================================
function renderRoomsTable() {
  const data = getHotelData();
  const tbody = document.getElementById("roomsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  data.rooms.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${r.image}" class="table-img" alt="${r.nameAr}"></td>
      <td><strong>${r.nameAr}</strong><br><small style="color:#94a3b8;">${r.nameEn}</small></td>
      <td><span style="color:#c5a059; font-weight:800;">${r.priceYER.toLocaleString()} ر.ي</span><br><small>(${r.priceSAR} ر.س)</small></td>
      <td>${r.capacity}</td>
      <td>${r.floor}</td>
      <td>
        <span class="badge ${r.status === 'متاحة' ? 'badge-success' : (r.status === 'محجوزة' ? 'badge-warning' : 'badge-danger')}">
          ${r.status}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn-admin" onclick="openEditRoomModal(${r.id})" title="تعديل">✏️</button>
          <button class="btn-admin btn-admin-success" onclick="toggleRoomStatus(${r.id})" title="تبديل الحالة">🔄</button>
          <button class="btn-admin btn-admin-danger" onclick="deleteRoom(${r.id})" title="حذف">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddRoomModal() {
  document.getElementById("roomModalTitle").textContent = "إضافة غرفة أو جناح جديد";
  document.getElementById("roomFormId").value = "";
  document.getElementById("rfNameAr").value = "";
  document.getElementById("rfNameEn").value = "";
  document.getElementById("rfType").value = "double";
  document.getElementById("rfPriceYER").value = "45000";
  document.getElementById("rfPriceSAR").value = "300";
  document.getElementById("rfCapacity").value = "شخصين";
  document.getElementById("rfFloor").value = "الدور الثالث";
  document.getElementById("rfBeds").value = "سرير مزدوج فاخر";
  document.getElementById("rfView").value = "إطلالة بحرية مباشرة";
  document.getElementById("rfAmenities").value = "تكييف 24 ساعة، شاشة LED، ثلاجة، فايبر + ستارلينك";
  document.getElementById("rfImage").value = "assets/room_twin.jpg";
  document.getElementById("rfStatus").value = "متاحة";

  document.getElementById("roomEditModal").style.display = "flex";
}

function openEditRoomModal(id) {
  const data = getHotelData();
  const room = data.rooms.find(r => r.id === id);
  if (!room) return;

  document.getElementById("roomModalTitle").textContent = "تعديل بيانات الغرفة";
  document.getElementById("roomFormId").value = room.id;
  document.getElementById("rfNameAr").value = room.nameAr;
  document.getElementById("rfNameEn").value = room.nameEn;
  document.getElementById("rfType").value = room.type;
  document.getElementById("rfPriceYER").value = room.priceYER;
  document.getElementById("rfPriceSAR").value = room.priceSAR;
  document.getElementById("rfCapacity").value = room.capacity;
  document.getElementById("rfFloor").value = room.floor;
  document.getElementById("rfBeds").value = room.beds;
  document.getElementById("rfView").value = room.view;
  document.getElementById("rfAmenities").value = (room.amenities || []).join("، ");
  document.getElementById("rfImage").value = room.image;
  document.getElementById("rfStatus").value = room.status;

  document.getElementById("roomEditModal").style.display = "flex";
}

function saveRoomForm(e) {
  e.preventDefault();
  const data = getHotelData();
  const idStr = document.getElementById("roomFormId").value;
  const isEdit = Boolean(idStr);

  const newRoom = {
    id: isEdit ? parseInt(idStr) : Date.now(),
    nameAr: document.getElementById("rfNameAr").value,
    nameEn: document.getElementById("rfNameEn").value,
    type: document.getElementById("rfType").value,
    priceYER: parseInt(document.getElementById("rfPriceYER").value) || 45000,
    priceSAR: parseInt(document.getElementById("rfPriceSAR").value) || 300,
    capacity: document.getElementById("rfCapacity").value,
    floor: document.getElementById("rfFloor").value,
    beds: document.getElementById("rfBeds").value,
    view: document.getElementById("rfView").value,
    amenities: document.getElementById("rfAmenities").value.split("،").map(s => s.trim()).filter(Boolean),
    image: document.getElementById("rfImage").value || "assets/room_twin.jpg",
    status: document.getElementById("rfStatus").value
  };

  if (isEdit) {
    const idx = data.rooms.findIndex(r => r.id === newRoom.id);
    if (idx !== -1) data.rooms[idx] = newRoom;
  } else {
    data.rooms.push(newRoom);
  }

  saveHotelData(data);
  document.getElementById("roomEditModal").style.display = "none";
  renderRoomsTable();
  renderDashboard();
  showAdminToast(isEdit ? "تم تحديث بيانات الغرفة بنجاح!" : "تمت إضافة الغرفة الجديدة بنجاح!");
}

function toggleRoomStatus(id) {
  const data = getHotelData();
  const room = data.rooms.find(r => r.id === id);
  if (!room) return;

  if (room.status === "متاحة") room.status = "محجوزة";
  else if (room.status === "محجوزة") room.status = "صيانة";
  else room.status = "متاحة";

  saveHotelData(data);
  renderRoomsTable();
  renderDashboard();
  showAdminToast(`تم تغيير حالة ${room.nameAr} إلى ${room.status}`);
}

function deleteRoom(id) {
  if (!confirm("هل أنت متأكد من حذف هذه الغرفة من النظام؟")) return;
  const data = getHotelData();
  data.rooms = data.rooms.filter(r => r.id !== id);
  saveHotelData(data);
  renderRoomsTable();
  renderDashboard();
  showAdminToast("تم حذف الغرفة بنجاح!");
}

// ==========================================
// 5. BOOKINGS MANAGER
// ==========================================
function renderBookingsTable() {
  const data = getHotelData();
  const tbody = document.getElementById("bookingsTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  data.bookings.forEach(b => {
    const tr = document.createElement("tr");
    const waMsg = encodeURIComponent(`مرحباً أستاذ ${b.guestName}، بخصوص حجزكم في فندق روز عدن السياحي (الفرع الأول) للوحدة (${b.roomTitle}) للفترة ${b.checkIn} إلى ${b.checkOut}.`);
    const cleanPhone = b.phone.replace(/[^0-9]/g, "");

    tr.innerHTML = `
      <td><strong>${b.id}</strong></td>
      <td><strong>${b.guestName}</strong><br><small style="direction:ltr; display:inline-block;">${b.phone}</small></td>
      <td>${b.roomTitle}</td>
      <td>${b.checkIn} ➔ ${b.checkOut}</td>
      <td>${b.guests}</td>
      <td>
        <span class="badge ${b.status === 'مؤكد' ? 'badge-success' : (b.status === 'قيد المراجعة' ? 'badge-warning' : 'badge-danger')}">
          ${b.status}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" class="btn-admin btn-admin-success" title="مراسلة واتساب">💬</a>
          <button class="btn-admin" onclick="toggleBookingStatus('${b.id}')" title="تأكيد / تعديل الحالة">✔️</button>
          <button class="btn-admin btn-admin-danger" onclick="deleteBooking('${b.id}')" title="حذف">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleBookingStatus(id) {
  const data = getHotelData();
  const b = data.bookings.find(item => item.id === id);
  if (!b) return;

  if (b.status === "قيد المراجعة") b.status = "مؤكد";
  else if (b.status === "مؤكد") b.status = "ملغي";
  else b.status = "قيد المراجعة";

  saveHotelData(data);
  renderBookingsTable();
  renderDashboard();
  showAdminToast(`تم تغيير حالة الحجز ${b.id} إلى: ${b.status}`);
}

function deleteBooking(id) {
  if (!confirm("هل أنت متأكد من حذف هذا الحجز نهائياً؟")) return;
  const data = getHotelData();
  data.bookings = data.bookings.filter(b => b.id !== id);
  saveHotelData(data);
  renderBookingsTable();
  renderDashboard();
  showAdminToast("تم حذف الحجز بنجاح!");
}

// ==========================================
// 6. CONTENT & SETTINGS MANAGER
// ==========================================
function renderContentSettings() {
  const data = getHotelData();
  const cfg = data.config;

  document.getElementById("cfgNameAr").value = cfg.nameAr || "";
  document.getElementById("cfgNameEn").value = cfg.nameEn || "";
  document.getElementById("cfgPhone").value = cfg.phone || "";
  document.getElementById("cfgWhatsApp").value = cfg.whatsapp || "";
  document.getElementById("cfgEmail").value = cfg.email || "";
  document.getElementById("cfgAddressAr").value = cfg.addressAr || "";
  document.getElementById("cfgExt701").value = cfg.extensions?.[0]?.number || "701";
  document.getElementById("cfgExt444").value = cfg.extensions?.[1]?.number || "444";
  document.getElementById("cfgRoomsCount").value = cfg.roomsCount || 72;
}

function saveContentSettings(e) {
  e.preventDefault();
  const data = getHotelData();

  data.config.nameAr = document.getElementById("cfgNameAr").value;
  data.config.nameEn = document.getElementById("cfgNameEn").value;
  data.config.phone = document.getElementById("cfgPhone").value;
  data.config.whatsapp = document.getElementById("cfgWhatsApp").value;
  data.config.whatsappClean = document.getElementById("cfgWhatsApp").value.replace(/[^0-9]/g, "");
  data.config.email = document.getElementById("cfgEmail").value;
  data.config.addressAr = document.getElementById("cfgAddressAr").value;
  data.config.roomsCount = parseInt(document.getElementById("cfgRoomsCount").value) || 72;

  // Extensions
  if (data.config.extensions && data.config.extensions.length >= 2) {
    data.config.extensions[0].number = document.getElementById("cfgExt701").value;
    data.config.extensions[1].number = document.getElementById("cfgExt444").value;
  }

  saveHotelData(data);
  showAdminToast("تم حفظ كافة إعدادات وبيانات الفندق بنجاح!");
}

// ==========================================
// 7. GALLERY & REVIEWS MANAGERS
// ==========================================
function renderGalleryManager() {
  const data = getHotelData();
  const grid = document.getElementById("adminGalleryGrid");
  if (!grid) return;

  grid.innerHTML = "";
  (data.gallery || []).forEach(g => {
    const card = document.createElement("div");
    card.style = "background:#0d1e3d; border:1px solid rgba(197,160,89,0.3); border-radius:12px; overflow:hidden; position:relative;";
    card.innerHTML = `
      <img src="${g.image}" style="width:100%; height:140px; object-fit:cover;" alt="${g.titleAr}">
      <div style="padding:10px;">
        <h5 style="margin:0 0 6px; font-size:0.85rem; color:#fff;">${g.titleAr}</h5>
        <span class="badge badge-warning">${g.category}</span>
        <button class="btn-admin btn-admin-danger" style="margin-top:8px; width:100%; padding:4px;" onclick="deleteGalleryItem(${g.id})">حذف الصورة</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addGalleryItem() {
  const title = prompt("عنوان الصورة:");
  if (!title) return;
  const url = prompt("مسار الصورة أو الرابط (مثال: assets/building.jpg):", "assets/building.jpg");
  if (!url) return;
  const cat = prompt("الفئة (building / rooms / tairmanah / views / lobby):", "rooms");

  const data = getHotelData();
  data.gallery.push({
    id: Date.now(),
    titleAr: title,
    titleEn: title,
    category: cat,
    image: url
  });
  saveHotelData(data);
  renderGalleryManager();
  showAdminToast("تمت إضافة الصورة بنجاح!");
}

function deleteGalleryItem(id) {
  if (!confirm("هل ترغب بحذف هذه الصورة؟")) return;
  const data = getHotelData();
  data.gallery = data.gallery.filter(g => g.id !== id);
  saveHotelData(data);
  renderGalleryManager();
  showAdminToast("تم حذف الصورة بنجاح!");
}

function renderReviewsManager() {
  const data = getHotelData();
  const list = document.getElementById("adminReviewsList");
  if (!list) return;

  list.innerHTML = "";
  (data.reviews || []).forEach(rev => {
    const item = document.createElement("div");
    item.style = "background:#0d1e3d; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:1.2rem; margin-bottom:1rem;";
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong>${rev.authorAr}</strong>
        <span style="color:#f59e0b;">${'★'.repeat(rev.rating)}</span>
      </div>
      <p style="color:#cbd5e1; font-size:0.9rem; margin-bottom:10px;">${rev.commentAr}</p>
      <button class="btn-admin btn-admin-danger" style="padding:4px 10px; font-size:0.8rem;" onclick="deleteReview(${rev.id})">حذف التقييم</button>
    `;
    list.appendChild(item);
  });
}

function deleteReview(id) {
  if (!confirm("هل ترغب بحذف هذا التقييم؟")) return;
  const data = getHotelData();
  data.reviews = data.reviews.filter(r => r.id !== id);
  saveHotelData(data);
  renderReviewsManager();
  showAdminToast("تم حذف التقييم بنجاح!");
}

// ==========================================
// 8. BACKUP & RESTORE
// ==========================================
function importDataFromJSONFile(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.config && parsed.rooms) {
        saveHotelData(parsed);
        alert("تم استيراد كافة البيانات بنجاح وتحديث النظام!");
        window.location.reload();
      } else {
        alert("ملف JSON غير متوافق!");
      }
    } catch (err) {
      alert("خطأ في قراءة ملف JSON: " + err.message);
    }
  };
  reader.readAsText(file);
}

function resetAllDataToDefault() {
  if (confirm("تحذير: هل أنت متأكد من إعادة تعيين كافة البيانات إلى الإعدادات الأولية؟ ستفقد أي تعديلات غير محفوظة.")) {
    resetHotelData();
    alert("تمت إعادة تعيين البيانات بنجاح!");
    window.location.reload();
  }
}

// Toast
function showAdminToast(msg) {
  let toast = document.getElementById("adminToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "adminToast";
    toast.className = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}
