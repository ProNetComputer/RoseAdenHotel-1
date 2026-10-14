/**
 * فندق روز عدن السياحي - الفرع الأول (ساحل أبين)
 * ملف البرمجة الشامل للوحة التحكم الاحترافية المطورة (Admin Dashboard Controller v3)
 * يشمل: إدارة الغرف الحية، إدارة المستخدمين، استوديو التصميم، رفع الصور، والمزامنة السحابية المباشرة لـ GitHub Pages
 */

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  initSidebar();
  initLiveClock();
  renderDashboard();
  renderRoomsTable();
  renderBookingsTable();
  renderContentSettings();
  renderGalleryManager();
  renderReviewsManager();
  renderUsersManager();
  renderDesignStudio();
  initComboboxCatalogs();
  initImageUploadDropzones();
  initPublishingSettings();
});

// ==========================================
// 1. AUTHENTICATION & MULTI-USER ACCESS
// ==========================================
function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem("rose1_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function checkAdminAuth() {
  const user = getCurrentUser();
  const authModal = document.getElementById("adminAuthModal");
  if (!user && authModal) {
    authModal.style.display = "flex";
  } else if (authModal) {
    authModal.style.display = "none";
    updateUserTopbarBadge(user);
  }
}

function updateUserTopbarBadge(user) {
  if (!user) return;
  const avatarEl = document.getElementById("topbarUserAvatar");
  const nameEl = document.getElementById("topbarUserName");
  const roleEl = document.getElementById("topbarUserRole");
  const sideAvatar = document.getElementById("sideUserAvatar");
  const sideName = document.getElementById("sideUserName");
  const sideRole = document.getElementById("sideUserRole");

  if (avatarEl) avatarEl.textContent = user.avatar || "👤";
  if (nameEl) nameEl.textContent = user.fullName || user.username;
  if (roleEl) roleEl.textContent = user.roleNameAr || user.role;
  if (sideAvatar) sideAvatar.textContent = user.avatar || "👤";
  if (sideName) sideName.textContent = user.fullName || user.username;
  if (sideRole) sideRole.textContent = user.roleNameAr || user.role;
}

function handleAdminLogin(e) {
  e.preventDefault();
  const userInput = document.getElementById("adminUsernameInput")?.value.trim();
  const passInput = document.getElementById("adminPassInput")?.value;

  const data = getHotelData();
  const users = data.adminUsers || defaultAdminUsers;

  const found = users.find(u => 
    (u.username.toLowerCase() === userInput.toLowerCase() || u.email.toLowerCase() === userInput.toLowerCase()) &&
    u.password === passInput
  );

  if (found) {
    if (found.status === "inactive") {
      alert("عذراً، هذا الحساب معطل حالياً من قبل مدير النظام!");
      return;
    }
    found.lastLogin = new Date().toLocaleString("ar-YE");
    saveHotelData(data);

    sessionStorage.setItem("rose1_current_user", JSON.stringify(found));
    document.getElementById("adminAuthModal").style.display = "none";
    updateUserTopbarBadge(found);
    showAdminToast(`مرحباً بك يا ${found.fullName}! تم تسجيل الدخول بنجاح.`);
    renderDashboard();
  } else {
    alert("اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التأكد والمحاولة مجدداً.");
  }
}

function adminLogout() {
  if (confirm("هل ترغب بتسجيل الخروج من لوحة التحكم؟")) {
    sessionStorage.removeItem("rose1_current_user");
    window.location.reload();
  }
}

