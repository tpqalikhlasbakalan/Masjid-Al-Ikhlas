import React, { useState, useEffect } from 'react';
import { 
  Compass, Users, Gift, Heart, UserCheck, Settings, 
  Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, Lock, KeyRound, User, Eye, EyeOff, UserPlus, FileText,
  Phone, Send, BellRing, Smartphone, Menu, RefreshCw, Database
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
  "admin": { password: "admin123", role: "Admin", label: "Super Admin", approved: true },
  "takmir": { password: "takmir123", role: "Takmir", label: "Takmir Masjid", approved: true },
  "rt01": { password: "rt123", role: "RT", label: "Ketua RT 01", approved: true },
  "amil": { password: "amil123", role: "Amil", label: "Amil Zakat", approved: true },
  "jamaah": { password: "jamaah123", role: "Jamaah", label: "Jama'ah / Warga", approved: true },
  "khsyukron": { password: "petugas123", role: "Petugas", label: "KH. Syukron Ma'mun", approved: true },
  "ahmadhafiz": { password: "petugas123", role: "Petugas", label: "Ustadz Ahmad Al-Hafiz", approved: true },
  "bilalhanafi": { password: "petugas123", role: "Petugas", label: "Bilal Hanafi", approved: true },
  "soleh": { password: "petugas123", role: "Petugas", label: "Soleh", approved: true }
};

const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "Sedang", zuru: "Sedang", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: true, usulanOleh: "System" },
  { id: "subur", nama: "Pak Subur Sugiarto", anggota: 4, rt: "01", rw: "01", alamat: "Samping Jembatan Tikung", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat", qurban: "Penerima", isGuruNgaji: false, approvedByTakmir: false, usulanOleh: "Ketua RT 01" }
];

const INITIAL_PETUGAS_ABADI = {
  Legi: { khatib: "KH. Syukron Ma'mun", imam: "Ustadz Ahmad Al-Hafiz", muadzin: "Bilal Hanafi", bilal: "Soleh", telp: "081234567890" },
  Pahing: { khatib: "Prof. Dr. KH. Said Aqil", imam: "Ustadz Hasanuddin", muadzin: "Zainal Abidin", bilal: "Rudi Yulianto", telp: "081398765432" },
  Pon: { khatib: "Ustadz Adi Hidayat, Lc", imam: "Ustadz Sholihuddin", muadzin: "H. Abdul Qodir", bilal: "Slamet", telp: "085711223344" },
  Wage: { khatib: "KH. Anwar Zahid", imam: "Ustadz Abdurrahman", muadzin: "Supardi", bilal: "Mulyono", telp: "089988776655" },
  Kliwon: { khatib: "KH. Bahauddin Nursalim (Gus Baha)", imam: "Ustadz Hasan Al-Banna", muadzin: "M. Thoriq", bilal: "Sidiq Prasetyo", telp: "082144332211" }
};

