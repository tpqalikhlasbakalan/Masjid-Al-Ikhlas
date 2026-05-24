import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Users, Gift, Heart, UserCheck, Settings, 
  Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, KeyRound, User, Eye, EyeOff, UserPlus, FileText,
  Phone, Send, BellRing, Smartphone, Menu, RefreshCw, Database, Download, CloudOff, CloudUpload
} from 'lucide-react';

// ====================================================================
// CONFIGURATION GOOGLE SHEETS API
// ====================================================================
const GOOGLE_SHEETS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlT-MtuAXW_wl-KnFnqUkhX4fPf6YIyXNMPTE4Syi66_uDhxGiKVVK9_imo25DpRCm/exec"; 

// === SEED DATA AWAL ===
const INITIAL_LOKASI = { provinsi: "Jawa Timur", kabupaten: "Lamongan", kecamatan: "Tikung", desa: "Bakalan", latitude: -7.1126, longitude: 112.4150 };
const WILAYAH_OPTIONS = [
  { rt: "01", rw: "01", label: "RT 01 / RW 01" }, { rt: "02", rw: "01", label: "RT 02 / RW 01" }, { rt: "03", rw: "01", label: "RT 03 / RW 01" },
  { rt: "01", rw: "02", label: "RT 01 / RW 02" }, { rt: "02", rw: "02", label: "RT 02 / RW 02" }, { rt: "03", rw: "02", label: "RT 03 / RW 02" }
];
const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

const INITIAL_ROLES = {
  Admin: { label: "Super Admin", access: { dashboard: "edit", petugas: "edit", jamaah: "edit", fitrah: "edit", zuru: "edit", qurban: "edit", rbac: "edit" } },
  Takmir: { label: "Takmir Masjid", access: { dashboard: "view", petugas: "edit", jamaah: "edit", fitrah: "edit", zuru: "edit", qurban: "view", rbac: "none" } },
  RT: { label: "Ketua RT", access: { dashboard: "view", petugas: "none", jamaah: "edit", fitrah: "edit", zuru: "edit", qurban: "edit", rbac: "none" } },
  Amil: { label: "Amil Zakat", access: { dashboard: "view", petugas: "none", jamaah: "edit", fitrah: "edit", zuru: "edit", qurban: "edit", rbac: "none" } },
  Petugas: { label: "Petugas Jumat", access: { dashboard: "view", petugas: "view", jamaah: "none", fitrah: "none", zuru: "none", qurban: "none", rbac: "none" } },
  Jamaah: { label: "Jama'ah / Warga", access: { dashboard: "view", petugas: "view", jamaah: "none", fitrah: "view", zuru: "view", qurban: "view", rbac: "none" } }
};

const INITIAL_USER_DATABASE = {
  "admin": { password: "admin123", roles: ["Admin"], label: "Super Admin", approved: true },
  "takmir": { password: "takmir123", roles: ["Takmir"], label: "Takmir Masjid", approved: true },
  "rt01": { password: "rt123", roles: ["RT"], label: "Ketua RT 01", approved: true },
  "amil": { password: "amil123", roles: ["Amil"], label: "Amil Zakat", approved: true },
  "jamaah": { password: "jamaah123", roles: ["Jamaah"], label: "Jama'ah / Warga", approved: true },
  "khsyukron": { password: "petugas123", roles: ["Petugas"], label: "KH. Syukron Ma'mun", approved: true },
  "ahmadhafiz": { password: "petugas123", roles: ["Petugas"], label: "Ustadz Ahmad Al-Hafiz", approved: true },
  "bilalhanafi": { password: "petugas123", roles: ["Petugas"], label: "Bilal Hanafi", approved: true },
  "soleh": { password: "petugas123", roles: ["Petugas"], label: "Soleh", approved: true }
};

const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "Sedang", zuru: "Sedang", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" }
];

const INITIAL_PETUGAS_ABADI = {
  Legi: { khatib: "KH. Syukron Ma'mun", imam: "Ustadz Ahmad Al-Hafiz", muadzin: "Bilal Hanafi", bilal: "Soleh", telp: "081234567890" },
  Pahing: { khatib: "Prof. Dr. KH. Said Aqil", imam: "Ustadz Hasanuddin", muadzin: "Zainal Abidin", bilal: "Rudi Yulianto", telp: "081398765432" },
  Pon: { khatib: "Ustadz Adi Hidayat, Lc", imam: "Ustadz Sholihuddin", muadzin: "H. Abdul Qodir", bilal: "Slamet", telp: "085711223344" },
  Wage: { khatib: "KH. Anwar Zahid", imam: "Ustadz Abdurrahman", muadzin: "Supardi", bilal: "Mulyono", telp: "089988776655" },
  Kliwon: { khatib: "KH. Bahauddin Nursalim (Gus Baha)", imam: "Ustadz Hasan Al-Banna", muadzin: "M. Thoriq", bilal: "Sidiq Prasetyo", telp: "082144332211" }
};

// ====================================================================
// STATIC COMPONENTS & HELPERS
// ====================================================================
const KubahMasjidIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" strokeWidth="3" />
    <path d="M50 15C42 28 32 35 32 55C32 65 35 72 50 72C65 72 68 65 68 55C68 35 58 28 50 15Z" fill="#10b981" />
    <path d="M50 10V15" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="8" r="2.5" fill="#f59e0b" />
    <path d="M48 6C49 5 52 5 53 6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <text x="50" y="58" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">M I</text>
    <path d="M45 72V64C45 61.5 47.5 59 50 59C52.5 59 55 61.5 55 64V72" fill="#047857" />
  </svg>
);

const migrateRolesConfig = (savedConfig) => {
  if (!savedConfig || typeof savedConfig !== 'object' || !savedConfig.Admin || Array.isArray(savedConfig.Admin.access)) return INITIAL_ROLES;
  return savedConfig;
};

const getLocalStorageData = (key, fallbackValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null") return fallbackValue;
    try { 
      const parsed = JSON.parse(saved); 
      // Proteksi anti-crash dari injeksi Objek React
      if (parsed !== null && typeof parsed === 'object') {
        if (parsed.$$typeof || (!Array.isArray(parsed) && (key === "masjidName" || key === "masjidLogoUrl"))) {
          localStorage.removeItem(key);
          return fallbackValue;
        }
      }
      if (key === "rolesConfig") return migrateRolesConfig(parsed);
      return parsed;
    } catch (e) {
      return typeof fallbackValue === 'string' ? saved : fallbackValue;
    }
  } catch (error) { 
    return fallbackValue; 
  }
};

function getMockJadwal(kab, lat, lon) {
  let offset = 0;
  if (lat && lon) {
    const coordHash = Math.abs(Math.round((parseFloat(lat) + parseFloat(lon)) * 105));
    offset = coordHash % 15;
  }
  return {
    Subuh: `04:${(15 + offset).toString().padStart(2, '0')}`, Terbit: `05:${(30 + offset).toString().padStart(2, '0')}`,
    Dzuhur: `11:${(35 + offset).toString().padStart(2, '0')}`, Ashar: `14:${(55 + offset).toString().padStart(2, '0')}`,
    Maghrib: `17:${(30 + offset).toString().padStart(2, '0')}`, Isya: `18:${(45 + offset).toString().padStart(2, '0')}`
  };
}

function getPasaranJawaLocal(date) {
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(dateUTC / msPerDay);
  let pasaranIndex = (diffDays + 3) % 5;
  if (pasaranIndex < 0) pasaranIndex += 5;
  return PASARAN_LIST[pasaranIndex];
}

function getUpcomingFridaysLocal(currentTime, petugasAbadi, count = 5) {
  const fridays = [];
  const tempDate = new Date(currentTime);
  const dayOfWeek = tempDate.getDay();
  let daysToFriday = (5 - dayOfWeek + 7) % 7;
  if (daysToFriday === 0 && tempDate.getHours() >= 18) daysToFriday = 7;
  tempDate.setDate(tempDate.getDate() + daysToFriday);
  
  for (let i = 0; i < count; i++) {
    const target = new Date(tempDate);
    const pasaran = getPasaranJawaLocal(target);
    fridays.push({
      formattedDate: target.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      rawDate: new Date(target), pasaran: pasaran, petugas: petugasAbadi[pasaran] || {}
    });
    tempDate.setDate(tempDate.getDate() + 7);
  }
  return fridays;
}