function initLiveClock() {
  const clockEl = document.getElementById("adminClock");
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString("ar-YE", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " | " + now.toLocaleDateString("ar-YE");
  };
  update();
  setInterval(update, 1000);
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

      const titleEl = document.querySelector(".topbar-title");
      if (titleEl) {
        titleEl.textContent = link.textContent.trim();
      }

      document.querySelector(".admin-sidebar")?.classList.remove("open");
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
  const users = data.adminUsers || [];

  document.getElementById("statTotalRooms").textContent = data.config.roomsCount || 72;
  document.getElementById("statActiveRooms").textContent = rooms.filter(r => r.status === "متاحة").length;
  document.getElementById("statTotalBookings").textContent = bookings.length;
  document.getElementById("statPendingBookings").textContent = bookings.filter(b => b.status === "قيد المراجعة").length;
  if (document.getElementById("statTotalUsers")) {
    document.getElementById("statTotalUsers").textContent = users.length;
  }

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
// 4. IMAGE UPLOAD & LOCAL DEVICE FILE READING
// ==========================================
function setupImageDropzone(dropzoneEl, fileInputEl, previewImgEl, targetInputEl) {
  if (!dropzoneEl || !fileInputEl) return;

  dropzoneEl.addEventListener("click", () => fileInputEl.click());

  dropzoneEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzoneEl.classList.add("dragover");
  });

  dropzoneEl.addEventListener("dragleave", () => {
    dropzoneEl.classList.remove("dragover");
  });

  dropzoneEl.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzoneEl.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedImageFile(e.dataTransfer.files[0], previewImgEl, targetInputEl);
    }
  });

  fileInputEl.addEventListener("change", () => {
    if (fileInputEl.files && fileInputEl.files[0]) {
      processUploadedImageFile(fileInputEl.files[0], previewImgEl, targetInputEl);
    }
  });
}

