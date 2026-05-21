import React, { useState, useEffect } from 'react';
import { 
  Compass, Users, BookOpen, Gift, Heart, UserCheck, 
  Settings, Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, Lock, KeyRound, User, Eye, EyeOff, UserPlus, Image, FileText,
  Phone, Send, MessageSquare, BellRing, Upload, Download, Smartphone, Menu, RefreshCw, Database, Share2
} from 'lucide-react';

// ====================================================================
// CONFIG CONFIGURATION GOOGLE SHEETS API (GRATIS)
// ====================================================================
const GOOGLE_SHEETS_SCRIPT_URL = ""; 

// === SEED DATA LOKASI AWAL ===
const INITIAL_LOKASI = {
  provinsi: "Jawa Timur",
  kabupaten: "Lamongan",
  kecamatan: "Tikung",
  desa: "Bakalan",
  latitude: -7.1126, 
  longitude: 112.4150
};

const WILAYAH_OPTIONS = [
  { rt: "01", rw: "01", label: "RT 01 / RW 01" },
  { rt: "02", rw: "01", label: "RT 02 / RW 01" },
  { rt: "03", rw: "01", label: "RT 03 / RW 01" },
  { rt: "01", rw: "02", label: "RT 01 / RW 02" },
  { rt: "02", rw: "02", label: "RT 02 / RW 02" },
  { rt: "03", rw: "02", label: "RT 03 / RW 02" }
];

// === PENAMBAHAN ROLE BARU: PETUGAS ===
const INITIAL_ROLES = {
  Admin: { label: "Super Admin", access: ["dashboard", "petugas", "jamaah", "fitrah", "zuru", "qurban", "rbac"] },
  Takmir: { label: "Takmir Masjid", access: ["dashboard", "petugas", "jamaah", "qurban"] },
  Amil: { label: "Amil Zakat", access: ["dashboard", "jamaah", "fitrah", "zuru", "qurban"] },
  Petugas: { label: "Petugas Jumat", access: ["dashboard", "petugas"] }, 
  Jamaah: { label: "Jama'ah / Warga", access: ["dashboard", "petugas", "fitrah", "zuru", "qurban"] }
};

const INITIAL_USER_DATABASE = {
  "admin": { password: "admin123", role: "Admin", label: "Super Admin" },
  "takmir": { password: "takmir123", role: "Takmir", label: "Takmir Masjid" },
  "amil": { password: "amil123", role: "Amil", label: "Amil Zakat" },
  "petugas1": { password: "petugas123", role: "Petugas", label: "KH. Syukron Ma'mun" },
  "jamaah": { password: "jamaah123", role: "Jamaah", label: "Jama'ah / Warga" }
};

const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat", qurban: "Penerima" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "Sedang", zuru: "Sedang", qurban: "Penerima" },
  { id: "4", nama: "H. Abdul Rozak", anggota: 2, rt: "02", rw: "02", alamat: "Jl. Diponegoro No. 88", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Sahibul Qurban - Sapi" },
  { id: "5", nama: "Ustadz Hasan", anggota: 4, rt: "03", rw: "02", alamat: "Kamar Marbot Masjid", ekonomi: "Kurang Mampu", fitrah: "Ringan", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "6", nama: "Mbah Sutini", anggota: 1, rt: "03", rw: "01", alamat: "Gubuk RT 3", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "7", nama: "Andi Wijaya", anggota: 3, rt: "01", rw: "02", alamat: "Jl. Baru No. 17", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Ringan", qurban: "Penerima" }
];

const INITIAL_PETUGAS_ABADI = {
  Legi: { khatib: "KH. Syukron Ma'mun", imam: "Ustadz Ahmad Al-Hafiz", muadzin: "Bilal Hanafi", bilal: "Soleh", telp: "081234567890" },
  Pahing: { khatib: "Prof. Dr. KH. Said Aqil", imam: "Ustadz Hasanuddin", muadzin: "Zainal Abidin", bilal: "Rudi Yulianto", telp: "081398765432" },
  Pon: { khatib: "Ustadz Adi Hidayat, Lc", imam: "Ustadz Sholihuddin", muadzin: "H. Abdul Qodir", bilal: "Slamet", telp: "085711223344" },
  Wage: { khatib: "KH. Anwar Zahid", imam: "Ustadz Abdurrahman", muadzin: "Supardi", bilal: "Mulyono", telp: "089988776655" },
  Kliwon: { khatib: "KH. Bahauddin Nursalim (Gus Baha)", imam: "Ustadz Hasan Al-Banna", muadzin: "M. Thoriq", bilal: "Sidiq Prasetyo", telp: "082144332211" }
};

const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

// === HELPER FUNCTIONS ===
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

const getLocalStorageData = (key, fallbackValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null || saved === "undefined") return fallbackValue;
    try { return JSON.parse(saved); } catch (e) {
      if (typeof fallbackValue === 'string') return saved;
      return fallbackValue;
    }
  } catch (error) { console.warn("Info Storage: Konversi lokal tipe lama dilewati untuk key " + key); }
  return fallbackValue;
};

