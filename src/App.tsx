import React, { useState, useEffect } from 'react';
import { 
  Compass, Users, BookOpen, Gift, Heart, UserCheck, 
  Settings, Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  Clock, MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, Lock, KeyRound, User, Eye, EyeOff, UserPlus, Image, FileText,
  Phone, Send, MessageSquare, BellRing, Upload, Download, Smartphone, Menu
} from 'lucide-react';

// ====================================================================
// CONFIG CONFIGURATION GOOGLE SHEETS API (GRATIS)
// ====================================================================
// Silakan tempel URL Web App Google Apps Script Anda di sini setelah melakukan setup
const GOOGLE_SHEETS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlT-MtuAXW_wl-KnFnqUkhX4fPf6YIyXNMPTE4Syi66_uDhxGiKVVK9_imo25DpRCm/exec"; 

// === SEED DATA LOKASI AWAL (DITAMBAH DESA AGAR LEBIH SPESIFIK) ===
const INITIAL_LOKASI = {
  provinsi: "Jawa Timur",
  kabupaten: "Lamongan",
  kecamatan: "Tikung",
  desa: "Bakalan"
};

// Daftar Kombinasi RT & RW Terpadu yang Unik & Valid di Desa Bakalan
const WILAYAH_OPTIONS = [
  { rt: "01", rw: "01", label: "RT 01 / RW 01" },
  { rt: "02", rw: "01", label: "RT 02 / RW 01" },
  { rt: "03", rw: "01", label: "RT 03 / RW 01" },
  { rt: "01", rw: "02", label: "RT 01 / RW 02" },
  { rt: "02", rw: "02", label: "RT 02 / RW 02" },
  { rt: "03", rw: "02", label: "RT 03 / RW 02" }
];

// Batas Akses default per Peran (Role) yang tetap terkunci keamanannya
const INITIAL_ROLES = {
  Admin: { label: "Super Admin", access: ["dashboard", "petugas", "jamaah", "fitrah", "zuru", "qurban", "rbac"] },
  Takmir: { label: "Takmir Masjid", access: ["dashboard", "petugas", "jamaah", "qurban"] },
  Amil: { label: "Amil Zakat", access: ["dashboard", "jamaah", "fitrah", "zuru", "qurban"] },
  Jamaah: { label: "Jama'ah / Warga", access: ["dashboard", "petugas", "fitrah", "zuru", "qurban"] }
};

const INITIAL_USER_DATABASE = {
  "admin": { password: "admin123", role: "Admin", label: "Super Admin" },
  "takmir": { password: "takmir123", role: "Takmir", label: "Takmir Masjid" },
  "amil": { password: "amil123", role: "Amil", label: "Amil Zakat" },
  "jamaah": { password: "jamaah123", role: "Jamaah", label: "Jama'ah / Warga" }
};

// Data Jamaah disesuaikan dengan batasan wilayah kombinasi RT & RW serta Kriteria Mustahik
const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat", qurban: "Penerima" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "Sedang", zuru: "Sedang", qurban: "Penerima" },
  { id: "4", nama: "H. Abdul Rozak", anggota: 2, rt: "02", rw: "02", alamat: "Jl. Diponegoro No. 88", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Sahibul Qurban" },
  { id: "5", nama: "Ustadz Hasan", anggota: 4, rt: "03", rw: "02", alamat: "Kamar Marbot Masjid", ekonomi: "Kurang Mampu", fitrah: "Ringan", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "6", nama: "Mbah Sutini", anggota: 1, rt: "03", rw: "01", alamat: "Gubuk RT 3", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Bukan Mustahik", qurban: "Penerima" },
  { id: "7", nama: "Andi Wijaya", anggota: 3, rt: "01", rw: "02", alamat: "Jl. Baru No. 17", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Ringan", qurban: "Penerima" }
];

// === TEMPLATE PETUGAS JUMAT ABADI ===
const INITIAL_PETUGAS_ABADI = {
  Legi: { khatib: "KH. Syukron Ma'mun", imam: "Ustadz Ahmad Al-Hafiz", muadzin: "Bilal Hanafi", bilal: "Soleh", telp: "081234567890" },
  Pahing: { khatib: "Prof. Dr. KH. Said Aqil", imam: "Ustadz Hasanuddin", muadzin: "Zainal Abidin", bilal: "Rudi Yulianto", telp: "081398765432" },
  Pon: { khatib: "Ustadz Adi Hidayat, Lc", imam: "Ustadz Sholihuddin", muadzin: "H. Abdul Qodir", bilal: "Slamet", telp: "085711223344" },
  Wage: { khatib: "KH. Anwar Zahid", imam: "Ustadz Abdurrahman", muadzin: "Supardi", bilal: "Mulyono", telp: "089988776655" },
  Kliwon: { khatib: "KH. Bahauddin Nursalim (Gus Baha)", imam: "Ustadz Hasan Al-Banna", muadzin: "M. Thoriq", bilal: "Sidiq Prasetyo", telp: "082144332211" }
};

const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

// === HELPER FUNCTIONS (OUTSIDE OF COMPONENT) ===

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
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Gagal membaca LocalStorage key: " + key, error);
  }
  return fallbackValue;
};

const getJadwalSholat = (kab) => {
  const hash = kab.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = hash % 15;
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
  if (daysToFriday === 0 && tempDate.getHours() >= 13) {
    daysToFriday = 7;
  }
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
  return jamaahList
    .filter(item => item.fitrah === kategori)
    .reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
};

const getJumlahJiwaPerKategoriZuru = (jamaahList, kategori) => {
  return jamaahList
    .filter(item => item.zuru === kategori)
    .reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
};