function processUploadedImageFile(file, previewImgEl, targetInputEl) {
  if (!file.type.startsWith("image/")) {
    alert("يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)!");
    return;
  }

  if (file.size > 4 * 1024 * 1024) {
    alert("حجم الصورة كبير جداً! يفضل أن يكون حجم الصورة أقل من 4 ميجابايت لتسريع التصفح.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;
    if (previewImgEl) {
      previewImgEl.src = base64Data;
      const previewBox = previewImgEl.closest(".upload-preview-box");
      if (previewBox) previewBox.style.display = "flex";
    }
    if (targetInputEl) {
      targetInputEl.value = base64Data;
    }
    showAdminToast("تم تحميل الصورة ومعاينتها بنجاح!");
  };
  reader.readAsDataURL(file);
}

function initImageUploadDropzones() {
  setupImageDropzone(
    document.getElementById("roomDropzone"),
    document.getElementById("roomFileInput"),
    document.getElementById("roomPreviewImg"),
    document.getElementById("rfImage")
  );

  setupImageDropzone(
    document.getElementById("galleryDropzone"),
    document.getElementById("galleryFileInput"),
    document.getElementById("galleryPreviewImg"),
    document.getElementById("galleryImgInput")
  );
}

// ==========================================
// 5. COMBOBOX CATALOGS & FORM ENHANCEMENTS
// ==========================================
function initComboboxCatalogs() {
  const floorSelect = document.getElementById("rfFloorSelect");
  if (floorSelect) {
    floorSelect.innerHTML = `<option value="">-- اختر الدور من القائمة --</option>` +
      inputCatalogs.floors.map(f => `<option value="${f}">${f}</option>`).join("");
  }

  const typeSelect = document.getElementById("rfType");
  if (typeSelect) {
    typeSelect.innerHTML = inputCatalogs.roomTypes.map(t => `<option value="${t.value}">${t.labelAr}</option>`).join("");
  }

  const bedSelect = document.getElementById("rfBedSelect");
  if (bedSelect) {
    bedSelect.innerHTML = `<option value="">-- اختر توزيع الأسرّة --</option>` +
      inputCatalogs.bedOptions.map(b => `<option value="${b}">${b}</option>`).join("");
  }

  const viewSelect = document.getElementById("rfViewSelect");
  if (viewSelect) {
    viewSelect.innerHTML = `<option value="">-- اختر نوع الإطلالة --</option>` +
      inputCatalogs.viewOptions.map(v => `<option value="${v}">${v}</option>`).join("");
  }

  const statusSelect = document.getElementById("rfStatus");
  if (statusSelect) {
    statusSelect.innerHTML = inputCatalogs.statusOptions.map(s => `<option value="${s.value}">${s.label}</option>`).join("");
  }

  const yerInput = document.getElementById("rfPriceYER");
  const sarInput = document.getElementById("rfPriceSAR");
  if (yerInput && sarInput) {
    yerInput.addEventListener("input", () => {
      const yer = parseFloat(yerInput.value);
      if (!isNaN(yer) && yer > 0) {
        sarInput.value = Math.round(yer / 155);
      }
    });
    sarInput.addEventListener("input", () => {
      const sar = parseFloat(sarInput.value);
      if (!isNaN(sar) && sar > 0) {
        yerInput.value = Math.round(sar * 155);
      }
    });
  }

  renderAmenitiesChecklist();
}

function renderAmenitiesChecklist(selectedList = []) {
  const container = document.getElementById("rfAmenitiesChecklist");
  if (!container) return;

  container.innerHTML = "";
  inputCatalogs.amenityCatalog.forEach(amenity => {
    const isChecked = selectedList.includes(amenity);
    const label = document.createElement("label");
    label.className = `amenity-checkbox-label ${isChecked ? 'checked' : ''}`;
    label.innerHTML = `
      <input type="checkbox" value="${amenity}" ${isChecked ? 'checked' : ''} onchange="toggleAmenityChip(this)">
      <span>${amenity}</span>
    `;
    container.appendChild(label);
  });
}

function toggleAmenityChip(checkbox) {
  const label = checkbox.closest(".amenity-checkbox-label");
  if (checkbox.checked) {
    label.classList.add("checked");
  } else {
    label.classList.remove("checked");
  }
}

function getSelectedAmenitiesFromChecklist() {
  const container = document.getElementById("rfAmenitiesChecklist");
  if (!container) return [];
  const checkedBoxes = container.querySelectorAll("input[type='checkbox']:checked");
  return Array.from(checkedBoxes).map(cb => cb.value);
}

// ==========================================
// 6. ROOMS MANAGER (CRUD WITH INSTANT PROPAGATION)
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
      <td>
        ${(r.priceYER && r.priceYER > 0 && !r.priceCustom) 
          ? `<span style="color:#c5a059; font-weight:800;">${r.priceYER.toLocaleString()} ر.ي</span><br><small>(${r.priceSAR} ر.س)</small>`
          : `<span class="badge badge-warning" style="font-size:0.82rem; padding:4px 10px; background:rgba(197,160,89,0.2); border-color:#c5a059; color:#dfbe7d;">حسب الطلب / أسعار خاصة</span>`}
      </td>
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
  document.getElementById("rfPriceYER").value = "0";
  document.getElementById("rfPriceSAR").value = "0";
  document.getElementById("rfCapacity").value = "شخصين";
  document.getElementById("rfFloorSelect").value = "الدور الثاني الفندقي";
  document.getElementById("rfBedSelect").value = "سرير مزدوج فاخر كبير";
  document.getElementById("rfViewSelect").value = "إطلالة على نسيم البحر والشارع السياحي الحيوي";
  document.getElementById("rfImage").value = "assets/room_twin.jpg";
  document.getElementById("rfStatus").value = "متاحة";

  const prevImg = document.getElementById("roomPreviewImg");
  if (prevImg) {
    prevImg.src = "assets/room_twin.jpg";
    prevImg.closest(".upload-preview-box").style.display = "flex";
  }

  renderAmenitiesChecklist(["تكييف سبليت مستمر 24 ساعة", "شاشة ذكية 55 بوصة", "إنترنت فايبر وستارلينك فائق السرعة", "ثلاجة ميني بار"]);
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
  document.getElementById("rfFloorSelect").value = room.floor;
  document.getElementById("rfBedSelect").value = room.beds;
  document.getElementById("rfViewSelect").value = room.view;
  document.getElementById("rfImage").value = room.image;
  document.getElementById("rfStatus").value = room.status;

  const prevImg = document.getElementById("roomPreviewImg");
  if (prevImg) {
    prevImg.src = room.image;
    prevImg.closest(".upload-preview-box").style.display = "flex";
  }

  renderAmenitiesChecklist(room.amenities || []);
  document.getElementById("roomEditModal").style.display = "flex";
}