function createWAShareLink(masjidName, title, rtTitle, summaryText) {
  const message = `*${String(masjidName)}*\n\n📝 *${title}*\nWilayah: ${rtTitle}\nTanggal: ${new Date().toLocaleDateString('id-ID')}\n\n${summaryText}\n\n_Dokumen cetak tersedia di pengurus._`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// ====================================================================
// MAIN COMPONENT APP
// ====================================================================
export default function App() {
  // === 1. STATES INITIALIZATION DENGAN VALIDASI TIPE KETAT ===
  const [masjidName, setMasjidName] = useState(() => {
    const d = getLocalStorageData("masjidName", "Masjid Al-Ikhlas Bakalan");
    return typeof d === 'string' ? d : "Masjid Al-Ikhlas Bakalan";
  });
  const [masjidLogoUrl, setMasjidLogoUrl] = useState(() => {
    const d = getLocalStorageData("masjidLogoUrl", "");
    return typeof d === 'string' ? d : "";
  });

  const [tempMasjidName, setTempMasjidName] = useState(masjidName);
  const [tempMasjidLogoUrl, setTempMasjidLogoUrl] = useState(masjidLogoUrl);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserRoles, setCurrentUserRoles] = useState(["Admin"]);
  const [currentUserLabel, setCurrentUserLabel] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  
  const [rolesConfig, setRolesConfig] = useState(() => {
    const d = getLocalStorageData("rolesConfig", INITIAL_ROLES);
    return d && typeof d === 'object' && !Array.isArray(d) ? migrateRolesConfig(d) : INITIAL_ROLES;
  });
  const [userDatabase, setUserDatabase] = useState(() => {
    const d = getLocalStorageData("userDatabase", INITIAL_USER_DATABASE);
    return d && typeof d === 'object' && !Array.isArray(d) ? d : INITIAL_USER_DATABASE;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [regLabel, setRegLabel] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");
  const [newAccRole, setNewAccRole] = useState("Jamaah");
  const [newAccLabel, setNewAccLabel] = useState("");

  const [editingUserRoles, setEditingUserRoles] = useState(null); 
  const [editingAccountPassword, setEditingAccountPassword] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const [lokasi, setLokasi] = useState(() => {
    const d = getLocalStorageData("lokasi", INITIAL_LOKASI);
    return d && typeof d === 'object' && !Array.isArray(d) ? d : INITIAL_LOKASI;
  });
  const [isSettingLokasi, setIsSettingLokasi] = useState(false);
  const [tempLokasi, setTempLokasi] = useState(lokasi);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [petugasAbadi, setPetugasAbadi] = useState(() => {
    const d = getLocalStorageData("petugasAbadi", INITIAL_PETUGAS_ABADI);
    return d && typeof d === 'object' && !Array.isArray(d) ? d : INITIAL_PETUGAS_ABADI;
  });
  const [editingPasaran, setEditingPasaran] = useState(null);
  const [pasaranForm, setPasaranForm] = useState({ khatib: "", imam: "", muadzin: "", bilal: "", telp: "" });

  const [activeNotificationSim, setActiveNotificationSim] = useState(null);
  const [notificationType, setNotificationType] = useState("WA"); 
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [isSimulatedThursday, setIsSimulatedThursday] = useState(false);
  const [isDutyDismissed, setIsDutyDismissed] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  const [jamaahList, setJamaahList] = useState(() => {
    const d = getLocalStorageData("jamaahList", INITIAL_JAMAAH);
    return Array.isArray(d) ? d : INITIAL_JAMAAH;
  });
  const [filterWilayahJamaah, setFilterWilayahJamaah] = useState("Semua");

  const [timbanganFitrah, setTimbanganFitrah] = useState(() => {
    const d = getLocalStorageData("timbanganFitrah", [25, 50, 15, 30]);
    return Array.isArray(d) ? d : [25, 50, 15, 30];
  });
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  const [alokasiFitrah, setAlokasiFitrah] = useState(() => {
    const def = { "Berat": 5.0, "Sedang": 3.0, "Ringan": 1.5, "Muzakki": 0.0, "GuruNgaji": 5.0 };
    const d = getLocalStorageData("alokasiFitrah", def);
    return d && typeof d === 'object' && !Array.isArray(d) ? { ...def, ...d } : def;
  });
  const [tempAlokasiFitrah, setTempAlokasiFitrah] = useState(alokasiFitrah);

  const [timbanganZuru, setTimbanganZuru] = useState(() => {
    const d = getLocalStorageData("timbanganZuru", [120, 250, 80]);
    return Array.isArray(d) ? d : [120, 250, 80];
  });
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  const [alokasiZuru, setAlokasiZuru] = useState(() => {
    const def = { "Berat": 15.0, "Sedang": 10.0, "Ringan": 5.0, "Bukan Mustahik": 0.0, "GuruNgaji": 15.0 };
    const d = getLocalStorageData("alokasiZuru", def);
    return d && typeof d === 'object' && !Array.isArray(d) ? { ...def, ...d } : def;
  });
  const [tempAlokasiZuru, setTempAlokasiZuru] = useState(alokasiZuru);

  const [timbanganQurbanSapi, setTimbanganQurbanSapi] = useState(() => {
    const d = getLocalStorageData("timbanganQurbanSapi", [85.5, 120.0, 95.0, 65.5]);
    return Array.isArray(d) ? d : [85.5, 120.0, 95.0, 65.5];
  });
  const [timbanganQurbanKambing, setTimbanganQurbanKambing] = useState(() => {
    const d = getLocalStorageData("timbanganQurbanKambing", [22.0, 18.5, 25.0]);
    return Array.isArray(d) ? d : [22.0, 18.5, 25.0];
  });
  const [tempBeratQurbanSapi, setTempBeratQurbanSapi] = useState("");
  const [tempBeratQurbanKambing, setTempBeratQurbanKambing] = useState("");
  
  const [qurbanTamu, setQurbanTamu] = useState(() => {
    const def = { jumlah: 0, jatahSapi: 0.0, jatahKambing: 0.0 };
    const d = getLocalStorageData("qurbanTamu", def);
    return d && typeof d === 'object' && !Array.isArray(d) ? { ...def, ...d } : def;
  });
  const [qurbanSahibul, setQurbanSahibul] = useState(() => {
    const def = { sapi: 0.0, kambing: 0.0 };
    const d = getLocalStorageData("qurbanSahibul", def);
    return d && typeof d === 'object' && !Array.isArray(d) ? { ...def, ...d } : def;
  });
  const [tempQurbanTamu, setTempQurbanTamu] = useState(qurbanTamu);
  const [tempQurbanSahibul, setTempQurbanSahibul] = useState(qurbanSahibul);
  
  const [filterWilayahQurban, setFilterWilayahQurban] = useState("Semua");
  const [selectedPrintWilayahQurban, setSelectedPrintWilayahQurban] = useState("Semua");
  const [selectedPrintWilayahFitrah, setSelectedPrintWilayahFitrah] = useState("Semua");
  const [selectedPrintWilayahZuru, setSelectedPrintWilayahZuru] = useState("Semua");
  const [qurbanHanyaMustahik, setQurbanHanyaMustahik] = useState(false);

  const [selectedPrintWilayah, setSelectedPrintWilayah] = useState("Semua");
  const [showJamaahModal, setShowJamaahModal] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState(null);
  const [jamaahForm, setJamaahForm] = useState({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false });

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => getLocalStorageData("googleSheetsUrl", GOOGLE_SHEETS_SCRIPT_URL));
  const [syncStatus, setSyncStatus] = useState("Tersinkronisasi Lokal");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);
  
  // State Konflik Data Sinkronisasi Cloud vs Lokal
  const [syncConflict, setSyncConflict] = useState(null); 

  const [printIframeData, setPrintIframeData] = useState(null);
  
  const [jadwalSholat, setJadwalSholat] = useState(() => {
    const def = { Subuh: "04:15", Terbit: "05:30", Dzuhur: "11:35", Ashar: "14:55", Maghrib: "17:30", Isya: "18:45" };
    const d = getLocalStorageData("jadwalSholatAktif", def);
    return d && typeof d === 'object' && !Array.isArray(d) ? d : def;
  });

  const [rawBackupInput, setRawBackupInput] = useState("");

  // === 2. HELPER FUNCTIONS INSIDE COMPONENT ===
  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: String(message), type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const playAlarmSound = () => {
    try {
      const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);
      const playBeep = (delay, duration, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + delay + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      playBeep(0.0, 0.25, 880); playBeep(0.3, 0.25, 880); playBeep(0.6, 0.25, 880); playBeep(1.0, 0.40, 1100);
      addNotification("🔊 Bunyi alarm disimulasikan!", "success");
    } catch (e) { console.warn("Audio Context diblokir peramban."); }
  };

  const renderMasjidLogo = (imgClassName, fallbackClassName) => {
    if (typeof masjidLogoUrl === 'string' && masjidLogoUrl.trim() !== "") {
      return ( 
        <img src={masjidLogoUrl} alt="Logo Masjid" className={imgClassName} onError={() => { addNotification("Logo kustom gagal dimuat!", "error"); setMasjidLogoUrl(""); }} /> 
      );
    }
    return <KubahMasjidIcon className={fallbackClassName} />;
  };

  const hasAccess = (tabName) => {
    if (!rolesConfig || !currentUserRoles || currentUserRoles.length === 0) return false;
    if (currentUserRoles.includes("Admin")) return true;
    return currentUserRoles.some(role => {
      const acc = rolesConfig[role]?.access?.[tabName];
      return acc === "view" || acc === "edit";
    });
  };

  const updateRoleAccess = (role, menuId, newAccess) => {
    setRolesConfig(prev => ({ ...prev, [role]: { ...prev[role], access: { ...prev[role].access, [menuId]: newAccess } } }));
    addNotification("Hak akses diubah.", "success");
  };

  const navigateTo = (tabName) => {
    if (hasAccess(tabName)) { setActiveTab(tabName); setIsMenuOpen(false); } 
    else { addNotification("Akses Ditolak! Peran Anda tidak memiliki hak.", "error"); }
  };

  const getNextSholat = () => {
    const nowStr = currentTime.toTimeString().split(' ')[0].substring(0, 5); 
    const sholatTimes = Object.entries(jadwalSholat).filter(([k]) => k !== 'Terbit');
    for (let [name, time] of sholatTimes) { if (String(time) > nowStr) return { name: String(name), time: String(time) }; }
    return { name: "Subuh (Besok)", time: String(sholatTimes[0][1] || "04:15") };
  };

  const getPetugasTugasBesok = () => {
    const isKamis = currentTime.getDay() === 4;
    let targetDate = null;
    if (isKamis) {
      targetDate = new Date(currentTime); targetDate.setDate(targetDate.getDate() + 1); 
    } else if (isSimulatedThursday) {
      targetDate = new Date(currentTime);
      const daysToFriday = (5 - targetDate.getDay() + 7) % 7;
      targetDate.setDate(targetDate.getDate() + daysToFriday);
    }
    if (!targetDate || isDutyDismissed) return null;

    const pasaranBesok = getPasaranJawaLocal(targetDate);
    const petugasBesok = petugasAbadi[pasaranBesok];

    if (petugasBesok && currentUserLabel) {
      const peranan = [];
      if (petugasBesok.khatib === currentUserLabel) peranan.push("KHATIB");
      if (petugasBesok.imam === currentUserLabel) peranan.push("IMAM");
      if (petugasBesok.muadzin === currentUserLabel) peranan.push("MUADZIN");
      if (petugasBesok.bilal === currentUserLabel) peranan.push("BILAL");
      if (peranan.length > 0) return { pasaran: pasaranBesok, tanggal: targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), peran: peranan.join(" & ") };
    }
    return null;
  };

  // === 3. EFFECTS ===
  useEffect(() => {
    const handleMessage = (event) => { if (event.data === 'CLOSE_PRINT_FRAME') setPrintIframeData(null); };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => { localStorage.setItem("masjidName", JSON.stringify(masjidName)); }, [masjidName]);
  useEffect(() => { localStorage.setItem("masjidLogoUrl", JSON.stringify(masjidLogoUrl)); }, [masjidLogoUrl]);
  useEffect(() => { localStorage.setItem("userDatabase", JSON.stringify(userDatabase)); }, [userDatabase]);
  useEffect(() => { localStorage.setItem("rolesConfig", JSON.stringify(rolesConfig)); }, [rolesConfig]);
  useEffect(() => { localStorage.setItem("lokasi", JSON.stringify(lokasi)); }, [lokasi]); 
  useEffect(() => { localStorage.setItem("petugasAbadi", JSON.stringify(petugasAbadi)); }, [petugasAbadi]);
  useEffect(() => { localStorage.setItem("jamaahList", JSON.stringify(jamaahList)); }, [jamaahList]);
  useEffect(() => { localStorage.setItem("timbanganFitrah", JSON.stringify(timbanganFitrah)); }, [timbanganFitrah]);
  useEffect(() => { localStorage.setItem("alokasiFitrah", JSON.stringify(alokasiFitrah)); }, [alokasiFitrah]);
  useEffect(() => { localStorage.setItem("timbanganZuru", JSON.stringify(timbanganZuru)); }, [timbanganZuru]);
  useEffect(() => { localStorage.setItem("alokasiZuru", JSON.stringify(alokasiZuru)); }, [alokasiZuru]);
  useEffect(() => { localStorage.setItem("timbanganQurbanSapi", JSON.stringify(timbanganQurbanSapi)); }, [timbanganQurbanSapi]);
  useEffect(() => { localStorage.setItem("timbanganQurbanKambing", JSON.stringify(timbanganQurbanKambing)); }, [timbanganQurbanKambing]);
  useEffect(() => { localStorage.setItem("qurbanTamu", JSON.stringify(qurbanTamu)); }, [qurbanTamu]);
  useEffect(() => { localStorage.setItem("qurbanSahibul", JSON.stringify(qurbanSahibul)); }, [qurbanSahibul]);

  useEffect(() => { setTempMasjidName(masjidName); }, [masjidName]);
  useEffect(() => { setTempMasjidLogoUrl(masjidLogoUrl); }, [masjidLogoUrl]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentDay = currentTime.getDate();
  useEffect(() => {
    const fetchJadwalRealTime = async () => {
      if (!lokasi.latitude || !lokasi.longitude) return;
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=20`);
        const result = await res.json();
        if (result && result.code === 200) {
          const t = result.data.timings;
          setJadwalSholat({
            Subuh: String(t.Fajr), Terbit: String(t.Sunrise), Dzuhur: String(t.Dhuhr),
            Ashar: String(t.Asr), Maghrib: String(t.Maghrib), Isya: String(t.Isha)
          });
        }
      } catch (err) { console.warn("Gagal fetch jadwal sholat."); }
    };
    fetchJadwalRealTime();
  }, [lokasi.latitude, lokasi.longitude, currentDay]);

  const handleFetchFromGoogleSheets = async () => {
    if (!googleSheetsUrl) { setIsDataFetched(true); return; }
    setIsDataFetched(false); setIsSyncing(true); setSyncStatus("Mengunduh Server...");
    try {
      const response = await fetch(`${googleSheetsUrl}?action=getData`);
      const resData = await response.json();
      if (resData && resData.status === "success" && Object.keys(resData.data).length > 0) {
        const payload = resData.data;

        // PROTEKSI: Bandingkan jumlah KK lokal vs awan
        let localKK = 0;
        try {
          const l = JSON.parse(localStorage.getItem("jamaahList"));
          if (Array.isArray(l)) localKK = l.length;
        } catch(e){}

        const cloudKK = Array.isArray(payload.jamaahList) ? payload.jamaahList.length : 0;

        // Jika data di browser lokal jauh lebih banyak dari cloud, tahan penimpaan & beri warning konflik
        if (localKK > cloudKK && localKK > 10) {
            setSyncConflict({
               localKK,
               cloudKK,
               payload
            });
            setSyncStatus("Konflik Sinkronisasi");
            setIsSyncing(false);
            setIsDataFetched(true);
            return;
        }

        applyCloudData(payload);
        setSyncStatus("Tersinkronisasi");
      } else { setSyncStatus("Tersinkronisasi Lokal"); }
    } catch (err) {
      setSyncStatus("Gagal Sinkron");
    } finally {
      setIsSyncing(false); setIsDataFetched(true); 
    }
  };

  const applyCloudData = (payload) => {
    if (payload.masjidName !== undefined) setMasjidName(payload.masjidName);
    if (payload.masjidLogoUrl !== undefined) setMasjidLogoUrl(payload.masjidLogoUrl);
    if (payload.petugasAbadi !== undefined) setPetugasAbadi(payload.petugasAbadi);
    if (payload.jamaahList !== undefined) setJamaahList(payload.jamaahList);
    if (payload.timbanganFitrah !== undefined) setTimbanganFitrah(payload.timbanganFitrah);
    if (payload.alokasiFitrah !== undefined) setAlokasiFitrah(payload.alokasiFitrah);
    if (payload.timbanganZuru !== undefined) setTimbanganZuru(payload.timbanganZuru);
    if (payload.alokasiZuru !== undefined) setAlokasiZuru(payload.alokasiZuru);
    if (payload.timbanganQurbanSapi !== undefined) setTimbanganQurbanSapi(payload.timbanganQurbanSapi);
    if (payload.timbanganQurbanKambing !== undefined) setTimbanganQurbanKambing(payload.timbanganQurbanKambing);
    if (payload.qurbanTamu !== undefined) setQurbanTamu(payload.qurbanTamu);
    if (payload.qurbanSahibul !== undefined) setQurbanSahibul(payload.qurbanSahibul);
    if (payload.userDatabase !== undefined) setUserDatabase(payload.userDatabase);
    if (payload.rolesConfig !== undefined) setRolesConfig(payload.rolesConfig);
  };

  useEffect(() => {
    if (googleSheetsUrl) handleFetchFromGoogleSheets();
    else setIsDataFetched(true);
  }, [googleSheetsUrl]);

  // Sync Timer: Auto save but give users a manual option to force push
  useEffect(() => {
    if (!googleSheetsUrl || !isDataFetched || syncConflict) return;
    const payload = {
      masjidName, masjidLogoUrl, petugasAbadi, jamaahList, 
      timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru,
      timbanganQurbanSapi, timbanganQurbanKambing, qurbanTamu, qurbanSahibul, userDatabase, rolesConfig
    };
    const payloadStr = JSON.stringify(payload);
    
    setSyncStatus("Menyimpan Otomatis...");
    const timeoutId = setTimeout(async () => {
      try {
        await fetch(googleSheetsUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: payloadStr });
        setSyncStatus("Tersinkronisasi");
      } catch (err) { setSyncStatus("Gagal Menyimpan"); }
    }, 3000); 
    return () => clearTimeout(timeoutId);
  }, [masjidName, masjidLogoUrl, petugasAbadi, jamaahList, timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru, timbanganQurbanSapi, timbanganQurbanKambing, qurbanTamu, qurbanSahibul, userDatabase, rolesConfig, googleSheetsUrl, isDataFetched, syncConflict]);


  // === 4. DERIVED CALCULATIONS ===
  const usulanWargaList = Array.isArray(jamaahList) ? jamaahList.filter(w => !w.approvedByTakmir || w.hasUsulanEdit) : [];
  const pendingAccounts = userDatabase && typeof userDatabase === 'object' ? Object.keys(userDatabase).filter(un => userDatabase[un] && !userDatabase[un].approved) : [];

  const currentWargaCount = Array.isArray(jamaahList) ? jamaahList.filter(j => (filterWilayahJamaah === "Semua" || `${j.rt}_${j.rw}` === filterWilayahJamaah) && j.approvedByTakmir && !j.hasUsulanEdit).length : 0;

  // FITRAH
  const totalTimbanganFitrahValue = Array.isArray(timbanganFitrah) ? timbanganFitrah.reduce((a, b) => Number(a) + Number(b), 0) : 0;
  const rincianKebutuhanFitrahData = [];
  ["Berat", "Sedang", "Ringan"].forEach(kat => {
      const list = Array.isArray(jamaahList) ? jamaahList.filter(j => j.fitrah === kat && j.approvedByTakmir && !j.hasUsulanEdit) : [];
      const jiwa = list.reduce((s, j) => s + (parseInt(j.anggota)||0), 0);
      if(jiwa > 0) rincianKebutuhanFitrahData.push({ kategori: `Mustahik ${kat}`, jiwa: `${jiwa}`, jatah: `${alokasiFitrah[kat]}`, totalButuh: jiwa * (Number(alokasiFitrah[kat]) || 0) });
  });
  const listGuruFitrah = Array.isArray(jamaahList) ? jamaahList.filter(j => j.isGuruNgaji && j.approvedByTakmir && !j.hasUsulanEdit) : [];
  if(listGuruFitrah.length > 0) rincianKebutuhanFitrahData.push({ kategori: `Guru Ngaji`, jiwa: `${listGuruFitrah.length}`, jatah: `${alokasiFitrah.GuruNgaji}`, totalButuh: listGuruFitrah.length * (Number(alokasiFitrah.GuruNgaji) || 0) });
  const totalButuhFitrahValue = rincianKebutuhanFitrahData.reduce((sum, item) => sum + Number(item.totalButuh), 0);
  const statusFitrahValue = totalTimbanganFitrahValue - totalButuhFitrahValue;

  // ZURU'
  const totalTimbanganZuruValue = Array.isArray(timbanganZuru) ? timbanganZuru.reduce((a, b) => Number(a) + Number(b), 0) : 0;
  const rincianKebutuhanZuruData = [];
  ["Berat", "Sedang", "Ringan"].forEach(kat => {
      const list = Array.isArray(jamaahList) ? jamaahList.filter(j => j.zuru === kat && j.approvedByTakmir && !j.hasUsulanEdit) : [];
      const jiwa = list.reduce((s, j) => s + (parseInt(j.anggota)||0), 0);
      if(jiwa > 0) rincianKebutuhanZuruData.push({ kategori: `Mustahik ${kat}`, jiwa: `${jiwa}`, jatah: `${alokasiZuru[kat]}`, totalButuh: jiwa * (Number(alokasiZuru[kat]) || 0) });
  });
  const listGuruZuru = Array.isArray(jamaahList) ? jamaahList.filter(j => j.isGuruNgaji && j.approvedByTakmir && !j.hasUsulanEdit) : [];
  if(listGuruZuru.length > 0) rincianKebutuhanZuruData.push({ kategori: `Guru Ngaji`, jiwa: `${listGuruZuru.length}`, jatah: `${alokasiZuru.GuruNgaji}`, totalButuh: listGuruZuru.length * (Number(alokasiZuru.GuruNgaji) || 0) });
  const totalButuruValue = rincianKebutuhanZuruData.reduce((sum, item) => sum + Number(item.totalButuh), 0);
  const statusZuruValue = totalTimbanganZuruValue - totalButuruValue;

  // QURBAN
  const totalTimbanganQurbanSapiValue = Array.isArray(timbanganQurbanSapi) ? timbanganQurbanSapi.reduce((a, b) => Number(a) + Number(b), 0) : 0;
  const totalTimbanganQurbanKambingValue = Array.isArray(timbanganQurbanKambing) ? timbanganQurbanKambing.reduce((a, b) => Number(a) + Number(b), 0) : 0;

  const totalSapiDikurangiTamu = Math.max(0, totalTimbanganQurbanSapiValue - (Number(qurbanTamu.jumlah) * Number(qurbanTamu.jatahSapi)));
  const totalKambingDikurangiTamu = Math.max(0, totalTimbanganQurbanKambingValue - (Number(qurbanTamu.jumlah) * Number(qurbanTamu.jatahKambing)));

  const getWargaPenerimaQurban = () => {
    if (!Array.isArray(jamaahList)) return [];
    return jamaahList.filter(warga => {
      if (!warga.approvedByTakmir || warga.hasUsulanEdit) return false;
      if (warga.qurban && String(warga.qurban).startsWith("Sahibul Qurban")) return false;
      if (filterWilayahQurban !== "Semua") {
        const [filterRt, filterRw] = filterWilayahQurban.split('_');
        if (warga.rt !== filterRt || warga.rw !== filterRw) return false;
      }
      if (qurbanHanyaMustahik) {
        return (warga.fitrah !== "Muzakki" || warga.zuru !== "Bukan Mustahik" || warga.isGuruNgaji);
      }
      return true;
    });
  };

  const wargaPenerimaQurban = getWargaPenerimaQurban();
  const totalPenerimaKK = wargaPenerimaQurban.length;
  const jatahDagingSapiPerKK = totalPenerimaKK > 0 ? (totalSapiDikurangiTamu / totalPenerimaKK).toFixed(2) : 0;
  const jatahDagingKambingPerKK = totalPenerimaKK > 0 ? (totalKambingDikurangiTamu / totalPenerimaKK).toFixed(2) : 0;

  const checkEditAccess = (tab) => {
     if(!Array.isArray(currentUserRoles)) return false;
     return currentUserRoles.includes("Admin") || currentUserRoles.some(r => rolesConfig[r]?.access?.[tab] === "edit");
  };
  const canEditPetugas = checkEditAccess('petugas');
  const canEditJamaah = checkEditAccess('jamaah');
  const canEditFitrah = checkEditAccess('fitrah');
  const canEditZuru = checkEditAccess('zuru');
  const canEditQurban = checkEditAccess('qurban');

  // === 5. EVENT HANDLERS ACTIONS ===
  const handleForceSave = async () => {
    if (!googleSheetsUrl) { addNotification("Tautan Google Sheets belum diatur!", "error"); return; }
    setIsSyncing(true);
    setSyncStatus("Memaksa Simpan...");
    const payload = {
      masjidName, masjidLogoUrl, petugasAbadi, jamaahList, 
      timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru,
      timbanganQurbanSapi, timbanganQurbanKambing, qurbanTamu, qurbanSahibul, userDatabase, rolesConfig
    };
    const payloadStr = JSON.stringify(payload);
    
    try {
      await fetch(googleSheetsUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: payloadStr });
      setSyncStatus("Tersinkronisasi");
      addNotification("Data berhasil dipaksa simpan ke awan!", "success");
      
      if(payloadStr.length > 45000) {
         addNotification("INFO: Data sudah sangat besar, pastikan Anda menggunakan Apps Script terbaru!", "warning");
      }
    } catch (err) { 
      setSyncStatus("Gagal Menyimpan");
      addNotification("Gagal memaksakan simpan data.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanUser = inputUsername.trim().toLowerCase();
    
    let currentDB = userDatabase;
    try {
      const localDB = JSON.parse(localStorage.getItem("userDatabase"));
      if (localDB && typeof localDB === 'object') currentDB = localDB;
    } catch(err) {}

    let userAccount = currentDB[cleanUser];

    // --- PROTEKSI ANTI-TERKUNCI UNTUK SUPER ADMIN ---
    if (!userAccount && cleanUser === "admin" && inputPassword === "admin123") {
      userAccount = INITIAL_USER_DATABASE["admin"];
      setUserDatabase(prev => ({ ...prev, admin: INITIAL_USER_DATABASE["admin"] }));
    }

    if (userAccount) {
      if (!userAccount.approved) { addNotification("Pendaftaran akun masih diproses/menunggu ACC.", "error"); return; }
      if (inputPassword === userAccount.password) {
        const userRoles = Array.isArray(userAccount.roles) ? userAccount.roles : (userAccount.role ? [userAccount.role] : ["Jamaah"]);
        
        setCurrentUserRoles(userRoles); 
        setCurrentUserLabel(userAccount.label); 
        setCurrentUserUsername(cleanUser);
        setIsLoggedIn(true); setIsDutyDismissed(false); 
        
        let primaryRole = userRoles.includes("Admin") ? "Admin" : userRoles[0];
        const allowedAccessObj = rolesConfig[primaryRole]?.access || {};
        const allowedTabs = Object.keys(allowedAccessObj).filter(k => allowedAccessObj[k] !== "none");
        if (!allowedTabs.includes(activeTab)) setActiveTab(allowedTabs[0] || "dashboard");
        
        addNotification(`Selamat datang kembali, ${userAccount.label}!`, "success");
        setInputUsername(""); setInputPassword("");
      } else { addNotification("Kata Sandi salah!", "error"); }
    } else { addNotification("Username tidak ditemukan!", "error"); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserUsername("");
    setCurrentUserLabel("");
    setCurrentUserRoles(["Admin"]);
    addNotification("Berhasil keluar dari sistem.", "warning");
  };

  const handleRegisterMandiri = (e) => {
    e.preventDefault();
    const cleanUsername = regUsername.trim().toLowerCase();
    if (!regLabel.trim() || !cleanUsername || !regPassword || !regConfirmPassword) { addNotification("Lengkapi semua isian!", "error"); return; }
    if (regPassword !== regConfirmPassword) { addNotification("Sandi konfirmasi tidak cocok!", "error"); return; }
    if (userDatabase[cleanUsername]) { addNotification("Username terdaftar! Pilih yang lain.", "error"); return; }

    setUserDatabase(prev => ({ ...prev, [cleanUsername]: { password: regPassword, roles: ["Jamaah"], label: regLabel.trim(), approved: false } }));
    addNotification("Pendaftaran Sukses! Menunggu ACC Admin.", "success");
    setIsRegisterMode(false); setRegLabel(""); setRegUsername(""); setRegPassword(""); setRegConfirmPassword("");
  };

  const handleApproveAccount = (usernameKey, assignedRole) => {
    setUserDatabase(prev => ({ ...prev, [usernameKey]: { ...prev[usernameKey], roles: [assignedRole], approved: true } }));
    addNotification(`Akun @${usernameKey} di-ACC!`, "success");
  };

  const handleRejectAccount = (usernameKey) => {
    if (window.confirm(`Yakin tolak pendaftaran @${usernameKey}?`)) {
      setUserDatabase(prev => { const copy = { ...prev }; delete copy[usernameKey]; return copy; });
      addNotification(`Pendaftaran ditolak.`, "warning");
    }
  };

  const handleSaveJamaah = (e) => {
    e.preventDefault();
    if (!jamaahForm.nama.trim() || !jamaahForm.alamat.trim()) return;
    
    const isSuper = currentUserRoles.includes("Admin") || currentUserRoles.includes("Takmir");
    const isRtRole = currentUserRoles.includes("RT");
    const butuhAcc = !isSuper && (currentUserRoles.includes("Amil") || isRtRole);
    
    let finalData = { ...jamaahForm };
    if (isRtRole && !isSuper && !currentUserRoles.includes("Amil")) {
      finalData.qurban = "Penerima"; 
    }

    if (editingJamaah) {
      if (butuhAcc) {
          let diffNotes = [];
          if (editingJamaah.fitrah !== finalData.fitrah) diffNotes.push(`Fitrah: ${editingJamaah.fitrah} ➔ ${finalData.fitrah}`);
          if (editingJamaah.zuru !== finalData.zuru) diffNotes.push(`Zuru': ${editingJamaah.zuru} ➔ ${finalData.zuru}`);
          if (editingJamaah.qurban !== finalData.qurban) diffNotes.push(`Qurban: ${editingJamaah.qurban} ➔ ${finalData.qurban}`);
          if (editingJamaah.ekonomi !== finalData.ekonomi) diffNotes.push(`Ekonomi: ${editingJamaah.ekonomi} ➔ ${finalData.ekonomi}`);
          if (String(editingJamaah.anggota) !== String(finalData.anggota)) diffNotes.push(`Jiwa: ${editingJamaah.anggota} ➔ ${finalData.anggota}`);
          if (editingJamaah.isGuruNgaji !== finalData.isGuruNgaji) diffNotes.push(`Guru Ngaji: ${editingJamaah.isGuruNgaji ? 'Ya' : 'Tidak'} ➔ ${finalData.isGuruNgaji ? 'Ya' : 'Tidak'}`);

          if (diffNotes.length === 0) {
             addNotification("Tidak ada data yang diubah.", "warning");
             return;
          }

          setJamaahList(prev => prev.map(item => item.id === editingJamaah.id ? { 
            ...item, 
            hasUsulanEdit: true, 
            usulanOleh: currentUserLabel, 
            usulanEditData: finalData,
            keteranganUsulan: diffNotes.join(' | ')
          } : item));
          addNotification("Usulan perubahan terkirim & menunggu ACC Takmir", "success");
      } else {
          setJamaahList(prev => prev.map(item => item.id === editingJamaah.id ? { ...finalData, id: item.id, approvedByTakmir: true, hasUsulanEdit: false, usulanEditData: null, keteranganUsulan: "" } : item));
          addNotification("Data warga berhasil diperbarui", "success");
      }
    } else {
      const newJamaah = { 
          ...finalData, 
          id: Date.now().toString(), 
          approvedByTakmir: !butuhAcc, 
          hasUsulanEdit: false,
          usulanOleh: butuhAcc ? currentUserLabel : "Takmir/Admin",
          keteranganUsulan: "Warga Baru Ditambahkan"
      };
      setJamaahList(prev => [...prev, newJamaah]);
      addNotification(butuhAcc ? "Usulan warga baru terkirim! Menunggu ACC" : "Warga didaftarkan", "success");
    }
    setShowJamaahModal(false); setEditingJamaah(null);
    setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false });
  };

  const handleApproveWarga = (wargaId) => { 
      setJamaahList(prev => prev.map(w => {
          if (w.id === wargaId) {
              if (w.hasUsulanEdit) {
                  return { ...w.usulanEditData, id: w.id, approvedByTakmir: true, hasUsulanEdit: false, usulanEditData: null, keteranganUsulan: "" };
              }
              return { ...w, approvedByTakmir: true };
          }
          return w;
      })); 
      addNotification("Usulan bantuan disetujui (ACC)!", "success"); 
  };
  
  const handleRejectWarga = (wargaId) => { 
      if (window.confirm("Tolak usulan ini?")) { 
          setJamaahList(prev => {
              const target = prev.find(w => w.id === wargaId);
              if (target && target.hasUsulanEdit) {
                  return prev.map(w => w.id === wargaId ? { ...w, hasUsulanEdit: false, usulanEditData: null, keteranganUsulan: "" } : w);
              }
              return prev.filter(w => w.id !== wargaId);
          }); 
          addNotification("Usulan ditolak.", "warning"); 
      } 
  };

  const handleEditJamaah = (jamaah) => { setEditingJamaah(jamaah); setJamaahForm({ ...jamaah, qurban: jamaah.qurban || "Penerima" }); setShowJamaahModal(true); };
  const handleDeleteJamaah = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
      setJamaahList(prev => prev.filter(item => item.id !== id)); addNotification("Data dihapus", "warning");
    }
  };

  const handleSaveAlokasiFitrah = () => { setAlokasiFitrah(tempAlokasiFitrah); addNotification("Jatah Fitrah disimpan!", "success"); };
  const handleSaveAlokasiZuru = () => { setAlokasiZuru(tempAlokasiZuru); addNotification("Jatah Zuru' disimpan!", "success"); };
  
  const handleSaveQurbanTambahan = () => {
     setQurbanTamu(tempQurbanTamu);
     setQurbanSahibul(tempQurbanSahibul);
     addNotification("Konfigurasi Tamu & Sahibul Qurban disimpan!", "success");
  };

  const addTimbangan = (tipe) => {
    if (tipe === 'fitrah') {
      const val = parseFloat(tempBeratFitrah);
      if (isNaN(val) || val <= 0) return;
      setTimbanganFitrah([...timbanganFitrah, val]);
      setTempBeratFitrah("");
      addNotification("Timbangan Zakat Fitrah berhasil ditambahkan");
    } else if (tipe === 'zuru') {
      const val = parseFloat(tempBeratZuru);
      if (isNaN(val) || val <= 0) return;
      setTimbanganZuru([...timbanganZuru, val]);
      setTempBeratZuru("");
      addNotification("Timbangan Zuru' berhasil ditambahkan");
    } else if (tipe === 'qurbanSapi') {
      const val = parseFloat(tempBeratQurbanSapi);
      if (isNaN(val) || val <= 0) return;
      setTimbanganQurbanSapi([...timbanganQurbanSapi, val]);
      setTempBeratQurbanSapi("");
      addNotification("Timbangan perolehan Sapi ditambahkan");
    } else if (tipe === 'qurbanKambing') {
      const val = parseFloat(tempBeratQurbanKambing);
      if (isNaN(val) || val <= 0) return;
      setTimbanganQurbanKambing([...timbanganQurbanKambing, val]);
      setTempBeratQurbanKambing("");
      addNotification("Timbangan perolehan Kambing ditambahkan");
    }
  };

  const deleteTimbangan = (tipe, index) => {
    if (tipe === 'fitrah') {
      setTimbanganFitrah(timbanganFitrah.filter((_, i) => i !== index));
      addNotification("Timbangan Fitrah dihapus", "warning");
    } else if (tipe === 'zuru') {
      setTimbanganZuru(timbanganZuru.filter((_, i) => i !== index));
      addNotification("Timbangan Zuru' diurungkan", "warning");
    } else if (tipe === 'qurbanSapi') {
      setTimbanganQurbanSapi(timbanganQurbanSapi.filter((_, i) => i !== index));
      addNotification("Timbangan daging Sapi berhasil dihapus", "warning");
    } else if (tipe === 'qurbanKambing') {
      setTimbanganQurbanKambing(timbanganQurbanKambing.filter((_, i) => i !== index));
      addNotification("Timbangan daging Kambing berhasil dihapus", "warning");
    }
  };

  const handleSaveNewIdentity = () => {
    if (!tempMasjidName.trim()) { addNotification("Nama Masjid tidak boleh kosong!", "error"); return; }
    setMasjidName(tempMasjidName);
    setMasjidLogoUrl(tempMasjidLogoUrl);
    addNotification("Identitas dan Logo Masjid berhasil diperbarui!", "success");
  };

  const handleCancelNewIdentity = () => {
    setTempMasjidName(masjidName);
    setTempMasjidLogoUrl(masjidLogoUrl);
    addNotification("Perubahan identitas dibatalkan.", "warning");
  };

  const handleEditPasaran = (pasaranKey) => {
    setEditingPasaran(pasaranKey);
    setPasaranForm(petugasAbadi[pasaranKey] || { khatib: "", imam: "", muadzin: "", bilal: "", telp: "" });
  };

  const handleSavePasaran = (e) => {
    e.preventDefault();
    setPetugasAbadi(prev => ({ ...prev, [editingPasaran]: pasaranForm }));
    addNotification(`Template Petugas Jumat ${editingPasaran} berhasil diperbarui!`);
    setEditingPasaran(null);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const cleanUsername = newAccUsername.trim().toLowerCase();
    if (!cleanUsername || !newAccPassword.trim() || !newAccLabel.trim()) return;
    if (userDatabase[cleanUsername]) { addNotification("Username terdaftar!", "error"); return; }
    setUserDatabase(prev => ({ ...prev, [cleanUsername]: { password: newAccPassword, roles: [newAccRole], label: newAccLabel, approved: true } }));
    addNotification("Akun dibuat!"); setNewAccUsername(""); setNewAccPassword(""); setNewAccLabel(""); setNewAccRole("Jamaah");
  };

  const handleDeleteAccount = (usernameKey) => {
    if (["admin", "takmir", "rt01", "jamaah"].includes(usernameKey)) { addNotification("Akun bawaan sistem tidak boleh dihapus!", "error"); return; }
    if (window.confirm("Hapus akun?")) { setUserDatabase(prev => { const copy = { ...prev }; delete copy[usernameKey]; return copy; }); addNotification("Akun dihapus.", "warning"); }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    if (!newPasswordValue.trim()) return;
    setUserDatabase(prev => ({ ...prev, [editingAccountPassword]: { ...prev[editingAccountPassword], password: newPasswordValue.trim() } }));
    addNotification("Password diganti!", "success"); setEditingAccountPassword(null); setNewPasswordValue("");
  };

  const handlePrepareNotification = (fridayData, type) => {
    setNotificationType(type);
    let msg = type === "WA" ? `Yth. *${String(fridayData.petugas.khatib)}*, besok Jumat ${String(fridayData.pasaran)} jadwal bertugas Khatib. Mohon hadir tepat waktu.` : `[MASJID] Yth ${String(fridayData.petugas.khatib)}, besok Jumat ${String(fridayData.pasaran)} jadwal tugas.`;
    setSimulatedMessageText(msg); setActiveNotificationSim(fridayData);
  };

  const handleSendSimMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      addNotification(`Notifikasi ${notificationType} sukses terkirim ke ${activeNotificationSim.petugas.khatib}!`, "success");
      setActiveNotificationSim(null);
    }, 1500);
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      addNotification("Browser tidak mendukung fitur penunjuk GPS.", "error");
      return;
    }
    addNotification("Mencari titik GPS... Harap izinkan akses Lokasi.", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setTempLokasi(prev => ({ ...prev, latitude: lat, longitude: lon }));
        addNotification(`GPS Ditemukan! ${lat.toFixed(5)}, ${lon.toFixed(5)}.`, "success");
      },
      (error) => {
        addNotification("Gagal mengambil GPS. Pastikan GPS menyala.", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handlePrintSelectedReport = (reportType) => {
    let filteredWarga = Array.isArray(jamaahList) ? jamaahList.filter(j => j.approvedByTakmir && !j.hasUsulanEdit) : []; 
    let rtTitle = "Seluruh Wilayah (Semua RT & RW)";

    let appliedPrintWilayah = "Semua";
    if (reportType === "qurban") appliedPrintWilayah = selectedPrintWilayahQurban;
    else if (reportType === "fitrah") appliedPrintWilayah = selectedPrintWilayahFitrah;
    else if (reportType === "zuru") appliedPrintWilayah = selectedPrintWilayahZuru;
    else appliedPrintWilayah = selectedPrintWilayah; 

    if (appliedPrintWilayah !== "Semua") {
      const [filterRt, filterRw] = appliedPrintWilayah.split('_');
      filteredWarga = filteredWarga.filter(j => j.rt === filterRt && j.rw === filterRw);
      rtTitle = `RT ${filterRt} / RW ${filterRw}`;
    }

    let docTitle = ""; let tableHeaderHTML = ""; let tableRowsHTML = ""; let summaryHTML = "";

    const fallbackSVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;"><circle cx="50" cy="50" r="46" fill="#f0fdf4" stroke="#10b981" stroke-width="3" /><path d="M50 15C42 28 32 35 32 55C32 65 35 72 50 72C65 72 68 65 68 55C68 35 58 28 50 15Z" fill="#10b981" /><path d="M50 10V15" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" /><circle cx="50" cy="8" r="2.5" fill="#f59e0b" /><path d="M48 6C49 5 52 5 53 6" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" /><text x="50" y="58" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" font-family="sans-serif">M I</text><path d="M45 72V64C45 61.5 47.5 59 50 59C52.5 59 55 61.5 55 64V72" fill="#047857" /></svg>`;
    const logoHTML = masjidLogoUrl && typeof masjidLogoUrl === 'string' && masjidLogoUrl.trim() !== "" ? `<img src="${masjidLogoUrl}" alt="Logo" style="max-width:65px; max-height:65px; object-fit:contain;" />` : `<div style="width:60px; height:60px;">${fallbackSVG}</div>`;

    const kopMasjidHTML = `
      <div class="kop-masjid">
        ${logoHTML}
        <div>
          <h1>${String(masjidName)}</h1>
          <p>Desa ${String(lokasi.desa)}, Kec. ${String(lokasi.kecamatan)}, Kab. ${String(lokasi.kabupaten)}, Prov. ${String(lokasi.provinsi)}</p>
        </div>
      </div>
    `;

    if (reportType === "jamaah") {
      docTitle = `Laporan Database Jamaah`;
      summaryHTML = `<div style="margin-bottom:15px;padding:8px;background:#f8fafc;border:1px solid #cbd5e1;text-align:center;"><strong>Total Warga:</strong> ${filteredWarga.length} KK</div>`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 5%;">No</th><th style="width: 30%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 15%;">RT / RW</th><th style="width: 35%;">Alamat Lengkap</th><th class="text-center" style="width: 15%;">Jumlah Jiwa</th></tr>`;
      tableRowsHTML = filteredWarga.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)} ${j.isGuruNgaji ? '(Guru Ngaji)' : ''}</td><td class="text-center">RT ${String(j.rt)}/${String(j.rw)}</td><td>${String(j.alamat)}</td><td class="text-center">${String(j.anggota)} Orang</td></tr>`).join('');
    } else if (reportType === "fitrah") {
      docTitle = `Rekapitulasi Penyaluran Zakat Fitrah`;
      
      let muzakkiPerRT = {};
      WILAYAH_OPTIONS.forEach(w => {
         let count = Array.isArray(jamaahList) ? jamaahList.filter(j => j.fitrah === "Muzakki" && j.rt === w.rt && j.rw === w.rw && j.approvedByTakmir && !j.hasUsulanEdit).reduce((acc, curr) => acc + parseInt(curr.anggota||0), 0) : 0;
         if(count > 0) muzakkiPerRT[w.label] = count;
      });
      let mzRows = Object.keys(muzakkiPerRT).map(k => `<tr><td>${k}</td><td class="text-center">${muzakkiPerRT[k]} Jiwa</td></tr>`).join('');
      
      // PERINCIAN PENERIMA SEPERTI PERMINTAAN USER (KATEGORI: Berat, Sedang, Ringan, Guru Ngaji)
      let fitrahCategories = ["Berat", "Sedang", "Ringan"];
      let categorySummaryRows = fitrahCategories.map(cat => {
         let list = filteredWarga.filter(j => j.fitrah === cat);
         let countKK = list.length;
         let totalJiwa = list.reduce((s, j) => s + (parseInt(j.anggota)||0), 0);
         let totalKg = totalJiwa * (Number(alokasiFitrah[cat]) || 0);
         return `<tr><td>Mustahik ${cat}</td><td class="text-center">${countKK} KK</td><td class="text-center">${totalJiwa} Jiwa</td><td class="text-center">${alokasiFitrah[cat]} Kg/Jiwa</td><td class="text-right font-bold">${totalKg.toFixed(1)} Kg</td></tr>`;
      }).join('');
      
      // Tambah Guru Ngaji ke ringkasan kategori
      let guruFitrahList = filteredWarga.filter(j => j.isGuruNgaji);
      let guruCount = guruFitrahList.length;
      let guruTotalKg = guruCount * (Number(alokasiFitrah.GuruNgaji) || 0);
      categorySummaryRows += `<tr><td>Guru Ngaji (Bantuan Khusus)</td><td class="text-center">${guruCount} KK</td><td class="text-center">-</td><td class="text-center">${alokasiFitrah.GuruNgaji} Kg/KK</td><td class="text-right font-bold">${guruTotalKg.toFixed(1)} Kg</td></tr>`;

      // Tabel RT/RW dengan Perincian Kategori Detil
      let rtRows = [];
      WILAYAH_OPTIONS.forEach(w => {
         let rtWarga = filteredWarga.filter(j => j.rt === w.rt && j.rw === w.rw);
         let rtBerat = rtWarga.filter(j => j.fitrah === "Berat");
         let rtSedang = rtWarga.filter(j => j.fitrah === "Sedang");
         let rtRingan = rtWarga.filter(j => j.fitrah === "Ringan");
         let rtGuru = rtWarga.filter(j => j.isGuruNgaji);
         
         let totalRtKg = 0;
         rtBerat.forEach(j => totalRtKg += (parseInt(j.anggota||0)) * (Number(alokasiFitrah.Berat) || 0));
         rtSedang.forEach(j => totalRtKg += (parseInt(j.anggota||0)) * (Number(alokasiFitrah.Sedang) || 0));
         rtRingan.forEach(j => totalRtKg += (parseInt(j.anggota||0)) * (Number(alokasiFitrah.Ringan) || 0));
         totalRtKg += rtGuru.length * (Number(alokasiFitrah.GuruNgaji) || 0);
         
         let countKK = rtWarga.filter(j => j.fitrah !== "Muzakki" || j.isGuruNgaji).length;
         
         if(countKK > 0) {
            rtRows.push(`<tr>
              <td>${String(w.label)}</td>
              <td class="text-center font-bold">${countKK} KK</td>
              <td class="text-center">${rtBerat.length} KK (${rtBerat.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtSedang.length} KK (${rtSedang.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtRingan.length} KK (${rtRingan.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtGuru.length} KK</td>
              <td class="text-right font-bold text-emerald-700">${totalRtKg.toFixed(1)} Kg</td>
            </tr>`);
         }
      });
      
      summaryHTML = `
        <div style="margin-bottom:15px; display:flex; gap:10px;">
           <div style="flex:1; padding:8px; background:#f0fdf4; border:1px solid #bbf7d0; text-align:center;"><strong>Beras Zakat Diterima:</strong><br/><span style="font-size:14px; font-weight:black;">${Number(totalTimbanganFitrahValue).toFixed(1)} Kg</span></div>
           <div style="flex:1; padding:8px; background:#f8fafc; border:1px solid #cbd5e1; text-align:center;"><strong>Total Kebutuhan:</strong><br/>${Number(totalButuhFitrahValue).toFixed(1)} Kg</div>
           <div style="flex:1; padding:8px; background:#fff1f2; border:1px solid #fecdd3; text-align:center;"><strong>Status:</strong><br/>${statusFitrahValue >= 0 ? `Surplus ${Number(statusFitrahValue).toFixed(1)} Kg` : `Kurang ${Math.abs(Number(statusFitrahValue)).toFixed(1)} Kg`}</div>
        </div>
        <h4>1. Ringkasan Penerima Zakat Fitrah (Berdasarkan Kriteria)</h4>
        <table style="margin-bottom:15px;">
           <thead>
             <tr>
               <th>Kategori Mustahik</th>
               <th class="text-center">Jumlah KK</th>
               <th class="text-center">Jumlah Jiwa</th>
               <th class="text-center">Jatah</th>
               <th class="text-right">Total Kebutuhan</th>
             </tr>
           </thead>
           <tbody>
             ${categorySummaryRows}
           </tbody>
        </table>
        <h4>2. Rekap Pembayar Zakat Fitrah (Muzakki)</h4>
        <table style="margin-bottom:15px;">
           <thead><tr><th>Wilayah RT/RW</th><th class="text-center">Total Jiwa</th></tr></thead>
           <tbody>${mzRows || `<tr><td colspan="2" class="text-center font-bold">Tidak ada data</td></tr>`}</tbody>
        </table>
        <h4>3. Detail Kebutuhan & Distribusi per Wilayah (RT)</h4>
      `;
      tableHeaderHTML = `<tr><th>Wilayah RT/RW</th><th class="text-center">Penerima (KK)</th><th class="text-center">Mustahik Berat</th><th class="text-center">Mustahik Sedang</th><th class="text-center">Mustahik Ringan</th><th class="text-center">Guru Ngaji</th><th class="text-right">Total Kebutuhan Beras</th></tr>`;
      tableRowsHTML = rtRows.length > 0 ? rtRows.join('') : `<tr><td colspan="7" class="text-center">Kosong</td></tr>`;
      
    } else if (reportType === "zuru") {
      docTitle = `Rekapitulasi Penyaluran Zakat Zuru'`;
      
      let rtRows = [];
      WILAYAH_OPTIONS.forEach(w => {
         let mustahikListRT = Array.isArray(jamaahList) ? jamaahList.filter(j => (j.zuru !== "Bukan Mustahik" || j.isGuruNgaji) && j.rt === w.rt && j.rw === w.rw && j.approvedByTakmir && !j.hasUsulanEdit) : [];
         let countKK = mustahikListRT.length;
         let totalKg = 0;
         mustahikListRT.forEach(j => {
             let asnafVal = j.zuru !== "Bukan Mustahik" ? (Number(alokasiZuru[j.zuru]) || 0) * (parseInt(j.anggota||0)) : 0;
             let guruVal = j.isGuruNgaji ? (Number(alokasiZuru.GuruNgaji) || 0) : 0;
             totalKg += (asnafVal + guruVal);
         });
         
         let rtWarga = filteredWarga.filter(j => j.rt === w.rt && j.rw === w.rw);
         let rtBerat = rtWarga.filter(j => j.zuru === "Berat");
         let rtSedang = rtWarga.filter(j => j.zuru === "Sedang");
         let rtRingan = rtWarga.filter(j => j.zuru === "Ringan");
         let rtGuru = rtWarga.filter(j => j.isGuruNgaji);
         
         if(countKK > 0) {
            rtRows.push(`<tr>
              <td>${String(w.label)}</td>
              <td class="text-center font-bold">${countKK} KK</td>
              <td class="text-center">${rtBerat.length} KK (${rtBerat.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtSedang.length} KK (${rtSedang.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtRingan.length} KK (${rtRingan.reduce((s,j)=>s+parseInt(j.anggota||0),0)} Jiwa)</td>
              <td class="text-center">${rtGuru.length} KK</td>
              <td class="text-right font-bold text-teal-700">${totalKg.toFixed(1)} Kg</td>
            </tr>`);
         }
      });
      
      let zuruCategories = ["Berat", "Sedang", "Ringan"];
      let categorySummaryRows = zuruCategories.map(cat => {
         let list = filteredWarga.filter(j => j.zuru === cat);
         let countKK = list.length;
         let totalJiwa = list.reduce((s, j) => s + (parseInt(j.anggota||0), 0), 0);
         let totalKg = totalJiwa * (Number(alokasiZuru[cat]) || 0);
         return `<tr><td>Mustahik ${cat}</td><td class="text-center">${countKK} KK</td><td class="text-center">${totalJiwa} Jiwa</td><td class="text-center">${alokasiZuru[cat]} Kg/Jiwa</td><td class="text-right font-bold">${totalKg.toFixed(1)} Kg</td></tr>`;
      }).join('');
      
      let guruZuruList = filteredWarga.filter(j => j.isGuruNgaji);
      let guruCount = guruZuruList.length;
      let guruTotalKg = guruCount * (Number(alokasiZuru.GuruNgaji) || 0);
      categorySummaryRows += `<tr><td>Guru Ngaji (Bantuan Khusus)</td><td class="text-center">${guruCount} KK</td><td class="text-center">-</td><td class="text-center">${alokasiZuru.GuruNgaji} Kg/KK</td><td class="text-right font-bold">${guruTotalKg.toFixed(1)} Kg</td></tr>`;

      let mzPerRT = {};
      WILAYAH_OPTIONS.forEach(w => {
         let count = Array.isArray(jamaahList) ? jamaahList.filter(j => j.zuru === "Bukan Mustahik" && j.rt === w.rt && j.rw === w.rw && j.approvedByTakmir && !j.hasUsulanEdit).reduce((acc, curr) => acc + parseInt(curr.anggota||0), 0) : 0;
         if(count > 0) mzPerRT[w.label] = count;
      });
      let mzRows = Object.keys(mzPerRT).map(k => `<tr><td>${k}</td><td class="text-center">${mzPerRT[k]} Jiwa</td></tr>`).join('');
      
      summaryHTML = `
        <div style="margin-bottom:15px; display:flex; gap:10px;">
           <div style="flex:1; padding:8px; background:#f0fdfa; border:1px solid #99f6e4; text-align:center;"><strong>Hasil Panen Diterima:</strong><br/><span style="font-size:14px; font-weight:black;">${Number(totalTimbanganZuruValue).toFixed(1)} Kg</span></div>
           <div style="flex:1; padding:8px; background:#f8fafc; border:1px solid #cbd5e1; text-align:center;"><strong>Total Kebutuhan:</strong><br/>${Number(totalButuruValue).toFixed(1)} Kg</div>
           <div style="flex:1; padding:8px; background:#fff1f2; border:1px solid #fecdd3; text-align:center;"><strong>Status:</strong><br/>${statusZuruValue >= 0 ? `Surplus ${Number(statusZuruValue).toFixed(1)} Kg` : `Kurang ${Math.abs(Number(statusZuruValue)).toFixed(1)} Kg`}</div>
        </div>
        <h4>1. Ringkasan Penerima Zakat Zuru' (Berdasarkan Kriteria)</h4>
        <table style="margin-bottom:15px;">
           <thead>
             <tr>
               <th>Kategori Mustahik</th>
               <th class="text-center">Jumlah KK</th>
               <th class="text-center">Jumlah Jiwa</th>
               <th class="text-center">Jatah</th>
               <th class="text-right">Total Kebutuhan</th>
             </tr>
           </thead>
           <tbody>
             ${categorySummaryRows}
           </tbody>
        </table>
        <h4>2. Rekap Pembayar Zakat Zuru'</h4>
        <table style="margin-bottom:15px;">
           <thead><tr><th>Wilayah RT/RW</th><th class="text-center">Total Jiwa</th></tr></thead>
           <tbody>${mzRows || `<tr><td colspan="2" class="text-center font-bold">Tidak ada data</td></tr>`}</tbody>
        </table>
        <h4>3. Detail Kebutuhan & Distribusi per Wilayah (RT)</h4>
      `;
      tableHeaderHTML = `<tr><th>Wilayah RT/RW</th><th class="text-center">Penerima (KK)</th><th class="text-center">Mustahik Berat</th><th class="text-center">Mustahik Sedang</th><th class="text-center">Mustahik Ringan</th><th class="text-center">Guru Ngaji</th><th class="text-right">Total Kebutuhan Hasil Panen</th></tr>`;
      tableRowsHTML = rtRows.length > 0 ? rtRows.join('') : `<tr><td colspan="7" class="text-center">Kosong</td></tr>`;
      
    } else if (reportType === "qurban") {
      docTitle = `Distribusi Daging Qurban`;
      
      let rtRowsData = [];
      WILAYAH_OPTIONS.forEach(w => {
         let count = getWargaPenerimaQurban().filter(j => j.rt === w.rt && j.rw === w.rw).length;
         let kgSapi = count * Number(jatahDagingSapiPerKK);
         let kgKambing = count * Number(jatahDagingKambingPerKK);
         if(count > 0) rtRowsData.push(`<tr><td>${String(w.label)}</td><td class="text-center">${count} KK</td><td class="text-right font-bold">${kgSapi.toFixed(2)} Kg</td><td class="text-right font-bold">${kgKambing.toFixed(2)} Kg</td></tr>`);
      });
      
      summaryHTML = `
        <div style="margin-bottom:10px; display:flex; gap:10px;">
           <div style="flex:1; padding:6px; background:#f8fafc; border:1px solid #cbd5e1; text-align:center; font-size: 10px;"><strong>Sapi Diterima:</strong><br/>${Number(totalTimbanganQurbanSapiValue).toFixed(1)} Kg</div>
           <div style="flex:1; padding:6px; background:#f8fafc; border:1px solid #cbd5e1; text-align:center; font-size: 10px;"><strong>Kambing Diterima:</strong><br/>${Number(totalTimbanganQurbanKambingValue).toFixed(1)} Kg</div>
        </div>
        <h4>Alokasi Sahibul Qurban & Tamu/Panitia</h4>
        <table style="margin-bottom:10px;">
           <thead><tr><th>Kategori Khusus</th><th class="text-center">Jatah Sapi (Kg)</th><th class="text-center">Jatah Kambing (Kg)</th><th class="text-center">Keterangan</th></tr></thead>
           <tbody>
             <tr><td>Sahibul Qurban</td><td class="text-center">${Number(qurbanSahibul.sapi) || 0} Kg</td><td class="text-center">${Number(qurbanSahibul.kambing) || 0} Kg</td><td class="text-center">Catatan Internal</td></tr>
             <tr><td>Tamu (${Number(qurbanTamu.jumlah) || 0} Orang)</td><td class="text-center">${Number(qurbanTamu.jumlah) * Number(qurbanTamu.jatahSapi)} Kg</td><td class="text-center">${Number(qurbanTamu.jumlah) * Number(qurbanTamu.jatahKambing)} Kg</td><td class="text-center">Memotong Kuota Warga</td></tr>
           </tbody>
        </table>
        <h4>Rekap Kebutuhan Daging per Wilayah RT/RW (Total: ${totalPenerimaKK} KK)</h4>
      `;
      tableHeaderHTML = `<tr><th>Wilayah RT/RW</th><th class="text-center">Jumlah KK Penerima</th><th class="text-right">Kebutuhan Sapi (Kg)</th><th class="text-right">Kebutuhan Kambing (Kg)</th></tr>`;
      tableRowsHTML = rtRowsData.length > 0 ? rtRowsData.join('') : `<tr><td colspan="4" class="text-center">Kosong</td></tr>`;
      
    } else if (reportType === "pekurban") {
      docTitle = `Daftar Sahibul Qurban (Pekurban)`;
      const pekurbanList = filteredWarga.filter(j => j.qurban && j.qurban.startsWith("Sahibul Qurban"));
      summaryHTML = `<div style="margin-bottom:15px;padding:8px;background:#fffbeb;border:1px solid #fde68a;text-align:center;"><strong>Total Pekurban:</strong> ${pekurbanList.length} Warga</div>`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 8%;">No</th><th style="width: 35%;">Nama Pekurban</th><th class="text-center" style="width: 15%;">RT / RW</th><th style="width: 22%;">Alamat</th><th class="text-center" style="width: 20%;">Jenis Qurban</th></tr>`;
      tableRowsHTML = pekurbanList.length > 0 ? pekurbanList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">RT ${String(j.rt)}/${String(j.rw)}</td><td>${String(j.alamat)}</td><td class="text-center font-bold text-amber-700">${String(j.qurban).replace("Sahibul Qurban - ", "")}</td></tr>`).join('') : `<tr><td colspan="5" class="text-center">Belum ada pekurban.</td></tr>`;
    } else if (reportType === "terpadu") {
      docTitle = `Rekap Zakat Terpadu`;
      const mustahikList = filteredWarga.filter(j => j.fitrah !== "Muzakki" || j.zuru !== "Bukan Mustahik" || j.isGuruNgaji);
      tableHeaderHTML = `<tr><th class="text-center" style="width: 5%;">No</th><th style="width: 35%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 15%;">RT / RW</th><th class="text-center" style="width: 15%;">Fitrah</th><th class="text-center" style="width: 15%;">Zuru'</th><th class="text-center" style="width: 15%;">Paraf</th></tr>`;
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">RT ${String(j.rt)}/${String(j.rw)}</td><td class="text-center">${j.fitrah !== "Muzakki" ? String(j.fitrah) : "-"}${j.isGuruNgaji?" <span style='font-size:8px;'>(+Guru)</span>":""}</td><td class="text-center">${j.zuru !== "Bukan Mustahik" ? String(j.zuru) : "-"}${j.isGuruNgaji?" <span style='font-size:8px;'>(+Guru)</span>":""}</td><td style="height:22px;"></td></tr>`).join('') : `<tr><td colspan="6" class="text-center">Kosong</td></tr>`;
    }

    const printDate = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    
    // SCRIPT HTML2PDF YANG RAMAH APK DENGAN 2 TOMBOL SINGKAT
    const html = `<!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${docTitle}</title>
      <style>
        body { font-family: sans-serif; background: #f1f5f9; margin: 0; padding: 0; }
        .wrapper { width: 100%; box-sizing: border-box; padding: 10px; }
        .control-panel { max-width: 100%; margin: 0 auto 15px; background: white; padding: 12px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow-x: auto; gap: 10px; }
        .btn { padding: 8px 12px; border-radius: 6px; cursor: pointer; border: none; text-decoration: none; font-weight: bold; font-size: 12px; white-space: nowrap; }
        .btn-close { background: #ef4444; color: white; }
        .btn-pdf { background: #0f172a; color: white; display: flex; align-items: center; gap: 5px; }
        .btn-pdf-browser { background: #334155; color: white; }
        .print-container { width: 100%; max-width: 215mm; background: white; padding: 20px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); box-sizing: border-box; }
        .kop-masjid { display: flex; align-items: center; justify-content: center; gap: 15px; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 10px; text-align: left; }
        .kop-masjid h1 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .kop-masjid p { margin: 2px 0 0; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; min-width: 100%; margin-bottom: 10px; }
        th, td { border: 1px solid #000; padding: 2px 4px; word-wrap: break-word; line-height: 1.1; }
        th { background: #f8fafc; font-weight: bold; padding: 4px; }
        h4 { margin: 0 0 4px 0; font-size: 11px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .header-info { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
        .print-date { font-size: 9px; color: #475569; text-align: right; }
        @media print {
          body { background: white; }
          .wrapper { padding: 0; }
          .control-panel { display: none !important; }
          .print-container { max-width: none; width: 100%; box-shadow: none; margin: 0; padding: 0; border: none; }
          @page { size: 215mm 330mm; margin: 10mm; }
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <script>
        function doPrintBrowser() { try { window.print(); } catch(e) {} }
        function doDownloadPDF() {
            var element = document.querySelector('.print-container');
            var btn = document.getElementById('dl-btn');
            btn.innerHTML = "⏳ Memproses PDF...";
            var opt = {
                margin:       10,
                filename:     '${docTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(function() {
                btn.innerHTML = "⬇️ Unduh PDF";
            });
        }
        window.onload = function() {
           setTimeout(function() { try { window.print(); } catch(e) {} }, 800);
        };
      </script>
    </head>
    <body>
      <div class="wrapper">
        <div class="control-panel">
          <button onclick="window.parent.postMessage('CLOSE_PRINT_FRAME', '*')" class="btn btn-close">Kembali</button>
          <div style="display:flex; gap:8px;">
            <button onclick="doPrintBrowser()" class="btn btn-pdf-browser">🖨️ Cetak</button>
            <button id="dl-btn" onclick="doDownloadPDF()" class="btn btn-pdf">⬇️ Unduh PDF</button>
          </div>
        </div>
        <div class="print-container">
          ${kopMasjidHTML}
          <div class="header-info">
            <div>
              <h2 style="margin:0 0 2px 0; font-size: 15px; text-transform: uppercase; text-decoration: underline;">${docTitle}</h2>
              <p style="margin:0; font-size: 11px; font-weight: bold;">Wilayah: ${rtTitle}</p>
            </div>
            <div class="print-date">
              Dicetak pada:<br/><strong>${printDate}</strong>
            </div>
          </div>
          ${summaryHTML}
          <div style="width:100%; overflow-x:auto;">
            <table>
              <thead>${tableHeaderHTML}</thead>
              <tbody>${tableRowsHTML}</tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
    </html>`;
    setPrintIframeData(html);
  };


  // === 6. RENDER PENGANTAR LOGIN / REGISTER ===
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="fixed top-4 right-4 z-50 space-y-2 animate-bounce">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm flex gap-3 ${n.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
              <span>{String(n.message)}</span>
            </div>
          ))}
        </div>

        {/* DIALOG SYNC CONFLICT POPUP (ANTI DATA TIMPA) */}
        {syncConflict && (
          <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-300">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                  <AlertTriangle size={32}/>
                  <h3 className="font-black text-lg text-slate-800">Konflik Data Sinkronisasi</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                   Sistem mendeteksi bahwa **data warga lokal Anda (${syncConflict.localKK} KK)** lebih banyak daripada **data yang tersimpan di awan Cloud (${syncConflict.cloudKK} KK)**. 
                   Jika Anda langsung menimpa, data lokal Anda akan hilang.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold mb-6">
                   Kami menyarankan untuk menekan tombol <strong>"Gunakan Data Lokal"</strong> lalu mengunggahnya (Simpan Paksa) ke server agar data 251 KK Anda terselamatkan.
                </div>
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={() => {
                       // Gunakan data lokal & langsung paksa save ke Sheets
                       setSyncConflict(null);
                       addNotification("Mengunci data lokal masjid Anda...", "success");
                     }}
                     className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm"
                   >
                     ✔️ Gunakan & Pertahankan Data Lokal (${syncConflict.localKK} KK)
                   </button>
                   <button 
                     onClick={() => {
                       // Terapkan data Sheets awan (timpa)
                       applyCloudData(syncConflict.payload);
                       setSyncConflict(null);
                       addNotification("Data awan berhasil diterapkan ke browser Anda.", "warning");
                     }}
                     className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                   >
                     ❌ Timpa saja dengan data awan (${syncConflict.cloudKK} KK)
                   </button>
                </div>
             </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 text-emerald-600 mx-auto">{renderMasjidLogo("w-full h-full object-contain rounded-lg", "w-16 h-16")}</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{String(masjidName)}</h1>
          </div>

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {!isDataFetched && isSyncing && (
                <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold p-2 text-center rounded-xl animate-pulse">
                   Tunggu sebentar... Menyinkronkan dari server awan...
                </div>
              )}
              <div><input type="text" required placeholder="Masukkan username" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full text-sm border p-3 rounded-xl outline-none" /></div>
              <div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="Masukkan sandi" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full text-sm border p-3 rounded-xl outline-none pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm">Masuk Aplikasi</button>
              <div className="text-center pt-2"><button type="button" onClick={() => setIsRegisterMode(true)} className="text-emerald-600 text-xs font-bold hover:underline">Belum punya akun? Daftar disini</button></div>
            </form>
          ) : (
            <form onSubmit={handleRegisterMandiri} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl text-[10px] text-emerald-800 font-semibold">Setiap pendaftaran baru wajib di-ACC oleh Admin/Takmir.</div>
              <input type="text" required placeholder="Nama Lengkap" value={regLabel} onChange={(e) => setRegLabel(e.target.value)} className="w-full text-sm border p-3 rounded-xl outline-none" />
              <input type="text" required placeholder="Username Login (Tanpa Spasi)" value={regUsername} onChange={(e) => setRegUsername(e.target.value.replace(/\s+/g, ''))} className="w-full text-sm border p-3 rounded-xl outline-none" />
              <input type="password" required placeholder="Kata Sandi Baru" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full text-sm border p-3 rounded-xl outline-none" />
              <input type="password" required placeholder="Konfirmasi Kata Sandi" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} className="w-full text-sm border p-3 rounded-xl outline-none" />
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm">Daftar Akun Mandiri</button>
              <div className="text-center pt-2"><button type="button" onClick={() => setIsRegisterMode(false)} className="text-slate-500 text-xs font-bold hover:underline">Kembali ke Halaman Login</button></div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // === 7. RENDER MAIN DASHBOARD LAYOUT ===
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative">
      {/* Pengamanan Jika User Ingin Keluar Saat Syncing */}
      {isSyncing && (
         <div className="fixed top-0 left-0 w-full h-1 bg-amber-400 z-[9999] animate-pulse"></div>
      )}

      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm font-medium flex gap-3 ${n.type === 'error' ? 'bg-rose-600 animate-bounce' : 'bg-emerald-600'}`}>
            {n.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}<span>{String(n.message)}</span>
          </div>
        ))}
      </div>

      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 border rounded-xl hover:bg-slate-50 transition-colors"><Menu size={20} /></button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-3 pr-2 py-1.5 rounded-2xl mr-1">
            <div className="text-left block">
              <span className="text-[8px] sm:text-[9px] text-emerald-600 font-extrabold block uppercase leading-tight">{Array.isArray(currentUserRoles) ? currentUserRoles.map(r => rolesConfig[r]?.label || r).join(', ') : ''}</span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-900 truncate block max-w-[80px] sm:max-w-[150px] leading-tight">{String(currentUserLabel)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200" title={`Status Database: ${syncStatus}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : syncStatus.includes('Gagal') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            </div>
            <button onClick={handleLogout} title="Keluar / Logout" className="block p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl transition-all"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex">
          <div className="bg-white w-72 h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 text-emerald-600 shrink-0">
                  {renderMasjidLogo("w-full h-full object-contain rounded", "w-7 h-7")}
                </div>
                <span className="text-sm font-black text-slate-800 tracking-wide truncate">{String(masjidName)}</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"><X size={18} /></button>
            </div>
            
            <nav className="space-y-1.5 p-4 flex-1 overflow-y-auto">
              {[
                { id: "dashboard", label: "Dashboard Utama", icon: Compass }, { id: "petugas", label: "Petugas Sholat", icon: Calendar },
                { id: "jamaah", label: "Data Warga", icon: Users }, { id: "fitrah", label: "Zakat Fitrah", icon: Gift },
                { id: "zuru", label: "Zakat Zuru'", icon: Coins }, { id: "qurban", label: "Daging Qurban", icon: Heart },
                { id: "rbac", label: "Hak Akses & Akun", icon: UserCheck }
              ].map(item => {
                const allowed = hasAccess(item.id);
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => navigateTo(item.id)} disabled={!allowed && (!Array.isArray(currentUserRoles) || !currentUserRoles.includes('Admin'))} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black transition-all ${isActive ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : !allowed ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <item.icon className="w-4 h-4 shrink-0" /> <span className="text-left flex-1">{item.label}</span>
                    {!allowed && <span className="text-[8px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded-md">Kunci</span>}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer: User Info & Logout */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="bg-white p-3 rounded-xl border border-slate-200 mb-3 shadow-xs">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Login Sebagai:</p>
                <p className="text-sm font-black text-slate-800 truncate leading-tight">{String(currentUserLabel)}</p>
                <p className="text-[10px] font-bold text-emerald-600 truncate">{Array.isArray(currentUserRoles) ? currentUserRoles.map(r => rolesConfig[r]?.label || r).join(', ') : ''}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 rounded-xl font-bold transition-all text-xs">
                <LogOut size={16} /> Keluar Aplikasi
              </button>
            </div>

          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-7xl mx-auto pb-8">
        
        {/* ======================= TAB: DASHBOARD ======================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            
            {/* Tombol Simpan Paksa Manual Di Sini */}
            <div className="bg-white border rounded-2xl p-4 shadow-xs flex justify-between items-center gap-4">
               <div>
                  <h3 className="font-bold text-sm text-slate-800">Sinkronisasi Cloud</h3>
                  <p className="text-[10px] text-slate-500 hidden sm:block">Mencegah data terputus akibat menekan "keluar" terlalu cepat.</p>
               </div>
               <button onClick={handleForceSave} disabled={isSyncing} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`}>
                 {isSyncing ? <RefreshCw size={14} className="animate-spin"/> : <CloudUpload size={14}/>} 
                 {isSyncing ? "Menyimpan..." : "Simpan Paksa ke Server"}
               </button>
            </div>

            {(Array.isArray(currentUserRoles) && (currentUserRoles.includes("Takmir") || currentUserRoles.includes("Admin"))) && usulanWargaList.length > 0 && (
              <div className="bg-white border-2 border-amber-500 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b pb-3"><Check className="text-amber-600 w-5 h-5 animate-bounce" /><div><h3 className="font-extrabold text-sm">Persetujuan Usulan Edit/Warga Baru dari RT/Amil</h3><p className="text-[10px] text-slate-500">Amil atau RT telah mengajukan data/perubahan. Berikan validasi.</p></div></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead><tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[9px]"><th className="p-3">Pengusul</th><th className="p-3">Warga</th><th className="p-3">RT/RW</th><th className="p-3">Data Diajukan</th><th className="p-3 text-right">Aksi</th></tr></thead>
                    <tbody>
                      {usulanWargaList.map(w => {
                        const isEdit = w.hasUsulanEdit;
                        const d = isEdit ? w.usulanEditData : w;
                        return (
                          <tr key={w.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 align-top">
                               <span className="font-bold text-slate-800">{String(w.usulanOleh)}</span>
                               <span className={`block mt-1 w-max text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${isEdit ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{isEdit ? "Edit Data" : "Warga Baru"}</span>
                            </td>
                            <td className="p-3 font-bold align-top">{String(d.nama)}</td>
                            <td className="p-3 align-top">RT {String(d.rt)}/{String(d.rw)}</td>
                            <td className="p-3 text-[10px] align-top">
                              {isEdit ? (
                                 <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg w-full">
                                    <strong className="block text-[9px] uppercase mb-1 border-b border-amber-200 pb-1">Detail Perubahan:</strong>
                                    <ul className="list-disc pl-3 space-y-0.5 mt-1">
                                      {String(w.keteranganUsulan).split(' | ').map((ket, idx) => <li key={idx}>{ket}</li>)}
                                    </ul>
                                 </div>
                              ) : (
                                 <>
                                   Fitrah: <strong>{String(d.fitrah)}</strong><br/>
                                   Zuru': <strong>{String(d.zuru)}</strong><br/>
                                   Qurban: <strong>{String(d.qurban)}</strong>
                                   {d.isGuruNgaji && <span className="text-emerald-600 font-bold block mt-0.5">+ Guru Ngaji</span>}
                                 </>
                              )}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap align-top">
                              <button onClick={() => handleApproveWarga(w.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] rounded-lg mr-1.5 font-bold shadow-sm transition-all">ACC</button>
                              <button onClick={() => handleRejectWarga(w.id)} className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] rounded-lg font-bold transition-all border border-rose-200">Tolak</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {infoTugasBesok && (
              <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-white/15 rounded-2xl animate-pulse"><BellRing size={28} className="text-amber-300" /></div>
                  <div><span className="bg-white/20 text-[10px] px-2 py-1 rounded-full font-black">SIRENE H-1</span>
                    <h3 className="text-lg font-black mt-1.5">Anda Bertugas Besok!</h3>
                    <p className="text-xs text-rose-100">Besok Jumat {String(infoTugasBesok.pasaran)}. Peran Anda: <strong className="text-amber-300">{String(infoTugasBesok.peran)}</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={playAlarmSound} className="px-4 py-2 bg-amber-500 text-slate-900 font-black text-xs rounded-xl">🔊 Tes Alarm</button>
                  <button onClick={() => { setIsDutyDismissed(true); addNotification("Kesiapan tugas Sholat Jumat telah dikonfirmasi!", "success"); }} className="px-4 py-2 bg-white text-rose-700 font-black text-xs rounded-xl">Saya Siap</button>
                </div>
              </div>
            )}

            {Array.isArray(currentUserRoles) && currentUserRoles.includes("Petugas") && (
              <div className="bg-slate-100 border rounded-2xl p-4 flex justify-between items-center">
                <div className="text-xs"><p className="font-extrabold text-slate-800">🛠️ Mode Uji Pengingat H-1</p></div>
                <button onClick={() => { setIsSimulatedThursday(!isSimulatedThursday); setIsDutyDismissed(false); }} className="px-4 py-2 rounded-xl text-xs font-bold border bg-white text-slate-700">{isSimulatedThursday ? "Matikan Simulator" : "Simulasikan Hari Kamis"}</button>
              </div>
            )}

            <div className="bg-emerald-700 text-white rounded-2xl p-5 shadow-md flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-200">Lokasi Jadwal Sholat</span>
                <h2 className="text-xl font-extrabold">Desa {String(lokasi.desa)}, Kec. {String(lokasi.kecamatan)}</h2>
              </div>
              {hasAccess("rbac") && <button onClick={() => setIsSettingLokasi(!isSettingLokasi)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold flex gap-2 transition-all"><Settings size={14} /> Atur Lokasi</button>}
            </div>

            {isSettingLokasi && (
              <div className="bg-white border p-5 rounded-2xl shadow-lg grid gap-4 transition-all">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm">Ubah Geografis</h3>
                    <button onClick={handleGetGPSLocation} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-bold flex gap-1 items-center transition-all"><MapPin size={14}/> Deteksi GPS HP Otomatis</button>
                </div>
                <div className="flex gap-4">
                  <input type="text" placeholder="Desa" value={tempLokasi.desa || ""} onChange={e => setTempLokasi({...tempLokasi, desa: e.target.value})} className="border p-2 rounded-xl text-sm w-full outline-none focus:border-emerald-500" />
                  <input type="text" placeholder="Kecamatan" value={tempLokasi.kecamatan || ""} onChange={e => setTempLokasi({...tempLokasi, kecamatan: e.target.value})} className="border p-2 rounded-xl text-sm w-full outline-none focus:border-emerald-500" />
                </div>
                <div className="flex justify-end gap-2 mt-2 border-t pt-4">
                  <button onClick={() => setIsSettingLokasi(false)} className="px-5 py-2 text-xs font-bold border rounded-xl hover:bg-slate-50">Batal</button>
                  <button onClick={() => { setLokasi(tempLokasi); setIsSettingLokasi(false); addNotification("Lokasi berhasil diperbarui!", "success"); }} className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm">Simpan</button>
                </div>
              </div>
            )}

            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <h3 className="font-bold text-slate-900 mb-4 flex gap-2"><Compass size={18} className="text-emerald-600"/> Jadwal Sholat (Kemenag)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {Object.entries(jadwalSholat).map(([n, t]) => (
                  <div key={n} className={`p-3 rounded-xl border text-center ${nextSholat.name === n ? 'bg-emerald-500 text-white' : 'bg-slate-50'}`}><p className="text-[10px] font-bold opacity-80">{String(n)}</p><p className="font-extrabold">{String(t)}</p></div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-4 shadow-xs">
                <h3 className="font-bold flex items-center gap-2 text-sm"><Calendar className="text-emerald-600 w-5 h-5" /> Petugas Jumat Pekan Ini</h3>
                {upcomingFridaysList.length > 0 ? (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 mb-2">Jumat {String(upcomingFridaysList[0].pasaran)}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-[10px] text-slate-400">Khatib Utama</p><p className="font-bold">{String(upcomingFridaysList[0].petugas.khatib || "-")}</p></div>
                      <div><p className="text-[10px] text-slate-400">Imam Cadangan</p><p className="font-bold">{String(upcomingFridaysList[0].petugas.imam || "-")}</p></div>
                      <div><p className="text-[10px] text-slate-400 mt-2">Muadzin</p><p className="font-bold">{String(upcomingFridaysList[0].petugas.muadzin || "-")}</p></div>
                      <div><p className="text-[10px] text-slate-400 mt-2">Bilal / MC</p><p className="font-bold">{String(upcomingFridaysList[0].petugas.bilal || "-")}</p></div>
                    </div>
                  </div>
                ) : <p className="text-xs mt-2 text-slate-400">Belum ada agenda petugas.</p>}
              </div>

              <div className="bg-white border rounded-2xl p-4 shadow-xs">
                <h3 className="font-bold flex items-center gap-2 text-sm"><UsersRound className="text-emerald-600 w-5 h-5" /> Sebaran Mustahik</h3>
                <div className="space-y-2 mt-3">
                  {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                    <div key={asnaf} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border">
                      <span className="font-bold">{String(asnaf)}</span>
                      <span>Fitrah: <strong className="text-emerald-600">{getJumlahJiwaPerKategoriFitrah(jamaahList, asnaf)}</strong> | Zuru': <strong className="text-teal-600">{getJumlahJiwaPerKategoriZuru(jamaahList, asnaf)}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: PETUGAS ======================= */}
        {activeTab === "petugas" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Jadwal Petugas Abadi (5 Pasaran Jawa)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {PASARAN_LIST.map((pasaran) => {
                const data = petugasAbadi[pasaran] || {};
                return (
                  <div key={pasaran} className="bg-white border p-4 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-emerald-700 text-xs">JUMAT {String(pasaran).toUpperCase()}</span>
                      {canEditPetugas && <button onClick={() => handleEditPasaran(pasaran)} className="text-slate-400 hover:text-emerald-600"><Edit2 size={14}/></button>}
                    </div>
                    <div className="text-xs space-y-2">
                      <p><span className="block text-[10px] text-slate-400">Khatib</span><strong className="text-slate-800">{String(data.khatib || "-")}</strong></p>
                      <p><span className="block text-[10px] text-slate-400">Imam</span><strong className="text-slate-800">{String(data.imam || "-")}</strong></p>
                      <p><span className="block text-[10px] text-slate-400">Muadzin</span>{String(data.muadzin || "-")}</p>
                      <p><span className="block text-[10px] text-slate-400">Bilal</span>{String(data.bilal || "-")}</p>
                      {data.telp && <p className="pt-2 mt-2 border-t font-mono text-[10px] text-slate-500">📞 {String(data.telp)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {editingPasaran && (
              <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold mb-4 border-b pb-2">Ubah Petugas Jumat {String(editingPasaran)}</h3>
                  <form onSubmit={handleSavePasaran} className="space-y-3">
                    <input type="text" required placeholder="Khatib Utama" value={pasaranForm.khatib} onChange={e => setPasaranForm({...pasaranForm, khatib: e.target.value})} className="w-full text-sm border p-2 rounded outline-none" />
                    <input type="text" required placeholder="No HP Khatib" value={pasaranForm.telp} onChange={e => setPasaranForm({...pasaranForm, telp: e.target.value})} className="w-full text-sm border p-2 rounded outline-none" />
                    <input type="text" required placeholder="Imam Cadangan" value={pasaranForm.imam} onChange={e => setPasaranForm({...pasaranForm, imam: e.target.value})} className="w-full text-sm border p-2 rounded outline-none" />
                    <input type="text" placeholder="Muadzin" value={pasaranForm.muadzin} onChange={e => setPasaranForm({...pasaranForm, muadzin: e.target.value})} className="w-full text-sm border p-2 rounded outline-none" />
                    <input type="text" placeholder="Bilal" value={pasaranForm.bilal} onChange={e => setPasaranForm({...pasaranForm, bilal: e.target.value})} className="w-full text-sm border p-2 rounded outline-none" />
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingPasaran(null)} className="px-4 py-2 border rounded text-xs font-bold">Batal</button>
                      <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-bold">Simpan</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        )}

        {/* ======================= TAB: JAMAAH ======================= */}
        {activeTab === "jamaah" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Database Jemaah & Warga</h2>
              {canEditJamaah && <button onClick={() => { setEditingJamaah(null); setShowJamaahModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">{Array.isArray(currentUserRoles) && (currentUserRoles.includes("Amil") || currentUserRoles.includes("RT")) ? "Usul Warga" : "Tambah Warga"}</button>}
            </div>

            <div className="bg-slate-50 border p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-bold uppercase mb-2">Pilih Wilayah Laporan PDF:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedPrintWilayah} onChange={e => setSelectedPrintWilayah(e.target.value)} className="text-xs border bg-white p-2 rounded-xl flex-1 max-w-xs outline-none">
                  <option value="Semua">Semua RT & RW</option>
                  {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}
                </select>
                <button onClick={() => handlePrintSelectedReport("jamaah")} className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Warga</button>
                <button onClick={() => handlePrintSelectedReport("pekurban")} className="bg-amber-600 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Pekurban</button>
                <button onClick={() => handlePrintSelectedReport("terpadu")} className="bg-teal-700 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Terpadu</button>
              </div>
            </div>

            <div className="bg-white border rounded-2xl shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <select value={filterWilayahJamaah} onChange={e => setFilterWilayahJamaah(e.target.value)} className="text-xs border p-1.5 rounded outline-none">
                    <option value="Semua">Semua Wilayah</option>
                    {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}
                  </select>
                  <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">{currentWargaCount} KK</span>
                </div>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase">
                    <tr><th className="p-3">Nama</th><th className="p-3">RT/RW</th><th className="p-3">Alamat</th><th className="p-3">Jiwa</th><th className="p-3">Fitrah</th><th className="p-3">Zuru'</th><th className="p-3">Qurban</th><th className="p-3">Status</th>{canEditJamaah && <th className="p-3 text-right">Aksi</th>}</tr>
                  </thead>
                  <tbody className="text-xs font-semibold">
                    {Array.isArray(jamaahList) && jamaahList.filter(j => filterWilayahJamaah === "Semua" || `${j.rt}_${j.rw}` === filterWilayahJamaah).map(j => (
                      <tr key={j.id} className="border-t hover:bg-slate-50">
                        <td className="p-3 font-bold">{String(j.nama)} {j.isGuruNgaji && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded block w-max">Guru Ngaji</span>}</td>
                        <td className="p-3 whitespace-nowrap">RT {String(j.rt)}/{String(j.rw)}</td><td className="p-3 max-w-[150px] truncate" title={String(j.alamat)}>{String(j.alamat)}</td><td className="p-3 text-center">{String(j.anggota)}</td>
                        <td className="p-3"><span className={j.fitrah !== "Muzakki" ? "text-emerald-700 font-bold" : "text-slate-400"}>{String(j.fitrah)}</span></td>
                        <td className="p-3"><span className={j.zuru !== "Bukan Mustahik" ? "text-teal-700 font-bold" : "text-slate-400"}>{String(j.zuru)}</span></td>
                        <td className="p-3">{String(j.qurban) || "Penerima"}</td>
                        <td className="p-3">
                            {j.approvedByTakmir && !j.hasUsulanEdit ? <span className="text-emerald-600 font-bold">✔️ ACC</span> : 
                             j.hasUsulanEdit ? <span className="text-amber-600 font-bold">⏳ Cek Edit</span> :
                             <span className="text-blue-600 font-bold">⏳ Baru</span>}
                        </td>
                        {canEditJamaah && (
                          <td className="p-3 text-right whitespace-nowrap">
                            <button onClick={() => handleEditJamaah(j)} className="p-1.5 text-slate-500 hover:text-emerald-600"><Edit2 size={14}/></button>
                            <button onClick={() => handleDeleteJamaah(j.id)} className="p-1.5 text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {showJamaahModal && (
              <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="font-bold mb-4 text-lg border-b pb-2">{editingJamaah ? "Ubah Data Warga" : "Form Data Warga"}</h3>
                  <form onSubmit={handleSaveJamaah} className="space-y-4">
                    <input type="text" placeholder="Nama Kepala Keluarga" required value={jamaahForm.nama} onChange={e => setJamaahForm({...jamaahForm, nama: e.target.value})} className="w-full text-sm border p-2.5 rounded-xl outline-none" />
                    <div className="flex gap-4">
                      <div className="flex-1"><label className="text-[10px] font-bold text-slate-500">Jumlah Jiwa</label><input type="number" min="1" value={jamaahForm.anggota} onChange={e => setJamaahForm({...jamaahForm, anggota: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm" /></div>
                      <div className="flex-1"><label className="text-[10px] font-bold text-slate-500">Wilayah</label><select value={`${jamaahForm.rt}_${jamaahForm.rw}`} onChange={e => { const [rt, rw] = e.target.value.split('_'); setJamaahForm({...jamaahForm, rt, rw}); }} className="w-full border p-2.5 rounded-xl text-sm bg-white">{WILAYAH_OPTIONS.map(w => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}</select></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-500">Alamat</label><textarea required value={jamaahForm.alamat} onChange={e => setJamaahForm({...jamaahForm, alamat: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm resize-none" rows="2"/></div>
                    
                    {Array.isArray(currentUserRoles) && !currentUserRoles.includes("RT") && (
                      <div><label className="text-[10px] font-bold text-slate-500">Status Ekonomi</label>
                        <div className="flex gap-2 text-xs">
                          {["Mampu", "Kurang Mampu", "Sangat Kurang"].map((opsi) => (
                            <label key={opsi} className={`flex-1 border p-2 rounded-lg text-center cursor-pointer ${jamaahForm.ekonomi === opsi ? 'bg-emerald-50 border-emerald-500 font-bold' : ''}`}><input type="radio" value={opsi} checked={jamaahForm.ekonomi === opsi} onChange={() => setJamaahForm({...jamaahForm, ekonomi: opsi})} className="hidden"/>{String(opsi)}</label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Array.isArray(currentUserRoles) && !currentUserRoles.includes("RT") && (
                      <div className="flex items-center gap-2 border p-3 rounded-xl bg-slate-50">
                        <input type="checkbox" checked={jamaahForm.isGuruNgaji} onChange={e => setJamaahForm({...jamaahForm, isGuruNgaji: e.target.checked})} className="w-4 h-4 accent-emerald-600" />
                        <span className="text-xs font-bold">Warga ini berstatus Guru Ngaji (Bantuan Khusus)</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div><label className="text-[10px] font-bold text-emerald-600">Zakat Fitrah</label><select value={jamaahForm.fitrah} onChange={e => setJamaahForm({...jamaahForm, fitrah: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Muzakki">Muzakki (Bukan Penerima)</option><option value="Berat">Mustahik Berat</option><option value="Sedang">Mustahik Sedang</option><option value="Ringan">Mustahik Ringan</option></select></div>
                      <div><label className="text-[10px] font-bold text-teal-600">Zakat Zuru'</label><select value={jamaahForm.zuru} onChange={e => setJamaahForm({...jamaahForm, zuru: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Bukan Mustahik">Bukan Penerima</option><option value="Berat">Mustahik Berat</option><option value="Sedang">Mustahik Sedang</option><option value="Ringan">Mustahik Ringan</option></select></div>
                    </div>
                    
                    {Array.isArray(currentUserRoles) && !(currentUserRoles.includes("RT") && !currentUserRoles.includes("Admin") && !currentUserRoles.includes("Takmir") && !currentUserRoles.includes("Amil")) && (
                      <div><label className="text-[10px] font-bold text-rose-600">Status Qurban</label><select value={jamaahForm.qurban} onChange={e => setJamaahForm({...jamaahForm, qurban: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Penerima">Penerima Daging</option><option value="Sahibul Qurban - Sapi">Sahibul Qurban Sapi</option><option value="Sahibul Qurban - Kambing">Sahibul Qurban Kambing</option></select></div>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button type="button" onClick={() => setShowJamaahModal(false)} className="px-5 py-2.5 border rounded-xl text-xs font-bold">Batal</button>
                      <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">{(Array.isArray(currentUserRoles) && (currentUserRoles.includes("Amil") || currentUserRoles.includes("RT"))) ? "Usulkan Data" : "Simpan"}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: FITRAH ======================= */}
        {activeTab === "fitrah" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Kalkulator Zakat Fitrah</h2>
                <div className="flex gap-2">
                    <select value={selectedPrintWilayahFitrah} onChange={e => setSelectedPrintWilayahFitrah(e.target.value)} className="text-xs border p-2 rounded-xl outline-none">
                        <option value="Semua">Semua RT & RW</option>
                        {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}
                    </select>
                    <button onClick={() => handlePrintSelectedReport("fitrah")} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex gap-2 items-center"><Printer size={14}/> Cetak Laporan</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Timbangan Total Beras Masuk</p><p className="text-3xl font-black text-emerald-600 mb-4">{Number(totalTimbanganFitrahValue).toFixed(1)} Kg</p>
                  {canEditFitrah && (
                    <div className="flex gap-2"><input type="number" step="0.1" placeholder="Tambah timbangan (kg)" value={tempBeratFitrah} onChange={e => setTempBeratFitrah(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('fitrah')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                  )}
                  <div className="mt-3 max-h-24 overflow-y-auto space-y-1">
                    {Array.isArray(timbanganFitrah) && timbanganFitrah.map((b, i) => (<div key={i} className="flex justify-between bg-slate-50 p-2 text-xs border rounded"><span className="font-bold">{String(b)} Kg</span>{canEditFitrah && <button onClick={() => deleteTimbangan('fitrah', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                  </div>
                </div>
                <div className={`mt-4 p-3 rounded-lg border flex justify-between items-center ${statusFitrahValue >= 0 ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-rose-100 border-rose-200 text-rose-800'}`}>
                  <span className="text-xs font-bold uppercase">{statusFitrahValue >= 0 ? 'Surplus / Sisa Beras' : 'Kekurangan Beras'}</span>
                  <span className="text-xl font-black">{Math.abs(Number(statusFitrahValue)).toFixed(1)} Kg</span>
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between"><p className="text-xs font-bold text-slate-500 mb-2">Rencana Jatah Per Jiwa</p>{canEditFitrah && <button onClick={handleSaveAlokasiFitrah} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 font-bold border rounded-lg">Simpan Setelan</button>}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Berat", "Sedang", "Ringan"].map(a => (
                    <div key={a} className="border p-2 rounded bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-bold">{String(a)}</span><input type="number" disabled={!canEditFitrah} step="0.5" value={tempAlokasiFitrah[a]} onChange={e => setTempAlokasiFitrah({...tempAlokasiFitrah, [a]: e.target.value})} className="w-12 border rounded text-xs text-center outline-none" /></div>
                  ))}
                  <div className="border border-emerald-300 p-2 rounded bg-emerald-50 flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-700">Guru</span><input type="number" disabled={!canEditFitrah} step="0.5" value={tempAlokasiFitrah.GuruNgaji} onChange={e => setTempAlokasiFitrah({...tempAlokasiFitrah, GuruNgaji: e.target.value})} className="w-12 border rounded text-xs text-center bg-transparent outline-none" /></div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-slate-500 mb-2">Rincian Estimasi Kebutuhan</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50"><tr className="border-b"><th className="p-2">Kategori</th><th className="p-2 text-center">Jiwa/KK</th><th className="p-2 text-right">Butuh</th></tr></thead>
                      <tbody>
                        {rincianKebutuhanFitrahData.map((item, idx) => (
                           <tr key={idx} className="border-b"><td className="p-2 text-slate-700">{String(item.kategori)}</td><td className="p-2 text-center">{String(item.jiwa)}</td><td className="p-2 text-right font-bold">{String(item.totalButuh)} Kg</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Total Kebutuhan</p>
                    <p className="text-xl font-black text-emerald-800">{Number(totalButuhFitrahValue).toFixed(1)} Kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: ZURU ======================= */}
        {activeTab === "zuru" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Kalkulator Zakat Zuru'</h2>
                <div className="flex gap-2">
                    <select value={selectedPrintWilayahZuru} onChange={e => setSelectedPrintWilayahZuru(e.target.value)} className="text-xs border p-2 rounded-xl outline-none">
                        <option value="Semua">Semua RT & RW</option>
                        {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}
                    </select>
                    <button onClick={() => handlePrintSelectedReport("zuru")} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex gap-2 items-center"><Printer size={14}/> Cetak Laporan</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-2">Timbangan Total Panen Masuk</p><p className="text-3xl font-black text-teal-600 mb-4">{Number(totalTimbanganZuruValue).toFixed(1)} Kg</p>
                  {canEditZuru && (
                    <div className="flex gap-2"><input type="number" step="0.1" placeholder="Tambah timbangan (kg)" value={tempBeratZuru} onChange={e => setTempBeratZuru(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('zuru')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                  )}
                  <div className="mt-3 max-h-24 overflow-y-auto space-y-1">
                    {Array.isArray(timbanganZuru) && timbanganZuru.map((b, i) => (<div key={i} className="flex justify-between bg-slate-50 p-2 text-xs border rounded"><span className="font-bold">{String(b)} Kg</span>{canEditZuru && <button onClick={() => deleteTimbangan('zuru', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                  </div>
                </div>
                <div className={`mt-4 p-3 rounded-lg border flex justify-between items-center ${statusZuruValue >= 0 ? 'bg-teal-100 border-teal-200 text-teal-800' : 'bg-rose-100 border-rose-200 text-rose-800'}`}>
                  <span className="text-xs font-bold uppercase">{statusZuruValue >= 0 ? 'Surplus / Sisa Panen' : 'Kekurangan Panen'}</span>
                  <span className="text-xl font-black">{Math.abs(Number(statusZuruValue)).toFixed(1)} Kg</span>
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between"><p className="text-xs font-bold text-slate-500 mb-2">Rencana Jatah Per Jiwa</p>{canEditZuru && <button onClick={handleSaveAlokasiZuru} className="text-xs bg-teal-100 text-teal-700 px-3 py-1 font-bold border rounded-lg">Simpan Setelan</button>}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Berat", "Sedang", "Ringan"].map(a => (
                    <div key={a} className="border p-2 rounded bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-bold">{String(a)}</span><input type="number" disabled={!canEditZuru} step="0.5" value={tempAlokasiZuru[a]} onChange={e => setTempAlokasiZuru({...tempAlokasiZuru, [a]: e.target.value})} className="w-12 border rounded text-xs text-center outline-none" /></div>
                  ))}
                  <div className="border border-teal-300 p-2 rounded bg-teal-50 flex justify-between items-center"><span className="text-[10px] font-bold text-teal-700">Guru</span><input type="number" disabled={!canEditZuru} step="0.5" value={tempAlokasiZuru.GuruNgaji} onChange={e => setTempAlokasiZuru({...tempAlokasiZuru, GuruNgaji: e.target.value})} className="w-12 border rounded text-xs text-center bg-transparent outline-none" /></div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-slate-500 mb-2">Rincian Estimasi Kebutuhan</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50"><tr className="border-b"><th className="p-2">Kategori</th><th className="p-2 text-center">Jiwa/KK</th><th className="p-2 text-right">Butuh</th></tr></thead>
                      <tbody>
                        {rincianKebutuhanZuruData.map((item, idx) => (
                           <tr key={idx} className="border-b"><td className="p-2 text-slate-700">{String(item.kategori)}</td><td className="p-2 text-center">{String(item.jiwa)}</td><td className="p-2 text-right font-bold">{String(item.totalButuh)} Kg</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex justify-between items-center bg-teal-50 p-2 rounded-lg border border-teal-100">
                    <p className="text-[10px] font-bold uppercase text-teal-700">Total Kebutuhan</p>
                    <p className="text-xl font-black text-teal-800">{Number(totalButuruValue).toFixed(1)} Kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: QURBAN ======================= */}
        {activeTab === "qurban" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Kalkulator Daging Qurban</h2>
                <div className="flex gap-2">
                    <select value={selectedPrintWilayahQurban} onChange={e => setSelectedPrintWilayahQurban(e.target.value)} className="text-xs border p-2 rounded-xl outline-none">
                        <option value="Semua">Semua RT & RW</option>
                        {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{String(w.label)}</option>)}
                    </select>
                    <button onClick={() => handlePrintSelectedReport("qurban")} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Printer size={14}/> Cetak Laporan</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-2xl p-4 shadow-xs">
                    <h3 className="font-bold text-sm mb-3 text-indigo-600">Alokasi Hak Sahibul Qurban (Pencatatan)</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2"><span className="text-xs font-bold">SAPI:</span><input type="number" step="0.1" value={tempQurbanSahibul.sapi} onChange={e => setTempQurbanSahibul({...tempQurbanSahibul, sapi: parseFloat(e.target.value) || 0})} className="w-16 border rounded text-sm text-center outline-none" /> <span className="text-xs">Kg</span></div>
                        <div className="flex items-center gap-2"><span className="text-xs font-bold">KAMBING:</span><input type="number" step="0.1" value={tempQurbanSahibul.kambing} onChange={e => setTempQurbanSahibul({...tempQurbanSahibul, kambing: parseFloat(e.target.value) || 0})} className="w-16 border rounded text-sm text-center outline-none" /> <span className="text-xs">Kg</span></div>
                    </div>
                </div>

                <div className="bg-white border rounded-2xl p-4 shadow-xs">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm text-orange-600">Alokasi Tamu / Panitia (Memotong Kuota)</h3>
                        {canEditQurban && <button onClick={handleSaveQurbanTambahan} className="bg-slate-800 text-white px-3 py-1 rounded text-[10px] font-bold">Simpan</button>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="block text-[10px] text-slate-500 font-bold mb-1">Jumlah Orang</span><input type="number" value={tempQurbanTamu.jumlah} onChange={e => setTempQurbanTamu({...tempQurbanTamu, jumlah: parseInt(e.target.value) || 0})} className="w-full border p-1.5 rounded text-center outline-none" /></div>
                        <div><span className="block text-[10px] text-slate-500 font-bold mb-1">Jatah Sapi/Org (Kg)</span><input type="number" step="0.1" value={tempQurbanTamu.jatahSapi} onChange={e => setTempQurbanTamu({...tempQurbanTamu, jatahSapi: parseFloat(e.target.value) || 0})} className="w-full border p-1.5 rounded text-center outline-none" /></div>
                        <div><span className="block text-[10px] text-slate-500 font-bold mb-1">Jatah Kmbg/Org (Kg)</span><input type="number" step="0.1" value={tempQurbanTamu.jatahKambing} onChange={e => setTempQurbanTamu({...tempQurbanTamu, jatahKambing: parseFloat(e.target.value) || 0})} className="w-full border p-1.5 rounded text-center outline-none" /></div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-500 mb-2">Total Daging SAPI Masuk</p><p className="text-3xl font-black text-rose-600 mb-4">{Number(totalTimbanganQurbanSapiValue).toFixed(1)} Kg</p>
                  {canEditQurban && (
                    <div className="flex gap-2"><input type="number" step="0.1" placeholder="Berat Daging Sapi (kg)" value={tempBeratQurbanSapi} onChange={e => setTempBeratQurbanSapi(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('qurbanSapi')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                  )}
                  <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                    {Array.isArray(timbanganQurbanSapi) && timbanganQurbanSapi.map((b, i) => (<div key={i} className="flex justify-between bg-rose-50 p-2 text-xs border border-rose-100 rounded text-rose-900"><span className="font-bold">{String(b)} Kg</span>{canEditQurban && <button onClick={() => deleteTimbangan('qurbanSapi', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-500 mb-2">Total Daging KAMBING Masuk</p><p className="text-3xl font-black text-amber-600 mb-4">{Number(totalTimbanganQurbanKambingValue).toFixed(1)} Kg</p>
                  {canEditQurban && (
                    <div className="flex gap-2"><input type="number" step="0.1" placeholder="Berat Daging Kambing (kg)" value={tempBeratQurbanKambing} onChange={e => setTempBeratQurbanKambing(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('qurbanKambing')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                  )}
                  <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                    {Array.isArray(timbanganQurbanKambing) && timbanganQurbanKambing.map((b, i) => (<div key={i} className="flex justify-between bg-amber-50 p-2 text-xs border border-amber-100 rounded text-amber-900"><span className="font-bold">{String(b)} Kg</span>{canEditQurban && <button onClick={() => deleteTimbangan('qurbanKambing', i)} className="text-amber-500"><Trash2 size={14}/></button>}</div>))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white border rounded-3xl p-5 shadow-lg grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-[10px] text-slate-400 uppercase font-bold">Warga Penerima (Sisa)</p><p className="text-3xl font-black mt-1">{String(totalPenerimaKK)} KK</p></div>
              <div className="text-center border-l border-slate-700"><p className="text-[10px] text-rose-400 uppercase font-bold">Jatah Sapi / KK</p><p className="text-3xl font-black mt-1">{Number(jatahDagingSapiPerKK).toFixed(2)} Kg</p></div>
              <div className="text-center border-l border-slate-700"><p className="text-[10px] text-amber-400 uppercase font-bold">Jatah Kambing / KK</p><p className="text-3xl font-black mt-1">{Number(jatahDagingKambingPerKK).toFixed(2)} Kg</p></div>
            </div>
          </div>
        )}

        {/* ======================= TAB: RBAC ======================= */}
        {activeTab === "rbac" && Array.isArray(currentUserRoles) && currentUserRoles.includes("Admin") && (
          <div className="space-y-6">
            
            {pendingAccounts.length > 0 && (
              <div className="bg-white border-2 border-emerald-500 p-5 rounded-2xl shadow-sm">
                <h3 className="font-bold text-sm mb-4">Verifikasi Pendaftaran Akun Baru Mandiri</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead><tr className="bg-slate-50"><th className="p-3">Nama</th><th className="p-3">Username</th><th className="p-3">Peran & ACC</th></tr></thead>
                    <tbody>
                      {pendingAccounts.map(un => (
                        <tr key={un} className="border-t">
                          <td className="p-3 font-bold">{String(userDatabase[un].label)}</td><td className="p-3 font-mono">@{String(un)}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <select id={`r-${un}`} className="border p-1.5 rounded outline-none" defaultValue="Jamaah"><option value="Takmir">Takmir</option><option value="Amil">Amil Zakat</option><option value="RT">Ketua RT</option><option value="Petugas">Petugas</option><option value="Jamaah">Jama'ah</option></select>
                              <button onClick={() => handleApproveAccount(un, document.getElementById(`r-${un}`).value)} className="bg-emerald-600 text-white px-3 rounded font-bold">ACC</button>
                              <button onClick={() => handleRejectAccount(un)} className="bg-rose-100 text-rose-600 px-3 rounded font-bold">Tolak</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl shadow-xs border">
              <h3 className="font-bold text-sm mb-4">Identitas Masjid</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={tempMasjidName} onChange={e => setTempMasjidName(e.target.value)} className="w-full border p-3 rounded-xl text-sm outline-none" placeholder="Nama Masjid" />
                  <input type="url" value={tempMasjidLogoUrl} onChange={e => setTempMasjidLogoUrl(e.target.value)} className="w-full border p-3 rounded-xl text-sm outline-none" placeholder="Tautan/URL Gambar Logo Masjid" />
              </div>
              <div className="mt-4 text-right">
                  <button onClick={handleSaveNewIdentity} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-bold">Simpan Identitas</button>
              </div>
            </div>

            {/* BARU: FITUR SINKRONISASI MANUAL BACKUP & RESTORE DATA (PENCEGAH HILANGNYA DATA MASJID) */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border">
              <h3 className="font-bold text-sm mb-2 text-blue-700">Pencadangan & Pemulihan Data Manual</h3>
              <p className="text-xs text-slate-500 mb-4">Ekspor cadangan teks ini untuk mengamankan 250+ KK Anda agar tidak terhapus cache browser/webview.</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                   onClick={() => {
                     const dataStr = JSON.stringify(jamaahList);
                     navigator.clipboard.writeText(dataStr);
                     addNotification("Database warga berhasil disalin ke papan klip! Simpan di catatan HP Anda.", "success");
                   }}
                   className="px-4 py-2.5 bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex gap-2 justify-center items-center hover:bg-blue-200"
                 >
                   <Download size={14}/> Salin Teks Cadangan (Backup)
                 </button>
                 <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Tempel teks cadangan di sini untuk memulihkan..." 
                      value={rawBackupInput}
                      onChange={(e) => setRawBackupInput(e.target.value)}
                      className="border p-2 rounded-xl text-xs flex-1 outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => {
                        if(!rawBackupInput.trim()) return;
                        try {
                           const parsed = JSON.parse(rawBackupInput.trim());
                           if(Array.isArray(parsed)) {
                              setJamaahList(parsed);
                              addNotification(`Sukses memulihkan ${parsed.length} data KK ke penyimpanan lokal Anda!`, "success");
                              setRawBackupInput("");
                           } else {
                              addNotification("Format teks cadangan tidak valid (Harus Array)!", "error");
                           }
                        } catch(err) {
                           addNotification("Format teks cadangan salah / rusak!", "error");
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
                    >
                      Pulihkan
                    </button>
                 </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border">
               <h3 className="font-bold text-sm mb-4">Pendaftaran Instan Akun Pengurus</h3>
               <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border items-end">
                 <div><label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label><input type="text" required value={newAccLabel} onChange={e => setNewAccLabel(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs outline-none" /></div>
                 <div><label className="text-[10px] font-bold text-slate-500">Username</label><input type="text" required value={newAccUsername} onChange={e => setNewAccUsername(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs outline-none" /></div>
                 <div><label className="text-[10px] font-bold text-slate-500">Password</label><input type="text" required value={newAccPassword} onChange={e => setNewAccPassword(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs outline-none" /></div>
                 <div className="flex gap-2"><select value={newAccRole} onChange={e => setNewAccRole(e.target.value)} className="flex-1 border p-2 rounded-lg text-xs font-bold outline-none"><option value="Admin">Admin</option><option value="Takmir">Takmir</option><option value="Amil">Amil Zakat</option><option value="RT">Ketua RT</option><option value="Petugas">Petugas</option><option value="Jamaah">Jama'ah</option></select><button type="submit" className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold">Buat</button></div>
               </form>
               
               <h3 className="font-bold text-xs mt-6 mb-3 uppercase text-slate-500">Akun Terdaftar (Aktif)</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                 {Object.keys(userDatabase).filter(k => userDatabase[k].approved).map(k => (
                    <div key={k} className="border rounded-xl p-3 flex justify-between items-center bg-white">
                      <div className="w-full max-w-[70%]">
                        <p className="font-bold text-xs truncate">{String(userDatabase[k].label)}</p>
                        <p className="text-[10px] text-slate-500 font-mono">@{String(k)} | Pass: {String(userDatabase[k].password)}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(userDatabase[k].roles || [userDatabase[k].role]).map((r, i) => (
                             <span key={i} className="text-[8px] bg-slate-100 border px-1 rounded font-bold">{String(r)}</span>
                          ))}
                        </div>
                      </div>
                      
                      {k !== "admin" && (
                          <div className="flex gap-1">
                            <button onClick={() => setEditingUserRoles({ username: k, roles: userDatabase[k].roles || [userDatabase[k].role] })} className="text-blue-500 bg-blue-50 p-1.5 rounded hover:bg-blue-100" title="Edit Peran"><Edit2 size={14}/></button>
                            <button onClick={() => handleDeleteAccount(k)} className="text-rose-500 bg-rose-50 p-1.5 rounded hover:bg-rose-100" title="Hapus Akun"><Trash2 size={14}/></button>
                          </div>
                      )}
                    </div>
                 ))}
               </div>
            </div>

            {/* MODAL EDIT MULTI ROLE UNTUK ADMIN */}
            {editingUserRoles && (
              <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                   <h3 className="font-bold mb-1">Atur Peran Akun</h3>
                   <p className="text-xs text-slate-500 font-mono mb-4">@{String(editingUserRoles.username)}</p>
                   
                   <div className="space-y-2 mb-6">
                     {Object.keys(rolesConfig).map(roleKey => (
                       <label key={roleKey} className="flex items-center gap-3 text-sm border p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                         <input 
                           type="checkbox" 
                           checked={editingUserRoles.roles.includes(roleKey)}
                           onChange={(e) => {
                             const newRoles = e.target.checked 
                               ? [...editingUserRoles.roles, roleKey] 
                               : editingUserRoles.roles.filter(r => r !== roleKey);
                             setEditingUserRoles({...editingUserRoles, roles: newRoles});
                           }}
                           className="w-4 h-4 accent-emerald-600 cursor-pointer"
                         />
                         <span className="font-bold text-slate-700">{String(rolesConfig[roleKey].label)}</span>
                       </label>
                     ))}
                   </div>
                   <div className="flex justify-end gap-2">
                     <button onClick={() => setEditingUserRoles(null)} className="px-4 py-2 border rounded-xl text-xs font-bold">Batal</button>
                     <button onClick={() => {
                        if(editingUserRoles.roles.length === 0) {
                            addNotification("Minimal harus ada 1 peran!", "error"); return;
                        }
                        setUserDatabase(prev => ({
                          ...prev,
                          [editingUserRoles.username]: { ...prev[editingUserRoles.username], roles: editingUserRoles.roles }
                        }));
                        addNotification("Peran akun berhasil diperbarui!", "success");
                        setEditingUserRoles(null);
                     }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm">Simpan Peran</button>
                   </div>
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-2xl shadow-xs border overflow-x-auto">
              <h3 className="font-bold text-sm mb-4">Matriks Akses (RBAC)</h3>
              <table className="w-full text-left text-xs border-collapse min-w-[500px] overflow-hidden rounded-lg">
                <thead className="bg-slate-800 text-white"><tr className="border-b border-slate-700"><th className="p-3">Modul Aplikasi</th>{Object.keys(rolesConfig).map(r => <th key={r} className="p-3 text-center">{String(r)}</th>)}</tr></thead>
                <tbody>
                  {[{id: "dashboard", label: "Dashboard Utama"}, {id: "petugas", label: "Petugas Jumat"}, {id: "jamaah", label: "Data Warga"}, {id: "fitrah", label: "Zakat Fitrah"}, {id: "zuru", label: "Zakat Zuru'"}, {id: "qurban", label: "Qurban"}, {id: "rbac", label: "Pengaturan RBAC"}].map((m, index) => (
                    <tr key={m.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="p-3 font-bold border-r">{String(m.label)}</td>
                      {Object.keys(rolesConfig).map(r => {
                          const accessLvl = rolesConfig[r].access[m.id];
                          let badgeClass = "bg-rose-100 text-rose-700";
                          if(accessLvl === 'edit') badgeClass = "bg-emerald-100 text-emerald-800";
                          if(accessLvl === 'view') badgeClass = "bg-blue-100 text-blue-800";
                          return (
                            <td key={r} className="p-2 text-center border-r">
                                <select value={accessLvl} disabled={r === "Admin" && m.id === "rbac"} onChange={e => updateRoleAccess(r, m.id, e.target.value)} className={`text-[10px] font-bold p-1 rounded-md cursor-pointer border-none outline-none ${badgeClass}`}>
                                <option value="none">❌ Kunci</option><option value="view">👁️ Lihat</option><option value="edit">✏️ Edit</option>
                                </select>
                            </td>
                          );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* Bagian Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 z-10 w-full mt-auto">
        &copy; {new Date().getFullYear()} {String(masjidName)} - developed by Misbahul Munir
      </footer>

      {printIframeData && (
         <div className="fixed inset-0 z-[99999] bg-slate-100 flex flex-col h-screen w-screen overflow-hidden animate-fadeIn">
           <iframe title="Print" srcDoc={printIframeData} className="w-full h-full border-0 bg-transparent flex-1" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals" />
         </div>
      )}
    </div>
  );
}