export default function App() {
  // =========================================================
  // 1. STATE MANAGEMENT DENGAN STRATEGI PENYIMPANAN DOUBLE-BACKUP
  // =========================================================
  const [masjidName, setMasjidName] = useState(() => {
    return localStorage.getItem("masjidName") || "Masjid Al-Ikhlas Bakalan";
  });
  const [masjidLogoUrl, setMasjidLogoUrl] = useState(() => {
    return localStorage.getItem("masjidLogoUrl") || "";
  });

  const [tempMasjidName, setTempMasjidName] = useState(masjidName);
  const [tempMasjidLogoUrl, setTempMasjidLogoUrl] = useState(masjidLogoUrl);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("Admin");
  const [currentUserLabel, setCurrentUserLabel] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  
  const [rolesConfig, setRolesConfig] = useState(() => {
    const saved = localStorage.getItem("rolesConfig");
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });
  
  const [userDatabase, setUserDatabase] = useState(() => {
    const saved = localStorage.getItem("userDatabase");
    return saved ? JSON.parse(saved) : INITIAL_USER_DATABASE;
  });

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

  const [lokasi, setLokasi] = useState(() => {
    const saved = localStorage.getItem("lokasi");
    return saved ? JSON.parse(saved) : INITIAL_LOKASI;
  });
  const [isSettingLokasi, setIsSettingLokasi] = useState(false);
  const [tempLokasi, setTempLokasi] = useState(lokasi);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [petugasAbadi, setPetugasAbadi] = useState(() => {
    const saved = localStorage.getItem("petugasAbadi");
    return saved ? JSON.parse(saved) : INITIAL_PETUGAS_ABADI;
  });
  const [editingPasaran, setEditingPasaran] = useState(null);
  const [pasaranForm, setPasaranForm] = useState({ khatib: "", imam: "", muadzin: "", bilal: "", telp: "" });

  const [activeNotificationSim, setActiveNotificationSim] = useState(null);
  const [notificationType, setNotificationType] = useState("WA"); 
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showAndroidCode, setShowAndroidCode] = useState(false);

  const [jamaahList, setJamaahList] = useState(() => {
    const saved = localStorage.getItem("jamaahList");
    return saved ? JSON.parse(saved) : INITIAL_JAMAAH;
  });
  const [filterWilayahJamaah, setFilterWilayahJamaah] = useState("Semua");

  const [timbanganFitrah, setTimbanganFitrah] = useState(() => {
    const saved = localStorage.getItem("timbanganFitrah");
    return saved ? JSON.parse(saved) : [25, 50, 15, 30];
  });
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  
  const [alokasiFitrah, setAlokasiFitrah] = useState(() => {
    const saved = localStorage.getItem("alokasiFitrah");
    return saved ? JSON.parse(saved) : { "Berat": 5.0, "Sedang": 3.0, "Ringan": 1.5, "Muzakki": 0.0 };
  });
  const [tempAlokasiFitrah, setTempAlokasiFitrah] = useState(alokasiFitrah);

  const [timbanganZuru, setTimbanganZuru] = useState(() => {
    const saved = localStorage.getItem("timbanganZuru");
    return saved ? JSON.parse(saved) : [120, 250, 80];
  });
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  
  const [alokasiZuru, setAlokasiZuru] = useState(() => {
    const saved = localStorage.getItem("alokasiZuru");
    return saved ? JSON.parse(saved) : { "Berat": 15.0, "Sedang": 10.0, "Ringan": 5.0, "Bukan Mustahik": 0.0 };
  });
  const [tempAlokasiZuru, setTempAlokasiZuru] = useState(alokasiZuru);

  const [timbanganQurbanSapi, setTimbanganQurbanSapi] = useState(() => {
    const saved = localStorage.getItem("timbanganQurbanSapi");
    return saved ? JSON.parse(saved) : [85.5, 120.0, 95.0, 65.5];
  });
  const [timbanganQurbanKambing, setTimbanganQurbanKambing] = useState(() => {
    const saved = localStorage.getItem("timbanganQurbanKambing");
    return saved ? JSON.parse(saved) : [22.0, 18.5, 25.0];
  });
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

  // State untuk status sinkronisasi Google Sheets
  const [syncStatus, setSyncStatus] = useState("Belum Sinkron");
  const [isSyncing, setIsSyncing] = useState(false);

  // =========================================================
  // EFFECTS FOR STORAGE & TIMER
  // =========================================================
  useEffect(() => {
    localStorage.setItem("masjidName", masjidName);
  }, [masjidName]);

  useEffect(() => {
    localStorage.setItem("masjidLogoUrl", masjidLogoUrl);
  }, [masjidLogoUrl]);

  useEffect(() => {
    localStorage.setItem("userDatabase", JSON.stringify(userDatabase));
  }, [userDatabase]);

  useEffect(() => {
    localStorage.setItem("rolesConfig", JSON.stringify(rolesConfig));
  }, [rolesConfig]);

  useEffect(() => {
    localStorage.setItem("lokasi", JSON.stringify(lokasi));
  }, [lokasi]);

  useEffect(() => {
    localStorage.setItem("petugasAbadi", JSON.stringify(petugasAbadi));
  }, [petugasAbadi]);

  useEffect(() => {
    localStorage.setItem("jamaahList", JSON.stringify(jamaahList));
  }, [jamaahList]);

  useEffect(() => {
    localStorage.setItem("timbanganFitrah", JSON.stringify(timbanganFitrah));
  }, [timbanganFitrah]);

  useEffect(() => {
    localStorage.setItem("alokasiFitrah", JSON.stringify(alokasiFitrah));
  }, [alokasiFitrah]);

  useEffect(() => {
    localStorage.setItem("timbanganZuru", JSON.stringify(timbanganZuru));
  }, [timbanganZuru]);

  useEffect(() => {
    localStorage.setItem("alokasiZuru", JSON.stringify(alokasiZuru));
  }, [alokasiZuru]);

  useEffect(() => {
    localStorage.setItem("timbanganQurbanSapi", JSON.stringify(timbanganQurbanSapi));
  }, [timbanganQurbanSapi]);

  useEffect(() => {
    localStorage.setItem("timbanganQurbanKambing", JSON.stringify(timbanganQurbanKambing));
  }, [timbanganQurbanKambing]);

  useEffect(() => {
    setTempMasjidName(masjidName);
  }, [masjidName]);

  useEffect(() => {
    setTempMasjidLogoUrl(masjidLogoUrl);
  }, [masjidLogoUrl]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const jadwalSholat = getJadwalSholat(lokasi.kabupaten);
  
  const getNextSholat = () => {
    const nowStr = currentTime.toTimeString().split(' ')[0];
    const sholatTimes = Object.entries(jadwalSholat).filter(([k]) => k !== 'Terbit');
    
    for (let [name, time] of sholatTimes) {
      if (time > nowStr) {
        return { name, time };
      }
    }
    return { name: "Subuh (Besok)", time: sholatTimes[0][1] };
  };

  const nextSholat = getNextSholat();
  const upcomingFridays = getUpcomingFridays(currentTime, petugasAbadi, 5);

  const totalTimbanganFitrah = timbanganFitrah.reduce((a, b) => a + b, 0);
  const rincianKebutuhanFitrah = Object.entries(alokasiFitrah).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriFitrah(jamaahList, kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhFitrah = rincianKebutuhanFitrah.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusFitrah = totalTimbanganFitrah - totalButuhFitrah;

  const totalTimbanganZuru = timbanganZuru.reduce((a, b) => a + b, 0);
  const rincianKebutuhanZuru = Object.entries(alokasiZuru).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriZuru(jamaahList, kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuru = rincianKebutuhanZuru.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusZuru = totalTimbanganZuru - totalButuru;

  const totalTimbanganQurbanSapi = timbanganQurbanSapi.reduce((a, b) => a + b, 0);
  const totalTimbanganQurbanKambing = timbanganQurbanKambing.reduce((a, b) => a + b, 0);

  const getWargaPenerimaQurban = () => {
    return jamaahList.filter(warga => {
      // === PENYARINGAN UTAMA: SAHIBUL QURBAN TIDAK MASUK DAFTAR PENERIMA ===
      if (warga.qurban === "Sahibul Qurban") {
        return false;
      }
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
  
  const jatahDagingSapiPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanSapi / totalPenerimaKK).toFixed(2) : 0;
  const jatahDagingKambingPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurbanKambing / totalPenerimaKK).toFixed(2) : 0;

  // =========================================================
  // 3. ACTION HANDLERS
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
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      addNotification("Ukuran berkas gambar terlalu besar! Maksimal adalah 1.5 MB.", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      addNotification("Harap pilih berkas gambar valid (PNG, JPG, atau JPEG)!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempMasjidLogoUrl(reader.result);
      addNotification("Berkas logo sukses diunggah ke memori sementara. Tekan 'Simpan Perubahan'!", "info");
    };
    reader.readAsDataURL(file);
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

  // ====================================================================
  // GOOGLE SHEETS SYNC CONTROLLER (INTEGRASI GRATIS)
  // ====================================================================
  
  // Fungsi penarik data penuh dari Google Sheets saat aplikasi dibuka
  const handleFetchFromGoogleSheets = async () => {
    if (!GOOGLE_SHEETS_SCRIPT_URL) {
      addNotification("Gagal Sinkronisasi: Script URL Google Sheets belum diisi pada app.jsx!", "error");
      return;
    }
    setIsSyncing(true);
    setSyncStatus("Mengunduh...");
    try {
      const response = await fetch(`${GOOGLE_SHEETS_SCRIPT_URL}?action=getData`);
      const resData = await response.json();
      if (resData && resData.status === "success") {
        const payload = resData.data;
        if (payload.masjidName) setMasjidName(payload.masjidName);
        if (payload.masjidLogoUrl) setMasjidLogoUrl(payload.masjidLogoUrl);
        if (payload.lokasi) setLokasi(payload.lokasi);
        if (payload.petugasAbadi) setPetugasAbadi(payload.petugasAbadi);
        if (payload.jamaahList) setJamaahList(payload.jamaahList);
        if (payload.timbanganFitrah) setTimbanganFitrah(payload.timbanganFitrah);
        if (payload.alokasiFitrah) setAlokasiFitrah(payload.alokasiFitrah);
        if (payload.timbanganZuru) setTimbanganZuru(payload.timbanganZuru);
        if (payload.alokasiZuru) setAlokasiZuru(payload.alokasiZuru);
        if (payload.timbanganQurbanSapi) setTimbanganQurbanSapi(payload.timbanganQurbanSapi);
        if (payload.timbanganQurbanKambing) setTimbanganQurbanKambing(payload.timbanganQurbanKambing);
        if (payload.userDatabase) setUserDatabase(payload.userDatabase);
        
        setSyncStatus("Tersinkronisasi");
        addNotification("Semua data berhasil disinkronisasi dari Google Sheets!", "success");
      } else {
        throw new Error("Respon Google Apps Script gagal");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("Gagal Sinkron");
      addNotification("Koneksi gagal! Pastikan Apps Script Web App sudah di-deploy dengan benar.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fungsi pengirim data terpadu ke Google Sheets secara berkala atau ketika diklik manual
  const handlePushToGoogleSheets = async () => {
    if (!GOOGLE_SHEETS_SCRIPT_URL) {
      addNotification("Silakan atur URL Google Apps Script Anda di bagian atas app.jsx terlebih dahulu!", "error");
      return;
    }
    setIsSyncing(true);
    setSyncStatus("Mengunggah...");
    
    const payload = {
      masjidName,
      masjidLogoUrl,
      lokasi,
      petugasAbadi,
      jamaahList,
      timbanganFitrah,
      alokasiFitrah,
      timbanganZuru,
      alokasiZuru,
      timbanganQurbanSapi,
      timbanganQurbanKambing,
      userDatabase
    };

    try {
      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // penting untuk bypass CORS Google Apps Script Redirect
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      setSyncStatus("Tersinkronisasi");
      addNotification("Perubahan berhasil dikirim & disimpan di Google Sheets Anda!", "success");
    } catch (err) {
      console.error(err);
      setSyncStatus("Gagal Sinkron");
      addNotification("Gagal mengunggah perubahan. Cek konfigurasi Google Sheets.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Lakukan auto-fetch saat pengurus berhasil login
  useEffect(() => {
    if (isLoggedIn && GOOGLE_SHEETS_SCRIPT_URL) {
      handleFetchFromGoogleSheets();
    }
  }, [isLoggedIn]);

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
    let textTheme = "text-emerald-800";
    let tableHeaderHTML = "";
    let tableRowsHTML = "";

    if (reportType === "jamaah") {
      docTitle = `Laporan Database Jamaah & Anggota Keluarga`;
      textTheme = "text-slate-800";
      tableHeaderHTML = `
        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
          <th class="p-2.5 border border-slate-300 w-1/12 text-center">No</th>
          <th class="p-2.5 border border-slate-300 w-4/12">Nama Kepala Keluarga</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">RT / RW</th>
          <th class="p-2.5 border border-slate-300 w-3/12">Alamat Lengkap</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Jumlah Jiwa</th>
        </tr>
      `;
      tableRowsHTML = filteredWarga.map((j, i) => `
        <tr class="border-b border-slate-200">
          <td class="p-2.5 border border-slate-300 text-center font-mono">${i + 1}</td>
          <td class="p-2.5 border border-slate-300 font-bold text-slate-900">${j.nama}</td>
          <td class="p-2.5 border border-slate-300 text-center font-bold">RT ${j.rt} / RW ${j.rw}</td>
          <td class="p-2.5 border border-slate-300 text-slate-500">${j.alamat}</td>
          <td class="p-2.5 border border-slate-300 text-center font-mono font-bold">${j.anggota} Orang</td>
        </tr>
      `).join('');
    }

    else if (reportType === "fitrah") {
      docTitle = `Daftar Penyaluran & Tanda Terima Zakat Fitrah (Beras)`;
      textTheme = "text-emerald-800";
      tableHeaderHTML = `
        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
          <th class="p-2.5 border border-slate-300 w-1/12 text-center">No</th>
          <th class="p-2.5 border border-slate-300 w-3/12">Nama Kepala Keluarga</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Kriteria</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Jiwa KK</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-right">Jatah Beras</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Tanda Terima / Paraf</th>
        </tr>
      `;
      
      const mustahikList = filteredWarga.filter(j => j.fitrah !== "Muzakki");
      
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => {
        const jatahPerJiwa = alokasiFitrah[j.fitrah] || 0;
        const totalJatah = jatahPerJiwa * j.anggota;
        return `
          <tr class="border-b border-slate-200">
            <td class="p-2.5 border border-slate-300 text-center font-mono">${i + 1}</td>
            <td class="p-2.5 border border-slate-300 font-bold text-slate-900">${j.nama}</td>
            <td class="p-2.5 border border-slate-300 text-center"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">Mustahik ${j.fitrah}</span></td>
            <td class="p-2.5 border border-slate-300 text-center font-mono">${j.anggota} Jiwa</td>
            <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-emerald-700">${totalJatah.toFixed(1)} Kg</td>
            <td class="p-2.5 border border-slate-300 text-left font-mono text-[9px] text-slate-300 relative h-12">
              <span class="absolute bottom-1 left-2">${i + 1}.</span>
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">Tidak ada jemaah penerima Zakat Fitrah pada wilayah terpilih ini.</td></tr>`;
    }

    else if (reportType === "zuru") {
      docTitle = `Daftar Penyaluran & Tanda Terima Zakat Zuru' (Hasil Pertanian)`;
      textTheme = "text-teal-800";
      tableHeaderHTML = `
        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
          <th class="p-2.5 border border-slate-300 w-1/12 text-center">No</th>
          <th class="p-2.5 border border-slate-300 w-3/12">Nama Kepala Keluarga</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Kriteria</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Jiwa KK</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-right">Jatah Hasil Panen</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">Tanda Terima / Paraf</th>
        </tr>
      `;
      
      const mustahikList = filteredWarga.filter(j => j.zuru !== "Bukan Mustahik");
      
      tableRowsHTML = mustahikList.length > 0 ? mustahikList.map((j, i) => {
        const jatahPerJiwa = alokasiZuru[j.zuru] || 0;
        const totalJatah = jatahPerJiwa * j.anggota;
        return `
          <tr class="border-b border-slate-200">
            <td class="p-2.5 border border-slate-300 text-center font-mono">${i + 1}</td>
            <td class="p-2.5 border border-slate-300 font-bold text-slate-900">${j.nama}</td>
            <td class="p-2.5 border border-slate-300 text-center"><span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[10px]">Mustahik ${j.zuru}</span></td>
            <td class="p-2.5 border border-slate-300 text-center font-mono">${j.anggota} Jiwa</td>
            <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-teal-700">${totalJatah.toFixed(1)} Kg</td>
            <td class="p-2.5 border border-slate-300 text-left font-mono text-[9px] text-slate-300 relative h-12">
              <span class="absolute bottom-1 left-2">${i + 1}.</span>
            </td>
          </tr>
        `;
      }).join('') : `<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">Tidak ada jemaah penerima Zakat Zuru' pada wilayah terpilih ini.</td></tr>`;
    }

    else if (reportType === "qurban") {
      docTitle = `Daftar Penerima & Tanda Terima Distribusi Daging Qurban`;
      textTheme = "text-rose-800";
      tableHeaderHTML = `
        <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
          <th class="p-2.5 border border-slate-300 w-1/12 text-center">No</th>
          <th class="p-2.5 border border-slate-300 w-3/12">Nama Kepala Keluarga</th>
          <th class="p-2.5 border border-slate-300 w-2/12 text-center">RT / RW</th>
          <th class="p-2.5 border border-slate-300 text-slate-500">Alamat</th>
          <th class="p-2.5 border border-slate-300 w-1.5/12 text-right">Daging Sapi</th>
          <th class="p-2.5 border border-slate-300 w-1.5/12 text-right">Daging Kambing</th>
          <th class="p-2.5 border border-slate-300 w-3/12 text-center">Tanda Tangan / Paraf</th>
        </tr>
      `;

      const qurbanList = filteredWarga.filter(warga => {
        if (warga.qurban === "Sahibul Qurban") return false;

        if (qurbanHanyaMustahik) {
          const isMustahikFitrah = warga.fitrah !== "Muzakki";
          const isMustahikZuru = warga.zuru !== "Bukan Mustahik";
          return isMustahikFitrah || isMustahikZuru;
        }
        return true;
      });

      const localTotalPenerima = qurbanList.length;
      const localJatahSapi = localTotalPenerima > 0 ? (totalTimbanganQurbanSapi / localTotalPenerima).toFixed(2) : 0;
      const localJatahKambing = localTotalPenerima > 0 ? (totalTimbanganQurbanKambing / localTotalPenerima).toFixed(2) : 0;

      tableRowsHTML = qurbanList.length > 0 ? qurbanList.map((j, i) => `
        <tr class="border-b border-slate-200">
          <td class="p-2.5 border border-slate-300 text-center font-mono">${i + 1}</td>
          <td class="p-2.5 border border-slate-300 font-bold text-slate-900">${j.nama}</td>
          <td class="p-2.5 border border-slate-300 text-center font-bold">RT ${j.rt} / RW ${j.rw}</td>
          <td class="p-2.5 border border-slate-300 text-slate-500 text-[10px]">${j.alamat}</td>
          <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-rose-700">${localJatahSapi} Kg</td>
          <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-amber-700">${localJatahKambing} Kg</td>
          <td class="p-2.5 border border-slate-300 text-left font-mono text-[9px] text-slate-300 relative h-12">
            <span class="absolute bottom-1 left-2">${i + 1}.</span>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="7" class="p-8 text-center text-slate-400 italic">Tidak ada warga penerima daging qurban pada wilayah terpilih ini.</td></tr>`;
    }

    const html = `
      <html>
        <head>
          <title>${docTitle} - ${masjidName}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; margin: 1.2cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="p-8 bg-white text-slate-800">
          <div class="flex items-center justify-between border-b-4 border-slate-900 pb-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 text-emerald-700 flex items-center justify-center border border-slate-200 rounded-xl overflow-hidden p-1">
                ${masjidLogoUrl ? `<img src="${masjidLogoUrl}" class="w-full h-full object-contain" />` : `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22h20M12 2v3M12 5a7 7 0 0 0-7 7v10h14V12a7 7 0 0 0-7-7ZM9 17h6v5H9z"/></svg>`}
              </div>
              <div>
                <h1 class="text-2xl font-black uppercase text-slate-900 leading-none">${masjidName}</h1>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Desa ${lokasi.desa || ''}, Kec. ${lokasi.kecamatan}, Kab. ${lokasi.kabupaten}, Provinsi ${lokasi.provinsi}</p>
              </div>
            </div>
            <div class="text-right text-xs text-slate-400 font-semibold font-mono">
              <p>Tanggal Dokumen:</p>
              <p class="text-slate-900 font-bold">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            </div>
          </div>

          <div class="text-center mb-6 space-y-1">
            <h2 class="text-base font-black uppercase ${textTheme} tracking-wide">${docTitle}</h2>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Wilayah Pengurusan: ${rtTitle}</p>
          </div>
          
          <table class="w-full text-left text-xs border border-collapse border-slate-300">
            <thead>
              ${tableHeaderHTML}
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>
          
          <div class="mt-12 flex justify-between text-xs font-semibold">
            <div>
              <p>Menyetujui & Mengesahkan,</p>
              <p class="mt-16 border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-center">Ketua Takmir Masjid</p>
            </div>
            <div class="text-right">
              <p>Lamongan, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p>Penanggung Jawab Laporan,</p>
              <p class="mt-16 border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-center mx-auto">Kepala Pengurus RT</p>
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintQurbanRT = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification("Gagal membuka jendela cetak! Periksa pengaturan pemblokir pop-up browser Anda.", "error");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Daftar Distribusi Daging Qurban per Wilayah - ${masjidName}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; margin: 1cm; }
              .page-break { page-break-after: always; }
              .avoid-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body class="p-8 bg-white text-slate-800">
          <div class="flex items-center justify-between border-b-4 border-rose-800 pb-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 text-rose-700 flex items-center justify-center border border-slate-200 rounded-xl overflow-hidden p-1">
                ${masjidLogoUrl ? `<img src="${masjidLogoUrl}" class="w-full h-full object-contain" />` : `<svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22h20M12 2v3M12 5a7 7 0 0 0-7 7v10h14V12a7 7 0 0 0-7-7ZM9 17h6v5H9z"/></svg>`}
              </div>
              <div>
                <h1 class="text-2xl font-black uppercase text-slate-900 leading-tight">${masjidName}</h1>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Desa ${lokasi.desa || ''}, Kec. ${lokasi.kecamatan}, Kab. ${lokasi.kabupaten}, Provinsi ${lokasi.provinsi}</p>
              </div>
            </div>
            <div class="text-right text-xs text-slate-400 font-semibold font-mono">
              <p>Tanggal Cetak:</p>
              <p class="text-slate-955 font-bold">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            </div>
          </div>

          <div class="text-center mb-8">
            <h2 class="text-lg font-bold uppercase text-rose-800 tracking-wide">Daftar Penerima & Tanda Terima Distribusi Hewan Qurban per RT / RW</h2>
            <p class="text-xs text-slate-500 mt-1">Total Timbangan: Sapi ${totalTimbanganQurbanSapi.toFixed(1)} Kg | Kambing ${totalTimbanganQurbanKambing.toFixed(1)} Kg</p>
          </div>
          
          ${WILAYAH_OPTIONS.map((wilayah) => {
            const list = wargaPenerimaQurban.filter(w => w.rt === wilayah.rt && w.rw === wilayah.rw);
            return `
              <div class="mb-10 avoid-break">
                <div class="bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl mb-3 flex justify-between items-center">
                  <h3 class="text-sm font-black text-rose-800 uppercase tracking-wide">${wilayah.label}</h3>
                  <span class="text-xs font-bold bg-white text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg">Kapasitas: ${list.length} KK Penerima</span>
                </div>
                
                <table class="w-full text-left text-xs border border-collapse border-slate-300">
                  <thead>
                    <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <th class="p-2 border border-slate-300 w-1/12 text-center">No</th>
                      <th class="p-2 border border-slate-300 w-3/12">Nama Kepala Keluarga</th>
                      <th class="p-2 border border-slate-300 font-bold text-center">RT / RW</th>
                      <th class="p-2 border border-slate-300 text-slate-500">Alamat</th>
                      <th class="p-2 border border-slate-300 w-1.5/12 text-right">Jatah Sapi</th>
                      <th class="p-2 border border-slate-300 w-1.5/12 text-right">Jatah Kambing</th>
                      <th class="p-2 border border-slate-300 w-2/12 text-center">Tanda Tangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${list.length > 0 ? list.map((w, index) => `
                      <tr class="border-b border-slate-200">
                        <td class="p-2 border border-slate-300 text-center font-mono">${index + 1}</td>
                        <td class="p-2 border border-slate-300 font-bold text-slate-900">${w.nama}</td>
                        <td class="p-2 border border-slate-300 font-bold text-center">RT ${w.rt} / RW ${w.rw}</td>
                        <td class="p-2 border border-slate-300 text-slate-500 text-[10px]">${w.alamat}</td>
                        <td class="p-2 border border-slate-300 text-right font-mono font-bold text-rose-700">${jatahDagingSapiPerKK} Kg</td>
                        <td class="p-2 border border-slate-300 text-right font-mono font-bold text-amber-700">${jatahDagingKambingPerKK} Kg</td>
                        <td class="p-2 border border-slate-300 h-10 text-center text-slate-300 font-mono text-[9px] relative">
                          <span class="absolute bottom-1 left-2">${index + 1}.</span>
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="7" class="p-4 text-center text-slate-400 italic">Tidak ada warga penerima di wilayah ini.</td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}

          <div class="mt-12 flex justify-between text-xs font-semibold avoid-break">
            <div>
              <p>Mengetahui,</p>
              <p class="mt-16 border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-center">Takmir Masjid Al-Ikhlas</p>
            </div>
            <div class="text-right">
              <p>Lamongan, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
              <p>Dilaporkan oleh,</p>
              <p class="mt-16 border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-center mx-auto">Ketua Panitia Qurban</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // =========================================================
  // 4. VIEW RENDERING & CONTROLLER (EVALUATED AT BOTTOM OF APP)
  // =========================================================
  if (!isLoggedIn) {
    // Jalur Render Halaman Login Bersih
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans antialiased">
        
        {/* === TOAST NOTIFICATIONS === */}
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

        {/* Ornamen Latar Belakang */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Login Utama */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10 flex flex-col p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-20 h-20 text-emerald-600 flex items-center justify-center mx-auto overflow-hidden">
              {renderMasjidLogo("w-full h-full object-contain rounded-lg", "w-16 h-16")}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{masjidName}</h1>
              <p className="text-xs text-slate-500 font-semibold font-mono tracking-wider">Gerbang Pengelolaan Masjid & Zakat</p>
            </div>
          </div>

          {/* Form Login Sederhana */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
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

            {/* Password */}
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* === HEADER UTAMA DENGAN HAMBURGER MENU (GARIS 3) === */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200 shadow-xs"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-emerald-600 flex items-center justify-center overflow-hidden">
              {renderMasjidLogo("w-12 h-12 object-contain rounded-lg", "w-10 h-10")}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{masjidName}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Aplikasi Masjid Terpadu</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200/60 text-slate-700 text-xs font-semibold flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Clock className="text-emerald-600 w-4 h-4" />
              <span className="font-mono text-sm tracking-widest font-black">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-3 pr-2 py-1.5 rounded-2xl">
            <div className="text-left hidden md:block">
              <span className="text-[9px] text-emerald-600 font-extrabold block leading-none uppercase">Peran</span>
              <span className="text-xs font-black text-emerald-955">{currentUserLabel}</span>
            </div>
            <button onClick={handleLogout} className="p-1 hover:bg-rose-50 text-rose-500 rounded-xl transition-all" title="Keluar dari sistem">
              <LogOut size={16} />
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
                  <span className="text-sm font-black text-slate-800 uppercase tracking-wide">{masjidName}</span>
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
                <div className="text-xs">
                  <p className="font-bold text-slate-800">{currentUserLabel}</p>
                  <p className="text-[10px] text-slate-400 font-mono">@{currentUserUsername}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-all border border-dashed border-rose-100">
                <LogOut className="w-4.5 h-4.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />
        </div>
      )}

      {/* === CONTENT AREA UTAMA === */}
      <div className="flex-1 flex flex-col md:flex-row font-sans">
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* TAB 1: DASHBOARD UTAMA */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-700/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-300 w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-200">Lokasi Penentuan Jadwal Sholat</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Desa {lokasi.desa || ''}, {lokasi.kecamatan}, {lokasi.kabupaten}, {lokasi.provinsi}</h2>
                </div>
                {hasAccess("rbac") && ( 
                  <button onClick={() => { setTempLokasi(lokasi); setIsSettingLokasi(true); }} className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <Settings size={15} /> Atur Lokasi Baru
                  </button>
                )}
              </div>

              {isSettingLokasi && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-emerald-700"><MapPin size={16} /> Konfigurasi Geografis Masjid</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button onClick={() => setIsSettingLokasi(false)} className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all">Batal</button>
                    <button onClick={async () => { 
                      setLokasi(tempLokasi); 
                      setIsSettingLokasi(false); 
                      addNotification("Lokasi masjid berhasil dikonfigurasi ulang secara presisi!"); 
                    }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10">Terapkan Perubahan</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-955 flex items-center gap-2"><Clock className="text-emerald-600 w-5 h-5" /> Jadwal Sholat Hari Ini</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Metode Kemenag RI</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(jadwalSholat).map(([sholatName, time]) => {
                      const isNext = nextSholat.name === sholatName;
                      return (
                        <div key={sholatName} className={`p-3 rounded-xl border text-center transition-all ${isNext ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10 scale-105' : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'}`}>
                          <p className={`text-[11px] font-bold ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{sholatName}</p>
                          <p className="text-lg font-extrabold tracking-wider mt-1">{time}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-955 flex items-center gap-2"><Calendar className="text-emerald-600 w-5 h-5" /> Penjadwalan Petugas Jumat Pekan Ini</h3>
                  {upcomingFridays.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-bold">{upcomingFridays[0].formattedDate}</span>
                        <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">Jumat {upcomingFridays[0].pasaran}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Khatib Utama</p>
                          <p className="text-slate-900 text-sm font-extrabold">{upcomingFridays[0].petugas.khatib}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Imam Cadangan</p>
                          <p className="text-slate-900 text-sm font-extrabold">{upcomingFridays[0].petugas.imam}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Muadzin</p>
                          <p className="text-slate-855 text-sm font-bold">{upcomingFridays[0].petugas.muadzin}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Bilal / MC</p>
                          <p className="text-slate-855 text-sm font-bold">{upcomingFridays[0].petugas.bilal}</p>
                        </div>
                      </div>
                    </div>
                  ) : ( <p className="text-xs text-slate-400">Belum ada agenda petugas sholat Jumat.</p> )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-95.0 flex items-center gap-2"><UsersRound className="text-emerald-600 w-5 h-5" /> Sebaran Jiwa Mustahik (Basis RT)</h3>
                  <div className="space-y-2">
                    {["Berat", "Sedang", "Ringan"].map((asnaf) => {
                      const fitrahCount = getJumlahJiwaPerKategoriFitrah(jamaahList, asnaf);
                      const zuruCount = getJumlahJiwaPerKategoriZuru(jamaahList, asnaf);
                      return (
                        <div key={asnaf} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl border border-slate-200/50">
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
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-955">Konfigurasi Petugas Sholat Jumat Abadi</h2>
                  <p className="text-xs text-slate-500">Sistem otomatis mengikat petugas berdasarkan 5 Hari Pasaran Jawa. Tidak perlu membuat jadwal mingguan baru selamanya!</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <BellRing className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold">Sistem Notifikasi Pengingat Otomatis H-1 (Hari Kamis)</p>
                    <p className="text-amber-700">Simulasikan pengiriman pesan pengingat WhatsApp atau SMS Gateway Android ke ponsel petugas langsung dari tombol simulasi di bawah template kartu petugas.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Template Petugas Jumat Abadi (5 Pasaran)</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {PASARAN_LIST.map((pasaran) => {
                    const data = petugasAbadi[pasaran] || {};
                    return (
                      <div key={pasaran} className="bg-white border-2 border-slate-100 hover:border-emerald-200 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                            <span className="text-xs font-black text-emerald-700 uppercase">JUMAT {pasaran}</span>
                            {canEditPetugas && (
                              <button onClick={() => handleEditPasaran(pasaran)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-all border border-transparent hover:border-slate-200 shadow-2xs" title="Ubah Template Petugas"><Edit2 size={13} /></button>
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div><span className="text-[10px] text-slate-400 block font-bold">KHATIB / IMAM</span><span className="text-slate-800 font-extrabold">{data.khatib || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">IMAM CADANGAN</span><span className="text-slate-800 font-semibold">{data.imam || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">MUADZIN</span><span className="text-slate-700 font-medium">{data.muadzin || "-"}</span></div>
                            <div><span className="text-[10px] text-slate-400 block">BILAL</span><span className="text-slate-700 font-medium">{data.bilal || "-"}</span></div>
                          </div>
                        </div>
                        {data.telp && ( 
                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                              <Phone size={10} />
                              <span>{data.telp}</span>
                            </div>
                            
                            {data.khatib && (
                              <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-slate-100/50">
                                <button
                                  onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat, 22 Mei 2026" }, "WA")}
                                  className="flex-1 bg-[#128c7e] hover:bg-[#075e54] text-white font-bold py-1 rounded text-[9px] transition-all text-center animate-none"
                                  title="Simulasi WA"
                                >
                                  Kirim WA
                                </button>
                                <button
                                  onClick={() => handlePrepareNotification({ petugas: data, pasaran, formattedDate: "Jumat, 22 Mei 2026" }, "SMS")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded text-[9px] transition-all text-center animate-none"
                                  title="Simulasi SMS"
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-scaleIn">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-900">Ubah Template Jumat {editingPasaran}</h3>
                      <button onClick={() => setEditingPasaran(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSavePasaran} className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Khatib Utama *</label>
                        <input type="text" required value={pasaranForm.khatib} onChange={(e) => setPasaranForm({...pasaranForm, khatib: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">No. Telp / WA Khatib *</label>
                        <input type="text" required placeholder="Contoh: 081234567890" value={pasaranForm.telp} onChange={(e) => setPasaranForm({...pasaranForm, telp: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Imam Cadangan *</label>
                        <input type="text" required value={pasaranForm.imam} onChange={(e) => setPasaranForm({...pasaranForm, imam: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Muadzin</label>
                          <input type="text" value={pasaranForm.muadzin} onChange={(e) => setPasaranForm({...pasaranForm, muadzin: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Bilal</label>
                          <input type="text" value={pasaranForm.bilal} onChange={(e) => setPasaranForm({...pasaranForm, bilal: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setEditingPasaran(null)} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">Simpan Template</button>
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

                      {/* Info & Panduan Kode Android (Untuk Developer Anda) */}
                      {notificationType === "SMS" && (
                        <div className="bg-white border border-blue-200 p-3 rounded-2xl mt-4 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1">
                              <Smartphone size={12} />
                              Panduan Kode Android (Kotlin)
                            </span>
                            <button 
                              type="button"
                              onClick={() => setShowAndroidCode(!showAndroidCode)}
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              Sembunyikan
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Aplikasi Android Anda nantinya dapat memantau API web ini lalu mengirim SMS secara otomatis menggunakan kode program native berikut:
                          </p>
                          {showAndroidCode && (
                            <pre className="text-[8px] bg-slate-950 text-emerald-400 p-2.5 rounded-xl font-mono overflow-x-auto max-h-24">
{`val smsManager = SmsManager.getDefault()
smsManager.sendTextMessage(
    "${activeNotificationSim.petugas.telp}", 
    null, 
    "...\${pesan}...", 
    null, 
    null
)`}
                            </pre>
                          )}
                        </div>
                      )}
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
            <div className="space-y-6 animate-fadeIn">
              
              {/* PANEL PUSAT CETAK LAPORAN SEPARATED BY RT */}
              <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Printer className="text-emerald-600 w-5 h-5" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Pusat Cetak Dokumen & PDF Masjid Terpadu</h3>
                </div>

                <div className="flex flex-col md:flex-row items-end gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex-1 space-y-1.5">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Pilih Wilayah RT / RW yang Mau Dicetak:</label>
                    <select 
                      value={selectedPrintWilayah} 
                      onChange={(e) => setSelectedPrintWilayah(e.target.value)} 
                      className="w-full text-xs border border-slate-200 bg-white p-3 rounded-xl outline-none font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua RT & RW Terdaftar</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-2 flex flex-wrap gap-2">
                    <button onClick={() => handlePrintSelectedReport("jamaah")} className="bg-slate-800 hover:bg-[#111] text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Jamaah</button>
                    <button onClick={() => handlePrintSelectedReport("fitrah")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Fitrah</button>
                    <button onClick={() => handlePrintSelectedReport("zuru")} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Zuru'</button>
                    <button onClick={() => handlePrintSelectedReport("qurban")} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Qurban</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-955">Database Jemaah Berbasis RT/RW</h2>
                  <p className="text-xs text-slate-500">Sistem database jemaah kustom yang dibatasi pada sebaran **RT & RW** unik di Desa Bakalan.</p>
                </div>
                {canEditJamaah && (
                  <button onClick={() => { setEditingJamaah(null); setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik", qurban: "Penerima" }); setShowJamaahModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow shadow-emerald-600/10 hover:scale-102">
                    <Plus size={16} /> Tambah Warga Baru
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {/* === FITUR PENYARINGAN RT & RW TERPADU DAN INTERAKTIF === */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filter Wilayah Warga:</span>
                    <select 
                      value={filterWilayahJamaah} 
                      onChange={(e) => setFilterWilayahJamaah(e.target.value)}
                      className="text-xs border border-slate-200 bg-white px-3 py-2 rounded-xl outline-none font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua RT & RW</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                    Tampil: {jamaahList.filter(item => {
                      if (filterWilayahJamaah === "Semua") return true;
                      const [rtF, rwF] = filterWilayahJamaah.split('_');
                      return item.rt === rtF && item.rw === rwF;
                    }).length} KK dari {jamaahList.length} KK
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-4">Nama Kepala Keluarga</th>
                        <th className="p-4">Wilayah RT / RW</th>
                        <th className="p-4">Alamat Rumah</th>
                        <th className="p-4 text-center">Anggota (Jiwa)</th>
                        <th className="p-4">Ekonomi</th>
                        <th className="p-4 text-emerald-700">Mustahik Fitrah</th>
                        <th className="p-4 text-teal-700">Mustahik Zuru'</th>
                        <th className="p-4 text-rose-700">Status Qurban</th>
                        {canEditJamaah && <th className="p-4 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {/* === FILTERING BERDASARKAN RT/RW TERPADU === */}
                      {jamaahList
                        .filter(item => {
                          if (filterWilayahJamaah === "Semua") return true;
                          const [rtF, rwF] = filterWilayahJamaah.split('_');
                          return item.rt === rtF && item.rw === rwF;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="p-4 text-slate-900 font-bold">{item.nama}</td>
                            <td className="p-4"><span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200/50 font-mono font-bold">RT {item.rt} / RW {item.rw}</span></td>
                            <td className="p-4 text-xs font-medium text-slate-500">{item.alamat}</td>
                            <td className="p-4 text-center text-slate-900">{item.anggota} Jiwa</td>
                            <td className="p-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.ekonomi === 'Mampu' ? 'bg-emerald-50 text-emerald-700' : item.ekonomi === 'Kurang Mampu' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                {item.ekonomi}
                              </span>
                            </td>
                            <td className="p-4"><span className={`text-xs ${item.fitrah === 'Muzakki' ? 'text-slate-400 font-normal' : 'text-emerald-700 font-bold'}`}>{item.fitrah}</span></td>
                            <td className="p-4"><span className={`text-xs ${item.zuru === 'Bukan Mustahik' ? 'text-slate-400 font-normal' : 'text-teal-700 font-bold'}`}>{item.zuru}</span></td>
                            <td className="p-4">
                              <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${item.qurban === 'Sahibul Qurban' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-600 border-slate-200/60'}`}>
                                {item.qurban || "Penerima"}
                              </span>
                            </td>
                            {canEditJamaah && (
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleEditJamaah(item)} className="p-1.5 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 transition-all" title="Ubah Data"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeleteJamaah(item.id)} className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg text-rose-600 transition-all" title="Hapus Data"><Trash2 size={14} /></button>
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
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-scaleIn">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-900">{editingJamaah ? "Ubah Data Warga" : "Tambah Warga Baru"}</h3>
                      <button onClick={() => setShowJamaahModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    {/* === FIX: Mengubah handleSaveSaveJamaah = handleSaveJamaah menjadi handleSaveJamaah murni === */}
                    <form onSubmit={handleSaveJamaah} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kepala Keluarga *</label>
                          <input type="text" placeholder="Masukkan nama Kepala Keluarga" required value={jamaahForm.nama} onChange={(e) => setJamaahForm({...jamaahForm, nama: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Anggota Keluarga (Jiwa) *</label>
                            <input type="number" min="1" required value={jamaahForm.anggota} onChange={(e) => setJamaahForm({...jamaahForm, anggota: parseInt(e.target.value) || 1})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Wilayah RT / RW *</label>
                            <select 
                              value={`${jamaahForm.rt}_${jamaahForm.rw}`} 
                              onChange={(e) => {
                                const [rt, rw] = e.target.value.split('_');
                                setJamaahForm({...jamaahForm, rt, rw});
                              }} 
                              className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
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
                          <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Rumah *</label>
                          <textarea placeholder="Alamat lengkap warga" required rows="2" value={jamaahForm.alamat} onChange={(e) => setJamaahForm({...jamaahForm, alamat: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold resize-none text-slate-855" />
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Status Ekonomi</label>
                          <div className="flex gap-3">
                            {["Mampu", "Kurang Mampu", "Sangat Kurang"].map((opsi) => (
                              <label key={opsi} className="flex-1 border p-2.5 rounded-xl text-center text-xs font-semibold cursor-pointer select-none flex items-center justify-center gap-1.5">
                                <input type="radio" name="ekonomi" value={opsi} checked={jamaahForm.ekonomi === opsi} onChange={() => setJamaahForm({...jamaahForm, ekonomi: opsi})} className="accent-emerald-600" />
                                {opsi}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-emerald-700 mb-1">Klasifikasi Mustahik Fitrah</label>
                            <select 
                              value={jamaahForm.fitrah} 
                              onChange={(e) => setJamaahForm({...jamaahForm, fitrah: e.target.value})} 
                              className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-emerald-800"
                            >
                              <option value="Muzakki">Muzakki (Bukan Penerima)</option>
                              <option value="Berat">Mustahik Berat</option>
                              <option value="Sedang">Mustahik Sedang</option>
                              <option value="Ringan">Mustahik Ringan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#0d9488] mb-1">Klasifikasi Mustahik Zuru'</label>
                            <select 
                              value={jamaahForm.zuru} 
                              onChange={(e) => setJamaahForm({...jamaahForm, zuru: e.target.value})} 
                              className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-teal-800"
                            >
                              <option value="Bukan Mustahik">Bukan Mustahik Zuru'</option>
                              <option value="Berat">Mustahik Berat</option>
                              <option value="Sedang">Mustahik Sedang</option>
                              <option value="Ringan">Mustahik Ringan</option>
                            </select>
                          </div>
                        </div>

                        {/* === INPUT PENAMBAHAN KATEGORI STATUS QURBAN PADA MODAL === */}
                        <div className="border-t border-slate-100 pt-3">
                          <label className="block text-xs font-bold text-rose-700 mb-1">Status Qurban (Khusus Distribusi Hari Raya)</label>
                          <select 
                            value={jamaahForm.qurban || "Penerima"} 
                            onChange={(e) => setJamaahForm({...jamaahForm, qurban: e.target.value})} 
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-rose-800 focus:ring-1 focus:ring-rose-500"
                          >
                            <option value="Penerima">Penerima Daging (Warga Biasa / Mustahik)</option>
                            <option value="Sahibul Qurban">Sahibul Qurban (Pekurban - Tidak Dapat Pembagian Umum)</option>
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">Sahibul Qurban otomatis dikeluarkan dari kalkulator pembagian daging qurban dan cetak PDF tanda terima kupon.</p>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setShowJamaahModal(false)} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">Simpan Warga</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ZAKAT FITRAH */}
          {activeTab === "fitrah" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Modul Pengelolaan Zakat Fitrah</h2>
                  <p className="text-xs text-slate-500">Mencatat, menimbang, dan mensimulasikan jatah pembagian beras secara adil dan transparan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Log Timbangan Masuk */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Gift size={16} className="text-emerald-600" /> 1. Log Timbangan Masuk</h3>
                  
                  {canEditFitrah ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" step="0.1" 
                        placeholder="Berat Beras (Kg)" 
                        value={tempBeratFitrah} 
                        onChange={(e) => setTempBeratFitrah(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('fitrah')} 
                        className="flex-1 text-xs border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500" 
                      />
                      <button onClick={() => addTimbangan('fitrah')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0">Tambah</button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-bold">Peran Anda saat ini tidak memiliki otoritas mengubah data timbangan.</p>
                  )}

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {timbanganFitrah.map((berat, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold font-mono">{berat} Kg</span>
                          {canEditFitrah && (
                            <button onClick={() => deleteTimbangan('fitrah', idx)} className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg"><Trash2 size={13} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-emerald-800 font-extrabold uppercase">Total Beras Masuk:</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">{totalTimbanganFitrah.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* 2. Simulasi & Distribusi Otomatis */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><UsersRound size={16} className="text-emerald-600" /> 2. Rencana Penyaluran Beras (Kriteria Mustahik)</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusFitrah >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {statusFitrah >= 0 ? `Beras Surplus: +${statusFitrah.toFixed(1)} Kg` : `Defisit/Kurang: ${statusFitrah.toFixed(1)} Kg`}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Konstanta Jatah Jemaah (Beras / Jiwa)</p>
                      {canEditFitrah && (
                        <button onClick={handleSaveAlokasiFitrah} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"><Check size={12} />Simpan Parameter</button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                        <div key={asnaf} className="bg-white p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">{asnaf}</span>
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" step="0.5" min="0" 
                              disabled={!canEditFitrah}
                              value={tempAlokasiFitrah[asnaf] || 0} 
                              onChange={(e) => setTempAlokasiFitrah({...tempAlokasiFitrah, [asnaf]: parseFloat(e.target.value) || 0})}
                              className="w-12 text-center text-xs font-black outline-none border-b border-dashed border-slate-300 focus:border-emerald-500 text-slate-800" 
                            />
                            <span className="text-[10px] text-slate-400 font-bold">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Golongan Penerima</th>
                          <th className="pb-2 text-center">Jumlah Jiwa</th>
                          <th className="pb-2 text-center">Jatah / Jiwa (Committed)</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {rincianKebutuhanFitrah.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900">Mustahik {item.kategori}</td>
                            <td className="py-2.5 text-center">{item.jumlahJiwa} Orang</td>
                            <td className="py-2.5 text-center text-emerald-700">{item.jatah} Kg</td>
                            <td className="py-2.5 text-right text-slate-900 font-black">{item.totalButuh.toFixed(1)} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 text-slate-900 font-extrabold">
                          <td className="p-2.5" colSpan="3">Total Kebutuhan Penyaluran:</td>
                          <td className="p-2.5 text-right text-emerald-800 font-black">{totalButuhFitrah.toFixed(1)} Kg</td>
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
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Modul Pengelolaan Zakat Zuru' (Hasil Pertanian)</h2>
                  <p className="text-xs text-slate-500">Kalkulasi timbangan gabah atau beras hasil zakat pertanian jemaah secara akurat.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Log Timbangan Zuru' Masuk */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Coins size={16} className="text-teal-600" /> 1. Log Timbangan Zuru' Masuk</h3>
                  
                  {canEditZuru ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" step="0.5" 
                        placeholder="Berat Panen (Kg)" 
                        value={tempBeratZuru} 
                        onChange={(e) => setTempBeratZuru(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('zuru')} 
                        className="flex-1 text-xs border border-slate-200 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-teal-500" 
                      />
                      <button onClick={() => addTimbangan('zuru')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-xl text-xs font-bold transition-all shrink-0">Tambah</button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg font-bold">Peran Anda tidak diizinkan mengubah timbangan zakat zuru'.</p>
                  )}

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {timbanganZuru.map((berat, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold font-mono">{berat} Kg</span>
                          {canEditZuru && (
                            <button onClick={() => deleteTimbangan('zuru', idx)} className="text-rose-600 hover:bg-rose-50 p-1 rounded-lg"><Trash2 size={13} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-teal-50/70 border border-teal-100 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-teal-800 font-extrabold uppercase">Total Terkumpul:</span>
                    <span className="text-xl font-black text-teal-700 font-mono">{totalTimbanganZuru.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* 2. Penyaluran Zuru' */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><UsersRound size={16} className="text-teal-600" /> 2. Rencana Penyaluran Hasil Panen</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusZuru >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
                      {statusZuru >= 0 ? `Hasil Surplus: +${statusZuru.toFixed(1)} Kg` : `Kekurangan: ${statusZuru.toFixed(1)} Kg`}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Konstanta Jatah Jemaah (Zuru' / Jiwa)</p>
                      {canEditZuru && (
                        <button onClick={handleSaveAlokasiZuru} className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"><Check size={12} />Simpan Parameter</button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Berat", "Sedang", "Ringan"].map((asnaf) => (
                        <div key={asnaf} className="bg-white p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-bold">{asnaf}</span>
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" step="0.5" min="0" 
                              disabled={!canEditZuru}
                              value={tempAlokasiZuru[asnaf] || 0} 
                              onChange={(e) => setTempAlokasiZuru({...tempAlokasiZuru, [asnaf]: parseFloat(e.target.value) || 0})}
                              className="w-12 text-center text-xs font-black outline-none border-b border-dashed border-slate-300 focus:border-teal-500 text-slate-800" 
                            />
                            <span className="text-[10px] text-slate-400 font-bold">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Kriteria Penerima Zuru'</th>
                          <th className="pb-2 text-center">Jumlah Jiwa</th>
                          <th className="pb-2 text-center">Jatah / Jiwa (Committed)</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                        {rincianKebutuhanZuru.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900">Mustahik {item.kategori}</td>
                            <td className="py-2.5 text-center">{item.jumlahJiwa} Orang</td>
                            <td className="py-2.5 text-center text-teal-700">{item.jatah} Kg</td>
                            <td className="py-2.5 text-right text-slate-900 font-black">{item.totalButuh.toFixed(1)} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 text-slate-900 font-extrabold">
                          <td className="p-2.5" colSpan="3">Total Kebutuhan Penyaluran Zuru:</td>
                          <td className="p-2.5 text-right text-teal-800 font-black">{totalButuru.toFixed(1)} Kg</td>
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
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Pengelolaan & Distribusi Daging Qurban Terpadu</h2>
                  <p className="text-xs text-slate-500">Log timbangan berkala perolehan daging Sapi & Kambing secara terpisah untuk pemerataan pembagian jatah KK.</p>
                </div>
                <button onClick={handlePrintQurbanRT} className="bg-slate-800 hover:bg-slate-955 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
                  <Download size={15} /> Download PDF Distribusi per RT/RW
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sapi */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-rose-600 rounded-full"></div> 1. Log Timbangan Daging Sapi Masuk
                    </h3>
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">Kategori Sapi</span>
                  </div>
                  {canEditQurban ? (
                    <div className="flex gap-2">
                      <input type="number" step="0.1" placeholder="Berat Daging Sapi (kg)" value={tempBeratQurbanSapi} onChange={(e) => setTempBeratQurbanSapi(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurbanSapi')} className="flex-1 text-sm border border-slate-200/50 p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-rose-500" />
                      <button onClick={() => addTimbangan('qurbanSapi')} className="bg-rose-600 hover:bg-rose-700 text-white px-4 rounded-xl font-bold text-xs transition-all animate-none">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-[#f43f5e] bg-[#fff5f5] border border-[#ffe4e6] p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Sapi.</p>}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 font-semibold text-slate-700">
                    {timbanganQurbanSapi.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs font-semibold">
                        <span className="text-slate-400">Timbangan Sapi #{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-900 font-extrabold">{berat} Kg</span>
                          {canEditQurban && ( <button onClick={() => deleteTimbangan('qurbanSapi', index)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 size={12} /></button> )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-rose-800 font-extrabold uppercase">Total Bersih Daging Sapi</span>
                    <span className="text-xl font-black text-rose-700 font-mono">{totalTimbanganQurbanSapi.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* Kambing */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-amber-600 rounded-full"></div> 2. Log Timbangan Daging Kambing Masuk
                    </h3>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">Kategori Kambing</span>
                  </div>
                  {canEditQurban ? (
                    <div className="flex gap-2">
                      <input type="number" step="0.1" placeholder="Berat Daging Kambing (kg)" value={tempBeratQurbanKambing} onChange={(e) => setTempBeratQurbanKambing(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurbanKambing')} className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-amber-500" />
                      <button onClick={() => addTimbangan('qurbanKambing')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-xl font-bold text-xs transition-all animate-none">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-[#f43f5e] bg-[#fff5f5] border border-[#ffe4e6] p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Kambing.</p>}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 font-semibold text-slate-700">
                    {timbanganQurbanKambing.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs font-semibold">
                        <span className="text-slate-400">Timbangan Kambing #{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-955 font-extrabold">{berat} Kg</span>
                          {canEditQurban && ( <button onClick={() => deleteTimbangan('qurbanKambing', index)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 size={12} /></button> )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-amber-800 font-extrabold uppercase">Total Daging Kambing</span>
                    <span className="text-xl font-black text-amber-700 font-mono">{totalTimbanganQurbanKambing.toFixed(1)} Kg</span>
                  </div>
                </div>
              </div>

              {/* Alokasi */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
                <h3 className="font-extrabold text-slate-955 text-sm border-b border-slate-100 pb-2">Filter & Alokasi Jatah per KK Terpilih</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Filter Wilayah RT / RW Terpadu</label>
                    <select 
                      value={filterWilayahQurban} 
                      onChange={(e) => setFilterWilayahQurban(e.target.value)} 
                      className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua RT / RW (Seluruh Jamaah)</option>
                      {WILAYAH_OPTIONS.map((wil) => (
                        <option key={`${wil.rt}_${wil.rw}`} value={`${wil.rt}_${wil.rw}`}>
                          {wil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Prioritas Mustahik</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="checkbox" id="mustahikSaja" checked={qurbanHanyaMustahik} onChange={(e) => setQurbanHanyaMustahik(e.target.checked)} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                      <label htmlFor="mustahikSaja" className="text-xs font-bold text-slate-700 cursor-pointer">Hanya berikan ke Golongan Mustahik</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Jumlah Penerima (Mengeluarkan Shohibul Qurban)</p>
                    <p className="text-xl font-black text-slate-900">{totalPenerimaKK} KK</p>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                    <p className="text-[10px] text-rose-800 font-extrabold uppercase">Jatah Sapi / KK</p>
                    <p className="text-xl font-black text-rose-700 font-mono">{jatahDagingSapiPerKK} Kg</p>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100/10 p-4 rounded-xl">
                    <p className="text-[10px] text-amber-800 font-extrabold uppercase">Jatah Kambing / KK</p>
                    <p className="text-xl font-black text-amber-700 font-mono">{jatahDagingKambingPerKK} Kg</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Simulasi Kupon & Tanda Terima Penerima</p>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    {wargaPenerimaQurban.map((warga) => (
                      <div key={warga.id} className="p-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{warga.nama}</p>
                          <p className="text-slate-400 font-semibold text-[10px]">RT {warga.rt} / RW {warga.rw} • {warga.alamat}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg font-bold font-mono">Sapi: {jatahDagingSapiPerKK} Kg</span>
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg font-bold font-mono">Kambing: {jatahDagingKambingPerKK} Kg</span>
                          <button onClick={() => addNotification(`Cetak Kupon Qurban untuk KK: ${warga.nama}`)} className="border border-slate-200 hover:border-slate-300 p-1 rounded-lg hover:bg-slate-50 text-slate-500" title="Cetak Kupon"><Printer size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === TAB 7: HAK AKSES, AKUN & IDENTITAS (RBAC) === */}
          {activeTab === "rbac" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* === PANEL SINKRONISASI GOOGLE SHEETS CLOUD DI TAB RBAC === */}
              {currentRole === "Admin" && (
                <div className="bg-white border-2 border-emerald-100 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Download className="text-emerald-600 w-5 h-5 animate-pulse" />
                      <div>
                        <h3 className="font-black text-slate-900 text-sm">Pusat Sinkronisasi Google Sheets Cloud</h3>
                        <p className="text-xs text-slate-500">Koneksikan dan simpan seluruh database masjid luring Anda ke Google Sheets secara gratis.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${syncStatus === 'Tersinkronisasi' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      <span className="text-[10px] font-black text-slate-600 uppercase">Status: {syncStatus}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black text-slate-600">Google Apps Script Web App URL:</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Belum ada URL script yang dikonfigurasi. Edit file app.jsx untuk mengunci URL." 
                          value={GOOGLE_SHEETS_SCRIPT_URL || "Silakan konfigurasi URL Apps Script Anda di bagian atas app.jsx"} 
                          disabled 
                          className="flex-1 text-xs border border-slate-200 bg-slate-100 p-3 rounded-xl outline-none font-mono text-slate-500" 
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Sistem penyimpanan awan aman dan luring terenkripsi otomatis di Google Sheets. Baca tab panduan setup disamping untuk instruksi lengkapnya.</p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 pt-2">
                      <button 
                        onClick={handleFetchFromGoogleSheets}
                        disabled={isSyncing}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Download size={14} /> Tarik Data Dari Sheets (Fetch)
                      </button>
                      <button 
                        onClick={handlePushToGoogleSheets}
                        disabled={isSyncing}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Upload size={14} /> Unggah / Simpan Ke Sheets (Commit)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Settings className="text-emerald-600 w-5 h-5 animate-spin-slow" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Pengaturan Identitas & Logo Masjid</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Nama Masjid (Akan mengganti semua teks sistem)</label>
                      <input type="text" value={tempMasjidName} onChange={(e) => setTempMasjidName(e.target.value)} placeholder="Contoh: Masjid Al-Ikhlas" className="w-full text-sm border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Unggah Berkas Logo PNG atau Tautan Gambar</label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                            <Upload size={14} className="text-emerald-600" /> Pilih Berkas Gambar PNG
                            <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          {tempMasjidLogoUrl && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">Gambar Siap Simpan</span>}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={tempMasjidLogoUrl} onChange={(e) => setTempMasjidLogoUrl(e.target.value)} placeholder="Atau tempel tautan gambar disini (https://...)" className="flex-1 text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                          {tempMasjidLogoUrl.trim() !== "" && (
                            <button type="button" onClick={() => { setTempMasjidLogoUrl(""); addNotification("Pratinjau logo kustom dibersihkan."); }} className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 rounded-xl border border-rose-200 text-xs font-bold">Reset</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button type="button" onClick={handleCancelNewIdentity} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                    <button type="button" onClick={handleSaveNewIdentity} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10">Simpan Perubahan</button>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                      {tempMasjidLogoUrl.trim() !== "" ? <img src={tempMasjidLogoUrl} alt="Pratinjau" className="w-8 h-8 object-contain rounded" /> : <KubahMasjidIcon className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold">
                      <p className="font-bold">Pratinjau Identitas Sementara:</p>
                      <p className="text-slate-500 mt-0.5">{tempMasjidName} (Logo: {tempMasjidLogoUrl.trim() !== "" ? "Gambar Kustom Terdeteksi" : "Menggunakan Kubah Masjid Default"})</p>
                    </div>
                  </div>
                </div>
              )}

              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <UserPlus className="text-emerald-600 w-5 h-5" />
                    <nav className="font-extrabold text-slate-900 text-sm">Pendaftaran Akun Pengurus Custom</nav>
                  </div>
                  <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Tampilan (Contoh: Bpk. Jufri)</label>
                      <input type="text" required placeholder="Nama Lengkap / Panggilan" value={newAccLabel} onChange={(e) => setNewAccLabel(e.target.value)} className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Username Baru</label>
                      <input type="text" required placeholder="username (huruf kecil)" value={newAccUsername} onChange={(e) => setNewAccUsername(e.target.value)} className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Password Baru</label>
                      <input type="text" required placeholder="Sandi minimal 6 karakter" value={newAccPassword} onChange={(e) => setNewAccPassword(e.target.value)} className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Tingkatan Peran (Role)</label>
                      <div className="flex gap-2">
                        <select value={newAccRole} onChange={(e) => setNewAccRole(e.target.value)} className="flex-1 text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-800">
                          <option value="Admin">Super Admin</option>
                          <option value="Takmir">Takmir Masjid</option>
                          <option value="Amil">Amil Zakat</option>
                          <option value="Jamaah">Jama'ah / Warga</option>
                        </select>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center transition-all">Tambah</button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Basis Data Kredensial Pengguna Terdaftar</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(userDatabase).map((usernameKey) => {
                        const userObj = userDatabase[usernameKey];
                        const isDefault = ["admin", "takmir", "amil", "jamaah"].includes(usernameKey);
                        return (
                          <div key={usernameKey} className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black text-slate-900">{userObj.label}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">User: <span className="font-extrabold text-slate-700">{usernameKey}</span> • Pass: {userObj.password}</p>
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1.5 ${userObj.role === 'Admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : userObj.role === 'Takmir' ? 'bg-teal-50 text-teal-700 border border-teal-100' : userObj.role === 'Amil' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-600'}`}>{rolesConfig[userObj.role]?.label || userObj.role}</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => { setEditingAccountPassword(usernameKey); setNewPasswordValue(userObj.password); }} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-all" title="Ubah Password Akun"><Edit2 size={13} /></button>
                              {!isDefault && <button onClick={() => handleDeleteAccount(usernameKey)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all" title="Hapus Akun"><Trash2 size={13} /></button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {editingAccountPassword && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-scaleIn">
                    <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Ubah Password Akun: @{editingAccountPassword}</h3>
                      <button onClick={() => setEditingAccountPassword(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                    </div>
                    <form onSubmit={handleSaveNewPassword} className="p-5 space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Password Baru *</label>
                        <input type="text" required placeholder="Masukkan password baru akun" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} className="w-full text-xs border border-slate-200 bg-slate-50/50 p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button type="button" onClick={() => setEditingAccountPassword(null)} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 text-[11px] font-bold rounded-lg hover:bg-slate-50">Batal</button>
                        <button type="submit" className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm">Simpan Password</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">Matriks Otoritas Otorisasi Modul</h3>
                  <p className="text-xs text-slate-400 font-medium">Batas akses hierarki ini tetap mengikat dan melindungi keamanan data sistem.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-4">Modul / Menu Website</th>
                        {Object.keys(rolesConfig).map((r) => ( <th key={r} className="p-4 text-center">{rolesConfig[r].label}</th> ))}
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
                          <td className="p-4 text-slate-900 font-bold">{menu.label}</td>
                          {Object.keys(rolesConfig).map((role) => {
                            const isAllowed = rolesConfig[role].access.includes(menu.id);
                            const isSelfAdminRbac = role === "Admin" && menu.id === "rbac";
                            return (
                              <td key={role} className="p-4 text-center">
                                <button type="button" disabled={isSelfAdminRbac || currentRole !== "Admin"} onClick={() => {
                                  setRolesConfig(prev => {
                                    const updatedAccess = isAllowed ? prev[role].access.filter(id => id !== menu.id) : [...prev[role].access, menu.id];
                                    return { ...prev, [role]: { ...prev[role], access: updatedAccess } };
                                  });
                                  addNotification(`Akses menu "${menu.label}" untuk peran ${rolesConfig[role].label} telah diubah!`);
                                }} className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${isAllowed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'} ${currentRole === "Admin" && !isSelfAdminRbac ? "hover:scale-105" : "cursor-not-allowed"}`}>
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
                <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-xs text-amber-850 space-y-1">
                    <p className="font-bold">Informasi Hak Akses Dinamis</p>
                    <p>Hanya peran <strong>Super Admin</strong> yang dapat mendaftarkan akun pengurus baru, mengaktifkan, atau menonaktifkan matriks hak akses di atas. Peran lainnya hanya dapat melihat tabel ini tanpa melakukan modifikasi.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* === FOOTER === */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400 font-semibold">
        &copy; {new Date().getFullYear()} {masjidName}. Dirancang khusus untuk pengelolaan zakat yang akuntabel, modern, dan transparan.
      </footer>

    </div>
  );
}