function saveRoomForm(e) {
  e.preventDefault();
  const data = getHotelData();
  const idStr = document.getElementById("roomFormId").value;
  const isEdit = Boolean(idStr);

  const selectedAmenities = getSelectedAmenitiesFromChecklist();

  const newRoom = {
    id: isEdit ? parseInt(idStr) : Date.now(),
    nameAr: document.getElementById("rfNameAr").value.trim(),
    nameEn: document.getElementById("rfNameEn").value.trim() || document.getElementById("rfNameAr").value.trim(),
    type: document.getElementById("rfType").value,
    priceYER: parseInt(document.getElementById("rfPriceYER").value) || 0,
    priceSAR: parseInt(document.getElementById("rfPriceSAR").value) || 0,
    priceCustom: (parseInt(document.getElementById("rfPriceYER").value) || 0) <= 0,
    priceTextAr: "حسب الطلب / أسعار خاصة",
    priceTextEn: "Upon Request / Special Rates",
    capacity: document.getElementById("rfCapacity").value,
    floor: document.getElementById("rfFloorSelect").value || "الدور الثالث الفندقي",
    beds: document.getElementById("rfBedSelect").value || "سرير مريح",
    view: document.getElementById("rfViewSelect").value || "إطلالة بحرية",
    amenities: selectedAmenities.length > 0 ? selectedAmenities : ["تكييف 24h", "إنترنت فايبر وستارلينك"],
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
  showAdminToast(isEdit ? "تم تحديث وتطبيق بيانات الغرفة والأسعار مباشرة على الموقع!" : "تمت إضافة الغرفة ونشرها مباشرة على الموقع!");
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
  showAdminToast(`تم تحديث حالة (${room.nameAr}) إلى: ${room.status} فورياً!`);
}

function deleteRoom(id) {
  if (!confirm("هل أنت متأكد من حذف هذه الغرفة من النظام؟")) return;
  const data = getHotelData();
  data.rooms = data.rooms.filter(r => r.id !== id);
  saveHotelData(data);
  renderRoomsTable();
  renderDashboard();
  showAdminToast("تم حذف الغرفة وإزالتها مباشرة من الموقع!");
}

// ==========================================
// 7. USER MANAGEMENT & SECURITY
// ==========================================
function renderUsersManager() {
  const data = getHotelData();
  const users = data.adminUsers || [];
  const listEl = document.getElementById("adminUsersList");
  if (!listEl) return;

  listEl.innerHTML = "";
  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
      <div class="user-card-avatar">${u.avatar || '👤'}</div>
      <div class="user-card-details">
        <div style="display:flex; align-items:center; gap:8px;">
          <h4>${u.fullName}</h4>
          <span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">
            ${u.status === 'active' ? 'نشط' : 'معطل'}
          </span>
          <span class="badge badge-primary">${u.roleNameAr || u.role}</span>
        </div>
        <p>
          <strong>اسم المستخدم:</strong> <code style="color:#dfbe7d;">${u.username}</code> | 
          <strong>الهاتف:</strong> ${u.phone} | 
          <strong>البريد:</strong> ${u.email} | 
          <strong>آخر دخول:</strong> ${u.lastLogin || 'لم يسجل بعد'}
        </p>
      </div>
      <div class="user-card-actions">
        <button class="btn-admin" onclick="openChangePasswordModal(${u.id})" title="تغيير كلمة المرور">🔑 كلمة المرور</button>
        <button class="btn-admin btn-admin-secondary" onclick="openEditUserModal(${u.id})" title="تعديل المستخدم">✏️ تعديل</button>
        <button class="btn-admin btn-admin-danger" onclick="deleteUserAccount(${u.id})" title="حذف الحساب">🗑️</button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function openAddUserModal() {
  document.getElementById("userModalTitle").textContent = "إضافة مستخدم جديد للوحة التحكم";
  document.getElementById("userFormId").value = "";
  document.getElementById("ufUsername").value = "";
  document.getElementById("ufFullName").value = "";
  document.getElementById("ufEmail").value = "";
  document.getElementById("ufPhone").value = "";
  document.getElementById("ufPassword").value = "";
  document.getElementById("ufPassword").required = true;
  document.getElementById("ufRole").value = "receptionist";
  document.getElementById("ufStatus").value = "active";
  document.getElementById("ufAvatar").value = "👤";

  document.getElementById("userEditModal").style.display = "flex";
}

function openEditUserModal(userId) {
  const data = getHotelData();
  const u = data.adminUsers.find(item => item.id === userId);
  if (!u) return;

  document.getElementById("userModalTitle").textContent = "تعديل بيانات المستخدم";
  document.getElementById("userFormId").value = u.id;
  document.getElementById("ufUsername").value = u.username;
  document.getElementById("ufFullName").value = u.fullName;
  document.getElementById("ufEmail").value = u.email;
  document.getElementById("ufPhone").value = u.phone;
  document.getElementById("ufPassword").value = "";
  document.getElementById("ufPassword").required = false;
  document.getElementById("ufRole").value = u.role;
  document.getElementById("ufStatus").value = u.status;
  document.getElementById("ufAvatar").value = u.avatar || "👤";

  document.getElementById("userEditModal").style.display = "flex";
}

function saveUserForm(e) {
  e.preventDefault();
  const data = getHotelData();
  const idStr = document.getElementById("userFormId").value;
  const isEdit = Boolean(idStr);

  const roleValue = document.getElementById("ufRole").value;
  let roleTitle = "موظف استقبال";
  if (roleValue === "super_admin") roleTitle = "مدير النظام العام";
  else if (roleValue === "hotel_manager") roleTitle = "مدير الفندق";

  const passwordVal = document.getElementById("ufPassword").value;

  if (isEdit) {
    const idx = data.adminUsers.findIndex(u => u.id === parseInt(idStr));
    if (idx !== -1) {
      data.adminUsers[idx].fullName = document.getElementById("ufFullName").value.trim();
      data.adminUsers[idx].username = document.getElementById("ufUsername").value.trim();
      data.adminUsers[idx].email = document.getElementById("ufEmail").value.trim();
      data.adminUsers[idx].phone = document.getElementById("ufPhone").value.trim();
      data.adminUsers[idx].role = roleValue;
      data.adminUsers[idx].roleNameAr = roleTitle;
      data.adminUsers[idx].status = document.getElementById("ufStatus").value;
      data.adminUsers[idx].avatar = document.getElementById("ufAvatar").value || "👤";
      if (passwordVal) {
        data.adminUsers[idx].password = passwordVal;
      }
    }
  } else {
    const exists = data.adminUsers.some(u => u.username.toLowerCase() === document.getElementById("ufUsername").value.trim().toLowerCase());
    if (exists) {
      alert("اسم المستخدم هذا موجود مسبقاً! يرجى اختيار اسم مستخدم آخر.");
      return;
    }
    const newUser = {
      id: Date.now(),
      username: document.getElementById("ufUsername").value.trim(),
      fullName: document.getElementById("ufFullName").value.trim(),
      email: document.getElementById("ufEmail").value.trim(),
      phone: document.getElementById("ufPhone").value.trim(),
      password: passwordVal || "123456",
      role: roleValue,
      roleNameAr: roleTitle,
      status: document.getElementById("ufStatus").value,
      avatar: document.getElementById("ufAvatar").value || "👤",
      lastLogin: "لم يسجل بعد"
    };
    data.adminUsers.push(newUser);
  }

  saveHotelData(data);
  document.getElementById("userEditModal").style.display = "none";
  renderUsersManager();
  renderDashboard();
  showAdminToast(isEdit ? "تم تحديث حساب المستخدم!" : "تمت إضافة المستخدم بنجاح!");
}

function deleteUserAccount(userId) {
  const data = getHotelData();
  if (data.adminUsers.length <= 1) {
    alert("لا يمكن حذف المستخدم الوحيد المتبقي في النظام!");
    return;
  }
  const target = data.adminUsers.find(u => u.id === userId);
  if (!target) return;

  if (target.role === "super_admin") {
    const superCount = data.adminUsers.filter(u => u.role === "super_admin").length;
    if (superCount <= 1) {
      alert("لا يمكن حذف مدير النظام العام الوحيد!");
      return;
    }
  }

  if (confirm(`هل أنت متأكد من حذف حساب (${target.fullName}) نهائياً؟`)) {
    data.adminUsers = data.adminUsers.filter(u => u.id !== userId);
    saveHotelData(data);
    renderUsersManager();
    renderDashboard();
    showAdminToast("تم حذف الحساب بنجاح!");
  }
}

let targetPasswordUserId = null;

function openChangePasswordModal(userId) {
  targetPasswordUserId = userId;
  const data = getHotelData();
  const u = data.adminUsers.find(item => item.id === userId);
  if (!u) return;

  document.getElementById("cpUserNameTitle").textContent = `${u.fullName} (${u.username})`;
  document.getElementById("cpNewPassword").value = "";
  document.getElementById("cpConfirmPassword").value = "";
  document.getElementById("changePasswordModal").style.display = "flex";
}

function saveChangePasswordForm(e) {
  e.preventDefault();
  const p1 = document.getElementById("cpNewPassword").value;
  const p2 = document.getElementById("cpConfirmPassword").value;

  if (p1 !== p2) {
    alert("كلمتا المرور غير متطابقتين! يرجى إعادة الإدخال.");
    return;
  }
  if (p1.length < 4) {
    alert("كلمة المرور يجب أن لا تقل عن 4 خانات!");
    return;
  }

  const data = getHotelData();
  const u = data.adminUsers.find(item => item.id === targetPasswordUserId);
  if (u) {
    u.password = p1;
    saveHotelData(data);
    document.getElementById("changePasswordModal").style.display = "none";
    showAdminToast(`تم تغيير كلمة المرور للمستخدم (${u.fullName}) بنجاح!`);
  }
}

// ==========================================
// 8. DESIGN STUDIO
// ==========================================
function renderDesignStudio() {
  const data = getHotelData();
  const d = data.design || defaultDesignSettings;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  setVal("dsPrimaryGold", d.primaryGold || "#c5a059");
  setVal("dsGoldLight", d.goldLight || "#dfbe7d");
  setVal("dsOceanBlue", d.oceanBlue || "#1e60c4");
  setVal("dsBgBodyDark", d.bgBodyDark || "#07132c");
  setVal("dsBgCardDark", d.bgCardDark || "#0d1e3d");
  setVal("dsWhatsappGreen", d.whatsappGreen || "#25d366");
  setVal("dsFontFamily", d.fontFamily || "Tajawal");
  setVal("dsBorderRadius", d.borderRadius || "18px");

  const sec = d.sections || {};
  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val !== false;
  };

  setCheck("secToggleHero", sec.hero);
  setCheck("secToggleMetrics", sec.metrics);
  setCheck("secToggleExtensions", sec.extensions);
  setCheck("secToggleAbout", sec.about);
  setCheck("secToggleRooms", sec.rooms);
  setCheck("secToggleVip", sec.vip);
  setCheck("secToggleAmenities", sec.services);
  setCheck("secToggleGallery", sec.gallery);
  setCheck("secToggleReviews", sec.reviews);
  setCheck("secToggleContact", sec.contact);

  updateDesignLivePreview();
}

function updateDesignLivePreview() {
  const gold = document.getElementById("dsPrimaryGold")?.value || "#c5a059";
  const radius = document.getElementById("dsBorderRadius")?.value || "18px";
  const font = document.getElementById("dsFontFamily")?.value || "Tajawal";

  const prevBox = document.getElementById("dsPreviewSampleBox");
  if (prevBox) {
    prevBox.style.borderColor = gold;
    prevBox.style.borderRadius = radius;
    prevBox.style.fontFamily = `'${font}', sans-serif`;

    const btn = prevBox.querySelector(".ds-preview-btn");
    if (btn) {
      btn.style.background = gold;
      btn.style.borderRadius = radius;
    }
    const badge = prevBox.querySelector(".ds-preview-badge");
    if (badge) {
      badge.style.borderColor = gold;
      badge.style.color = gold;
    }
  }
}

function saveDesignStudioSettings(e) {
  e.preventDefault();
  const data = getHotelData();

  data.design = {
    primaryGold: document.getElementById("dsPrimaryGold").value,
    goldLight: document.getElementById("dsGoldLight").value,
    oceanBlue: document.getElementById("dsOceanBlue").value,
    oceanBlueHover: document.getElementById("dsOceanBlue").value,
    bgBodyDark: document.getElementById("dsBgBodyDark").value,
    bgCardDark: document.getElementById("dsBgCardDark").value,
    whatsappGreen: document.getElementById("dsWhatsappGreen").value,
    fontFamily: document.getElementById("dsFontFamily").value,
    borderRadius: document.getElementById("dsBorderRadius").value,
    sections: {
      hero: document.getElementById("secToggleHero").checked,
      metrics: document.getElementById("secToggleMetrics").checked,
      extensions: document.getElementById("secToggleExtensions").checked,
      about: document.getElementById("secToggleAbout").checked,
      rooms: document.getElementById("secToggleRooms").checked,
      vip: document.getElementById("secToggleVip").checked,
      services: document.getElementById("secToggleAmenities").checked,
      gallery: document.getElementById("secToggleGallery").checked,
      reviews: document.getElementById("secToggleReviews").checked,
      contact: document.getElementById("secToggleContact").checked
    }
  };

  saveHotelData(data);
  showAdminToast("تم حفظ ونشر تخصيصات التصميم مباشرة على كامل الموقع!");
}

function resetDesignStudioToDefault() {
  if (confirm("هل ترغب بإعادة تعيين ألوان وتصميم الموقع إلى الهوية الافتراضية؟")) {
    const data = getHotelData();
    data.design = defaultDesignSettings;
    saveHotelData(data);
    renderDesignStudio();
    showAdminToast("تمت استعادة التصميم الافتراضي الأصلي وتطبيقه!");
  }
}

// ==========================================
// 9. BOOKINGS MANAGER
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
// 10. CONTENT & SETTINGS MANAGER
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

  data.config.nameAr = document.getElementById("cfgNameAr").value.trim();
  data.config.nameEn = document.getElementById("cfgNameEn").value.trim();
  data.config.phone = document.getElementById("cfgPhone").value.trim();
  data.config.whatsapp = document.getElementById("cfgWhatsApp").value.trim();
  data.config.whatsappClean = document.getElementById("cfgWhatsApp").value.replace(/[^0-9]/g, "");
  data.config.email = document.getElementById("cfgEmail").value.trim();
  data.config.addressAr = document.getElementById("cfgAddressAr").value.trim();
  data.config.roomsCount = parseInt(document.getElementById("cfgRoomsCount").value) || 72;

  if (data.config.extensions && data.config.extensions.length >= 2) {
    data.config.extensions[0].number = document.getElementById("cfgExt701").value.trim();
    data.config.extensions[1].number = document.getElementById("cfgExt444").value.trim();
  }

  saveHotelData(data);
  showAdminToast("تم حفظ كافة إعدادات الفندق وتطبيقها مباشرة على كافة الصفحات!");
}