const getMockJadwal = (kab, lat, lon) => {
  let offset = 0;
  if (lat && lon) {
    const coordHash = Math.abs(Math.round((parseFloat(lat) + parseFloat(lon)) * 100));
    offset = coordHash % 15;
  } else {
    const hash = (kab || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    offset = hash % 15;
  }
  return {
    Subuh: `04:${(15 + offset).toString().padStart(2, '0')}`,
    Terbit: `05:${(30 + offset).toString().padStart(2, '0')}`,
    Dzuhur: `11:${(35 + offset).toString().padStart(2, '0')}`,
    Ashar: `14:${(55 + offset).toString().padStart(2, '0')}`,
    Maghrib: `17:${(30 + offset).toString().padStart(2, '0')}`,
    Isya: `18:${(45 + offset).toString().padStart(2, '0')}`
  };
};

const getPasaranJawa = (date) => {
  const anchor = new Date(2026, 0, 2); 
  const diffTime = date.getTime() - anchor.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  let pasaranIndex = (diffDays + 3) % 5;
  if (pasaranIndex < 0) pasaranIndex += 5;
  return PASARAN_LIST[pasaranIndex];
};

const getUpcomingFridays = (currentTime, petugasAbadi, count = 5) => {
  const fridays = [];
  const tempDate = new Date(currentTime);
  const dayOfWeek = tempDate.getDay();
  let daysToFriday = (5 - dayOfWeek + 7) % 7;
  if (daysToFriday === 0 && tempDate.getHours() >= 13) daysToFriday = 7;
  tempDate.setDate(tempDate.getDate() + daysToFriday);
  
  for (let i = 0; i < count; i++) {
    const target = new Date(tempDate);
    const pasaran = getPasaranJawa(target);
    fridays.push({
      formattedDate: target.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      rawDate: new Date(target),
      pasaran: pasaran,
      petugas: petugasAbadi[pasaran] || {}
    });
    tempDate.setDate(tempDate.getDate() + 7);
  }
  return fridays;
};

const getJumlahJiwaPerKategoriFitrah = (jamaahList, kategori) => {
  return jamaahList.filter(item => item.fitrah === kategori).reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
};

const getJumlahJiwaPerKategoriZuru = (jamaahList, kategori) => {
  return jamaahList.filter(item => item.zuru === kategori).reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
};

export default function App() {
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

  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  const [jamaahList, setJamaahList] = useState(() => getLocalStorageData("jamaahList", INITIAL_JAMAAH));
  const [filterWilayahJamaah, setFilterWilayahJamaah] = useState("Semua");

  const [timbanganFitrah, setTimbanganFitrah] = useState(() => getLocalStorageData("timbanganFitrah", [25, 50, 15, 30]));
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  const [alokasiFitrah, setAlokasiFitrah] = useState(() => getLocalStorageData("alokasiFitrah", { "Berat": 5.0, "Sedang": 3.0, "Ringan": 1.5, "Muzakki": 0.0 }));
  const [tempAlokasiFitrah, setTempAlokasiFitrah] = useState(alokasiFitrah);

  const [timbanganZuru, setTimbanganZuru] = useState(() => getLocalStorageData("timbanganZuru", [120, 250, 80]));
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  const [alokasiZuru, setAlokasiZuru] = useState(() => getLocalStorageData("alokasiZuru", { "Berat": 15.0, "Sedang": 10.0, "Ringan": 5.0, "Bukan Mustahik": 0.0 }));
  const [tempAlokasiZuru, setTempAlokasiZuru] = useState(alokasiZuru);

  const [timbanganQurbanSapi, setTimbanganQurbanSapi] = useState(() => getLocalStorageData("timbanganQurbanSapi", [85.5, 120.0, 95.0, 65.5]));
  const [timbanganQurbanKambing, setTimbanganQurbanKambing] = useState(() => getLocalStorageData("timbanganQurbanKambing", [22.0, 18.5, 25.0]));
  const [tempBeratQurbanSapi, setTempBeratQurbanSapi] = useState("");
  const [tempBeratQurbanKambing, setTempBeratQurbanKambing] = useState("");
  const [filterWilayahQurban, setFilterWilayahQurban] = useState("Semua");
  const [qurbanHanyaMustahik, setQurbanHanyaMustahik] = useState(false);

  const [selectedPrintWilayah, setSelectedPrintWilayah] = useState("Semua");

  const [showJamaahModal, setShowJamaahModal] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState(null);
  const [jamaahForm, setJamaahForm] = useState({
    nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima"
  });

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(() => getLocalStorageData("googleSheetsUrl", GOOGLE_SHEETS_SCRIPT_URL));
  const [syncStatus, setSyncStatus] = useState("Tersinkronisasi Lokal");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // Jadwal Sholat Terhubung API
  const [jadwalSholat, setJadwalSholat] = useState(() => {
    const saved = getLocalStorageData("jadwalSholatAktif", null);
    return saved || getMockJadwal(lokasi.kabupaten, lokasi.latitude, lokasi.longitude);
  });

  // =========================================================
  // EFFECTS FOR STORAGE & PERMISSIONS
  // =========================================================
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
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !currentUserLabel) return;
    const today = new Date();
    if (today.getDay() === 4) {
      const besok = new Date(today);
      besok.setDate(besok.getDate() + 1);
      const pasaranBesok = getPasaranJawa(besok);
      const petugasBesok = petugasAbadi[pasaranBesok];

      if (petugasBesok) {
        const isPetugas = [petugasBesok.khatib, petugasBesok.imam, petugasBesok.muadzin, petugasBesok.bilal].includes(currentUserLabel);
        const notifCacheKey = `notif_${pasaranBesok}_${today.toLocaleDateString('id-ID')}`;
        const hasNotified = localStorage.getItem(notifCacheKey);

        if (isPetugas && !hasNotified && "Notification" in window && Notification.permission === "granted") {
          new Notification("Pengingat Tugas Jumat", {
            body: `Assalamualaikum ${currentUserLabel}, mengingatkan besok Anda bertugas untuk Sholat Jumat ${pasaranBesok}.`,
            icon: masjidLogoUrl || undefined
          });
          localStorage.setItem(notifCacheKey, "true");
        }
      }
    }
  }, [currentTime, isLoggedIn, currentUserLabel, petugasAbadi, masjidLogoUrl]);

  // ====================================================================
  // API ALADHAN: MENARIK JADWAL SHOLAT ASTRONOMI REAL
  // ====================================================================
  const currentDay = currentTime.getDate();
  
  useEffect(() => {
    const fetchJadwalRealTime = async () => {
      if (!lokasi.latitude || !lokasi.longitude) return;
      const todayStr = new Date().toLocaleDateString('id-ID');
      const cacheKey = `jadwal_${lokasi.latitude}_${lokasi.longitude}_${todayStr}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        setJadwalSholat(parsed);
        localStorage.setItem("jadwalSholatAktif", JSON.stringify(parsed));
        return;
      }
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lokasi.latitude}&longitude=${lokasi.longitude}&method=20`);
        const result = await res.json();
        if (result && result.code === 200) {
          const t = result.data.timings;
          const realJadwal = {
            Subuh: t.Fajr, Terbit: t.Sunrise, Dzuhur: t.Dhuhr,
            Ashar: t.Asr, Maghrib: t.Maghrib, Isya: t.Isha
          };
          setJadwalSholat(realJadwal);
          localStorage.setItem(cacheKey, JSON.stringify(realJadwal));
          localStorage.setItem("jadwalSholatAktif", JSON.stringify(realJadwal));
        }
      } catch (err) {
        console.warn("Gagal fetch jadwal sholat Kemenag. Menampilkan estimasi dari cache lokal.", err);
      }
    };
    fetchJadwalRealTime();
  }, [lokasi.latitude, lokasi.longitude, currentDay]);

  // ====================================================================
  // GOOGLE SHEETS AUTO-SYNC CONTROLLER
  // ====================================================================
  const handleFetchFromGoogleSheets = async () => {
    if (!googleSheetsUrl) {
      setIsDataFetched(true);
      return;
    }
    setIsDataFetched(false); 
    setIsSyncing(true);
    setSyncStatus("Mengunduh Server...");
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
        addNotification("Data berhasil ditarik & diperbarui dari Server Pusat (Google Sheets)!", "success");
      } else {
        setSyncStatus("Tersinkronisasi Lokal");
      }
    } catch (err) {
      console.warn("Fetch Error:", err.message || err);
      setSyncStatus("Gagal Sinkron");
      addNotification("Gagal menarik data dari Google Sheets. Periksa jaringan Anda.", "error");
    } finally {
      setIsSyncing(false);
      setIsDataFetched(true); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (googleSheetsUrl) {
        handleFetchFromGoogleSheets();
      } else {
        setIsDataFetched(true);
      }
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
        await fetch(googleSheetsUrl, {
          method: "POST",
          mode: "no-cors", 
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload)
        });
        setSyncStatus("Tersinkronisasi");
      } catch (err) {
        console.warn("Auto-Save Error:", err.message || err);
        setSyncStatus("Gagal Menyimpan");
      }
    }, 3000); 

    return () => clearTimeout(timeoutId);
  }, [
    masjidName, masjidLogoUrl, petugasAbadi, jamaahList, 
    timbanganFitrah, alokasiFitrah, timbanganZuru, alokasiZuru, 
    timbanganQurbanSapi, timbanganQurbanKambing, userDatabase, 
    isLoggedIn, googleSheetsUrl, isDataFetched
  ]);

  // =========================================================
  // 2. CORE UTILITY FUNCTIONS
  // =========================================================
  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const hasAccess = (tabName) => {
    return rolesConfig[currentRole]?.access?.includes(tabName) || false;
  };

  const canEditPetugas = currentRole === "Admin" || hasAccess("petugas");
  const canEditJamaah = currentRole === "Admin" || hasAccess("jamaah");
  const canEditFitrah = currentRole === "Admin" || hasAccess("fitrah");
  const canEditZuru = currentRole === "Admin" || hasAccess("zuru");
  const canEditQurban = currentRole === "Admin" || hasAccess("qurban");

  const navigateTo = (tabName) => {
    if (hasAccess(tabName)) {
      setActiveTab(tabName);
      setIsMenuOpen(false);
    } else {
      addNotification(`Akses Ditolak! Peran Anda (${rolesConfig[currentRole].label}) tidak memiliki hak akses ke modul ini.`, "error");
    }
  };

  const renderMasjidLogo = (imgClassName, fallbackClassName) => {
    if (typeof masjidLogoUrl === 'string' && masjidLogoUrl.trim() !== "") {
      return (
        <img 
          src={masjidLogoUrl} 
          alt="Logo Masjid" 
          className={imgClassName} 
          onError={() => {
            addNotification("Tampilan Logo kustom gagal dimuat! Menggunakan logo kubah masjid bawaan.", "error");
            setMasjidLogoUrl("");
          }}
        />
      );
    }
    return <KubahMasjidIcon className={fallbackClassName} />;
  };

  const getNextSholat = () => {
    const nowStr = currentTime.toTimeString().split(' ')[0].substring(0, 5); 
    const sholatTimes = Object.entries(jadwalSholat).filter(([k]) => k !== 'Terbit');
    
    for (let [name, time] of sholatTimes) {
      if (time > nowStr) {
        return { name, time };
      }
    }
    return { name: "Subuh (Besok)", time: sholatTimes[0][1] };
  };

  const nextSholat = getNextSholat();
  const upcomingFridaysList = getUpcomingFridays(currentTime, petugasAbadi, 5);

  const totalTimbanganFitrahValue = timbanganFitrah.reduce((a, b) => a + b, 0);
  const rincianKebutuhanFitrahData = Object.entries(alokasiFitrah).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriFitrah(jamaahList, kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhFitrahValue = rincianKebutuhanFitrahData.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusFitrahValue = totalTimbanganFitrahValue - totalButuhFitrahValue;

  const totalTimbanganZuruValue = timbanganZuru.reduce((a, b) => a + b, 0);
  const rincianKebutuhanZuruData = Object.entries(alokasiZuru).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriZuru(jamaahList, kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuruValue = rincianKebutuhanZuruData.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusZuruValue = totalTimbanganZuruValue - totalButuruValue;

  const totalTimbanganQurbanSapiValue = timbanganQurbanSapi.reduce((a, b) => a + b, 0);
  const totalTimbanganQurbanKambingValue = timbanganQurbanKambing.reduce((a, b) => a + b, 0);

  const getWargaPenerimaQurban = () => {
    return jamaahList.filter(warga => {
      if (warga.qurban && warga.qurban.startsWith("Sahibul Qurban")) return false;
      if (filterWilayahQurban !== "Semua") {
        const [filterRt, filterRw] = filterWilayahQurban.split('_');
        if (warga.rt !== filterRt || warga.rw !== filterRw) return false;
      }
      if (qurbanHanyaMustahik) {
        const isMustahikFitrah = warga.fitrah !== "Muzakki";
        const isMustahikZuru = warga.zuru !== "Bukan Mustahik";
        return isMustahikFitrah || isMustahikZuru;
      }
      return true;
    });
  };

  const wargaPenerimaQurban = getWargaPenerimaQurban();
  const totalPenerimaKK = wargaPenerimaQurban.length;
  
  const jatahDagingSapiPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanSapiValue / totalPenerimaKK).toFixed(2) : 0;
  const jatahDagingKambingPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanKambingValue / totalPenerimaKK).toFixed(2) : 0;

  // =========================================================
  // 3. EVENT HANDLERS
  // =========================================================
  const handleSaveAlokasiFitrah = () => {
    setAlokasiFitrah(tempAlokasiFitrah);
    addNotification("Rencana jatah penyaluran Zakat Fitrah (Beras) berhasil diperbarui!", "success");
  };

  const handleSaveAlokasiZuru = () => {
    setAlokasiZuru(tempAlokasiZuru);
    addNotification("Rencana jatah penyaluran Zakat Zuru' berhasil diperbarui!", "success");
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
      addNotification("Timbangan daging sapi berhasil dihapus", "warning");
    } else if (tipe === 'qurbanKambing') {
      setTimbanganQurbanKambing(timbanganQurbanKambing.filter((_, i) => i !== index));
      addNotification("Timbangan daging kambing berhasil dihapus", "warning");
    }
  };

  const handlePrepareNotification = (fridayData, type) => {
    setNotificationType(type);
    let msg = "";
    if (type === "WA") {
      msg = `Assalamualaikum Wr. Wb. Yth. *${fridayData.petugas.khatib}*, menginfokan bahwa besok (hari Jumat ${fridayData.pasaran}, tanggal ${fridayData.formattedDate.replace(/^Jumat, /, "")}) adalah jadwal bapak bertugas sebagai *Khatib Sholat Jumat*. Mohon hadir 15 menit sebelum adzan berkumandang. Terima kasih. Wassalamualaikum Wr. Wb.`;
    } else {
      msg = `[MASJID AL-IKHLAS] Yth ${fridayData.petugas.khatib}, mengingatkan kembali besok Jumat ${fridayData.pasaran} jadwal bapak bertugas Khatib & Imam di masjid. Harap hadir 15 menit sebelum adzan. Terima kasih.`;
    }
    setSimulatedMessageText(msg);
    setActiveNotificationSim(fridayData);
  };

  const handleLogoUpload = (e) => {
    addNotification("Untuk sinkronisasi antar perangkat yang stabil, kami mematikan sistem unggah dokumen lokal. Cukup tempel URL gambar yang berawalan https://...", "warning");
  };

  const handleSaveNewIdentity = () => {
    if (!tempMasjidName.trim()) {
      addNotification("Nama Masjid tidak boleh kosong!", "error");
      return;
    }
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
    setPetugasAbadi(prev => ({
      ...prev,
      [editingPasaran]: pasaranForm
    }));
    addNotification(`Template Petugas Jumat ${editingPasaran} berhasil diperbarui!`);
    setEditingPasaran(null);
  };

  const handleSendSimMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      addNotification(`Notifikasi ${notificationType} H-1 pengingat sukses terkirim ke ${activeNotificationSim.petugas.khatib} (${activeNotificationSim.petugas.telp})!`, "success");
      setActiveNotificationSim(null);
    }, 1500);
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      addNotification("Browser atau gawai Anda tidak mendukung fitur penunjuk GPS.", "error");
      return;
    }

    addNotification("Mencari titik GPS... Harap izinkan akses Lokasi pada pop-up Browser/HP Anda.", "info");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setTempLokasi(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        addNotification(`Koordinat GPS Ditemukan! ${lat.toFixed(5)}, ${lon.toFixed(5)}. Klik "Terapkan Perubahan" untuk menyimpan.`, "success");
      },
      (error) => {
        console.warn("GPS Error:", error.message || error);
        addNotification("Gagal mengambil GPS. Pastikan GPS/Location di HP Anda MENYALA dan diizinkan untuk web ini.", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const cleanUser = inputUsername.trim().toLowerCase();
    const userAccount = userDatabase[cleanUser];

    if (userAccount && inputPassword === userAccount.password) {
      setCurrentRole(userAccount.role);
      setCurrentUserLabel(userAccount.label);
      setCurrentUserUsername(cleanUser);
      setIsLoggedIn(true);
      
      const allowedAccess = rolesConfig[userAccount.role].access;
      if (!allowedAccess.includes(activeTab)) {
        setActiveTab(allowedAccess[0] || "dashboard");
      }
      addNotification(`Selamat datang kembali, ${userAccount.label}!`, "success");
      
      setInputUsername("");
      setInputPassword("");
    } else {
      addNotification("Username atau Kata Sandi salah! Hubungi Super Admin.", "error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserUsername("");
    setCurrentUserLabel("");
    addNotification("Anda telah berhasil keluar dari sistem.", "warning");
  };

  const handleSaveJamaah = (e) => {
    e.preventDefault();
    if (!jamaahForm.nama.trim() || !jamaahForm.alamat.trim()) {
      addNotification("Mohon lengkapi semua bidang wajib!", "error");
      return;
    }

    if (editingJamaah) {
      setJamaahList(prev => prev.map(item => item.id === editingJamaah.id ? { ...jamaahForm, id: item.id } : item));
      addNotification("Data jamaah berhasil diperbarui");
    } else {
      const newJamaah = {
        ...jamaahForm,
        id: Date.now().toString()
      };
      setJamaahList(prev => [...prev, newJamaah]);
      addNotification("Jamaah baru berhasil ditambahkan");
    }
    setShowJamaahModal(false);
    setEditingJamaah(null);
    setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima" });
  };

  const handleEditJamaah = (jamaah) => {
    setEditingJamaah(jamaah);
    setJamaahForm({
      ...jamaah,
      qurban: jamaah.qurban || "Penerima"
    });
    setShowJamaahModal(true);
  };

  const handleDeleteJamaah = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
      setJamaahList(prev => prev.filter(item => item.id !== id));
      addNotification("Data warga berhasil dihapus", "warning");
    }
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const cleanUsername = newAccUsername.trim().toLowerCase();
    
    if (!cleanUsername || !newAccPassword.trim() || !newAccLabel.trim()) {
      addNotification("Mohon lengkapi semua bidang isian pembuatan akun!", "error");
      return;
    }

    if (userDatabase[cleanUsername]) {
      addNotification("Username tersebut sudah terdaftar! Gunakan username lain.", "error");
      return;
    }

    setUserDatabase(prev => ({
      ...prev,
      [cleanUsername]: {
        password: newAccPassword,
        role: newAccRole,
        label: newAccLabel
      }
    }));

    addNotification(`Akun baru dengan peran "${newAccRole}" berhasil dibuat!`);
    
    setNewAccUsername("");
    setNewAccPassword("");
    setNewAccLabel("");
    setNewAccRole("Jamaah");
  };

  const handleDeleteAccount = (usernameKey) => {
    if (usernameKey === "admin") {
      addNotification("Akun admin utama bawaan tidak boleh dihapus demi keamanan!", "error");
      return;
    }
    if (usernameKey === currentUserUsername) {
      addNotification("Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!", "error");
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akun pengguna "${usernameKey}"?`)) {
      setUserDatabase(prev => {
        const copy = { ...prev };
        delete copy[usernameKey];
        return copy;
      });
      addNotification(`Akun "${usernameKey}" berhasil dihapus.`, "warning");
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    if (!newPasswordValue.trim()) {
      addNotification("Password baru tidak boleh kosong!", "error");
      return;
    }

    setUserDatabase(prev => ({
      ...prev,
      [editingAccountPassword]: {
        ...prev[editingAccountPassword],
        password: newPasswordValue.trim()
      }
    }));

    addNotification(`Password untuk akun "${editingAccountPassword}" berhasil diganti!`, "success");
    setEditingAccountPassword(null);
    setNewPasswordValue("");
  };

  // Helper WA Formatter
  const createWAShareLink = (title, rtTitle, summaryText) => {
    const message = `*${masjidName}*\n\n📝 *${title}*\nWilayah: ${rtTitle}\nTanggal: ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}\n\n${summaryText}\n\n_Catatan: Dokumen cetak (PDF) tersedia di pengurus._`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  // =========================================================
  // SISTEM CETAK LAPORAN & PEMBUATAN PDF (F4 LAYOUT & RESPONSIVE)
  // =========================================================
  const generateHTMLTemplate = (docTitle, rtTitle, summaryHTML, tableHeaderHTML, tableRowsHTML, waLink, pdfFilename) => {
    return `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${docTitle} - ${masjidName}</title>
          <!-- Menggunakan html2pdf untuk konversi PDF Web ke Gambar -->
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              background-color: #f1f5f9; 
              margin: 0; 
              padding: 10px; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
            }
            .print-container {
              width: 100%;
              max-width: 215mm; /* Setara dengan lebar kertas F4/Folio */
              min-height: auto;
              background: white;
              padding: 20px;
              margin-top: 15px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              box-sizing: border-box;
              overflow-x: auto;
            }
            .control-panel {
              width: 100%;
              max-width: 215mm;
              background: white;
              padding: 15px 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-sizing: border-box;
              flex-wrap: wrap;
              gap: 10px;
            }
            .btn-group {
              display: flex; 
              gap: 8px; 
              flex-wrap: wrap;
            }
            .btn {
              padding: 10px 16px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              border: none;
            }
            .btn-wa { background: #25D366; color: white; }
            .btn-pdf-native { background: #0f172a; color: white; }
            .btn-pdf-web { background: #3b82f6; color: white; }
            
            /* TATA LETAK ISI KERTAS */
            .kop-surat { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;}
            .kop-surat .logo { width: 60px; height: 60px; object-fit: contain; }
            .kop-surat h1 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
            .kop-surat p { margin: 5px 0 0; font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .tanggal { text-align: right; font-size: 10px; color: #64748b; font-weight: bold; }
            
            .judul-dokumen { text-align: center; margin-bottom: 25px; }
            .judul-dokumen h2 { margin: 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
            .judul-dokumen p { margin: 5px 0 0; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; min-width: 600px;}
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: bold; text-transform: uppercase; color: #475569; }
            td { color: #334155; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .signature-area { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; flex-wrap: wrap; gap: 20px;}
            .signature-box { text-align: center; width: 180px; }
            .signature-line { margin-top: 60px; border-top: 1px solid #0f172a; padding-top: 5px; font-weight: bold; color: #0f172a; }

            /* MEDIA PRINT: Pengaturan Kertas Fisik (F4 / Folio: 215mm x 330mm) */
            @media print {
              body { padding: 0; background: white; display: block; }
              .control-panel { display: none !important; }
              .print-container { max-width: none; width: 100%; box-shadow: none; padding: 0; margin: 0; border-radius: 0; overflow-x: visible; }
              @page { size: 215mm 330mm; margin: 15mm; } 
            }
          </style>
        </head>
        <body>
          
          <!-- Panel Kontrol Aksi (Tidak Ikut Tercetak) -->
          <div class="control-panel">
            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: bold;">Opsi Laporan:</p>
            <div class="btn-group">
              <a href="${waLink}" target="_blank" class="btn btn-wa">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                <span>WA</span>
              </a>
              <button id="btn-print" onclick="window.print()" class="btn btn-pdf-native">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> 
                <span>Cetak / Simpan PDF (HP/APK)</span>
              </button>
              <button id="btn-download" onclick="downloadPDFWeb()" class="btn btn-pdf-web">
                <span>⬇️ Unduh PDF (PC/Web)</span>
              </button>
            </div>
          </div>

          <!-- Area yang akan diubah menjadi PDF atau di-Print -->
          <div id="print-area" class="print-container">
            <div class="kop-surat">
              <div style="display: flex; align-items: center; gap: 15px;">
                ${masjidLogoUrl ? `<img src="${masjidLogoUrl}" class="logo" crossorigin="anonymous" />` : `<div style="width: 50px; height: 50px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b;">LOGO</div>`}
                <div>
                  <h1>${masjidName}</h1>
                  <p>Desa ${lokasi.desa || ''}, Kec. ${lokasi.kecamatan}, Kab. ${lokasi.kabupaten}, Provinsi ${lokasi.provinsi}</p>
                </div>
              </div>
              <div class="tanggal text-right">
                Tanggal Dokumen:<br/>
                <span style="color: #0f172a; font-size: 11px;">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
              </div>
            </div>

            <div class="judul-dokumen">
              <h2>${docTitle}</h2>
              <p>Wilayah Pengurusan: ${rtTitle}</p>
            </div>
            
            ${summaryHTML}
            
            <div style="width: 100%; overflow-x: auto;">
              <table>
                <thead>
                  ${tableHeaderHTML}
                </thead>
                <tbody>
                  ${tableRowsHTML}
                </tbody>
              </table>
            </div>
            
            <div class="signature-area">
              <div class="signature-box">
                <p>Menyetujui & Mengesahkan,</p>
                <div class="signature-line">Ketua Takmir Masjid</div>
              </div>
              <div class="signature-box text-right">
                <p>Lamongan, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                <p>Penanggung Jawab Laporan,</p>
                <div class="signature-line">Kepala Pengurus RT</div>
              </div>
            </div>
          </div>
          
          <script>
            // Fungsi Unduh Otomatis via JS (Bagus untuk Desktop/Web)
            function downloadPDFWeb() {
              const element = document.getElementById('print-area');
              const btn = document.getElementById('btn-download');
              const originalText = btn.innerHTML;
              
              btn.innerHTML = 'Memproses PDF...';
              btn.style.opacity = '0.7';
              btn.disabled = true;

              if (typeof html2pdf === 'undefined') {
                 // Jika library gagal dimuat karena jaringan, panggil fungsi native print
                 window.print();
                 btn.innerHTML = originalText;
                 btn.style.opacity = '1';
                 btn.disabled = false;
                 return;
              }

              // Konfigurasi Kertas F4 (215mm x 330mm)
              const opt = {
                margin:       10, // margin 10mm
                filename:     '${pdfFilename}',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
                jsPDF:        { unit: 'mm', format: [215, 330], orientation: 'portrait' }
              };
              
              html2pdf().set(opt).from(element).save().then(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
              }).catch(err => {
                console.error("Gagal buat PDF otomatis:", err);
                window.print();
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.disabled = false;
              });
            }

            // Fungsi Auto-Eksekusi Saat Halaman Selesai Dimuat
            window.onload = function() {
              // Cek jika pengguna menggunakan HP Android/iOS (termasuk APK Webview)
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              setTimeout(() => {
                if (isMobile) {
                    // Pada APK/Mobile, fungsi cetak bawaan sistem jauh lebih dapat diandalkan
                    // karena mengizinkan penyimpanan file PDF lokal tanpa masalah izin Blob URL
                    window.print();
                } else {
                    // Pada Laptop/PC Desktop web, jalankan skrip unduh otomatis
                    downloadPDFWeb();
                }
              }, 1200);
            }
          </script>
        </body>
      </html>
    `;
    return html;
  };

  const handlePrintSelectedReport = (reportType) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification("Gagal membuka jendela cetak! Periksa pengaturan pemblokir pop-up browser Anda.", "error");
      return;
    }

    let filteredWarga = jamaahList;
    let rtTitle = "Seluruh Wilayah (Semua RT & RW)";

    if (selectedPrintWilayah !== "Semua") {
      const [filterRt, filterRw] = selectedPrintWilayah.split('_');
      filteredWarga = jamaahList.filter(j => j.rt === filterRt && j.rw === filterRw);
      rtTitle = `RT ${filterRt} / RW ${filterRw}`;
    }

    let docTitle = "";
    let tableHeaderHTML = "";
    let tableRowsHTML = "";
    let summaryHTML = "";
    let waSummaryText = "";

    if (reportType === "jamaah") {
      docTitle = `Laporan Database Jamaah & Anggota Keluarga`;
      waSummaryText = `Total Warga Terdaftar: ${filteredWarga.length} KK.`;
      tableHeaderHTML = `
        <tr>
          <th class="text-center" style="width: 5%;">No</th>
          <th style="width: 30%;">Nama Kepala Keluarga</th>
          <th class="text-center" style="width: 15%;">RT / RW</th>
          <th style="width: 35%;">Alamat Lengkap</th>
          <th class="text-center" style="width: 15%;">Jumlah Jiwa</th>
        </tr>
      `;
      tableRowsHTML = filteredWarga.map((j, i) => `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td class="font-bold">${j.nama}</td>
          <td class="text-center font-bold">RT ${j.rt} / RW ${j.rw}</td>
          <td>${j.alamat}</td>
          <td class="text-center font-bold">${j.anggota} Orang</td>
        </tr>
      `).join('');
    }

    else if (reportType === "fitrah") {
      docTitle = `Daftar Penyaluran & Tanda Terima Zakat Fitrah (Beras)`;
      const mustahikList = filteredWarga.filter(j => j.fitrah !== "Muzakki");
      const totalJiwaMustahik = mustahikList.reduce((acc, curr) => acc + curr.anggota, 0);

      waSummaryText = `✔️ Total Beras Terkumpul: ${totalTimbanganFitrahValue.toFixed(1)} Kg\n✔️ Penerima di wilayah ini: ${mustahikList.length} KK (${totalJiwaMustahik} Jiwa)\n\nSilakan datang ke masjid untuk pengambilan.`;

      summaryHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #065f46; font-size: 14px; text-transform: uppercase;">Ringkasan Data Penyaluran Zakat Fitrah</h3>
          <table style="width: 100%; border: none; margin-top: 5px;">
            <tr>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Total Beras Terkumpul:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #047857;">${totalTimbanganFitrahValue.toFixed(1)} Kg</span></td>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Total Mustahik Penerima:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #047857;">${mustahikList.length} KK (${totalJiwaMustahik} Jiwa)</span></td>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Jatah Dibagikan Per Jiwa:</strong><br/><span style="font-size: 11px;">Berat: ${alokasiFitrah.Berat} Kg | Sedang: ${alokasiFitrah.Sedang} Kg | Ringan: ${alokasiFitrah.Ringan} Kg</span></td>
            </tr>
          </table>
        </div>
      `;

      tableHeaderHTML = `
        <tr>
          <th class="text-center" style="width: 5%;">No</th>
          <th style="width: 25%;">Nama Kepala Keluarga</th>
          <th class="text-center" style="width: 15%;">Kriteria</th>
          <th class="text-center" style="width: 15%;">Jiwa KK</th>
          <th class="text-right" style="width: 15%;">Jatah Beras</th>
          <th class="text-center" style="width: 25%;">Tanda Terima</th>
        </tr>
      `;
      
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => {
        const jatahPerJiwa = alokasiFitrah[j.fitrah] || 0;
        const totalJatah = jatahPerJiwa * j.anggota;
        return `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td class="font-bold">${j.nama}</td>
            <td class="text-center">Mustahik ${j.fitrah}</td>
            <td class="text-center">${j.anggota} Jiwa</td>
            <td class="text-right font-bold" style="color: #047857;">${totalJatah.toFixed(1)} Kg</td>
            <td class="text-left" style="height: 40px; position: relative;">
              <span style="position: absolute; bottom: 5px; left: 10px; font-size: 9px; color: #94a3b8;">${i + 1}.</span>
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="6" class="text-center" style="padding: 30px; font-style: italic; color: #94a3b8;">Tidak ada jemaah penerima Zakat Fitrah pada wilayah terpilih ini.</td></tr>`;
    }

    else if (reportType === "zuru") {
      docTitle = `Daftar Penyaluran & Tanda Terima Zakat Zuru' (Pertanian)`;
      const mustahikList = filteredWarga.filter(j => j.zuru !== "Bukan Mustahik");
      const totalJiwaMustahik = mustahikList.reduce((acc, curr) => acc + curr.anggota, 0);

      waSummaryText = `✔️ Total Panen Terkumpul: ${totalTimbanganZuruValue.toFixed(1)} Kg\n✔️ Penerima di wilayah ini: ${mustahikList.length} KK (${totalJiwaMustahik} Jiwa)\n\nSilakan datang ke masjid untuk pengambilan jatah Zakat Zuru'.`;

      summaryHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #115e59; font-size: 14px; text-transform: uppercase;">Ringkasan Data Penyaluran Zakat Zuru'</h3>
          <table style="width: 100%; border: none; margin-top: 5px;">
            <tr>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Total Panen Terkumpul:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #0f766e;">${totalTimbanganZuruValue.toFixed(1)} Kg</span></td>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Total Mustahik Penerima:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #0f766e;">${mustahikList.length} KK (${totalJiwaMustahik} Jiwa)</span></td>
              <td style="width: 33%; border: none; padding: 5px 0;"><strong>Jatah Dibagikan Per Jiwa:</strong><br/><span style="font-size: 11px;">Berat: ${alokasiZuru.Berat} Kg | Sedang: ${alokasiZuru.Sedang} Kg | Ringan: ${alokasiZuru.Ringan} Kg</span></td>
            </tr>
          </table>
        </div>
      `;

      tableHeaderHTML = `
        <tr>
          <th class="text-center" style="width: 5%;">No</th>
          <th style="width: 25%;">Nama Kepala Keluarga</th>
          <th class="text-center" style="width: 15%;">Kriteria</th>
          <th class="text-center" style="width: 15%;">Jiwa KK</th>
          <th class="text-right" style="width: 15%;">Jatah Panen</th>
          <th class="text-center" style="width: 25%;">Tanda Terima</th>
        </tr>
      `;
      
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => {
        const jatahPerJiwa = alokasiZuru[j.zuru] || 0;
        const totalJatah = jatahPerJiwa * j.anggota;
        return `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td class="font-bold">${j.nama}</td>
            <td class="text-center">Mustahik ${j.zuru}</td>
            <td class="text-center">${j.anggota} Jiwa</td>
            <td class="text-right font-bold" style="color: #0f766e;">${totalJatah.toFixed(1)} Kg</td>
            <td class="text-left" style="height: 40px; position: relative;">
              <span style="position: absolute; bottom: 5px; left: 10px; font-size: 9px; color: #94a3b8;">${i + 1}.</span>
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="6" class="text-center" style="padding: 30px; font-style: italic; color: #94a3b8;">Tidak ada jemaah penerima Zakat Zuru' pada wilayah terpilih ini.</td></tr>`;
    }

    else if (reportType === "qurban") {
      docTitle = `Daftar Penerima & Tanda Terima Distribusi Daging Qurban`;
      
      const qurbanList = filteredWarga.filter(warga => {
        if (warga.qurban && warga.qurban.startsWith("Sahibul Qurban")) return false;
        if (qurbanHanyaMustahik) {
          const isMustahikFitrah = warga.fitrah !== "Muzakki";
          const isMustahikZuru = warga.zuru !== "Bukan Mustahik";
          return isMustahikFitrah || isMustahikZuru;
        }
        return true;
      });

      waSummaryText = `🥩 Info Pembagian Qurban 🥩\n\n✔️ Total Sapi: ${totalTimbanganQurbanSapiValue.toFixed(1)} Kg\n✔️ Kambing: ${totalTimbanganQurbanKambingValue.toFixed(1)} Kg\n✔️ Penerima (${rtTitle}): ${qurbanList.length} KK\n\nJatah per KK:\n- Sapi: ${jatahDagingSapiPerKK} Kg\n- Kambing: ${jatahDagingKambingPerKK} Kg`;

      summaryHTML = `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #be123c; font-size: 14px; text-transform: uppercase;">Ringkasan Data Penyaluran Daging Qurban</h3>
          <table style="width: 100%; border: none; margin-top: 5px;">
            <tr>
              <td style="width: 25%; border: none; padding: 5px 0;"><strong>Daging Sapi Terkumpul:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #e11d48;">${totalTimbanganQurbanSapiValue.toFixed(1)} Kg</span></td>
              <td style="width: 25%; border: none; padding: 5px 0;"><strong>Kambing Terkumpul:</strong><br/><span style="font-size: 16px; font-weight: bold; color: #d97706;">${totalTimbanganQurbanKambingValue.toFixed(1)} Kg</span></td>
              <td style="width: 25%; border: none; padding: 5px 0;"><strong>Warga Penerima:</strong><br/><span style="font-size: 16px; font-weight: bold;">${qurbanList.length} KK</span></td>
              <td style="width: 25%; border: none; padding: 5px 0;"><strong>Porsi Jatah per KK:</strong><br/><span style="font-size: 11px;">Sapi: ${jatahDagingSapiPerKK} Kg/KK<br/>Kambing: ${jatahDagingKambingPerKK} Kg/KK</span></td>
            </tr>
          </table>
        </div>
      `;

      tableHeaderHTML = `
        <tr>
          <th class="text-center" style="width: 5%;">No</th>
          <th style="width: 25%;">Nama Kepala Keluarga</th>
          <th class="text-center" style="width: 10%;">RT/RW</th>
          <th style="width: 20%;">Alamat</th>
          <th class="text-right" style="width: 10%;">Jatah Sapi</th>
          <th class="text-right" style="width: 10%;">Kambing</th>
          <th class="text-center" style="width: 20%;">Tanda Tangan</th>
        </tr>
      `;

      tableRowsHTML = qurbanList.length > 0 ? qurbanList.map((j, i) => `
        <tr>
          <td class="text-center">${i + 1}</td>
          <td class="font-bold">${j.nama}</td>
          <td class="text-center font-bold">RT ${j.rt}/${j.rw}</td>
          <td style="font-size: 9px;">${j.alamat}</td>
          <td class="text-right font-bold" style="color: #e11d48;">${jatahDagingSapiPerKK} Kg</td>
          <td class="text-right font-bold" style="color: #d97706;">${jatahDagingKambingPerKK} Kg</td>
          <td class="text-left" style="height: 40px; position: relative;">
            <span style="position: absolute; bottom: 5px; left: 10px; font-size: 9px; color: #94a3b8;">${i + 1}.</span>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="7" class="text-center" style="padding: 30px; font-style: italic; color: #94a3b8;">Tidak ada warga penerima daging qurban pada wilayah terpilih ini.</td></tr>`;
    }

    else if (reportType === "pekurban") {
      docTitle = `Daftar Nama Pekurban (Sahibul Qurban)`;
      waSummaryText = `Terima kasih kepada para jamaah Sahibul Qurban wilayah ${rtTitle}. Semoga amal ibadah qurban diterima Allah SWT. Amin.`;
      
      tableHeaderHTML = `
        <tr>
          <th class="text-center" style="width: 5%;">No</th>
          <th style="width: 25%;">Nama Pekurban</th>
          <th class="text-center" style="width: 15%;">RT / RW</th>
          <th style="width: 30%;">Alamat</th>
          <th class="text-center" style="width: 25%;">Jenis Hewan Qurban</th>
        </tr>
      `;

      const pekurbanList = filteredWarga.filter(warga => warga.qurban && warga.qurban.startsWith("Sahibul Qurban"));

      tableRowsHTML = pekurbanList.length > 0 ? pekurbanList.map((j, i) => {
        const jenisHewan = j.qurban.replace("Sahibul Qurban - ", "");
        return `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td class="font-bold">${j.nama}</td>
            <td class="text-center font-bold">RT ${j.rt} / RW ${j.rw}</td>
            <td>${j.alamat}</td>
            <td class="text-center font-bold" style="color: #e11d48;">${jenisHewan}</td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="5" class="text-center" style="padding: 30px; font-style: italic; color: #94a3b8;">Tidak ada data pekurban (Sahibul Qurban) pada wilayah terpilih ini.</td></tr>`;
    }

    const waLink = createWAShareLink(docTitle, rtTitle, waSummaryText);
    const pdfFilename = `${docTitle.replace(/\s+/g, '_')}_${rtTitle.replace(/\s+|\//g, '')}.pdf`;

    const html = generateHTMLTemplate(docTitle, rtTitle, summaryHTML, tableHeaderHTML, tableRowsHTML, waLink, pdfFilename);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintQurbanRT = () => {
    handlePrintSelectedReport("qurban");
  };

  // =========================================================
  // 6. LOGIN FORM RENDERING
  // =========================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans antialiased">
        <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm font-medium flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
              n.type === 'error' ? 'bg-rose-600 border-rose-700' : 'bg-emerald-600 border-emerald-700'
            }`}>
              {n.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
              <span>{n.message}</span>
            </div>
          ))}
        </div>

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10 flex flex-col p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 text-emerald-600 flex items-center justify-center mx-auto overflow-hidden">
              {renderMasjidLogo("w-full h-full object-contain rounded-lg", "w-16 h-16")}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{masjidName}</h1>
              <p className="text-xs text-slate-500 font-semibold font-mono tracking-wider">Manajemen Pengelola Zakat & Qurban</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={16} />
                </span>
                <input 
                  type="text" required
                  placeholder="Masukkan username Anda"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full text-sm border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} required
                  placeholder="Masukkan kata sandi Anda"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full text-sm border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              Masuk Aplikasi
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-[10px] font-semibold mt-4 z-10 font-mono">
          &copy; {new Date().getFullYear()} {masjidName}. Keamanan sistem dienkripsi secara lokal.
        </p>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD INTERFACE (AUTHORIZED USER ONLY)
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased relative">

      {/* === HEADER UTAMA === */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200 shadow-xs"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 flex items-center justify-center overflow-hidden shrink-0">
              {renderMasjidLogo("w-full h-full object-contain rounded-lg", "w-8 h-8 sm:w-10 sm:h-10")}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none">{masjidName}</h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-1 sm:mt-1.5 tracking-wider">Aplikasi Masjid Terpadu</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-3 pr-2 py-1.5 rounded-2xl">
            <div className="text-left hidden sm:block">
              <span className="text-[9px] text-emerald-600 font-extrabold block leading-none uppercase">Peran Saat Ini</span>
              <span className="text-xs font-black text-emerald-955 truncate max-w-[120px] inline-block">{currentUserLabel}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-xl transition-all ml-1" title="Pintu Keluar (Logout)">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* === DRAWER MENU NAVIGASI === */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex animate-fadeIn">
          <div className="bg-white w-72 h-full shadow-2xl flex flex-col justify-between p-5 border-r border-slate-200 animate-slideRight">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 text-emerald-600">
                    {renderMasjidLogo("w-8 h-8 object-contain rounded", "w-7 h-7")}
                  </div>
                  <span className="text-sm font-black text-slate-800 tracking-wide truncate">{masjidName}</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">Daftar Modul Masjid</p>
                {[
                  { id: "dashboard", label: "Dashboard Utama", icon: Compass },
                  { id: "petugas", label: "Petugas Sholat Jumat", icon: Calendar },
                  { id: "jamaah", label: "Data Jama'ah & RT/RW", icon: Users },
                  { id: "fitrah", label: "Zakat Fitrah", icon: Gift },
                  { id: "zuru", label: "Zakat Zuru' (Tani)", icon: Coins },
                  { id: "qurban", label: "Daging Qurban", icon: Heart },
                  { id: "rbac", label: "Hak Akses & Identitas", icon: UserCheck }
                ].map((item) => {
                  const allowed = hasAccess(item.id);
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      disabled={!allowed && currentRole !== 'Admin'} 
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black transition-all ${
                        isActive ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 shadow-xs' : !allowed ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-emerald-600' : !allowed ? 'text-slate-300' : 'text-slate-400'}`} />
                      <span className="text-left flex-1">{item.label}</span>
                      {!allowed && <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-90">Kunci</span>}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-xs text-emerald-700 uppercase">{currentUserUsername.substring(0, 2)}</div>
                <div className="text-xs truncate">
                  <p className="font-bold text-slate-800 truncate">{currentUserLabel}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">@{currentUserUsername}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center sm:justify-start gap-3 px-3.5 py-3 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-all border border-dashed border-rose-100">
                <LogOut className="w-4.5 h-4.5" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      {/* === CONTENT AREA UTAMA === */}
      <div className="flex-1 flex flex-col md:flex-row font-sans">
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto w-full max-w-7xl mx-auto">
          
          {/* TAB 1: DASHBOARD UTAMA */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 sm:space-y-6">
              
              {/* NOTIFIKASI IZIN WEB */}
              {("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                  <div className="flex gap-3">
                    <BellRing className="text-amber-600 mt-0.5 shrink-0" size={18}/>
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs sm:text-sm">Aktifkan Notifikasi Pengingat Tugas</h4>
                      <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5">Izinkan peramban untuk memberi Anda pop-up notifikasi latar belakang saat Anda dijadwalkan bertugas di hari esok.</p>
                    </div>
                  </div>
                  <button onClick={() => Notification.requestPermission().then(() => addNotification("Izin notifikasi diperbarui."))} className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-amber-700 shrink-0">Izinkan Notifikasi</button>
                </div>
              )}

              {/* STATUS BAR CLOUD SYNC & REFRESH */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                      <Database size={18} className={isSyncing ? "animate-pulse" : ""} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Server</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <div className={`w-2 h-2 rounded-full shrink-0 ${syncStatus === 'Tersinkronisasi' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                         <p className="text-xs sm:text-sm font-black text-slate-800 truncate">{syncStatus}</p>
                      </div>
                   </div>
                </div>
                <button 
                   onClick={handleFetchFromGoogleSheets}
                   disabled={isSyncing}
                   className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> 
                   {isSyncing ? "Memuat Data..." : "Refresh Data Server"}
                </button>
              </div>

              <div className="bg-emerald-700 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-emerald-700/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-300 w-5 h-5 shrink-0" />
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-200">Lokasi Penentuan Jadwal Sholat</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">Desa {lokasi.desa || ''}, {lokasi.kecamatan}, <br className="block sm:hidden"/> {lokasi.kabupaten}, {lokasi.provinsi}</h2>
                  {lokasi.latitude && lokasi.longitude && (
                    <p className="text-[10px] text-emerald-200 font-mono mt-1">Koordinat Aktif: {parseFloat(lokasi.latitude).toFixed(5)}, {parseFloat(lokasi.longitude).toFixed(5)}</p>
                  )}
                </div>
                {hasAccess("rbac") && ( 
                  <button onClick={() => { setTempLokasi(lokasi); setIsSettingLokasi(true); }} className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <Settings size={15} /> Atur Lokasi Baru
                  </button>
                )}
              </div>

              {isSettingLokasi && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-emerald-700"><MapPin size={16} /> Konfigurasi Geografis Masjid</h3>
                    <button 
                      type="button" 
                      onClick={handleGetGPSLocation}
                      className="w-full sm:w-auto px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-2"
                    >
                      <Smartphone size={14} /> Ambil GPS HP Otomatis
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Desa / Kelurahan</label>
                      <input type="text" value={tempLokasi.desa || ""} onChange={(e) => setTempLokasi({...tempLokasi, desa: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kecamatan</label>
                      <input type="text" value={tempLokasi.kecamatan} onChange={(e) => setTempLokasi({...tempLokasi, kecamatan: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kabupaten / Kota</label>
                      <input type="text" value={tempLokasi.kabupaten} onChange={(e) => setTempLokasi({...tempLokasi, kabupaten: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Provinsi</label>
                      <input type="text" value={tempLokasi.provinsi} onChange={(e) => setTempLokasi({...tempLokasi, provinsi: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Latitude (Koordinat Lintang)</label>
                      <input type="number" step="0.000001" value={tempLokasi.latitude || ""} onChange={(e) => setTempLokasi({...tempLokasi, latitude: parseFloat(e.target.value) || 0})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20 font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Longitude (Koordinat Bujur)</label>
                      <input type="number" step="0.000001" value={tempLokasi.longitude || ""} onChange={(e) => setTempLokasi({...tempLokasi, longitude: parseFloat(e.target.value) || 0})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500/20 font-mono" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                    <button onClick={() => setIsSettingLokasi(false)} className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all">Batal</button>
                    <button onClick={() => { 
                      setLokasi(tempLokasi); 
                      setIsSettingLokasi(false); 
                      addNotification("Lokasi dan koordinat GPS masjid berhasil disave sebagai acuan sholat!"); 
                    }} className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10">Terapkan Perubahan</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-slate-100 gap-2">
                    <h3 className="font-bold text-slate-955 flex items-center gap-2"><Compass className="text-emerald-600 w-5 h-5 shrink-0" /> Jadwal Sholat Hari Ini</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider self-start sm:self-auto">Akurasi API Kemenag RI</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(jadwalSholat).map(([sholatName, time]) => {
                      const isNext = nextSholat.name === sholatName;
                      return (
                        <div key={sholatName} className={`p-3 rounded-xl border text-center transition-all ${isNext ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10 scale-105' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                          <p className={`text-[10px] sm:text-[11px] font-bold ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{sholatName}</p>
                          <p className="text-base sm:text-lg font-extrabold tracking-wider mt-1">{time}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-955 flex items-center gap-2 text-sm sm:text-base"><Calendar className="text-emerald-600 w-5 h-5 shrink-0" /> Penjadwalan Petugas Jumat Pekan Ini</h3>
                  {upcomingFridaysList.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-slate-100 gap-2">
                        <span className="text-xs text-slate-500 font-bold">{upcomingFridaysList[0].formattedDate}</span>
                        <span className="text-[10px] sm:text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold self-start sm:self-auto">Jumat {upcomingFridaysList[0].pasaran}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Khatib Utama</p>
                          <p className="text-slate-900 text-sm font-extrabold truncate">{upcomingFridaysList[0].petugas.khatib}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Imam Cadangan</p>
                          <p className="text-slate-900 text-sm font-extrabold truncate">{upcomingFridaysList[0].petugas.imam}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Muadzin</p>
                          <p className="text-slate-800 text-sm font-bold truncate">{upcomingFridaysList[0].petugas.muadzin}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Bilal / MC</p>
                          <p className="text-slate-800 text-sm font-bold truncate">{upcomingFridaysList[0].petugas.bilal}</p>
                        </div>
                      </div>
                    </div>
                  ) : ( <p className="text-xs text-slate-400">Belum ada agenda petugas sholat Jumat.</p> )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-950 flex items-center gap-2 text-sm sm:text-base"><UsersRound className="text-emerald-600 w-5 h-5 shrink-0" /> Sebaran Jiwa Mustahik (Basis RT)</h3>
                  <div className="space-y-2">
                    {["Berat", "Sedang", "Ringan"].map((asnaf) => {
                      const fitrahCount = getJumlahJiwaPerKategoriFitrah(jamaahList, asnaf);
                      const zuruCount = getJumlahJiwaPerKategoriZuru(jamaahList, asnaf);
                      return (
                        <div key={asnaf} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200/50 gap-1.5">
                          <span className="font-bold text-slate-700">Mustahik {asnaf}</span>
                          <div className="flex gap-4 font-semibold text-slate-600">
                            <span>Fitrah: <strong className="text-emerald-600">{fitrahCount} Jiwa</strong></span>
                            <span>Zuru': <strong className="text-teal-600">{zuruCount} Jiwa</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PETUGAS JUMAT */}
          {activeTab === "petugas" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-955">Konfigurasi Petugas Sholat Jumat Abadi</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Sistem otomatis mengikat petugas berdasarkan 5 Hari Pasaran Jawa. Tidak perlu membuat jadwal mingguan baru selamanya!</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <BellRing className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-[11px] sm:text-xs text-amber-800">
                    <p className="font-bold">Sistem Notifikasi Pengingat Latar Belakang (Web/Android)</p>
                    <p className="text-amber-700 mt-0.5">Simulasikan pengiriman pesan pengingat WhatsApp atau SMS Gateway ke ponsel petugas langsung dari tombol simulasi di bawah template kartu petugas. Secara otomatis, sistem juga akan memicu Push Notification web lokal setiap hari Kamis.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Template Petugas Jumat Abadi (5 Pasaran)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {PASARAN_LIST.map((pasaran) => {
                    const data = petugasAbadi[pasaran] || {};
                    return (
                      <div key={pasaran} className="bg-white border-2 border-slate-100 hover:border-emerald-200 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span className="text-xs font-black text-emerald-700 uppercase">JUMAT {pasaran}</span>
                            {canEditPetugas && (
                              <button onClick={() => handleEditPasaran(pasaran)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-transparent hover:border-slate-200 shadow-2xs" title="Ubah Template Petugas"><Edit2 size={14} /></button>
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div><span className="text-[10px] text-slate-400 block font-bold">KHATIB / IMAM</span><span className="text-slate-800 font-extrabold block truncate">{data.khatib || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">IMAM CADANGAN</span><span className="text-slate-800 font-semibold block truncate">{data.imam || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">MUADZIN</span><span className="text-slate-700 font-medium block truncate">{data.muadzin || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">BILAL</span><span className="text-slate-700 font-medium block truncate">{data.bilal || "-"}</span></div>
                          </div>
                        </div>
                        {data.telp && ( 
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-50 p-1.5 rounded-md">
                              <Phone size={12} className="text-emerald-600"/>
                              <span className="truncate">{data.telp}</span>
                            </div>
                            
                            {data.khatib && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <button
                                  onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat, 22 Mei 2026" }, "WA")}
                                  className="flex-1 bg-[#128c7e] hover:bg-[#075e54] text-white font-bold py-1.5 rounded-lg text-[10px] transition-all text-center"
                                >
                                  Kirim WA
                                </button>
                                <button
                                  onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat, 22 Mei 2026" }, "SMS")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] transition-all text-center"
                                >
                                  Kirim SMS
                                </button>
                              </div>
                            )}
                          </div> 
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Edit Template Pasaran */}
              {editingPasaran && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp sm:animate-scaleIn">
                    <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Ubah Template Jumat {editingPasaran}</h3>
                      <button onClick={() => setEditingPasaran(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSavePasaran} className="p-5 sm:p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Khatib Utama *</label>
                        <input type="text" required value={pasaranForm.khatib} onChange={(e) => setPasaranForm({...pasaranForm, khatib: e.target.value})} className="w-full text-sm border border-slate-200 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">No. Telp / WA Khatib *</label>
                        <input type="tel" required placeholder="Contoh: 081234567890" value={pasaranForm.telp} onChange={(e) => setPasaranForm({...pasaranForm, telp: e.target.value})} className="w-full text-sm border border-slate-200 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Imam Cadangan *</label>
                        <input type="text" required value={pasaranForm.imam} onChange={(e) => setPasaranForm({...pasaranForm, imam: e.target.value})} className="w-full text-sm border border-slate-200 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Muadzin</label>
                          <input type="text" value={pasaranForm.muadzin} onChange={(e) => setPasaranForm({...pasaranForm, muadzin: e.target.value})} className="w-full text-sm border border-slate-200 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Bilal</label>
                          <input type="text" value={pasaranForm.bilal} onChange={(e) => setPasaranForm({...pasaranForm, bilal: e.target.value})} className="w-full text-sm border border-slate-200 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setEditingPasaran(null)} className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50">Batal</button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm">Simpan Template</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL SIMULATOR WHATSAPP/SMS NOTIFIKASI H-1 */}
              {activeNotificationSim && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className={`w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleIn transition-all ${
                    notificationType === "WA" ? "bg-[#eae6df] h-[550px]" : "bg-slate-100 h-[580px] border border-slate-300"
                  }`}>
                    
                    {/* Header Sesuai Platform */}
                    {notificationType === "WA" ? (
                      <div className="bg-[#008069] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center font-bold text-sm text-white">WA</div>
                          <div>
                            <p className="font-bold text-sm">Masjid Gateway</p>
                            <p className="text-[10px] text-emerald-100">Online • Kepada: {activeNotificationSim.petugas.khatib}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveNotificationSim(null)} className="text-white hover:text-slate-200"><X size={20} /></button>
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                          <Smartphone className="text-blue-400 w-5 h-5" />
                          <div>
                            <p className="font-bold text-sm">SMS Messenger (Android)</p>
                            <p className="text-[10px] text-slate-300">Penerima: {activeNotificationSim.petugas.khatib} ({activeNotificationSim.petugas.telp})</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveNotificationSim(null)} className="text-white hover:text-slate-200"><X size={20} /></button>
                      </div>
                    )}

                    {/* Chat / Message Area */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end space-y-4" style={notificationType === "WA" ? { 
                      backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", 
                      backgroundSize: "contain" 
                    } : { backgroundColor: "#f3f4f6" }}>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="bg-slate-200/80 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-bold text-center self-center uppercase shadow-xs">
                          Hari Kamis (H-1) • Pengingat Sholat Jumat
                        </div>

                        {/* Tampilan Sesuai Platform */}
                        {notificationType === "WA" ? (
                          <div className="bg-[#d9fdd3] text-slate-800 p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end relative border border-[#c1ebd0]">
                            <p className="text-xs whitespace-pre-line leading-relaxed">{simulatedMessageText}</p>
                            <span className="text-[8px] text-slate-400 text-right block mt-2 font-mono">14:00 ✓✓</span>
                          </div>
                        ) : (
                          <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end relative">
                            <p className="text-xs whitespace-pre-line leading-relaxed">{simulatedMessageText}</p>
                            <span className="text-[8px] text-blue-200 text-right block mt-2 font-mono">Sent via Android Gateway</span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Input Footer */}
                    <div className="bg-[#f0f2f5] p-3 flex gap-2 items-center border-t border-slate-200">
                      <input 
                        type="text" 
                        value={simulatedMessageText}
                        onChange={(e) => setSimulatedMessageText(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
                      />
                      <button 
                        onClick={handleSendSimMessage}
                        disabled={isSendingMessage}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:bg-slate-400 shrink-0 shadow ${
                          notificationType === "WA" ? "bg-[#00a884] hover:bg-[#008f6f]" : "bg-blue-600 hover:bg-blue-700"
                        } text-white`}
                      >
                        {isSendingMessage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={15} className="ml-0.5" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: DATA JAMAAH */}
          {activeTab === "jamaah" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-955">Database Jemaah & Warga</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Kelola dan cetak seluruh laporan data jemaah, qurban, dan pembagian zakat di sini.</p>
                </div>
                {canEditJamaah && (
                  <button onClick={() => { setEditingJamaah(null); setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima" }); setShowJamaahModal(true); }} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow shadow-emerald-600/10 hover:scale-102">
                    <Plus size={16} /> Tambah Warga Baru
                  </button>
                )}
              </div>

              {/* PANEL PUSAT CETAK LAPORAN SEPARATED BY RT */}
              <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-slate-200/60 pb-3">
                  <Printer className="text-slate-600 w-5 h-5 shrink-0 hidden sm:block" />
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide mb-1.5">Wilayah Cetak Laporan PDF:</label>
                    <select 
                      value={selectedPrintWilayah} 
                      onChange={(e) => setSelectedPrintWilayah(e.target.value)} 
                      className="w-full sm:w-64 text-xs border border-slate-300 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Semua">Semua RT & RW (Seluruh Warga)</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
                  <button onClick={() => handlePrintSelectedReport("jamaah")} className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] sm:text-xs font-bold px-3 py-2.5 rounded-xl flex justify-center items-center gap-1.5 transition-all shadow-sm w-full sm:w-auto"><FileText size={14} className="shrink-0"/>Data Warga</button>
                  <button onClick={() => handlePrintSelectedReport("pekurban")} className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] sm:text-xs font-bold px-3 py-2.5 rounded-xl flex justify-center items-center gap-1.5 transition-all shadow-sm w-full sm:w-auto"><Heart size={14} className="shrink-0"/>Data Pekurban</button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {/* === FITUR PENYARINGAN RT & RW TERPADU DAN INTERAKTIF === */}
                <div className="p-3 sm:p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Tabel:</span>
                    <select 
                      value={filterWilayahJamaah} 
                      onChange={(e) => setFilterWilayahJamaah(e.target.value)}
                      className="w-full sm:w-auto text-xs border border-slate-200 bg-white px-3 py-2.5 sm:py-2 rounded-xl outline-none font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Tampilkan Semua</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] sm:text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl self-start sm:self-auto text-center sm:text-left w-full sm:w-auto">
                    Ditampilkan: {jamaahList.filter(item => {
                      if (filterWilayahJamaah === "Semua") return true;
                      const [rtF, rwF] = filterWilayahJamaah.split('_');
                      return item.rt === rtF && item.rw === rwF;
                    }).length} / {jamaahList.length} KK
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-3 sm:p-4">Nama Kepala Keluarga</th>
                        <th className="p-3 sm:p-4">Wilayah</th>
                        <th className="p-3 sm:p-4">Alamat Rumah</th>
                        <th className="p-3 sm:p-4 text-center">Jiwa</th>
                        <th className="p-3 sm:p-4">Ekonomi</th>
                        <th className="p-3 sm:p-4 text-emerald-700">Mustahik Fitrah</th>
                        <th className="p-3 sm:p-4 text-teal-700">Mustahik Zuru'</th>
                        <th className="p-3 sm:p-4 text-rose-700">Status Qurban</th>
                        {canEditJamaah && <th className="p-3 sm:p-4 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-[11px] sm:text-sm">
                      {/* === FILTERING BERDASARKAN RT/RW TERPADU === */}
                      {jamaahList
                        .filter(item => {
                          if (filterWilayahJamaah === "Semua") return true;
                          const [rtF, rwF] = filterWilayahJamaah.split('_');
                          return item.rt === rtF && item.rw === rwF;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-3 sm:p-4 text-slate-900 font-bold max-w-[120px] truncate">{item.nama}</td>
                            <td className="p-3 sm:p-4"><span className="bg-slate-100 text-slate-700 text-[10px] sm:text-xs px-2 py-1 rounded-lg border border-slate-200/50 font-mono font-bold whitespace-nowrap">RT {item.rt}/{item.rw}</span></td>
                            <td className="p-3 sm:p-4 text-[10px] sm:text-xs font-medium text-slate-500 max-w-[150px] truncate" title={item.alamat}>{item.alamat}</td>
                            <td className="p-3 sm:p-4 text-center text-slate-900">{item.anggota}</td>
                            <td className="p-3 sm:p-4">
                              <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${item.ekonomi === 'Mampu' ? 'bg-emerald-50 text-emerald-700' : item.ekonomi === 'Kurang Mampu' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                {item.ekonomi}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4"><span className={`text-[10px] sm:text-xs whitespace-nowrap ${item.fitrah === 'Muzakki' ? 'text-slate-400 font-normal' : 'text-emerald-700 font-bold'}`}>{item.fitrah}</span></td>
                            <td className="p-3 sm:p-4"><span className={`text-[10px] sm:text-xs whitespace-nowrap ${item.zuru === 'Bukan Mustahik' ? 'text-slate-400 font-normal' : 'text-teal-700 font-bold'}`}>{item.zuru}</span></td>
                            <td className="p-3 sm:p-4">
                              <span className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-lg border font-bold whitespace-nowrap ${item.qurban && item.qurban.startsWith('Sahibul Qurban') ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200/60'}`}>
                                {item.qurban || "Penerima"}
                              </span>
                            </td>
                            {canEditJamaah && (
                              <td className="p-3 sm:p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleEditJamaah(item)} className="p-1.5 sm:p-2 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 transition-all" title="Ubah Data"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteJamaah(item.id)} className="p-1.5 sm:p-2 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg text-rose-600 transition-all" title="Hapus Data"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Tambah/Edit Jamaah */}
              {showJamaahModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp sm:animate-scaleIn max-h-[90vh]">
                    <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{editingJamaah ? "Ubah Data Warga" : "Tambah Warga Baru"}</h3>
                      <button onClick={() => setShowJamaahModal(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
                    </div>
                    <div className="overflow-y-auto p-5 sm:p-6">
                      <form onSubmit={handleSaveJamaah} className="space-y-4 sm:space-y-5">
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-1.5">Nama Kepala Keluarga *</label>
                            <input type="text" placeholder="Masukkan nama" required value={jamaahForm.nama} onChange={(e) => setJamaahForm({...jamaahForm, nama: e.target.value})} className="w-full text-sm border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-1.5">Jumlah Jiwa *</label>
                              <input type="number" min="1" required value={jamaahForm.anggota} onChange={(e) => setJamaahForm({...jamaahForm, anggota: parseInt(e.target.value) || 1})} className="w-full text-sm border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-1.5">RT / RW *</label>
                              <select 
                                value={`${jamaahForm.rt}_${jamaahForm.rw}`} 
                                onChange={(e) => {
                                  const [rt, rw] = e.target.value.split('_');
                                  setJamaahForm({...jamaahForm, rt, rw});
                                }} 
                                className="w-full text-sm border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 bg-white"
                              >
                                {WILAYAH_OPTIONS.map((wil) => (
                                  <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                                    {wil.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-1.5">Alamat Rumah *</label>
                            <textarea placeholder="Detail alamat..." required rows="2" value={jamaahForm.alamat} onChange={(e) => setJamaahForm({...jamaahForm, alamat: e.target.value})} className="w-full text-sm border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-semibold resize-none text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                          </div>

                          <div className="border-t border-slate-200 pt-4 mt-2">
                            <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-2">Status Ekonomi</label>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              {["Mampu", "Kurang Mampu", "Sangat Kurang"].map((opsi) => (
                                <label key={opsi} className={`flex-1 border p-3 sm:p-2.5 rounded-xl text-center text-xs font-semibold cursor-pointer select-none flex items-center justify-center gap-2 transition-all ${jamaahForm.ekonomi === opsi ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                  <input type="radio" name="ekonomi" value={opsi} checked={jamaahForm.ekonomi === opsi} onChange={() => setJamaahForm({...jamaahForm, ekonomi: opsi})} className="w-4 h-4 accent-emerald-600" />
                                  {opsi}
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-emerald-700 mb-1.5">Status Zakat Fitrah</label>
                              <select 
                                value={jamaahForm.fitrah} 
                                onChange={(e) => setJamaahForm({...jamaahForm, fitrah: e.target.value})} 
                                className="w-full text-xs sm:text-sm border border-emerald-200 bg-emerald-50/50 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-emerald-900 focus:ring-2 focus:ring-emerald-500/20"
                              >
                                <option value="Muzakki">Muzakki (Pemberi Zakat)</option>
                                <option value="Berat">Mustahik Berat (Penerima)</option>
                                <option value="Sedang">Mustahik Sedang (Penerima)</option>
                                <option value="Ringan">Mustahik Ringan (Penerima)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] sm:text-xs font-bold text-teal-700 mb-1.5">Status Zakat Zuru'</label>
                              <select 
                                value={jamaahForm.zuru} 
                                onChange={(e) => setJamaahForm({...jamaahForm, zuru: e.target.value})} 
                                className="w-full text-xs sm:text-sm border border-teal-200 bg-teal-50/50 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-teal-900 focus:ring-2 focus:ring-teal-500/20"
                              >
                                <option value="Bukan Mustahik">Bukan Penerima Zuru'</option>
                                <option value="Berat">Mustahik Berat (Penerima)</option>
                                <option value="Sedang">Mustahik Sedang (Penerima)</option>
                                <option value="Ringan">Mustahik Ringan (Penerima)</option>
                              </select>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-4 mt-2">
                            <label className="block text-[11px] sm:text-xs font-bold text-rose-700 mb-1.5">Status Distribusi Daging Qurban</label>
                            <select 
                              value={jamaahForm.qurban || "Penerima"} 
                              onChange={(e) => setJamaahForm({...jamaahForm, qurban: e.target.value})} 
                              className="w-full text-xs sm:text-sm border border-rose-200 bg-rose-50/50 p-3 sm:p-2.5 rounded-xl outline-none font-bold text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                            >
                              <option value="Penerima">Penerima Daging Umum</option>
                              <option value="Sahibul Qurban - Sapi">Sahibul Qurban Sapi (Pekurban)</option>
                              <option value="Sahibul Qurban - Kambing">Sahibul Qurban Kambing (Pekurban)</option>
                            </select>
                            <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5 font-medium leading-relaxed">Sahibul Qurban (Pekurban) akan dipisahkan dan otomatis dikeluarkan dari kalkulator pembagian daging qurban dan cetak PDF tanda terima kupon.</p>
                          </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-5 pb-2 border-t border-slate-100 shrink-0">
                          <button type="button" onClick={() => setShowJamaahModal(false)} className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                          <button type="submit" className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all">Simpan Warga</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ZAKAT FITRAH */}
          {activeTab === "fitrah" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengelolaan Zakat Fitrah</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Kalkulasi timbangan beras & simulasi jatah mustahik.</p>
                </div>
                <button onClick={() => handlePrintSelectedReport("fitrah")} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Printer size={15} /> Cetak Laporan Fitrah PDF
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. Log Timbangan Masuk */}
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Gift size={16} className="text-emerald-600" /> 1. Log Timbangan Beras Masuk</h3>
                  
                  {canEditFitrah ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="number" step="0.1" 
                        placeholder="Berat Beras (Kg)" 
                        value={tempBeratFitrah} 
                        onChange={(e) => setTempBeratFitrah(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('fitrah')} 
                        className="flex-1 text-sm sm:text-xs border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                      <button onClick={() => addTimbangan('fitrah')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0">Tambah</button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-bold">Akses ditolak. Hanya Amil Zakat yang bisa mengubah data.</p>
                  )}

                  <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                    {timbanganFitrah.map((berat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold font-mono text-sm sm:text-xs">{berat} Kg</span>
                          {canEditFitrah && (
                            <button onClick={() => deleteTimbangan('fitrah', idx)} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center shadow-inner">
                    <span className="text-[11px] text-emerald-800 font-black uppercase tracking-wide">Total Terkumpul:</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">{totalTimbanganFitrahValue.toFixed(1)} <span className="text-sm">Kg</span></span>
                  </div>
                </div>

                {/* 2. Simulasi & Distribusi Otomatis */}
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-2.5 gap-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><UsersRound size={16} className="text-emerald-600 shrink-0" /> 2. Rencana Penyaluran (Zakat Fitrah)</h3>
                    <div className={`px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs w-full sm:w-auto ${statusFitrahValue >= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                      {statusFitrahValue >= 0 ? `Surplus Beras: +${statusFitrahValue.toFixed(1)} Kg` : `Defisit / Kurang: ${Math.abs(statusFitrahValue).toFixed(1)} Kg`}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Pengaturan Jatah per Jiwa (Kg)</p>
                      {canEditFitrah && (
                        <button onClick={handleSaveAlokasiFitrah} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"><Check size={14} />Simpan Parameter Jatah</button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                        <div key={asnaf} className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-slate-500 font-bold">{asnaf}</span>
                          <div className="flex items-center gap-1 w-full sm:w-auto">
                            <input 
                              type="number" step="0.5" min="0" 
                              disabled={!canEditFitrah}
                              value={tempAlokasiFitrah[asnaf] || 0} 
                              onChange={(e) => setTempAlokasiFitrah({...tempAlokasiFitrah, [asnaf]: parseFloat(e.target.value) || 0})}
                              className="w-full sm:w-16 text-center text-sm sm:text-xs font-black outline-none border border-slate-200 sm:border-0 sm:border-b sm:border-dashed sm:border-slate-300 focus:border-emerald-500 text-slate-800 p-1 sm:p-0 rounded-md sm:rounded-none" 
                            />
                            <span className="text-[10px] text-slate-400 font-bold hidden sm:block">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full border border-slate-200/60 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
                          <th className="p-3">Golongan Mustahik</th>
                          <th className="p-3 text-center">Jumlah Jiwa</th>
                          <th className="p-3 text-center">Jatah Masing-masing</th>
                          <th className="p-3 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {rincianKebutuhanFitrahData.map((item) => (
                          <tr key={item.kategori}>
                            <td className="p-3 text-slate-900 font-bold">Mustahik {item.kategori}</td>
                            <td className="p-3 text-center"><span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.jumlahJiwa} Orang</span></td>
                            <td className="p-3 text-center font-mono text-emerald-700 font-bold">{item.jatah} Kg</td>
                            <td className="p-3 text-right text-slate-900 font-black text-sm">{item.totalButuh.toFixed(1)} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50/50 text-slate-900 border-t-2 border-emerald-100">
                          <td className="p-3 font-black uppercase text-[10px] sm:text-xs text-emerald-900" colSpan="3">Total Estimasi Kebutuhan Penyaluran:</td>
                          <td className="p-3 text-right text-emerald-700 font-black text-base sm:text-lg">{totalButuhFitrahValue.toFixed(1)} Kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ZAKAT ZURU' */}
          {activeTab === "zuru" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Modul Pengelolaan Zakat Zuru' (Pertanian)</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Kalkulasi timbangan hasil panen & simulasi jatah penyaluran.</p>
                </div>
                <button onClick={() => handlePrintSelectedReport("zuru")} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-3 sm:py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Printer size={15} /> Cetak Laporan Zuru' PDF
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. Log Timbangan Zuru' Masuk */}
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Coins size={16} className="text-teal-600" /> 1. Log Timbangan Panen Masuk</h3>
                  
                  {canEditZuru ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="number" step="0.5" 
                        placeholder="Berat Panen (Kg)" 
                        value={tempBeratZuru} 
                        onChange={(e) => setTempBeratZuru(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('zuru')} 
                        className="flex-1 text-sm sm:text-xs border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20" 
                      />
                      <button onClick={() => addTimbangan('zuru')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0">Tambah</button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-bold">Peran Anda tidak diizinkan mengubah timbangan zakat zuru'.</p>
                  )}

                  <div className="space-y-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                    {timbanganZuru.map((berat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 sm:p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl font-semibold">
                        <span className="text-slate-500">Timbangan #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold font-mono text-sm sm:text-xs">{berat} Kg</span>
                          {canEditZuru && (
                            <button onClick={() => deleteTimbangan('zuru', idx)} className="text-rose-600 hover:bg-rose-50 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex justify-between items-center shadow-inner">
                    <span className="text-[11px] text-teal-800 font-black uppercase tracking-wide">Total Terkumpul:</span>
                    <span className="text-xl sm:text-2xl font-black text-teal-700 font-mono">{totalTimbanganZuruValue.toFixed(1)} <span className="text-sm">Kg</span></span>
                  </div>
                </div>

                {/* 2. Penyaluran Zuru' */}
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-2.5 gap-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><UsersRound size={16} className="text-teal-600 shrink-0" /> 2. Rencana Penyaluran (Hasil Pertanian)</h3>
                    <div className={`px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs w-full sm:w-auto ${statusZuruValue >= 0 ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                      {statusZuruValue >= 0 ? `Panen Surplus: +${statusZuruValue.toFixed(1)} Kg` : `Defisit / Kurang: ${Math.abs(statusZuruValue).toFixed(1)} Kg`}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Pengaturan Jatah per Jiwa (Kg)</p>
                      {canEditZuru && (
                        <button onClick={handleSaveAlokasiZuru} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"><Check size={14} />Simpan Parameter Jatah</button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                        <div key={asnaf} className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-slate-500 font-bold">{asnaf}</span>
                          <div className="flex items-center gap-1 w-full sm:w-auto">
                            <input 
                              type="number" step="0.5" min="0" 
                              disabled={!canEditZuru}
                              value={tempAlokasiZuru[asnaf] || 0} 
                              onChange={(e) => setTempAlokasiZuru({...tempAlokasiZuru, [asnaf]: parseFloat(e.target.value) || 0})}
                              className="w-full sm:w-16 text-center text-sm sm:text-xs font-black outline-none border border-slate-200 sm:border-0 sm:border-b sm:border-dashed sm:border-slate-300 focus:border-teal-500 text-slate-800 p-1 sm:p-0 rounded-md sm:rounded-none" 
                            />
                            <span className="text-[10px] text-slate-400 font-bold hidden sm:block">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full border border-slate-200/60 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-[11px]">
                          <th className="p-3">Kriteria Penerima Zuru'</th>
                          <th className="p-3 text-center">Jumlah Jiwa</th>
                          <th className="p-3 text-center">Jatah Masing-masing</th>
                          <th className="p-3 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {rincianKebutuhanZuruData.map((item) => (
                          <tr key={item.kategori}>
                            <td className="p-3 text-slate-900 font-bold">Mustahik {item.kategori}</td>
                            <td className="p-3 text-center"><span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.jumlahJiwa} Orang</span></td>
                            <td className="p-3 text-center font-mono text-teal-700 font-bold">{item.jatah} Kg</td>
                            <td className="p-3 text-right text-slate-900 font-black text-sm">{item.totalButuh.toFixed(1)} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-teal-50/50 text-slate-900 border-t-2 border-teal-100">
                          <td className="p-3 font-black uppercase text-[10px] sm:text-xs text-teal-900" colSpan="3">Total Estimasi Kebutuhan Penyaluran Zuru:</td>
                          <td className="p-3 text-right text-teal-800 font-black text-base sm:text-lg">{totalButuruValue.toFixed(1)} Kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DISTRIBUSI QURBAN */}
          {activeTab === "qurban" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pengelolaan & Distribusi Daging Qurban</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">Log timbangan dan kalkulator jatah pembagian daging Sapi & Kambing per KK.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                  <select 
                      value={selectedPrintWilayah} 
                      onChange={(e) => setSelectedPrintWilayah(e.target.value)} 
                      className="w-full sm:w-auto text-xs border border-slate-300 bg-white p-3 sm:p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Semua">Semua Wilayah Warga (RT/RW)</option>
                    {WILAYAH_OPTIONS.map((wil) => ( <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>{wil.label}</option> ))}
                  </select>
                  <button onClick={handlePrintQurbanRT} className="w-full sm:w-auto bg-slate-800 hover:bg-slate-955 text-white text-xs font-bold px-5 py-3 sm:py-2.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm shrink-0">
                    <Printer size={15} /> Cetak Lembar Distribusi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Sapi */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-rose-600 rounded-full shrink-0"></div> 1. Log Daging Sapi Masuk
                    </h3>
                    <span className="text-[9px] sm:text-[10px] bg-rose-50 text-rose-700 px-2 py-1 rounded-full font-bold whitespace-nowrap">Kategori Sapi</span>
                  </div>
                  {canEditQurban ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="number" step="0.1" placeholder="Berat Daging Sapi (kg)" value={tempBeratQurbanSapi} onChange={(e) => setTempBeratQurbanSapi(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurbanSapi')} className="flex-1 text-sm sm:text-xs border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500/20" />
                      <button onClick={() => addTimbangan('qurbanSapi')} className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs transition-all shrink-0">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-[#f43f5e] bg-[#fff5f5] border border-[#ffe4e6] p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Sapi.</p>}

                  <div className="space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1 font-semibold text-slate-700">
                    {timbanganQurbanSapi.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 sm:p-3 rounded-xl text-xs font-semibold">
                        <span className="text-slate-400">Timbangan Sapi #{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-900 font-extrabold font-mono text-sm sm:text-xs">{berat} Kg</span>
                          {canEditQurban && ( <button onClick={() => deleteTimbangan('qurbanSapi', index)} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button> )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex justify-between items-center shadow-inner">
                    <span className="text-[11px] text-rose-800 font-extrabold uppercase tracking-wide">Total Bersih Daging Sapi</span>
                    <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono">{totalTimbanganQurbanSapiValue.toFixed(1)} <span className="text-sm">Kg</span></span>
                  </div>
                </div>

                {/* Kambing */}
                <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-amber-600 rounded-full shrink-0"></div> 2. Log Daging Kambing Masuk
                    </h3>
                    <span className="text-[9px] sm:text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-bold whitespace-nowrap">Kategori Kambing</span>
                  </div>
                  {canEditQurban ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="number" step="0.1" placeholder="Berat Daging Kambing (kg)" value={tempBeratQurbanKambing} onChange={(e) => setTempBeratQurbanKambing(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurbanKambing')} className="flex-1 text-sm sm:text-xs border border-slate-300 p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20" />
                      <button onClick={() => addTimbangan('qurbanKambing')} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs transition-all shrink-0">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-[#f43f5e] bg-[#fff5f5] border border-[#ffe4e6] p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Kambing.</p>}

                  <div className="space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1 font-semibold text-slate-700">
                    {timbanganQurbanKambing.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 sm:p-3 rounded-xl text-xs font-semibold">
                        <span className="text-slate-955 font-extrabold">{berat} Kg</span>
                        {canEditQurban && ( <button onClick={() => deleteTimbangan('qurbanKambing', index)} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button> )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex justify-between items-center shadow-inner">
                    <span className="text-[11px] text-amber-800 font-extrabold uppercase tracking-wide">Total Daging Kambing</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono">{totalTimbanganQurbanKambingValue.toFixed(1)} <span className="text-sm">Kg</span></span>
                  </div>
                </div>
              </div>

              {/* Alokasi */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg text-white">
                <h3 className="font-black text-slate-100 text-base border-b border-slate-800 pb-3 flex items-center gap-2"><Settings size={18} className="text-emerald-400"/> Filter & Simulasi Kalkulator Jatah per KK</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Saring Berdasarkan Wilayah RT / RW</label>
                    <select 
                      value={filterWilayahQurban} 
                      onChange={(e) => setFilterWilayahQurban(e.target.value)} 
                      className="w-full text-xs border border-slate-600 bg-slate-900 text-white p-3 rounded-xl outline-none font-bold focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="Semua">Semua RT / RW (Seluruh Jamaah Umum)</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Prioritas Distribusi</label>
                    <div className="flex items-center gap-3 mt-3 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                      <input type="checkbox" id="mustahikSaja" checked={qurbanHanyaMustahik} onChange={(e) => setQurbanHanyaMustahik(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" />
                      <label htmlFor="mustahikSaja" className="text-xs font-bold text-slate-300 cursor-pointer">Hanya tampilkan Golongan Mustahik</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-center sm:text-left">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Estimasi Jumlah Penerima <br/><span className="text-[8px] font-normal text-slate-500">(Shohibul Qurban dikeluarkan)</span></p>
                    <p className="text-3xl font-black text-white mt-1">{totalPenerimaKK} <span className="text-sm font-semibold text-slate-500">KK</span></p>
                  </div>
                  <div className="bg-rose-900/40 border border-rose-800/60 p-4 rounded-2xl text-center sm:text-left">
                    <p className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wide">Porsi Jatah Daging Sapi / KK</p>
                    <p className="text-3xl font-black text-rose-400 mt-1 font-mono">{jatahDagingSapiPerKK} <span className="text-sm font-semibold text-rose-500/50">Kg</span></p>
                  </div>
                  <div className="bg-amber-900/40 border border-amber-800/60 p-4 rounded-2xl text-center sm:text-left">
                    <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wide">Porsi Jatah Daging Kambing / KK</p>
                    <p className="text-3xl font-black text-amber-400 mt-1 font-mono">{jatahDagingKambingPerKK} <span className="text-sm font-semibold text-amber-500/50">Kg</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === TAB 7: HAK AKSES, AKUN & IDENTITAS (RBAC) === */}
          {activeTab === "rbac" && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              
              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Settings className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6 animate-spin-slow" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Pengaturan Identitas & Logo Masjid</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500">Tentukan nama lembaga dan tempel tautan (*link*) gambar logo Anda di sini.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/60">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">1. Nama Masjid (Judul Utama)</label>
                      <input type="text" value={tempMasjidName} onChange={(e) => setTempMasjidName(e.target.value)} placeholder="Contoh: Masjid Al-Ikhlas" className="w-full text-sm border border-slate-300 bg-white p-3.5 sm:p-3 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">2. Tautan Gambar Logo (URL Online)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="url" value={tempMasjidLogoUrl} onChange={(e) => setTempMasjidLogoUrl(e.target.value)} placeholder="https://contoh.com/gambar-logo.png" className="w-full sm:flex-1 text-xs border border-slate-300 bg-white p-3.5 sm:p-3 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                        {tempMasjidLogoUrl.trim() !== "" && (
                          <button type="button" onClick={() => { setTempMasjidLogoUrl(""); addNotification("Tautan logo dibersihkan."); }} className="w-full sm:w-auto bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-3 sm:py-2 rounded-xl border border-rose-200 text-xs font-bold transition-all">Hapus Logo</button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">Agar data awan Anda tidak kelebihan beban, <strong>unggah berkas gambar lokal dinonaktifkan</strong>. Silakan cari gambar di Google, klik kanan "Copy Image Address", lalu tempel (*paste*) URL tersebut ke kotak di atas.</p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-100">
                    <button type="button" onClick={handleCancelNewIdentity} className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Batalkan Perubahan</button>
                    <button type="button" onClick={handleSaveNewIdentity} className="w-full sm:w-auto px-5 py-3.5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"><Check size={14}/>Simpan Identitas</button>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-inner">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0 border-2 border-emerald-100">
                      {tempMasjidLogoUrl.trim() !== "" ? <img src={tempMasjidLogoUrl} alt="Pratinjau" className="w-full h-full object-contain bg-white" /> : <KubahMasjidIcon className="w-8 h-8 animate-pulse" />}
                    </div>
                    <div className="text-xs text-emerald-900">
                      <p className="font-extrabold uppercase tracking-widest text-[10px] text-emerald-600 mb-0.5">Pratinjau Identitas Terbaru</p>
                      <p className="font-black text-base sm:text-lg tracking-tight leading-none">{tempMasjidName || "Nama Kosong"}</p>
                      <p className="text-emerald-700 mt-1 font-medium">{tempMasjidLogoUrl.trim() !== "" ? "Menggunakan Logo Kustom dari Tautan (URL)" : "Menggunakan Ikon Kubah Masjid Default"}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <UserPlus className="text-emerald-600 w-5 h-5 shrink-0" />
                    <nav className="font-extrabold text-slate-900 text-sm">Pendaftaran Akun Pengurus Custom</nav>
                  </div>
                  <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Nama Tampilan</label>
                      <input type="text" required placeholder="Cth: Bpk. Jufri" value={newAccLabel} onChange={(e) => setNewAccLabel(e.target.value)} className="w-full text-xs sm:text-sm border border-slate-300 bg-white p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Username Baru</label>
                      <input type="text" required placeholder="username (huruf kecil)" value={newAccUsername} onChange={(e) => setNewAccUsername(e.target.value)} className="w-full text-xs sm:text-sm border border-slate-300 bg-white p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Password Baru</label>
                      <input type="text" required placeholder="Minimal 6 karakter" value={newAccPassword} onChange={(e) => setNewAccPassword(e.target.value)} className="w-full text-xs sm:text-sm border border-slate-300 bg-white p-3 sm:p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Tingkatan Peran (Role)</label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                        <select value={newAccRole} onChange={(e) => setNewAccRole(e.target.value)} className="w-full sm:flex-1 text-xs sm:text-sm border border-slate-300 bg-white p-3 sm:p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                          <option value="Admin">Super Admin</option>
                          <option value="Takmir">Takmir Masjid</option>
                          <option value="Amil">Amil Zakat</option>
                          <option value="Petugas">Petugas Jumat</option>
                          <option value="Jamaah">Jama'ah / Warga</option>
                        </select>
                        <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 sm:py-2.5 rounded-xl text-xs flex items-center justify-center transition-all">Tambah</button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Basis Data Kredensial Pengguna Terdaftar</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(userDatabase).map((usernameKey) => {
                        const userObj = userDatabase[usernameKey];
                        const isDefault = ["admin", "takmir", "amil", "jamaah", "petugas1"].includes(usernameKey);
                        return (
                          <div key={usernameKey} className="bg-slate-50 border border-slate-200/80 p-3.5 sm:p-3 rounded-xl flex justify-between items-center shadow-sm">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs font-black text-slate-900 truncate">{userObj.label}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">User: <span className="font-extrabold text-slate-700">{usernameKey}</span> • Pass: {userObj.password}</p>
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-2 truncate max-w-full ${userObj.role === 'Admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : userObj.role === 'Takmir' ? 'bg-teal-50 text-teal-700 border border-teal-100' : userObj.role === 'Amil' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{rolesConfig[userObj.role]?.label || userObj.role}</span>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button onClick={() => { setEditingAccountPassword(usernameKey); setNewPasswordValue(userObj.password); }} className="text-emerald-600 hover:bg-emerald-50 p-2 sm:p-1.5 border border-transparent hover:border-emerald-200 rounded-lg transition-all" title="Ubah Password Akun"><Edit2 size={14} /></button>
                              {!isDefault && <button onClick={() => handleDeleteAccount(usernameKey)} className="text-rose-500 hover:bg-rose-50 p-2 sm:p-1.5 border border-transparent hover:border-rose-200 rounded-lg transition-all" title="Hapus Akun"><Trash2 size={14} /></button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {editingAccountPassword && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp sm:animate-scaleIn">
                    <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider truncate mr-2">Ubah Sandi: @{editingAccountPassword}</h3>
                      <button onClick={() => setEditingAccountPassword(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"><X size={16} /></button>
                    </div>
                    <form onSubmit={handleSaveNewPassword} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[11px] sm:text-xs font-bold text-slate-600 mb-1.5">Password Baru *</label>
                        <input type="text" required placeholder="Masukkan password baru akun" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} className="w-full text-sm sm:text-xs border border-slate-300 bg-slate-50/50 p-3 sm:p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20" />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setEditingAccountPassword(null)} className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-slate-300 text-slate-600 text-[11px] font-bold rounded-xl hover:bg-slate-50">Batal</button>
                        <button type="submit" className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm">Simpan Password</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Matriks Otoritas Otorisasi Modul</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Batas akses hierarki ini tetap mengikat dan melindungi keamanan data sistem.</p>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-3 sm:p-4">Modul / Menu Website</th>
                        {Object.keys(rolesConfig).map((r) => ( <th key={r} className="p-3 sm:p-4 text-center">{rolesConfig[r].label}</th> ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {[
                        { id: "dashboard", label: "Dashboard Utama" },
                        { id: "petugas", label: "Penjadwalan Sholat Jumat" },
                        { id: "jamaah", label: "Data Jama'ah & RT" },
                        { id: "fitrah", label: "Pengelolaan Zakat Fitrah" },
                        { id: "zuru", label: "Pengelolaan Zakat Zuru'" },
                        { id: "qurban", label: "Pengelolaan Daging Qurban" },
                        { id: "rbac", label: "Hak Akses & Akun (RBAC)" }
                      ].map((menu) => (
                        <tr key={menu.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-3 sm:p-4 text-slate-900 font-bold text-xs sm:text-sm">{menu.label}</td>
                          {Object.keys(rolesConfig).map((role) => {
                            const isAllowed = rolesConfig[role].access.includes(menu.id);
                            const isSelfAdminRbac = role === "Admin" && menu.id === "rbac";
                            return (
                              <td key={role} className="p-3 sm:p-4 text-center">
                                <button type="button" disabled={isSelfAdminRbac || currentRole !== "Admin"} onClick={() => {
                                  setRolesConfig(prev => {
                                    const updatedAccess = isAllowed ? prev[role].access.filter(id => id !== menu.id) : [...prev[role].access, menu.id];
                                    return { ...prev, [role]: { ...prev[role], access: updatedAccess } };
                                  });
                                  addNotification(`Akses menu "${menu.label}" untuk peran ${rolesConfig[role].label} telah diubah!`);
                                }} className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all shadow-sm ${isAllowed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'} ${currentRole === "Admin" && !isSelfAdminRbac ? "hover:scale-105 hover:shadow-md" : "cursor-not-allowed opacity-70"}`}>
                                  {isAllowed ? <Check size={16} /> : <X size={16} />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* === FOOTER === */}
      <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4 text-center text-[10px] sm:text-xs text-slate-400 font-semibold mt-auto">
        &copy; {new Date().getFullYear()} {masjidName}. Dikembangkan oleh Misbahul Munir.
      </footer>

    </div>
  );
}