// ====================================================================
// GLOBAL STABLE PURE FUNCTIONS (Aman dari referensi error)
// ====================================================================
function KubahMasjidIcon({ className }) {
  return (
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
}

function migrateRolesConfig(savedConfig) {
  if (!savedConfig || typeof savedConfig !== 'object' || !savedConfig.Admin || Array.isArray(savedConfig.Admin.access)) return INITIAL_ROLES;
  return savedConfig;
}

function getLocalStorageData(key, fallbackValue) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null") return fallbackValue;
    try { 
      const parsed = JSON.parse(saved); 
      // Proteksi anti-crash jika JSON malah menyimpan Objek React
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
}

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

function getPasaranJawa(date) {
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(dateUTC / msPerDay);
  let pasaranIndex = (diffDays + 3) % 5;
  if (pasaranIndex < 0) pasaranIndex += 5;
  return PASARAN_LIST[pasaranIndex];
}

function getUpcomingFridays(currentTime, petugasAbadi, count = 5) {
  const fridays = [];
  const tempDate = new Date(currentTime);
  const dayOfWeek = tempDate.getDay();
  let daysToFriday = (5 - dayOfWeek + 7) % 7;
  if (daysToFriday === 0 && tempDate.getHours() >= 18) daysToFriday = 7;
  tempDate.setDate(tempDate.getDate() + daysToFriday);
  
  for (let i = 0; i < count; i++) {
    const target = new Date(tempDate);
    const pasaran = getPasaranJawa(target);
    fridays.push({
      formattedDate: target.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      rawDate: new Date(target), pasaran: pasaran, petugas: petugasAbadi[pasaran] || {}
    });
    tempDate.setDate(tempDate.getDate() + 7);
  }
  return fridays;
}

function getJumlahJiwaPerKategoriFitrah(list, kategori) {
  if (!Array.isArray(list)) return 0;
  return list.filter(item => item.fitrah === kategori && item.approvedByTakmir).reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
}

function getJumlahJiwaPerKategoriZuru(list, kategori) {
  if (!Array.isArray(list)) return 0;
  return list.filter(item => item.zuru === kategori && item.approvedByTakmir).reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
}

function createWAShareLink(masjidName, title, rtTitle, summaryText) {
  const message = `*${String(masjidName)}*\n\n📝 *${title}*\nWilayah: ${rtTitle}\nTanggal: ${new Date().toLocaleDateString('id-ID')}\n\n${summaryText}\n\n_Dokumen cetak tersedia di pengurus._`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// ====================================================================
// MAIN COMPONENT APP
// ====================================================================
export default function App() {
  // === 1. STATES INITIALIZATION ===
  const [masjidName, setMasjidName] = useState(() => getLocalStorageData("masjidName", "Masjid Al-Ikhlas Bakalan"));
  const [masjidLogoUrl, setMasjidLogoUrl] = useState(() => getLocalStorageData("masjidLogoUrl", ""));

  const [tempMasjidName, setTempMasjidName] = useState(masjidName);
  const [tempMasjidLogoUrl, setTempMasjidLogoUrl] = useState(masjidLogoUrl);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("Admin");
  const [currentUserLabel, setCurrentUserLabel] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  
  const [rolesConfig, setRolesConfig] = useState(() => getLocalStorageData("rolesConfig", INITIAL_ROLES));
  const [userDatabase, setUserDatabase] = useState(() => getLocalStorageData("userDatabase", INITIAL_USER_DATABASE));

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

  const [editingAccountPassword, setEditingAccountPassword] = useState(null); 
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const [lokasi, setLokasi] = useState(() => getLocalStorageData("lokasi", INITIAL_LOKASI));
  const [isSettingLokasi, setIsSettingLokasi] = useState(false);
  const [tempLokasi, setTempLokasi] = useState(lokasi);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [petugasAbadi, setPetugasAbadi] = useState(() => getLocalStorageData("petugasAbadi", INITIAL_PETUGAS_ABADI));
  const [editingPasaran, setEditingPasaran] = useState(null);
  const [pasaranForm, setPasaranForm] = useState({ khatib: "", imam: "", muadzin: "", bilal: "", telp: "" });

  const [activeNotificationSim, setActiveNotificationSim] = useState(null);
  const [notificationType, setNotificationType] = useState("WA"); 
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [isSimulatedThursday, setIsSimulatedThursday] = useState(false);
  const [isDutyDismissed, setIsDutyDismissed] = useState(false);
  const [audioContext, setAudioContext] = useState(null);

  const [jamaahList, setJamaahList] = useState(() => getLocalStorageData("jamaahList", INITIAL_JAMAAH));
  const [filterWilayahJamaah, setFilterWilayahJamaah] = useState("Semua");

  const [timbanganFitrah, setTimbanganFitrah] = useState(() => getLocalStorageData("timbanganFitrah", [25, 50, 15, 30]));
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  const [alokasiFitrah, setAlokasiFitrah] = useState(() => {
    const saved = getLocalStorageData("alokasiFitrah", { "Berat": 5.0, "Sedang": 3.0, "Ringan": 1.5, "Muzakki": 0.0, "GuruNgaji": 5.0 });
    if(saved.GuruNgaji === undefined) saved.GuruNgaji = 5.0;
    return saved;
  });
  const [tempAlokasiFitrah, setTempAlokasiFitrah] = useState(alokasiFitrah);

  const [timbanganZuru, setTimbanganZuru] = useState(() => getLocalStorageData("timbanganZuru", [120, 250, 80]));
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  const [alokasiZuru, setAlokasiZuru] = useState(() => {
    const saved = getLocalStorageData("alokasiZuru", { "Berat": 15.0, "Sedang": 10.0, "Ringan": 5.0, "Bukan Mustahik": 0.0, "GuruNgaji": 15.0 });
    if(saved.GuruNgaji === undefined) saved.GuruNgaji = 15.0;
    return saved;
  });
  const [tempAlokasiZuru, setTempAlokasiZuru] = useState(alokasiZuru);

  const [timbanganQurbanSapi, setTimbanganQurbanSapi] = useState(() => getLocalStorageData("timbanganQurbanSapi", [85.5, 120.0, 95.0, 65.5]));
  const [timbanganQurbanKambing, setTimbanganQurbanKambing] = useState(() => getLocalStorageData("timbanganQurbanKambing", [22.0, 18.5, 25.0]));
  const [tempBeratQurbanSapi, setTempBeratQurbanSapi] = useState("");
  const [tempBeratQurbanKambing, setTempBeratQurbanKambing] = useState("");
  
  const [filterWilayahQurban, setFilterWilayahQurban] = useState("Semua");
  const [selectedPrintWilayahQurban, setSelectedPrintWilayahQurban] = useState("Semua");
  const [qurbanHanyaMustahik, setQurbanHanyaMustahik] = useState(false);

  const [selectedPrintWilayah, setSelectedPrintWilayah] = useState("Semua");
  const [showJamaahModal, setShowJamaahModal] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState(null);
  const [jamaahForm, setJamaahForm] = useState({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false });

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => getLocalStorageData("googleSheetsUrl", GOOGLE_SHEETS_SCRIPT_URL));
  const [syncStatus, setSyncStatus] = useState("Tersinkronisasi Lokal");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const [printIframeData, setPrintIframeData] = useState(null);
  const [jadwalSholat, setJadwalSholat] = useState(() => getLocalStorageData("jadwalSholatAktif", getMockJadwal(lokasi.kabupaten, lokasi.latitude, lokasi.longitude)));


  // === 2. DECLARATIONS & EVENT HANDLERS (Terstruktur di tingkat atas komponen) ===
  function addNotification(message, type = "success") {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: String(message), type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }

  function playAlarmSound() {
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
  }

  function renderMasjidLogo(imgClassName, fallbackClassName) {
    if (typeof masjidLogoUrl === 'string' && masjidLogoUrl.trim() !== "") {
      return ( 
        <img src={masjidLogoUrl} alt="Logo Masjid" className={imgClassName} onError={() => { addNotification("Logo kustom gagal dimuat!", "error"); setMasjidLogoUrl(""); }} /> 
      );
    }
    return <KubahMasjidIcon className={fallbackClassName} />;
  }

  function hasAccess(tabName) {
    if (!rolesConfig || !rolesConfig[currentRole]) return false;
    const acc = rolesConfig[currentRole]?.access?.[tabName];
    return acc === "view" || acc === "edit" || currentRole === "Admin";
  }

  function updateRoleAccess(role, menuId, newAccess) {
    setRolesConfig(prev => ({ ...prev, [role]: { ...prev[role], access: { ...prev[role].access, [menuId]: newAccess } } }));
    addNotification(`Hak akses diubah.`, "success");
  }

  function navigateTo(tabName) {
    if (hasAccess(tabName)) { setActiveTab(tabName); setIsMenuOpen(false); } 
    else { addNotification(`Akses Ditolak! Peran Anda tidak memiliki hak.`, "error"); }
  }

  function getNextSholat() {
    const nowStr = currentTime.toTimeString().split(' ')[0].substring(0, 5); 
    const sholatTimes = Object.entries(jadwalSholat).filter(([k]) => k !== 'Terbit');
    for (let [name, time] of sholatTimes) { if (String(time) > nowStr) return { name: String(name), time: String(time) }; }
    return { name: "Subuh (Besok)", time: String(sholatTimes[0][1]) };
  }

  function getPetugasTugasBesok() {
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

    const pasaranBesok = getPasaranJawa(targetDate);
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
  }

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
      const todayStr = new Date().toLocaleDateString('id-ID');
      const cacheKey = `jadwal_${lokasi.latitude}_${lokasi.longitude}_${todayStr}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached && cached !== "undefined") {
        try { 
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && !parsed.$$typeof) {
             setJadwalSholat(parsed); 
             return;
          }
        } catch(e){}
      }
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=20`);
        const result = await res.json();
        if (result && result.code === 200) {
          const t = result.data.timings;
          const realJadwal = {
            Subuh: String(t.Fajr), Terbit: String(t.Sunrise), Dzuhur: String(t.Dhuhr),
            Ashar: String(t.Asr), Maghrib: String(t.Maghrib), Isya: String(t.Isha)
          };
          setJadwalSholat(realJadwal);
          localStorage.setItem(cacheKey, JSON.stringify(realJadwal));
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
        if (payload.userDatabase !== undefined) setUserDatabase(payload.userDatabase);
        setSyncStatus("Tersinkronisasi");
        addNotification("Data berhasil diperbarui dari Server Pusat!", "success");
      } else { setSyncStatus("Tersinkronisasi Lokal"); }
    } catch (err) {
      setSyncStatus("Gagal Sinkron");
      addNotification("Gagal menarik data dari Google Sheets.", "error");
    } finally {
      setIsSyncing(false); setIsDataFetched(true); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (googleSheetsUrl) handleFetchFromGoogleSheets();
      else setIsDataFetched(true);
    }
  }, [isLoggedIn, googleSheetsUrl]);

  useEffect(() => {
    if (!isLoggedIn || !googleSheetsUrl || !isDataFetched) return;
    const payload = {
      masjidName, masjidLogoUrl, petugasAbadi, jamaahList, 
      timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru,
      timbanganQurbanSapi, timbanganQurbanKambing, userDatabase
    };
    setSyncStatus("Menyimpan Otomatis...");
    const timeoutId = setTimeout(async () => {
      try {
        await fetch(googleSheetsUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) });
        setSyncStatus("Tersinkronisasi");
      } catch (err) { setSyncStatus("Gagal Menyimpan"); }
    }, 3000); 
    return () => clearTimeout(timeoutId);
  }, [masjidName, masjidLogoUrl, petugasAbadi, jamaahList, timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru, timbanganQurbanSapi, timbanganQurbanKambing, userDatabase, isLoggedIn, googleSheetsUrl, isDataFetched]);


  // === 4. DERIVED CALCULATIONS ===
  const usulanWargaList = Array.isArray(jamaahList) ? jamaahList.filter(w => !w.approvedByTakmir) : [];
  const pendingAccounts = Object.keys(userDatabase).filter(un => !userDatabase[un].approved);

  const nextSholat = getNextSholat();
  const upcomingFridaysList = getUpcomingFridays(currentTime, petugasAbadi, 5);
  const infoTugasBesok = getPetugasTugasBesok();

  const totalTimbanganFitrahValue = Array.isArray(timbanganFitrah) ? timbanganFitrah.reduce((a, b) => a + b, 0) : 0;
  const rincianKebutuhanFitrahData = [];
  ["Berat", "Sedang", "Ringan"].forEach(kat => {
      const list = Array.isArray(jamaahList) ? jamaahList.filter(j => j.fitrah === kat && j.approvedByTakmir) : [];
      const jiwa = list.reduce((s, j) => s + (parseInt(j.anggota)||0), 0);
      if(jiwa > 0) rincianKebutuhanFitrahData.push({ kategori: `Mustahik ${kat}`, jiwa: `${jiwa} Org`, jatah: `${alokasiFitrah[kat]} Kg/Jiwa`, totalButuh: jiwa * (alokasiFitrah[kat] || 0) });
  });
  const listGuruFitrah = Array.isArray(jamaahList) ? jamaahList.filter(j => j.isGuruNgaji && j.approvedByTakmir) : [];
  if(listGuruFitrah.length > 0) rincianKebutuhanFitrahData.push({ kategori: `Tambahan Guru Ngaji`, jiwa: `${listGuruFitrah.length} KK`, jatah: `${alokasiFitrah.GuruNgaji} Kg/KK`, totalButuh: listGuruFitrah.length * (alokasiFitrah.GuruNgaji || 0) });
  const totalButuhFitrahValue = rincianKebutuhanFitrahData.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusFitrahValue = totalTimbanganFitrahValue - totalButuhFitrahValue;

  const totalTimbanganZuruValue = Array.isArray(timbanganZuru) ? timbanganZuru.reduce((a, b) => a + b, 0) : 0;
  const rincianKebutuhanZuruData = [];
  ["Berat", "Sedang", "Ringan"].forEach(kat => {
      const list = Array.isArray(jamaahList) ? jamaahList.filter(j => j.zuru === kat && j.approvedByTakmir) : [];
      const jiwa = list.reduce((s, j) => s + (parseInt(j.anggota)||0), 0);
      if(jiwa > 0) rincianKebutuhanZuruData.push({ kategori: `Mustahik ${kat}`, jiwa: `${jiwa} Org`, jatah: `${alokasiZuru[kat]} Kg/Jiwa`, totalButuh: jiwa * (alokasiZuru[kat] || 0) });
  });
  const listGuruZuru = Array.isArray(jamaahList) ? jamaahList.filter(j => j.isGuruNgaji && j.approvedByTakmir) : [];
  if(listGuruZuru.length > 0) rincianKebutuhanZuruData.push({ kategori: `Tambahan Guru Ngaji`, jiwa: `${listGuruZuru.length} KK`, jatah: `${alokasiZuru.GuruNgaji} Kg/KK`, totalButuh: listGuruZuru.length * (alokasiZuru.GuruNgaji || 0) });
  const totalButuruValue = rincianKebutuhanZuruData.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusZuruValue = totalTimbanganZuruValue - totalButuruValue;

  const totalTimbanganQurbanSapiValue = Array.isArray(timbanganQurbanSapi) ? timbanganQurbanSapi.reduce((a, b) => a + b, 0) : 0;
  const totalTimbanganQurbanKambingValue = Array.isArray(timbanganQurbanKambing) ? timbanganQurbanKambing.reduce((a, b) => a + b, 0) : 0;

  const getWargaPenerimaQurban = () => {
    if (!Array.isArray(jamaahList)) return [];
    return jamaahList.filter(warga => {
      if (!warga.approvedByTakmir) return false;
      if (warga.qurban && warga.qurban.startsWith("Sahibul Qurban")) return false;
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
  const jatahDagingSapiPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanSapiValue / totalPenerimaKK).toFixed(2) : 0;
  const jatahDagingKambingPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanKambingValue / totalPenerimaKK).toFixed(2) : 0;

  const canEditPetugas = currentRole === "Admin" || rolesConfig[currentRole]?.access?.petugas === "edit";
  const canEditJamaah = currentRole === "Admin" || rolesConfig[currentRole]?.access?.jamaah === "edit";
  const canEditFitrah = currentRole === "Admin" || rolesConfig[currentRole]?.access?.fitrah === "edit";
  const canEditZuru = currentRole === "Admin" || rolesConfig[currentRole]?.access?.zuru === "edit";
  const canEditQurban = currentRole === "Admin" || rolesConfig[currentRole]?.access?.qurban === "edit";

  // === 5. EVENT HANDLERS ACTIONS ===
  const handleLogin = (e) => {
    e.preventDefault();
    const cleanUser = inputUsername.trim().toLowerCase();
    
    // Fallback: Pastikan membaca dari LocalStorage jika state memori terputus
    let currentDB = userDatabase;
    try {
      const localDB = JSON.parse(localStorage.getItem("userDatabase"));
      if (localDB) currentDB = localDB;
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
        setCurrentRole(userAccount.role); setCurrentUserLabel(userAccount.label); setCurrentUserUsername(cleanUser);
        setIsLoggedIn(true); setIsDutyDismissed(false); 
        
        const allowedAccessObj = rolesConfig[userAccount.role]?.access || {};
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
    addNotification("Berhasil keluar dari sistem.", "warning");
  };

  const handleRegisterMandiri = (e) => {
    e.preventDefault();
    const cleanUsername = regUsername.trim().toLowerCase();
    if (!regLabel.trim() || !cleanUsername || !regPassword || !regConfirmPassword) { addNotification("Lengkapi semua isian!", "error"); return; }
    if (regPassword !== regConfirmPassword) { addNotification("Sandi konfirmasi tidak cocok!", "error"); return; }
    if (userDatabase[cleanUsername]) { addNotification("Username terdaftar! Pilih yang lain.", "error"); return; }

    setUserDatabase(prev => ({ ...prev, [cleanUsername]: { password: regPassword, role: "Jamaah", label: regLabel.trim(), approved: false } }));
    addNotification("Pendaftaran Sukses! Menunggu ACC Admin.", "success");
    setIsRegisterMode(false); setRegLabel(""); setRegUsername(""); setRegPassword(""); setRegConfirmPassword("");
  };

  const handleApproveAccount = (usernameKey, assignedRole) => {
    setUserDatabase(prev => ({ ...prev, [usernameKey]: { ...prev[usernameKey], role: assignedRole, approved: true } }));
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
    
    // Khusus Role Amil ATAU RT usulannya membutuhkan ACC
    const butuhAcc = currentRole === "Amil" || currentRole === "RT";

    if (editingJamaah) {
      setJamaahList(prev => prev.map(item => item.id === editingJamaah.id ? { ...jamaahForm, id: item.id, approvedByTakmir: butuhAcc ? false : item.approvedByTakmir, usulanOleh: butuhAcc ? currentUserLabel : item.usulanOleh } : item));
      addNotification(butuhAcc ? "Usulan diperbarui & menunggu ACC Takmir" : "Data warga berhasil diperbarui");
    } else {
      const newJamaah = { ...jamaahForm, id: Date.now().toString(), approvedByTakmir: butuhAcc ? false : true, usulanOleh: butuhAcc ? currentUserLabel : "Takmir/Admin" };
      setJamaahList(prev => [...prev, newJamaah]);
      addNotification(butuhAcc ? "Usulan penerima bantuan terkirim! Menunggu ACC Takmir" : "Warga didaftarkan");
    }
    setShowJamaahModal(false); setEditingJamaah(null);
    setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima", isGuruNgaji: false });
  };

  const handleApproveWarga = (wargaId) => { setJamaahList(prev => prev.map(w => w.id === wargaId ? { ...w, approvedByTakmir: true } : w)); addNotification("Usulan bantuan disetujui (ACC)!", "success"); };
  const handleRejectWarga = (wargaId) => { if (window.confirm("Tolak usulan?")) { setJamaahList(prev => prev.filter(w => w.id !== wargaId)); addNotification("Usulan ditolak.", "warning"); } };

  const handleEditJamaah = (jamaah) => { setEditingJamaah(jamaah); setJamaahForm({ ...jamaah, qurban: jamaah.qurban || "Penerima" }); setShowJamaahModal(true); };
  const handleDeleteJamaah = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
      setJamaahList(prev => prev.filter(item => item.id !== id)); addNotification("Data dihapus", "warning");
    }
  };

  const handleSaveAlokasiFitrah = () => { setAlokasiFitrah(tempAlokasiFitrah); addNotification("Jatah Fitrah disimpan!", "success"); };
  const handleSaveAlokasiZuru = () => { setAlokasiZuru(tempAlokasiZuru); addNotification("Jatah Zuru' disimpan!", "success"); };

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
    setPasaranForm(petugasAbadi[pasaranKey]);
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
    setUserDatabase(prev => ({ ...prev, [cleanUsername]: { password: newAccPassword, role: newAccRole, label: newAccLabel, approved: true } }));
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
    let msg = type === "WA" ? `Yth. *${fridayData.petugas.khatib}*, besok Jumat ${fridayData.pasaran} jadwal bertugas Khatib. Mohon hadir tepat waktu.` : `[MASJID] Yth ${fridayData.petugas.khatib}, besok Jumat ${fridayData.pasaran} jadwal tugas.`;
    setSimulatedMessageText(msg); setActiveNotificationSim(fridayData);
  };

  const handleSendSimMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      addNotification(`Notifikasi ${notificationType} H-1 pengingat sukses terkirim ke ${activeNotificationSim.petugas.khatib}!`, "success");
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
    let filteredWarga = Array.isArray(jamaahList) ? jamaahList.filter(j => j.approvedByTakmir) : []; 
    let rtTitle = "Seluruh Wilayah (Semua RT & RW)";

    // Khusus Qurban jika menggunakan filter cetak khusus Qurban
    const appliedPrintWilayah = reportType === "qurban" ? selectedPrintWilayahQurban : selectedPrintWilayah;

    if (appliedPrintWilayah !== "Semua") {
      const [filterRt, filterRw] = appliedPrintWilayah.split('_');
      filteredWarga = filteredWarga.filter(j => j.rt === filterRt && j.rw === filterRw);
      rtTitle = `RT ${filterRt} / RW ${filterRw}`;
    }

    let docTitle = ""; let tableHeaderHTML = ""; let tableRowsHTML = ""; let summaryHTML = ""; let waSummaryText = "";

    if (reportType === "jamaah") {
      docTitle = `Laporan Database Jamaah`; waSummaryText = `Total Warga: ${filteredWarga.length} KK.`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 5%;">No</th><th style="width: 30%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 15%;">RT / RW</th><th style="width: 35%;">Alamat Lengkap</th><th class="text-center" style="width: 15%;">Jumlah Jiwa</th></tr>`;
      tableRowsHTML = filteredWarga.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)} ${j.isGuruNgaji ? '(Guru Ngaji)' : ''}</td><td class="text-center">RT ${String(j.rt)}/${String(j.rw)}</td><td>${String(j.alamat)}</td><td class="text-center">${String(j.anggota)} Orang</td></tr>`).join('');
    } else if (reportType === "fitrah") {
      docTitle = `Penyaluran Zakat Fitrah`;
      const mustahikList = filteredWarga.filter(j => j.fitrah !== "Muzakki" || j.isGuruNgaji);
      waSummaryText = `✔️ Penerima: ${mustahikList.length} KK`;
      summaryHTML = `<div style="margin-bottom:15px;padding:12px;background:#ecfdf5;">Penerima: ${mustahikList.length} KK</div>`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 8%;">No</th><th style="width: 42%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 25%;">Kriteria Mustahik</th><th class="text-center" style="width: 25%;">Paraf</th></tr>`;
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">${j.fitrah !== "Muzakki" ? `Mustahik ${String(j.fitrah)}` : ""}${j.isGuruNgaji ? " + Guru Ngaji" : ""}</td><td style="height:38px;"></td></tr>`).join('') : `<tr><td colspan="4" class="text-center">Kosong</td></tr>`;
    } else if (reportType === "zuru") {
      docTitle = `Penyaluran Zakat Zuru'`;
      const mustahikList = filteredWarga.filter(j => j.zuru !== "Bukan Mustahik" || j.isGuruNgaji);
      waSummaryText = `✔️ Penerima: ${mustahikList.length} KK`;
      summaryHTML = `<div style="margin-bottom:15px;padding:12px;background:#f0fdfa;">Penerima: ${mustahikList.length} KK</div>`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 8%;">No</th><th style="width: 42%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 25%;">Kriteria Mustahik</th><th class="text-center" style="width: 25%;">Paraf</th></tr>`;
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">${j.zuru !== "Bukan Mustahik" ? `Mustahik ${String(j.zuru)}` : ""}${j.isGuruNgaji ? " + Guru Ngaji" : ""}</td><td style="height:38px;"></td></tr>`).join('') : `<tr><td colspan="4" class="text-center">Kosong</td></tr>`;
    } else if (reportType === "qurban") {
      docTitle = `Distribusi Daging Qurban`;
      let qurbanList = filteredWarga.filter(w => !w.qurban?.startsWith("Sahibul Qurban"));
      if (qurbanHanyaMustahik) {
        qurbanList = qurbanList.filter(warga => warga.fitrah !== "Muzakki" || warga.zuru !== "Bukan Mustahik" || warga.isGuruNgaji);
      }
      waSummaryText = `🥩 Penerima Qurban: ${qurbanList.length} KK`;
      summaryHTML = `<div style="margin-bottom:20px;padding:15px;background:#fff1f2;">Penerima: ${qurbanList.length} KK | Sapi: ${jatahDagingSapiPerKK} Kg/KK | Kambing: ${jatahDagingKambingPerKK} Kg/KK</div>`;
      tableHeaderHTML = `<tr><th class="text-center" style="width: 5%;">No</th><th style="width: 30%;">Nama Kepala Keluarga</th><th class="text-center" style="width: 15%;">RT/RW</th><th style="width: 20%;">Alamat</th><th class="text-right" style="width: 10%;">Sapi</th><th class="text-right" style="width: 10%;">Kambing</th><th class="text-center" style="width: 10%;">Paraf</th></tr>`;
      tableRowsHTML = qurbanList.length > 0 ? qurbanList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">RT ${String(j.rt)}/${String(j.rw)}</td><td>${String(j.alamat)}</td><td class="text-right font-bold text-rose-600">${jatahDagingSapiPerKK} Kg</td><td class="text-right font-bold text-amber-600">${jatahDagingKambingPerKK} Kg</td><td style="height:35px;"></td></tr>`).join('') : `<tr><td colspan="7" class="text-center">Kosong</td></tr>`;
    } else if (reportType === "terpadu") {
      docTitle = `Rekap Zakat Terpadu`;
      const mustahikList = filteredWarga.filter(j => j.fitrah !== "Muzakki" || j.zuru !== "Bukan Mustahik" || j.isGuruNgaji);
      waSummaryText = `Rekap Terpadu ${rtTitle}`;
      tableHeaderHTML = `<tr><th class="text-center">No</th><th>Nama</th><th class="text-center">Fitrah</th><th class="text-center">Zuru'</th><th class="text-center">Paraf</th></tr>`;
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => `<tr><td class="text-center">${i + 1}</td><td class="font-bold">${String(j.nama)}</td><td class="text-center">${j.fitrah !== "Muzakki" ? String(j.fitrah) : "-"}${j.isGuruNgaji?"+Guru":""}</td><td class="text-center">${j.zuru !== "Bukan Mustahik" ? String(j.zuru) : "-"}${j.isGuruNgaji?"+Guru":""}</td><td style="height:35px;"></td></tr>`).join('') : `<tr><td colspan="5" class="text-center">Kosong</td></tr>`;
    }

    const waLink = createWAShareLink(masjidName, docTitle, rtTitle, waSummaryText);
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${docTitle}</title><style>body{font-family:sans-serif;background:#f1f5f9;margin:0} .wrapper{width:100%;overflow-x:auto;padding:20px} .print-container{width:215mm;background:white;padding:15mm;margin:0 auto} .control-panel{max-width:215mm;margin:0 auto 15px;background:white;padding:15px;display:flex;justify-content:space-between} .btn{padding:10px;border-radius:6px;cursor:pointer;border:none;text-decoration:none;font-weight:bold} .btn-close{background:#ef4444;color:white} .btn-wa{background:#25D366;color:white} .btn-pdf{background:#0f172a;color:white} table{width:100%;border-collapse:collapse;font-size:10px;min-width:450px} th,td{border:1px solid #cbd5e1;padding:5px} th{background:#f8fafc} .text-center{text-align:center} @media screen and (max-width:215mm){.print-container{width:100%;padding:15px;margin:0}} @media print{ .wrapper{padding:0} .control-panel{display:none} .print-container{width:100%;padding:0;margin:0;box-shadow:none} @page{size:215mm 330mm;margin:15mm} }</style></head><body><div class="wrapper"><div class="control-panel"><button onclick="window.parent.postMessage('CLOSE_PRINT_FRAME', '*')" class="btn btn-close">Tutup</button><div style="display:flex;gap:8px;"><a href="${waLink}" target="_blank" class="btn btn-wa">Share WA</a><button onclick="window.print()" class="btn btn-pdf">Cetak / PDF</button></div></div><div class="print-container"><h2>${docTitle}</h2><p>${rtTitle}</p>${summaryHTML}<div style="width:100%;overflow-x:auto;"><table><thead>${tableHeaderHTML}</thead><tbody>${tableRowsHTML}</tbody></table></div></div></div></body></html>`;
    setPrintIframeData(html);
  };

  const handlePrintQurbanRT = () => {
    handlePrintSelectedReport("qurban");
  };


  // === 6. RENDER PENGANTAR LOGIN / REGISTER ===
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative font-sans">
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm flex gap-3 ${n.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
              <span>{String(n.message)}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 text-emerald-600 mx-auto">{renderMasjidLogo("w-full h-full object-contain rounded-lg", "w-16 h-16")}</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{String(masjidName)}</h1>
          </div>

          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
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
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm font-medium flex gap-3 ${n.type === 'error' ? 'bg-rose-600 border-rose-700' : 'bg-emerald-600 border-emerald-700'}`}>
            {n.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}<span>{String(n.message)}</span>
          </div>
        ))}
      </div>

      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 border rounded-xl"><Menu size={20} /></button>
          <div className="w-10 h-10">{renderMasjidLogo("w-full h-full object-contain", "w-8 h-8")}</div>
          <div><h1 className="font-bold text-sm tracking-tight">{String(masjidName)}</h1></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-3 pr-2 py-1.5 rounded-2xl">
            <div className="text-left hidden sm:block">
              <span className="text-[9px] text-emerald-600 font-extrabold block uppercase">{rolesConfig[currentRole]?.label || currentRole}</span>
              <span className="text-xs font-black text-emerald-900 truncate block">{String(currentUserLabel)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200" title={`Status Database: ${syncStatus}`}>
                <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : syncStatus.includes('Gagal') ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            </div>
            <button onClick={handleLogout} title="Keluar / Logout" className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-xl transition-all"><LogOut size={16} /></button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex">
          <div className="bg-white w-72 h-full shadow-2xl p-5 border-r flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 text-emerald-600 shrink-0">
                  {renderMasjidLogo("w-full h-full object-contain rounded", "w-7 h-7")}
                </div>
                <span className="text-sm font-black text-slate-800 tracking-wide truncate">{String(masjidName)}</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg transition-all"><X size={18} /></button>
            </div>
            <nav className="space-y-1.5 py-4 flex-1">
              {[
                { id: "dashboard", label: "Dashboard Utama", icon: Compass }, { id: "petugas", label: "Petugas Sholat", icon: Calendar },
                { id: "jamaah", label: "Data Warga", icon: Users }, { id: "fitrah", label: "Zakat Fitrah", icon: Gift },
                { id: "zuru", label: "Zakat Zuru'", icon: Coins }, { id: "qurban", label: "Daging Qurban", icon: Heart },
                { id: "rbac", label: "Hak Akses & Akun", icon: UserCheck }
              ].map(item => {
                const allowed = hasAccess(item.id);
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => navigateTo(item.id)} disabled={!allowed && currentRole !== 'Admin'} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-black transition-all ${isActive ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : !allowed ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <item.icon className="w-4 h-4 shrink-0" /> <span className="text-left flex-1">{item.label}</span>
                    {!allowed && <span className="text-[8px] bg-slate-200 text-slate-500 px-1 py-0.5 rounded-md">Kunci</span>}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* ======================= TAB: DASHBOARD ======================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            
            {(currentRole === "Takmir" || currentRole === "Admin") && usulanWargaList.length > 0 && (
              <div className="bg-white border-2 border-emerald-500 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b pb-3"><Check className="text-emerald-600 w-5 h-5 animate-bounce" /><div><h3 className="font-extrabold text-sm">Persetujuan Usulan Warga Baru dari RT/Amil</h3><p className="text-[10px] text-slate-500">Amil atau RT telah mengajukan data. Berikan validasi.</p></div></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead><tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[9px]"><th className="p-3">Pengusul</th><th className="p-3">Warga</th><th className="p-3">RT/RW</th><th className="p-3 text-right">Aksi</th></tr></thead>
                    <tbody>
                      {usulanWargaList.map(w => (
                        <tr key={w.id} className="border-b">
                          <td className="p-3 font-bold">{String(w.usulanOleh)}</td><td className="p-3 font-bold">{String(w.nama)}</td><td className="p-3">RT {String(w.rt)}/{String(w.rw)}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleApproveWarga(w.id)} className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] rounded-lg mr-2">ACC</button>
                            <button onClick={() => handleRejectWarga(w.id)} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[10px] rounded-lg">Tolak</button>
                          </td>
                        </tr>
                      ))}
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
                    <p className="text-xs text-rose-100">Besok Jumat {infoTugasBesok.pasaran}. Peran Anda: <strong className="text-amber-300">{infoTugasBesok.peran}</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={playAlarmSound} className="px-4 py-2 bg-amber-500 text-slate-900 font-black text-xs rounded-xl">🔊 Tes Alarm</button>
                  <button onClick={() => { setIsDutyDismissed(true); addNotification("Kesiapan tugas Sholat Jumat telah dikonfirmasi!", "success"); }} className="px-4 py-2 bg-white text-rose-700 font-black text-xs rounded-xl">Saya Siap</button>
                </div>
              </div>
            )}

            <div className="bg-slate-100 border rounded-2xl p-4 flex justify-between items-center">
              <div className="text-xs"><p className="font-extrabold text-slate-800">🛠️ Mode Uji Pengingat H-1</p></div>
              <button onClick={() => { setIsSimulatedThursday(!isSimulatedThursday); setIsDutyDismissed(false); }} className="px-4 py-2 rounded-xl text-xs font-bold border bg-white text-slate-700">{isSimulatedThursday ? "Matikan Simulator" : "Simulasikan Hari Kamis"}</button>
            </div>

            <div className="bg-emerald-700 text-white rounded-2xl p-5 shadow-md flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-200">Lokasi Jadwal Sholat</span>
                <h2 className="text-xl font-extrabold">Desa {lokasi.desa}, Kec. {lokasi.kecamatan}</h2>
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
                    <p className="text-xs font-bold text-slate-500 mb-2">Jumat {upcomingFridaysList[0].pasaran}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-[10px] text-slate-400">Khatib Utama</p><p className="font-bold">{upcomingFridaysList[0].petugas.khatib || "-"}</p></div>
                      <div><p className="text-[10px] text-slate-400">Imam Cadangan</p><p className="font-bold">{upcomingFridaysList[0].petugas.imam || "-"}</p></div>
                      <div><p className="text-[10px] text-slate-400 mt-2">Muadzin</p><p className="font-bold">{upcomingFridaysList[0].petugas.muadzin || "-"}</p></div>
                      <div><p className="text-[10px] text-slate-400 mt-2">Bilal / MC</p><p className="font-bold">{upcomingFridaysList[0].petugas.bilal || "-"}</p></div>
                    </div>
                  </div>
                ) : <p className="text-xs mt-2 text-slate-400">Belum ada agenda petugas.</p>}
              </div>

              <div className="bg-white border rounded-2xl p-4 shadow-xs">
                <h3 className="font-bold flex items-center gap-2 text-sm"><UsersRound className="text-emerald-600 w-5 h-5" /> Sebaran Mustahik</h3>
                <div className="space-y-2 mt-3">
                  {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                    <div key={asnaf} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded border">
                      <span className="font-bold">{asnaf}</span>
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
                      <span className="font-black text-emerald-700 text-xs">JUMAT {pasaran.toUpperCase()}</span>
                      {canEditPetugas && <button onClick={() => handleEditPasaran(pasaran)} className="text-slate-400 hover:text-emerald-600"><Edit2 size={14}/></button>}
                    </div>
                    <div className="text-xs space-y-2">
                      <p><span className="block text-[10px] text-slate-400">Khatib</span><strong className="text-slate-800">{data.khatib || "-"}</strong></p>
                      <p><span className="block text-[10px] text-slate-400">Imam</span><strong className="text-slate-800">{data.imam || "-"}</strong></p>
                      <p><span className="block text-[10px] text-slate-400">Muadzin</span>{data.muadzin || "-"}</p>
                      <p><span className="block text-[10px] text-slate-400">Bilal</span>{data.bilal || "-"}</p>
                      {data.telp && <p className="pt-2 mt-2 border-t font-mono text-[10px] text-slate-500">📞 {data.telp}</p>}
                    </div>
                    {data.khatib && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat" }, "WA")} className="bg-[#128c7e] text-white py-1 rounded text-[10px] font-bold">Kirim WA</button>
                        <button onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat" }, "SMS")} className="bg-blue-600 text-white py-1 rounded text-[10px] font-bold">Kirim SMS</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {editingPasaran && (
              <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                  <h3 className="font-bold mb-4 border-b pb-2">Ubah Petugas Jumat {editingPasaran}</h3>
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
            
            {activeNotificationSim && (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4">
                <div className="bg-white p-5 rounded-2xl w-full max-w-sm">
                  <h3 className="font-bold mb-2">Simulasi Pesan {notificationType}</h3>
                  <textarea value={simulatedMessageText} onChange={e => setSimulatedMessageText(e.target.value)} rows="5" className="w-full border p-2 text-xs rounded mb-3 outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setActiveNotificationSim(null)} className="flex-1 border py-2 rounded text-xs font-bold">Tutup</button>
                    <button onClick={handleSendSimMessage} className={`flex-1 text-white py-2 rounded text-xs font-bold ${notificationType === 'WA' ? 'bg-[#128c7e]' : 'bg-blue-600'}`}>Kirim Simulator</button>
                  </div>
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
              {canEditJamaah && <button onClick={() => { setEditingJamaah(null); setShowJamaahModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">{currentRole === "Amil" || currentRole === "RT" ? "Usul Warga" : "Tambah Warga"}</button>}
            </div>

            <div className="bg-slate-50 border p-4 rounded-2xl shadow-xs">
              <p className="text-[10px] font-bold uppercase mb-2">Pilih Wilayah Laporan PDF:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedPrintWilayah} onChange={e => setSelectedPrintWilayah(e.target.value)} className="text-xs border bg-white p-2 rounded-xl flex-1 max-w-xs">
                  <option value="Semua">Semua RT & RW</option>
                  {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{w.label}</option>)}
                </select>
                <button onClick={() => handlePrintSelectedReport("jamaah")} className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Warga</button>
                <button onClick={() => handlePrintSelectedReport("pekurban")} className="bg-amber-600 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Pekurban</button>
                <button onClick={() => handlePrintSelectedReport("terpadu")} className="bg-teal-700 text-white text-xs px-3 py-2 rounded-xl font-bold">Cetak Zakat Terpadu</button>
              </div>
            </div>

            <div className="bg-white border rounded-2xl shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-50 border-b flex justify-between">
                <select value={filterWilayahJamaah} onChange={e => setFilterWilayahJamaah(e.target.value)} className="text-xs border p-1.5 rounded">
                  <option value="Semua">Semua Wilayah</option>
                  {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{w.label}</option>)}
                </select>
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
                        <td className="p-3">{j.approvedByTakmir ? <span className="text-emerald-600 font-bold">✔️ ACC</span> : <span className="text-amber-600 font-bold">⏳ Menunggu</span>}</td>
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
                      <div className="flex-1"><label className="text-[10px] font-bold text-slate-500">Wilayah</label><select value={`${jamaahForm.rt}_${jamaahForm.rw}`} onChange={e => { const [rt, rw] = e.target.value.split('_'); setJamaahForm({...jamaahForm, rt, rw}); }} className="w-full border p-2.5 rounded-xl text-sm bg-white">{WILAYAH_OPTIONS.map(w => <option key={w.label} value={`${w.rt}_${w.rw}`}>{w.label}</option>)}</select></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-500">Alamat</label><textarea required value={jamaahForm.alamat} onChange={e => setJamaahForm({...jamaahForm, alamat: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm resize-none" rows="2"/></div>
                    <div><label className="text-[10px] font-bold text-slate-500">Status Ekonomi</label>
                      <div className="flex gap-2 text-xs">
                        {["Mampu", "Kurang Mampu", "Sangat Kurang"].map((opsi) => (
                          <label key={opsi} className={`flex-1 border p-2 rounded-lg text-center cursor-pointer ${jamaahForm.ekonomi === opsi ? 'bg-emerald-50 border-emerald-500 font-bold' : ''}`}><input type="radio" value={opsi} checked={jamaahForm.ekonomi === opsi} onChange={() => setJamaahForm({...jamaahForm, ekonomi: opsi})} className="hidden"/>{opsi}</label>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border p-3 rounded-xl bg-slate-50">
                      <input type="checkbox" checked={jamaahForm.isGuruNgaji} onChange={e => setJamaahForm({...jamaahForm, isGuruNgaji: e.target.checked})} className="w-4 h-4 accent-emerald-600" />
                      <span className="text-xs font-bold">Warga ini berstatus Guru Ngaji (Bantuan Khusus)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div><label className="text-[10px] font-bold text-emerald-600">Zakat Fitrah</label><select value={jamaahForm.fitrah} onChange={e => setJamaahForm({...jamaahForm, fitrah: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Muzakki">Muzakki</option><option value="Berat">Mustahik Berat</option><option value="Sedang">Mustahik Sedang</option><option value="Ringan">Mustahik Ringan</option></select></div>
                      <div><label className="text-[10px] font-bold text-teal-600">Zakat Zuru'</label><select value={jamaahForm.zuru} onChange={e => setJamaahForm({...jamaahForm, zuru: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Bukan Mustahik">Bukan Penerima</option><option value="Berat">Mustahik Berat</option><option value="Sedang">Mustahik Sedang</option><option value="Ringan">Mustahik Ringan</option></select></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-rose-600">Status Qurban</label><select value={jamaahForm.qurban} onChange={e => setJamaahForm({...jamaahForm, qurban: e.target.value})} className="w-full border p-2 rounded-xl text-xs font-bold"><option value="Penerima">Penerima Daging</option><option value="Sahibul Qurban - Sapi">Sahibul Qurban Sapi</option><option value="Sahibul Qurban - Kambing">Sahibul Qurban Kambing</option></select></div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button type="button" onClick={() => setShowJamaahModal(false)} className="px-5 py-2.5 border rounded-xl text-xs font-bold">Batal</button>
                      <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">{(currentRole === "Amil" || currentRole === "RT") ? "Usulkan Data" : "Simpan"}</button>
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
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Kalkulator Zakat Fitrah</h2><button onClick={() => handlePrintSelectedReport("fitrah")} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex gap-2"><Printer size={14}/> Cetak PDF</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold text-slate-500 mb-2">Timbangan Total Beras Masuk</p><p className="text-3xl font-black text-emerald-600 mb-4">{totalTimbanganFitrahValue.toFixed(1)} Kg</p>
                {canEditFitrah && (
                  <div className="flex gap-2"><input type="number" step="0.1" placeholder="Tambah timbangan (kg)" value={tempBeratFitrah} onChange={e => setTempBeratFitrah(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('fitrah')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                )}
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                  {Array.isArray(timbanganFitrah) && timbanganFitrah.map((b, i) => (<div key={i} className="flex justify-between bg-slate-50 p-2 text-xs border rounded"><span className="font-bold">{b} Kg</span>{canEditFitrah && <button onClick={() => deleteTimbangan('fitrah', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between"><p className="text-xs font-bold text-slate-500 mb-2">Rencana Jatah Per Jiwa</p>{canEditFitrah && <button onClick={handleSaveAlokasiFitrah} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 font-bold border rounded-lg">Simpan Setelan</button>}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Berat", "Sedang", "Ringan"].map(a => (
                    <div key={a} className="border p-2 rounded bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-bold">{a}</span><input type="number" disabled={!canEditFitrah} step="0.5" value={tempAlokasiFitrah[a]} onChange={e => setTempAlokasiFitrah({...tempAlokasiFitrah, [a]: e.target.value})} className="w-12 border rounded text-xs text-center" /></div>
                  ))}
                  <div className="border border-emerald-300 p-2 rounded bg-emerald-50 flex justify-between items-center"><span className="text-[10px] font-bold text-emerald-700">Guru</span><input type="number" disabled={!canEditFitrah} step="0.5" value={tempAlokasiFitrah.GuruNgaji} onChange={e => setTempAlokasiFitrah({...tempAlokasiFitrah, GuruNgaji: e.target.value})} className="w-12 border rounded text-xs text-center bg-transparent" /></div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-slate-500 mb-2">Rincian Estimasi Kebutuhan</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50"><tr className="border-b"><th className="p-2">Kategori</th><th className="p-2 text-center">Jiwa/KK</th><th className="p-2 text-right">Butuh</th></tr></thead>
                      <tbody>
                        {rincianKebutuhanFitrahData.map((item, idx) => (
                           <tr key={idx} className="border-b"><td className="p-2 text-slate-700">{item.kategori}</td><td className="p-2 text-center">{item.jiwa}</td><td className="p-2 text-right font-bold">{item.totalButuh} Kg</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <p className="text-[10px] font-bold uppercase text-emerald-700">Total Kebutuhan</p>
                    <p className="text-xl font-black text-emerald-800">{totalButuhFitrahValue.toFixed(1)} Kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB: ZURU ======================= */}
        {activeTab === "zuru" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Kalkulator Zakat Zuru'</h2><button onClick={() => handlePrintSelectedReport("zuru")} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex gap-2"><Printer size={14}/> Cetak PDF</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold text-slate-500 mb-2">Timbangan Total Panen Masuk</p><p className="text-3xl font-black text-teal-600 mb-4">{totalTimbanganZuruValue.toFixed(1)} Kg</p>
                {canEditZuru && (
                  <div className="flex gap-2"><input type="number" step="0.1" placeholder="Tambah timbangan (kg)" value={tempBeratZuru} onChange={e => setTempBeratZuru(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('zuru')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                )}
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                  {Array.isArray(timbanganZuru) && timbanganZuru.map((b, i) => (<div key={i} className="flex justify-between bg-slate-50 p-2 text-xs border rounded"><span className="font-bold">{b} Kg</span>{canEditZuru && <button onClick={() => deleteTimbangan('zuru', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between"><p className="text-xs font-bold text-slate-500 mb-2">Rencana Jatah Per Jiwa</p>{canEditZuru && <button onClick={handleSaveAlokasiZuru} className="text-xs bg-teal-100 text-teal-700 px-3 py-1 font-bold border rounded-lg">Simpan Setelan</button>}</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Berat", "Sedang", "Ringan"].map(a => (
                    <div key={a} className="border p-2 rounded bg-slate-50 flex justify-between items-center"><span className="text-[10px] font-bold">{a}</span><input type="number" disabled={!canEditZuru} step="0.5" value={tempAlokasiZuru[a]} onChange={e => setTempAlokasiZuru({...tempAlokasiZuru, [a]: e.target.value})} className="w-12 border rounded text-xs text-center" /></div>
                  ))}
                  <div className="border border-teal-300 p-2 rounded bg-teal-50 flex justify-between items-center"><span className="text-[10px] font-bold text-teal-700">Guru</span><input type="number" disabled={!canEditZuru} step="0.5" value={tempAlokasiZuru.GuruNgaji} onChange={e => setTempAlokasiZuru({...tempAlokasiZuru, GuruNgaji: e.target.value})} className="w-12 border rounded text-xs text-center bg-transparent" /></div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-bold text-slate-500 mb-2">Rincian Estimasi Kebutuhan</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50"><tr className="border-b"><th className="p-2">Kategori</th><th className="p-2 text-center">Jiwa/KK</th><th className="p-2 text-right">Butuh</th></tr></thead>
                      <tbody>
                        {rincianKebutuhanZuruData.map((item, idx) => (
                           <tr key={idx} className="border-b"><td className="p-2 text-slate-700">{item.kategori}</td><td className="p-2 text-center">{item.jiwa}</td><td className="p-2 text-right font-bold">{item.totalButuh} Kg</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex justify-between items-center bg-teal-50 p-2 rounded-lg border border-teal-100">
                    <p className="text-[10px] font-bold uppercase text-teal-700">Total Kebutuhan</p>
                    <p className="text-xl font-black text-teal-800">{totalButuruValue.toFixed(1)} Kg</p>
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
                        {WILAYAH_OPTIONS.map((w) => <option key={w.label} value={`${w.rt}_${w.rw}`}>{w.label}</option>)}
                    </select>
                    <button onClick={() => handlePrintSelectedReport("qurban")} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Printer size={14}/> Cetak per Wilayah</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold text-rose-500 mb-2">Total Daging SAPI Masuk</p><p className="text-3xl font-black text-rose-600 mb-4">{totalTimbanganQurbanSapiValue.toFixed(1)} Kg</p>
                {canEditQurban && (
                  <div className="flex gap-2"><input type="number" step="0.1" placeholder="Berat Daging Sapi (kg)" value={tempBeratQurbanSapi} onChange={e => setTempBeratQurbanSapi(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('qurbanSapi')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                )}
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                  {Array.isArray(timbanganQurbanSapi) && timbanganQurbanSapi.map((b, i) => (<div key={i} className="flex justify-between bg-rose-50 p-2 text-xs border border-rose-100 rounded text-rose-900"><span className="font-bold">{b} Kg</span>{canEditQurban && <button onClick={() => deleteTimbangan('qurbanSapi', i)} className="text-rose-500"><Trash2 size={14}/></button>}</div>))}
                </div>
              </div>
              <div className="bg-white border rounded-2xl p-5 shadow-xs">
                <p className="text-xs font-bold text-amber-500 mb-2">Total Daging KAMBING Masuk</p><p className="text-3xl font-black text-amber-600 mb-4">{totalTimbanganQurbanKambingValue.toFixed(1)} Kg</p>
                {canEditQurban && (
                  <div className="flex gap-2"><input type="number" step="0.1" placeholder="Berat Daging Kambing (kg)" value={tempBeratQurbanKambing} onChange={e => setTempBeratQurbanKambing(e.target.value)} className="border p-2 rounded flex-1 text-sm outline-none" /><button onClick={() => addTimbangan('qurbanKambing')} className="bg-slate-800 text-white px-3 font-bold text-xs rounded">Tambah</button></div>
                )}
                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                  {Array.isArray(timbanganQurbanKambing) && timbanganQurbanKambing.map((b, i) => (<div key={i} className="flex justify-between bg-amber-50 p-2 text-xs border border-amber-100 rounded text-amber-900"><span className="font-bold">{b} Kg</span>{canEditQurban && <button onClick={() => deleteTimbangan('qurbanKambing', i)} className="text-amber-500"><Trash2 size={14}/></button>}</div>))}
                </div>
              </div>
            </div>
            <div className="bg-slate-900 text-white border rounded-3xl p-5 shadow-lg grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-[10px] text-slate-400 uppercase font-bold">Penerima Valid</p><p className="text-3xl font-black mt-1">{totalPenerimaKK} KK</p></div>
              <div className="text-center border-l border-slate-700"><p className="text-[10px] text-rose-400 uppercase font-bold">Jatah Sapi / KK</p><p className="text-3xl font-black mt-1">{jatahDagingSapiPerKK} Kg</p></div>
              <div className="text-center border-l border-slate-700"><p className="text-[10px] text-amber-400 uppercase font-bold">Jatah Kambing / KK</p><p className="text-3xl font-black mt-1">{jatahDagingKambingPerKK} Kg</p></div>
            </div>
          </div>
        )}

        {/* ======================= TAB: RBAC ======================= */}
        {activeTab === "rbac" && currentRole === "Admin" && (
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
                          <td className="p-3 font-bold">{userDatabase[un].label}</td><td className="p-3 font-mono">@{un}</td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <select id={`r-${un}`} className="border p-1.5 rounded" defaultValue="Jamaah"><option value="Takmir">Takmir</option><option value="Amil">Amil Zakat</option><option value="RT">Ketua RT</option><option value="Petugas">Petugas</option><option value="Jamaah">Jama'ah</option></select>
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
                  <input type="text" value={tempMasjidName} onChange={e => setTempMasjidName(e.target.value)} className="w-full border p-3 rounded-xl text-sm" placeholder="Nama Masjid" />
                  <input type="url" value={tempMasjidLogoUrl} onChange={e => setTempMasjidLogoUrl(e.target.value)} className="w-full border p-3 rounded-xl text-sm" placeholder="Tautan/URL Gambar Logo Masjid" />
              </div>
              <div className="mt-4 text-right">
                  <button onClick={handleSaveNewIdentity} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-bold">Simpan Identitas</button>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border">
               <h3 className="font-bold text-sm mb-4">Pendaftaran Instan Akun Pengurus</h3>
               <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border items-end">
                 <div><label className="text-[10px] font-bold text-slate-500">Nama Lengkap</label><input type="text" required value={newAccLabel} onChange={e => setNewAccLabel(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs" /></div>
                 <div><label className="text-[10px] font-bold text-slate-500">Username</label><input type="text" required value={newAccUsername} onChange={e => setNewAccUsername(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs" /></div>
                 <div><label className="text-[10px] font-bold text-slate-500">Password</label><input type="text" required value={newAccPassword} onChange={e => setNewAccPassword(e.target.value)} className="w-full border p-2 rounded-lg mt-1 text-xs" /></div>
                 <div className="flex gap-2"><select value={newAccRole} onChange={e => setNewAccRole(e.target.value)} className="flex-1 border p-2 rounded-lg text-xs font-bold"><option value="Admin">Admin</option><option value="Takmir">Takmir</option><option value="Amil">Amil Zakat</option><option value="RT">Ketua RT</option><option value="Petugas">Petugas</option><option value="Jamaah">Jama'ah</option></select><button type="submit" className="bg-slate-800 text-white px-3 rounded-lg text-xs font-bold">Buat</button></div>
               </form>
               
               <h3 className="font-bold text-xs mt-6 mb-3 uppercase text-slate-500">Akun Terdaftar (Aktif)</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                 {Object.keys(userDatabase).filter(k => userDatabase[k].approved).map(k => (
                    <div key={k} className="border rounded-xl p-3 flex justify-between items-center">
                      <div><p className="font-bold text-xs">{userDatabase[k].label}</p><p className="text-[10px] text-slate-500 font-mono">@{k} | Pass: {userDatabase[k].password}</p><span className="text-[8px] bg-slate-100 border px-1 rounded font-bold">{userDatabase[k].role}</span></div>
                      {!["admin","takmir","amil","rt01","jamaah"].includes(k) && <button onClick={() => handleDeleteAccount(k)} className="text-rose-500 bg-rose-50 p-1.5 rounded hover:bg-rose-100"><Trash2 size={14}/></button>}
                    </div>
                 ))}
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xs border overflow-x-auto">
              <h3 className="font-bold text-sm mb-4">Matriks Akses (RBAC)</h3>
              <table className="w-full text-left text-xs border-collapse min-w-[500px] overflow-hidden rounded-lg">
                <thead className="bg-slate-800 text-white"><tr className="border-b border-slate-700"><th className="p-3">Modul Aplikasi</th>{Object.keys(rolesConfig).map(r => <th key={r} className="p-3 text-center">{r}</th>)}</tr></thead>
                <tbody>
                  {[{id: "dashboard", label: "Dashboard Utama"}, {id: "petugas", label: "Petugas Jumat"}, {id: "jamaah", label: "Data Warga"}, {id: "fitrah", label: "Zakat Fitrah"}, {id: "zuru", label: "Zakat Zuru'"}, {id: "qurban", label: "Qurban"}, {id: "rbac", label: "Pengaturan RBAC"}].map((m, index) => (
                    <tr key={m.id} className={index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                      <td className="p-3 font-bold border-r">{m.label}</td>
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

      {printIframeData && (
         <div className="fixed inset-0 z-[99999] bg-white flex flex-col h-screen w-screen overflow-hidden">
           <iframe title="Print" srcDoc={printIframeData} className="w-full h-full border-0" />
         </div>
      )}
    </div>
  );
}