// ==========================================
// 11. GALLERY & REVIEWS MANAGERS
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

function openAddGalleryModal() {
  document.getElementById("galleryTitleInput").value = "";
  document.getElementById("galleryImgInput").value = "assets/building.jpg";
  document.getElementById("galleryCategoryInput").value = "rooms";
  const prev = document.getElementById("galleryPreviewImg");
  if (prev) {
    prev.src = "assets/building.jpg";
    prev.closest(".upload-preview-box").style.display = "flex";
  }
  document.getElementById("galleryUploadModal").style.display = "flex";
}

function saveGalleryUploadForm(e) {
  e.preventDefault();
  const title = document.getElementById("galleryTitleInput").value.trim();
  const imgUrl = document.getElementById("galleryImgInput").value.trim();
  const cat = document.getElementById("galleryCategoryInput").value;

  if (!title || !imgUrl) {
    alert("يرجى ملء جميع الحقول المطلوبة!");
    return;
  }

  const data = getHotelData();
  data.gallery.push({
    id: Date.now(),
    titleAr: title,
    titleEn: title,
    category: cat,
    image: imgUrl
  });

  saveHotelData(data);
  document.getElementById("galleryUploadModal").style.display = "none";
  renderGalleryManager();
  showAdminToast("تمت إضافة الصورة ونشرها في معرض الموقع مباشرة!");
}

function deleteGalleryItem(id) {
  if (!confirm("هل ترغب بحذف هذه الصورة من المعرض؟")) return;
  const data = getHotelData();
  data.gallery = data.gallery.filter(g => g.id !== id);
  saveHotelData(data);
  renderGalleryManager();
  showAdminToast("تم حذف الصورة وتحديث المعرض مباشرة!");
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
  showAdminToast("تم حذف التقييم وتحديث الموقع مباشرة!");
}

// ==========================================
// 12. GITHUB PAGES CLOUD PUBLISHER & SYNC (النشر السحابي المباشر)
// ==========================================
function initPublishingSettings() {
  const repoEl = document.getElementById("ghRepoInput");
  const branchEl = document.getElementById("ghBranchInput");
  const tokenEl = document.getElementById("ghTokenInput");

  if (repoEl) repoEl.value = localStorage.getItem("rose1_gh_repo") || "pronetcomputer/RoseAdenHotel-1";
  if (branchEl) branchEl.value = localStorage.getItem("rose1_gh_branch") || "main";
  if (tokenEl) tokenEl.value = localStorage.getItem("rose1_gh_token") || "";
}

async function publishDataToGitHubPages() {
  const repo = document.getElementById("ghRepoInput")?.value.trim() || "pronetcomputer/RoseAdenHotel-1";
  const branch = document.getElementById("ghBranchInput")?.value.trim() || "main";
  const token = document.getElementById("ghTokenInput")?.value.trim();

  const statusBox = document.getElementById("ghPublishStatusBox");
  if (!statusBox) return;

  statusBox.style.display = "block";
  statusBox.innerHTML = `⏳ جاري تجهيز البيانات وحساب التشفير للاتصال بـ GitHub API...`;

  // حفظ الإعدادات للاستخدام المستقبلي
  localStorage.setItem("rose1_gh_repo", repo);
  localStorage.setItem("rose1_gh_branch", branch);
  if (token) localStorage.setItem("rose1_gh_token", token);

  const data = getHotelData();
  const jsonString = JSON.stringify(data, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

  if (!token) {
    statusBox.innerHTML = `
      <div style="color:#fbbf24; font-weight:800; margin-bottom:8px;">⚠️ تنبيه: لم يتم إدخال رمز الوصول الشخصي (GitHub Personal Access Token)</div>
      <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:10px;">تم تطبيق التعديلات بنجاح محلياً ولحظياً في هذا المتصفح. للنشر التلقائي عبر GitHub API مباشرة إلى المستودع، يرجى إدخال الرمز، أو تنزيل ملف <code>data.json</code> ورفعه للمستودع بنقرة واحدة أدناه.</p>
      <button class="btn-admin" onclick="exportDataAsJSON()">📥 تنزيل ملف data.json المحدث لرفعه للمستودع</button>
    `;
    return;
  }

  try {
    statusBox.innerHTML = `🔄 جاري الاستعلام عن حالة ملف data.json في مستودع (${repo})...`;

    // 1. Get current SHA of data.json if exists
    let sha = null;
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json?ref=${branch}`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (getRes.ok) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    // 2. Put file with commit
    statusBox.innerHTML = `🚀 جاري إرسال البيانات المحدثة وعمل Commit ونشرها على GitHub Pages...`;

    const putBody = {
      message: `chore: update hotel data and rooms from admin panel (${new Date().toLocaleString("ar-YE")})`,
      content: base64Content,
      branch: branch
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(putBody)
    });

    if (putRes.ok) {
      const putResult = await putRes.json();
      statusBox.innerHTML = `
        <div style="color:#34d399; font-weight:900; font-size:1.1rem; margin-bottom:6px;">
          🎉 تم النشر السحابي المباشر بنجاح على GitHub Pages!
        </div>
        <div style="font-size:0.85rem; color:#cbd5e1;">
          تم تسجيل الـ Commit برقم: <code>${putResult.commit.sha.substring(0, 7)}</code><br>
          ستظهر التعديلات لجميع الزوار عالمياً على: <a href="https://${repo.split('/')[0]}.github.io/${repo.split('/')[1]}/" target="_blank" style="color:#38bdf8;">https://${repo.split('/')[0]}.github.io/${repo.split('/')[1]}/</a> خلال لحظات.
        </div>
      `;
      showAdminToast("تم النشر السحابي المباشر بنجاح على GitHub Pages!");
    } else {
      const errJson = await putRes.json();
      statusBox.innerHTML = `
        <div style="color:#f87171; font-weight:800;">❌ تعذر إتمام النشر عبر GitHub API:</div>
        <div style="font-size:0.85rem; color:#fca5a5; margin-top:4px;">${errJson.message || 'يرجى التحقق من صلاحيات رمز الوصول Token واسم المستودع.'}</div>
        <div style="margin-top:10px;">
          <button class="btn-admin" onclick="exportDataAsJSON()">📥 تنزيل data.json ورفعه يدوياً</button>
        </div>
      `;
    }
  } catch (err) {
    statusBox.innerHTML = `<div style="color:#f87171;">خطأ في الاتصال: ${err.message}</div>`;
  }
}

// ==========================================
// 13. BACKUP & RESTORE
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
        alert("تم استيراد كافة البيانات وتطبيقها فورياً على جميع صفحات الموقع!");
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
    alert("تمت إعادة تعيين البيانات وتطبيقها فورياً على الموقع العام!");
    window.location.reload();
  }
}

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
  }, 4000);
}
