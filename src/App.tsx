import React, { useState, useEffect } from 'react';
import { 
  Compass, Users, BookOpen, Gift, Heart, UserCheck, 
  Settings, Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  Clock, MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, Lock, KeyRound, User, Eye, EyeOff, UserPlus, Image, FileText,
  Phone, Send, MessageSquare, BellRing, Upload, Download, Smartphone, Menu
} from 'lucide-react';

// === SEED DATA LOKASI AWAL ===
const INITIAL_LOKASI = {
  provinsi: "Jawa Timur",
  kabupaten: "Lamongan",
  kecamatan: "Tikung"
};

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

// Data Jamaah disesuaikan dengan batasan wilayah (3 RT, 2 RW) dan 3 Kriteria Mustahik (Berat, Sedang, Ringan)
const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Berat" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "Sedang", zuru: "Sedang" },
  { id: "4", nama: "H. Abdul Rozak", anggota: 2, rt: "02", rw: "02", alamat: "Jl. Diponegoro No. 88", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" },
  { id: "5", nama: "Ustadz Hasan", anggota: 4, rt: "03", rw: "02", alamat: "Kamar Marbot Masjid", ekonomi: "Kurang Mampu", fitrah: "Ringan", zuru: "Bukan Mustahik" },
  { id: "6", nama: "Mbah Sutini", anggota: 1, rt: "03", rw: "01", alamat: "Gubuk RT 3", ekonomi: "Sangat Kurang", fitrah: "Berat", zuru: "Bukan Mustahik" },
  { id: "7", nama: "Andi Wijaya", anggota: 3, rt: "01", rw: "02", alamat: "Jl. Baru No. 17", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Ringan" }
];

// === TEMPLATE PETUGAS JUMAT ABADI (BERDASARKAN PASARAN JAWA) ===
const INITIAL_PETUGAS_ABADI = {
  Legi: {
    khatib: "KH. Syukron Ma'mun",
    imam: "Ustadz Ahmad Al-Hafiz",
    muadzin: "Bilal Hanafi",
    bilal: "Soleh",
    telp: "081234567890"
  },
  Pahing: {
    khatib: "Prof. Dr. KH. Said Aqil",
    imam: "Ustadz Hasanuddin",
    muadzin: "Zainal Abidin",
    bilal: "Rudi Yulianto",
    telp: "081398765432"
  },
  Pon: {
    khatib: "Ustadz Adi Hidayat, Lc",
    imam: "Ustadz Syihabuddin",
    muadzin: "H. Abdul Qodir",
    bilal: "Slamet",
    telp: "085711223344"
  },
  Wage: {
    khatib: "KH. Anwar Zahid",
    imam: "Ustadz Abdurrahman",
    muadzin: "Supardi",
    bilal: "Mulyono",
    telp: "089988776655"
  },
  Kliwon: {
    khatib: "KH. Bahauddin Nursalim (Gus Baha)",
    imam: "Ustadz Hasan Al-Banna",
    muadzin: "M. Thoriq",
    bilal: "Sidiq Prasetyo",
    telp: "082144332211"
  }
};

const PASARAN_LIST = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];

// === CUSTOM SVG MOSQUE LOGO ===
function KubahMasjidIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22h20" />
      <path d="M12 2v3" />
      <path d="M12 5a7 7 0 0 0-7 7v10h14V12a7 7 0 0 0-7-7Z" />
      <path d="M9 17h6v5H9z" />
      <path d="M5 22V15a3 3 0 0 1 3-3M19 22V15a3 3 0 0 0-3-3" />
      <circle cx="12" cy="1" r="0.5" fill="currentColor" />
    </svg>
  );
}

// Fungsi pembantu untuk memuat data dari LocalStorage dengan nilai fallback aman
const getLocalStorageData = (key, fallbackValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof fallbackValue === 'string' && typeof parsed !== 'string') {
        return fallbackValue;
      }
      return parsed;
    }
  } catch (error) {
    console.error("Gagal membaca LocalStorage key: " + key, error);
  }
  return fallbackValue;
};

export default function App() {
  // =========================================================
  // 1. SEMUA USESTATE DEKLARASI PALING ATAS (MEMAKAI LOCALSTORAGE)
  // =========================================================
  
  // --- STATE IDENTITAS MASJID CUSTOM ---
  const [masjidName, setMasjidName] = useState(() => getLocalStorageData("masjidName", "Masjid Al-Abadi"));
  const [masjidLogoUrl, setMasjidLogoUrl] = useState(() => getLocalStorageData("masjidLogoUrl", ""));

  // State Sementara untuk Form Identitas Masjid agar tidak langsung tersimpan saat diketik
  const [tempMasjidName, setTempMasjidName] = useState(() => getLocalStorageData("masjidName", "Masjid Al-Abadi"));
  const [tempMasjidLogoUrl, setTempMasjidLogoUrl] = useState(() => getLocalStorageData("masjidLogoUrl", ""));

  // --- STATE SYSTEM, AUTH & DYNAMIC USERS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("Admin");
  const [currentUserLabel, setCurrentUserLabel] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [rolesConfig, setRolesConfig] = useState(() => getLocalStorageData("rolesConfig", INITIAL_ROLES));
  const [userDatabase, setUserDatabase] = useState(() => getLocalStorageData("userDatabase", INITIAL_USER_DATABASE));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  
  // State Navigasi Hamburger (Garis 3) Drawer
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State Form Login
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State Form Tambah Akun (Admin Only)
  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");
  const [newAccRole, setNewAccRole] = useState("Jamaah");
  const [newAccLabel, setNewAccLabel] = useState("");

  // State Ubah Password Akun (Admin Only)
  const [editingAccountPassword, setEditingAccountPassword] = useState(null); 
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // --- STATE LOKASI & JADWAL SHOLAT ---
  const [lokasi, setLokasi] = useState(() => getLocalStorageData("lokasi", INITIAL_LOKASI));
  const [isSettingLokasi, setIsSettingLokasi] = useState(false);
  const [tempLokasi, setTempLokasi] = useState(() => getLocalStorageData("lokasi", INITIAL_LOKASI));
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE PETUGAS SHOLAT JUMAT ABADI ---
  const [petugasAbadi, setPetugasAbadi] = useState(() => getLocalStorageData("petugasAbadi", INITIAL_PETUGAS_ABADI));
  const [editingPasaran, setEditingPasaran] = useState(null);
  const [pasaranForm, setPasaranForm] = useState({
    khatib: "", imam: "", muadzin: "", bilal: "", telp: ""
  });

  // State Simulasi Notifikasi HP Petugas (WhatsApp & SMS)
  const [activeNotificationSim, setActiveNotificationSim] = useState(null);
  const [notificationType, setNotificationType] = useState("WA"); 
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showAndroidCode, setShowAndroidCode] = useState(false);

  // --- STATE DATA MASTER ---
  const [jamaahList, setJamaahList] = useState(() => getLocalStorageData("jamaahList", INITIAL_JAMAAH));

  // --- STATE MANAGEMENT ZAKAT FITRAH ---
  const [timbanganFitrah, setTimbanganFitrah] = useState(() => getLocalStorageData("timbanganFitrah", [25, 50, 15, 30]));
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  
  // State Parameter Penyaluran Fitrah (Telah berkomitmen)
  const [alokasiFitrah, setAlokasiFitrah] = useState(() => getLocalStorageData("alokasiFitrah", {
    "Berat": 5.0,
    "Sedang": 3.0,
    "Ringan": 1.5,
    "Muzakki": 0.0
  }));
  // State Sementara Rencana Penyaluran Fitrah (Sebelum ditekan tombol simpan)
  const [tempAlokasiFitrah, setTempAlokasiFitrah] = useState(() => getLocalStorageData("alokasiFitrah", {
    "Berat": 5.0,
    "Sedang": 3.0,
    "Ringan": 1.5,
    "Muzakki": 0.0
  }));

  // --- STATE MANAGEMENT ZAKAT ZURU' ---
  const [timbanganZuru, setTimbanganZuru] = useState(() => getLocalStorageData("timbanganZuru", [120, 250, 80]));
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  
  // State Parameter Penyaluran Zuru' (Telah berkomitmen)
  const [alokasiZuru, setAlokasiZuru] = useState(() => getLocalStorageData("alokasiZuru", {
    "Berat": 15.0,
    "Sedang": 10.0,
    "Ringan": 5.0,
    "Bukan Mustahik": 0.0
  }));
  // State Sementara Rencana Penyaluran Zuru' (Sebelum ditekan tombol simpan)
  const [tempAlokasiZuru, setTempAlokasiZuru] = useState(() => getLocalStorageData("alokasiZuru", {
    "Berat": 15.0,
    "Sedang": 10.0,
    "Ringan": 5.0,
    "Bukan Mustahik": 0.0
  }));

  // --- STATE MANAGEMENT QURBAN ---
  const [timbanganQurbanSapi, setTimbanganQurbanSapi] = useState(() => getLocalStorageData("timbanganQurbanSapi", [85.5, 120.0, 95.0, 65.5]));
  const [timbanganQurbanKambing, setTimbanganQurbanKambing] = useState(() => getLocalStorageData("timbanganQurbanKambing", [22.0, 18.5, 25.0]));
  const [tempBeratQurbanSapi, setTempBeratQurbanSapi] = useState("");
  const [tempBeratQurbanKambing, setTempBeratQurbanKambing] = useState("");
  const [filterWilayahQurban, setFilterWilayahQurban] = useState("Semua");
  const [qurbanHanyaMustahik, setQurbanHanyaMustahik] = useState(false);

  const [selectedPrintRT, setSelectedPrintRT] = useState("Semua");

  const [showJamaahModal, setShowJamaahModal] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState(null);
  const [jamaahForm, setJamaahForm] = useState({
    nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik"
  });

  // =========================================================
  // EFFECT UNTUK SYNCHRONIZE STATE KE LOCALSTORAGE SECARA OTOMATIS
  // =========================================================
  useEffect(() => {
    localStorage.setItem("masjidName", JSON.stringify(masjidName));
  }, [masjidName]);

  useEffect(() => {
    localStorage.setItem("masjidLogoUrl", JSON.stringify(masjidLogoUrl));
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

  // =========================================================
  // 2. FUNGSI UTILITAS DASAR & SINKRONISASI JADWAL
  // =========================================================

  const addNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const hasAccess = (tabName) => {
    return rolesConfig[currentRole]?.access.includes(tabName);
  };

  // PEMBATAS EDITING SPESIFIK: Super Admin memiliki kekuasaan mutlak untuk mem-bypass semua lock
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

  const [jadwalSholat, setJadwalSholat] = useState(() => getJadwalSholat(lokasi.kabupaten));

  useEffect(() => {
    setJadwalSholat(getJadwalSholat(lokasi.kabupaten));
  }, [lokasi]);

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

  const getPasaranJawa = (date) => {
    const anchor = new Date(2026, 0, 2); 
    const diffTime = date.getTime() - anchor.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    let pasaranIndex = (diffDays + 3) % 5;
    if (pasaranIndex < 0) pasaranIndex += 5;
    return PASARAN_LIST[pasaranIndex];
  };

  const getUpcomingFridays = (count = 5) => {
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

  const upcomingFridays = getUpcomingFridays(5);

  const getJumlahJiwaPerKategoriFitrah = (kategori) => {
    return jamaahList
      .filter(item => item.fitrah === kategori)
      .reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
  };

  const getJumlahJiwaPerKategoriZuru = (kategori) => {
    return jamaahList
      .filter(item => item.zuru === kategori)
      .reduce((sum, item) => sum + parseInt(item.anggota || 0), 0);
  };

  const totalTimbanganFitrah = timbanganFitrah.reduce((a, b) => a + b, 0);
  const rincianKebutuhanFitrah = Object.entries(alokasiFitrah).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriFitrah(kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhFitrah = rincianKebutuhanFitrah.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusFitrah = totalTimbanganFitrah - totalButuhFitrah;

  const totalTimbanganZuru = timbanganZuru.reduce((a, b) => a + b, 0);
  const rincianKebutuhanZuru = Object.entries(alokasiZuru).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriZuru(kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhZuru = rincianKebutuhanZuru.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusZuru = totalTimbanganZuru - totalButuhZuru;

  const totalTimbanganQurbanSapi = timbanganQurbanSapi.reduce((a, b) => a + b, 0);
  const totalTimbanganQurbanKambing = timbanganQurbanKambing.reduce((a, b) => a + b, 0);

  const getWargaPenerimaQurban = () => {
    return jamaahList.filter(warga => {
      if (filterWilayahQurban !== "Semua") {
        if (filterWilayahQurban.startsWith("RT")) {
          const filterRt = filterWilayahQurban.replace("RT ", "");
          if (warga.rt !== filterRt) return false;
        } else if (filterWilayahQurban.startsWith("RW")) {
          const filterRw = filterWilayahQurban.replace("RW ", "");
          if (warga.rw !== filterRw) return false;
        }
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
  // 3. HANDLER EVENT UTAMA (LOGIN, LOGOUT, JAMAAH)
  // =========================================================

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

  const handleQuickLogin = (roleKey) => {
    const acc = {
      Admin: { username: "admin", password: "admin123" },
      Takmir: { username: "takmir", password: "takmir123" },
      Amil: { username: "amil", password: "amil123" },
      Jamaah: { username: "jamaah", password: "jamaah123" }
    }[roleKey];

    if (acc) {
      setInputUsername(acc.username);
      setInputPassword(acc.password);
      addNotification(`Form pengujian ${roleKey} diisi otomatis. Klik tombol Masuk.`);
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
    setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" });
  };

  const handleEditJamaah = (jamaah) => {
    setEditingJamaah(jamaah);
    setJamaahForm(jamaah);
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

  const handlePrepareNotification = (fridayData, type) => {
    setNotificationType(type);
    let msg = "";
    if (type === "WA") {
      msg = `Assalamualaikum Wr. Wb. Yth. *${fridayData.petugas.khatib}*, menginfokan bahwa besok (hari Jumat ${fridayData.pasaran}, tanggal ${fridayData.formattedDate.replace(/^Jumat, /, "")}) adalah jadwal bapak bertugas sebagai *Khatib Sholat Jumat*. Mohon hadir 15 menit sebelum adzan berkumandang. Terima kasih. Wassalamualaikum Wr. Wb.`;
    } else {
      msg = `[MASJID AL-ABADI] Yth ${fridayData.petugas.khatib}, mengingatkan kembali besok Jumat ${fridayData.pasaran} jadwal bapak bertugas Khatib & Imam di masjid. Harap hadir 15 menit sebelum adzan. Terima kasih.`;
    }
    setSimulatedMessageText(msg);
    setActiveNotificationSim(fridayData);
  };

  const handleSendSimMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      addNotification(`Notifikasi ${notificationType} H-1 pengingat sukses terkirim ke ${activeNotificationSim.petugas.khatib} (${activeNotificationSim.petugas.telp})!`, "success");
      setActiveNotificationSim(null);
    }, 1500);
  };

  const addTimbangan = (tipe) => {
    if (tipe === 'fitrah') {
      const val = parseFloat(tempBeratFitrah);
      if (isNaN(val) || val <= 0) return;
      setTimbanganFitrah(prev => [...prev, val]);
      setTempBeratFitrah("");
      addNotification("Timbangan Zakat Fitrah berhasil ditambahkan");
    } else if (tipe === 'zuru') {
      const val = parseFloat(tempBeratZuru);
      if (isNaN(val) || val <= 0) return;
      setTimbanganZuru(prev => [...prev, val]);
      setTempBeratZuru("");
      addNotification("Timbangan Zuru' berhasil ditambahkan");
    } else if (tipe === 'qurbanSapi') {
      const val = parseFloat(tempBeratQurbanSapi);
      if (isNaN(val) || val <= 0) return;
      setTimbanganQurbanSapi(prev => [...prev, val]);
      setTempBeratQurbanSapi("");
      addNotification("Timbangan perolehan daging sapi berhasil ditambahkan");
    } else if (tipe === 'qurbanKambing') {
      const val = parseFloat(tempBeratQurbanKambing);
      if (isNaN(val) || val <= 0) return;
      setTimbanganQurbanKambing(prev => [...prev, val]);
      setTempBeratQurbanKambing("");
      addNotification("Timbangan perolehan daging kambing berhasil ditambahkan");
    }
  };

  const deleteTimbangan = (tipe, index) => {
    if (tipe === 'fitrah') {
      setTimbanganFitrah(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan Fitrah dihapus", "warning");
    } else if (tipe === 'zuru') {
      setTimbanganZuru(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan Zuru' diurungkan", "warning");
    } else if (tipe === 'qurbanSapi') {
      setTimbanganQurbanSapi(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan daging sapi berhasil dihapus", "warning");
    } else if (tipe === 'qurbanKambing') {
      setTimbanganQurbanKambing(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan daging kambing berhasil dihapus", "warning");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/png") {
      addNotification("Harap pilih berkas gambar berformat khusus PNG (.png)!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempMasjidLogoUrl(reader.result);
      addNotification("Berkas logo PNG sukses diunggah ke memori sementara. Tekan 'Simpan Perubahan' untuk menerapkan!", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAlokasiFitrah = () => {
    setAlokasiFitrah(tempAlokasiFitrah);
    addNotification("Rencana jatah penyaluran Zakat Fitrah (Beras) berhasil diperbarui & disimpan!", "success");
  };

  const handleSaveAlokasiZuru = () => {
    setAlokasiZuru(tempAlokasiZuru);
    addNotification("Rencana jatah penyaluran Zakat Zuru' berhasil diperbarui & disimpan!", "success");
  };

  const handlePrintSelectedReport = (reportType) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addNotification("Gagal membuka jendela cetak! Periksa pengaturan pemblokir pop-up browser Anda.", "error");
      return;
    }

    const filteredWarga = selectedPrintRT === "Semua" 
      ? jamaahList 
      : jamaahList.filter(j => j.rt === selectedPrintRT);

    const rtTitle = selectedPrintRT === "Semua" ? "Seluruh Wilayah (RT 01-03)" : `RT ${selectedPrintRT}`;
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
          <th class="p-2.5 border border-slate-300 w-1.5/12 text-right">Daging Sapi</th>
          <th class="p-2.5 border border-slate-300 w-1.5/12 text-right">Daging Kambing</th>
          <th class="p-2.5 border border-slate-300 w-3/12 text-center">Tanda Tangan / Paraf</th>
        </tr>
      `;

      const qurbanList = filteredWarga.filter(warga => {
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
          <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-rose-700">${localJatahSapi} Kg</td>
          <td class="p-2.5 border border-slate-300 text-right font-mono font-bold text-amber-700">${localJatahKambing} Kg</td>
          <td class="p-2.5 border border-slate-300 text-left font-mono text-[9px] text-slate-300 relative h-12">
            <span class="absolute bottom-1 left-2">${i + 1}.</span>
          </td>
        </tr>
      `).join('') : `<tr><td colspan="6" class="p-8 text-center text-slate-400 italic">Tidak ada warga penerima daging qurban pada wilayah terpilih ini.</td></tr>`;
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
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Kec. Tikung, Kab. Lamongan, Provinsi Jawa Timur</p>
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

    const groupedByRT = {};
    ["01", "02", "03"].forEach(rt => {
      groupedByRT[rt] = wargaPenerimaQurban.filter(w => w.rt === rt);
    });

    const html = `
      <html>
        <head>
          <title>Daftar Distribusi Daging Qurban per RT - ${masjidName}</title>
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
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Wilayah: ${lokasi.kecamatan}, ${lokasi.kabupaten}, ${lokasi.provinsi}</p>
              </div>
            </div>
            <div class="text-right text-xs text-slate-400 font-semibold font-mono">
              <p>Tanggal Cetak:</p>
              <p class="text-slate-900 font-bold">${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            </div>
          </div>

          <div class="text-center mb-8">
            <h2 class="text-lg font-bold uppercase text-rose-800 tracking-wide">Daftar Penerima & Tanda Terima Distribusi Hewan Qurban (Terpisah)</h2>
            <p class="text-xs text-slate-500 mt-1">Total Timbangan: Sapi ${totalTimbanganQurbanSapi.toFixed(1)} Kg | Kambing ${totalTimbanganQurbanKambing.toFixed(1)} Kg</p>
          </div>
          
          ${Object.entries(groupedByRT).map(([rt, list]) => `
            <div class="mb-10 avoid-break">
              <div class="bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl mb-3 flex justify-between items-center">
                <h3 class="text-sm font-black text-rose-800 uppercase tracking-wide">Rukun Tetangga (RT) ${rt}</h3>
                <span class="text-xs font-bold bg-white text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg">Kapasitas: ${list.length} KK Penerima</span>
              </div>
              
              <table class="w-full text-left text-xs border border-collapse border-slate-300">
                <thead>
                  <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th class="p-2 border border-slate-300 w-1/12 text-center">No</th>
                    <th class="p-2 border border-slate-300 w-3/12">Nama Kepala Keluarga</th>
                    <th class="p-2 border border-slate-300 w-2/12 text-center">RT / RW</th>
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
                      <td class="p-2 border border-slate-300 text-center font-bold">RT ${w.rt} / RW ${w.rw}</td>
                      <td class="p-2 border border-slate-300 text-slate-500 text-[10px]">${w.alamat}</td>
                      <td class="p-2 border border-slate-300 text-right font-mono font-bold text-rose-700">${jatahDagingSapiPerKK} Kg</td>
                      <td class="p-2 border border-slate-300 text-right font-mono font-bold text-amber-700">${jatahDagingKambingPerKK} Kg</td>
                      <td class="p-2 border border-slate-300 h-10 text-center text-slate-300 font-mono text-[9px] relative">
                        <span class="absolute bottom-1 left-2">${index + 1}.</span>
                      </td>
                    </tr>
                  `).join('') : `
                    <tr>
                      <td colspan="7" class="p-4 text-center text-slate-400 italic">Tidak ada warga penerima di RT ini.</td>
                    </tr>
                  `}
                </tbody>
              </table>
            </div>
          `).join('')}

          <div class="mt-12 flex justify-between text-xs font-semibold avoid-break">
            <div>
              <p>Mengetahui,</p>
              <p class="mt-16 border-t border-slate-800 pt-1 w-48 font-bold text-slate-900 text-center">Ketua Takmir Masjid</p>
            </div>
            <div class="text-right">
              <p>${lokasi.kabupaten}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
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

  // --- CLOCK EFFECTS ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // =========================================================
  // 5. RENDER SEBELUM LOGIN (HALAMAN LOGIN BERSIH - FORM AMAN)
  // =========================================================
  if (!isLoggedIn) {
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

        {/* Card Login Utama (DEMO ACCOUNTS TELAH DIHAPUS SEPENUHNYA SESUAI PERMINTAAN USER) */}
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
                  className="w-full text-sm border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all"
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
                  className="w-full text-sm border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold transition-all"
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
  // 6. RENDER SETELAH LOGIN (DASBOR & MENU UTAMA)
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
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Aplikasi Manajemen Terpadu</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200/60 text-slate-700 text-xs font-semibold flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Clock className="text-emerald-600 w-4 h-4" />
              <span className="font-mono text-sm tracking-widest font-black">{currentTime.toLocaleTimeString()}</span>
            </div>
            {upcomingFridays.length > 0 && (
              <span className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                Khatib: <strong className="text-emerald-700">{upcomingFridays[0].petugas.khatib}</strong> ({upcomingFridays[0].pasaran})
              </span>
            )}
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

      {/* === DRAWER MENU NAVIGASI (SLIDE-OUT SISI KIRI) === */}
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
      <div className="flex-1 flex flex-col md:flex-row">
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* TAB 1: DASHBOARD UTAMA (STATISTIK TELAH DIHAPUS SEPENUHNYA) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-700/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-300 w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-200">Lokasi Penentuan Jadwal Sholat</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{lokasi.kecamatan}, {lokasi.kabupaten}, {lokasi.provinsi}</h2>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Provinsi</label>
                      <input type="text" value={tempLokasi.provinsi} onChange={(e) => setTempLokasi({...tempLokasi, provinsi: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kabupaten / Kota</label>
                      <input type="text" value={tempLokasi.kabupaten} onChange={(e) => setTempLokasi({...tempLokasi, kabupaten: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kecamatan / Desa</label>
                      <input type="text" value={tempLokasi.kecamatan} onChange={(e) => setTempLokasi({...tempLokasi, kecamatan: e.target.value})} className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button onClick={() => setIsSettingLokasi(false)} className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all">Batal</button>
                    <button onClick={() => { setLokasi(tempLokasi); setIsSettingLokasi(false); addNotification("Lokasi masjid berhasil dikonfigurasi ulang!"); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10">Terapkan Perubahan</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-950 flex items-center gap-2"><Clock className="text-emerald-600 w-5 h-5" /> Jadwal Sholat Hari Ini</h3>
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
                  <h3 className="font-bold text-slate-950 flex items-center gap-2"><Calendar className="text-emerald-600 w-5 h-5" /> Penjadwalan Petugas Jumat Pekan Ini</h3>
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
                          <p className="text-slate-800 text-sm font-bold">{upcomingFridays[0].petugas.muadzin}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px]">Bilal / MC</p>
                          <p className="text-slate-800 text-sm font-bold">{upcomingFridays[0].petugas.bilal}</p>
                        </div>
                      </div>
                    </div>
                  ) : ( <p className="text-xs text-slate-400">Belum ada agenda petugas sholat Jumat.</p> )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-950 flex items-center gap-2"><UsersRound className="text-emerald-600 w-5 h-5" /> Sebaran Jiwa Mustahik (Basis RT)</h3>
                  <div className="space-y-2">
                    {["Berat", "Sedang", "Ringan"].map((asnaf) => {
                      const fitrahCount = getJumlahJiwaPerKategoriFitrah(asnaf);
                      const zuruCount = getJumlahJiwaPerKategoriZuru(asnaf);
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

          {/* TAB 2: PETUGAS SHOLAT JUMAT (EDIT PETUGAS BERHASIL AKTIF) */}
          {activeTab === "petugas" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Konfigurasi Petugas Sholat Jumat Abadi</h2>
                  <p className="text-xs text-slate-500">Sistem otomatis mengikat petugas berdasarkan 5 Hari Pasaran Jawa. Tidak perlu membuat jadwal mingguan baru selamanya!</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <BellRing className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold">Sistem Notifikasi Pengingat Otomatis H-1 (Hari Kamis)</p>
                    <p className="text-amber-700">Simulasikan pengiriman pesan pengingat WhatsApp atau SMS Gateway Android ke ponsel petugas dengan menekan tombol kirim di bawah.</p>
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
                            {/* PENGAKTIFAN FITUR EDIT SECARA GRANULAR BAGI ADMIN & PETUGAS */}
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
                        {data.telp && ( <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-semibold"><Phone size={10} /><span>{data.telp}</span></div> )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Daftar Riil Sholat Jumat Mendatang & Kirim Notifikasi H-1 (LIHAT SEMUA PETUGAS)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="pb-3">Tanggal Sholat</th>
                        <th className="pb-3">Kombinasi Pasaran Jawa</th>
                        <th className="pb-3">Khatib & Imam Cadangan</th>
                        <th className="pb-3">Muadzin & Bilal</th>
                        <th className="pb-3 text-center">Pemicu Notifikasi H-1 (Hari Kamis)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {upcomingFridays.map((friday, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3 text-slate-900 font-bold">{friday.formattedDate}</td>
                          <td className="py-3"><span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">Jumat {friday.pasaran}</span></td>
                          <td className="py-3"><p className="font-bold text-slate-950">Khatib: {friday.petugas.khatib}</p><p className="text-slate-500 font-medium text-[11px]">Imam Cad: {friday.petugas.imam}</p></td>
                          <td className="py-3"><p className="text-slate-800">Muadzin: <strong>{friday.petugas.muadzin}</strong></p><p className="text-slate-500">Bilal: {friday.petugas.bilal}</p></td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handlePrepareNotification(friday, "WA")} className="bg-[#128c7e] hover:bg-[#075e54] text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] inline-flex items-center gap-1 transition-all shadow-sm" title="Simulasi WhatsApp"><MessageSquare size={11} />Kirim WA</button>
                              <button onClick={() => handlePrepareNotification(friday, "SMS")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] inline-flex items-center gap-1 transition-all shadow-sm" title="Simulasi SMS Gateway"><Smartphone size={11} />Kirim SMS</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            </div>
          )}

          {/* TAB 3: DATA JAMAAH (EDIT WARGA BERHASIL AKTIF) */}
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
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Pilih Wilayah RT yang Mau Dicetak:</label>
                    <select value={selectedPrintRT} onChange={(e) => setSelectedPrintRT(e.target.value)} className="w-full text-xs border border-slate-200 bg-white p-3 rounded-xl outline-none font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500">
                      <option value="Semua">Semua RT (RT 01, RT 02, dan RT 03 Sekaligus)</option>
                      <option value="01">Hanya Wilayah RT 01</option>
                      <option value="02">Hanya Wilayah RT 02</option>
                      <option value="03">Hanya Wilayah RT 03</option>
                    </select>
                  </div>

                  <div className="flex-2 flex flex-wrap gap-2">
                    <button onClick={() => handlePrintSelectedReport("jamaah")} className="bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Jamaah</button>
                    <button onClick={() => handlePrintSelectedReport("fitrah")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Fitrah</button>
                    <button onClick={() => handlePrintSelectedReport("zuru")} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Zuru'</button>
                    <button onClick={() => handlePrintSelectedReport("qurban")} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"><Download size={14} />Cetak Qurban</button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Database Jemaah Berbasis RT/RW</h2>
                  <p className="text-xs text-slate-500">Sistem database jemaah kustom yang dibatasi pada **3 RT** (RT 01, 02, 03) dan **2 RW** (RW 01, 02).</p>
                </div>
                {/* DIPERBAIKI: HAK AKSES DISINKRONKAN AGAR ADMIN BISA MENAMBAH DENGAN LANCAR */}
                {canEditJamaah && (
                  <button onClick={() => { setEditingJamaah(null); setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" }); setShowJamaahModal(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow shadow-emerald-600/10 hover:scale-102">
                    <Plus size={16} /> Tambah Warga Baru
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
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
                        {canEditJamaah && <th className="p-4 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {jamaahList.map((item) => (
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
                          {/* DIPERBAIKI: HAK AKSES PENGEDITAN JAMAAH VALID */}
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
                    <form onSubmit={handleSaveJamaah} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Nama Kepala Keluarga *</label>
                          <input type="text" placeholder="Masukkan nama Kepala Keluarga" required value={jamaahForm.nama} onChange={(e) => setJamaahForm({...jamaahForm, nama: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Jiwa</label>
                            <input type="number" min="1" required value={jamaahForm.anggota} onChange={(e) => setJamaahForm({...jamaahForm, anggota: parseInt(e.target.value) || 1})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">RT (Maks 3 RT)</label>
                            <select value={jamaahForm.rt} onChange={(e) => setJamaahForm({...jamaahForm, rt: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-bold">
                              {["01", "02", "03"].map(rt => ( <option key={rt} value={rt}>RT {rt}</option> ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">RW (Maks 2 RW)</label>
                            <select value={jamaahForm.rw} onChange={(e) => setJamaahForm({...jamaahForm, rw: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-bold">
                              {["01", "02"].map(rw => ( <option key={rw} value={rw}>RW {rw}</option> ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Rumah *</label>
                          <textarea placeholder="Alamat lengkap warga" required rows="2" value={jamaahForm.alamat} onChange={(e) => setJamaahForm({...jamaahForm, alamat: e.target.value})} className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold resize-none" />
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
                            <select value={jamaahForm.fitrah} onChange={(e) => setJamaahForm({...jamaahForm, fitrah: e.target.value})} className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-emerald-800">
                              <option value="Muzakki">Muzakki (Bukan Penerima)</option>
                              <option value="Berat">Mustahik Berat</option>
                              <option value="Sedang">Mustahik Sedang</option>
                              <option value="Ringan">Mustahik Ringan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1">Klasifikasi Mustahik Zuru'</label>
                            <select value={jamaahForm.zuru} onChange={(e) => setJamaahForm({...jamaahForm, zuru: e.target.value})} className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-teal-800">
                              <option value="Bukan Mustahik">Bukan Mustahik Zuru'</option>
                              <option value="Berat">Mustahik Berat</option>
                              <option value="Sedang">Mustahik Sedang</option>
                              <option value="Ringan">Mustahik Ringan</option>
                            </select>
                          </div>
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

          {/* TAB 4: ZAKAT FITRAH (BERAS) */}
          {activeTab === "fitrah" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Pengelolaan Zakat Fitrah (Beras)</h2>
                <p className="text-xs text-slate-500">Log timbangan berkala, totalisasi penerimaan otomatis, dan rencana penyaluran asnaf (Berat, Sedang, Ringan).</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Log Timbangan Masuk */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Log Timbangan Fitrah Masuk</h3>
                  {canEditFitrah ? (
                    <div className="flex gap-2">
                      <input type="number" step="0.1" placeholder="Berat (kg)" value={tempBeratFitrah} onChange={(e) => setTempBeratFitrah(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('fitrah')} className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500" />
                      <button onClick={() => addTimbangan('fitrah')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl font-bold text-xs transition-all">Tambah</button>
                    </div>
                  ) : <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">Hanya Amil Zakat yang memiliki hak menambahkan data.</p>}

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {timbanganFitrah.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan # {index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 font-extrabold">{berat} Kg</span>
                          {canEditFitrah && (
                            <button onClick={() => deleteTimbangan('fitrah', index)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100/40 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-emerald-800 font-extrabold uppercase">Total Beras Terkumpul</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">{totalTimbanganFitrah.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* Rencana Penyaluran */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-2 gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">Rencana Penyaluran & Ketersediaan Beras</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">Status Kebutuhan:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${statusFitrah >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {statusFitrah >= 0 ? `SISA BERAS SURPLUS ${statusFitrah.toFixed(1)} Kg` : `BERAS KURANG ${(Math.abs(statusFitrah)).toFixed(1)} Kg`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Parameter Pembagian Jatah per Jiwa (Zakat Fitrah)</p>
                      {canEditFitrah && (
                        <button onClick={handleSaveAlokasiFitrah} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"><Check size={12} />Simpan Rencana Penyaluran</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {["Berat", "Sedang", "Ringan"].map((k) => (
                        <div key={k} className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                          <p className="text-slate-500 font-bold">Kriteria {k}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <input type="number" step="0.5" min="0" disabled={!canEditFitrah} value={tempAlokasiFitrah[k]} onChange={(e) => setTempAlokasiFitrah({...tempAlokasiFitrah, [k]: parseFloat(e.target.value) || 0})} className="w-full font-extrabold text-sm text-slate-800 outline-none bg-transparent border-b border-dashed border-slate-200 focus:border-emerald-500" />
                            <span className="text-slate-400 font-bold text-[10px]">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Kategori Mustahik</th>
                          <th className="pb-2 text-center">Jumlah Jiwa (Database)</th>
                          <th className="pb-2 text-center">Jatah / Jiwa (Committed)</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {rincianKebutuhanFitrah.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900 font-bold">Mustahik {item.kategori}</td>
                            <td className="py-2.5 text-center text-slate-800">{item.jumlahJiwa} Orang</td>
                            <td className="py-2.5 text-center text-emerald-700">{item.jatah} Kg</td>
                            <td className="py-2.5 text-right font-bold text-slate-900">{item.totalButuh} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-black text-slate-900">
                          <td className="p-2.5" colSpan="3">Total Seluruh Kebutuhan Penyaluran</td>
                          <td className="p-2.5 text-right text-emerald-800">{totalButuhFitrah} Kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* === TAB 5: ZAKAT ZURU' === */}
          {activeTab === "zuru" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Pengelolaan Zakat Zuru' (Pertanian / Hasil Panen)</h2>
                <p className="text-xs text-slate-500">Log timbangan berkala, totalisasi penerimaan otomatis, dan rencana penyaluran asnaf (Berat, Sedang, Ringan).</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Log Timbangan Zuru' Masuk</h3>
                  {canEditZuru ? (
                    <div className="flex gap-2">
                      <input type="number" step="0.5" placeholder="Berat (kg)" value={tempBeratZuru} onChange={(e) => setTempBeratZuru(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('zuru')} className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-teal-500" />
                      <button onClick={() => addTimbangan('zuru')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-xl font-bold text-xs transition-all">Tambah</button>
                    </div>
                  ) : <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">Hanya Amil Zakat yang memiliki hak menambahkan data.</p>}

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {timbanganZuru.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan # {index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 font-extrabold">{berat} Kg</span>
                          {canEditZuru && (
                            <button onClick={() => deleteTimbangan('zuru', index)} className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-teal-800 font-extrabold uppercase">Total Zuru' Terkumpul</span>
                    <span className="text-2xl font-black text-teal-700 font-mono">{totalTimbanganZuru.toFixed(1)} Kg</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-2 gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">Rencana Penyaluran & Ketersediaan Hasil Pertanian</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">Status Kebutuhan:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${statusZuru >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'}`}>
                        {statusZuru >= 0 ? `SISA ZURU SURPLUS ${statusZuru.toFixed(1)} Kg` : `ZURU KURANG ${(Math.abs(statusZuru)).toFixed(1)} Kg`}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Parameter Pembagian Jatah per Jiwa (Zakat Zuru')</p>
                      {canEditZuru && (
                        <button onClick={handleSaveAlokasiZuru} className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"><Check size={12} />Simpan Rencana Penyaluran</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {["Berat", "Sedang", "Ringan"].map((k) => (
                        <div key={k} className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                          <p className="text-slate-400 font-bold">Kriteria {k}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <input type="number" step="0.5" min="0" disabled={!canEditZuru} value={tempAlokasiZuru[k]} onChange={(e) => setTempAlokasiZuru({...tempAlokasiZuru, [k]: parseFloat(e.target.value) || 0})} className="w-full font-extrabold text-sm text-slate-800 outline-none bg-transparent border-b border-dashed border-slate-200 focus:border-teal-500" />
                            <span className="text-slate-400 font-bold text-[10px]">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Kriteria Mustahik Zuru'</th>
                          <th className="pb-2 text-center">Jumlah Jiwa (Database)</th>
                          <th className="pb-2 text-center">Jatah / Jiwa (Committed)</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {rincianKebutuhanZuru.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900 font-bold">Mustahik {item.kategori}</td>
                            <td className="py-2.5 text-center text-slate-800">{item.jumlahJiwa} Orang</td>
                            <td className="py-2.5 text-center text-teal-700">{item.jatah} Kg</td>
                            <td className="py-2.5 text-right font-bold text-slate-900">{item.totalButuh} Kg</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-black text-slate-900">
                          <td className="p-2.5" colSpan="3">Total Seluruh Kebutuhan Penyaluran</td>
                          <td className="p-2.5 text-right text-teal-800">{totalButuhZuru} Kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === TAB 6: DISTRIBUSI QURBAN === */}
          {activeTab === "qurban" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Pengelolaan & Distribusi Daging Qurban Terpadu</h2>
                  <p className="text-xs text-slate-500">Log timbangan berkala perolehan daging Sapi & Kambing secara terpisah untuk pemerataan pembagian jatah KK.</p>
                </div>
                <button onClick={handlePrintQurbanRT} className="bg-slate-800 hover:bg-slate-955 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
                  <Download size={15} /> Download PDF Distribusi per RT
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
                      <input type="number" step="0.1" placeholder="Berat Daging Sapi (kg)" value={tempBeratQurbanSapi} onChange={(e) => setTempBeratQurbanSapi(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurbanSapi')} className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-rose-500" />
                      <button onClick={() => addTimbangan('qurbanSapi')} className="bg-rose-600 hover:bg-rose-700 text-white px-4 rounded-xl font-bold text-xs transition-all">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Sapi.</p>}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                      <button onClick={() => addTimbangan('qurbanKambing')} className="bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-xl font-bold text-xs transition-all">Tambah</button>
                    </div>
                  ) : <p className="text-[10px] text-amber-500 bg-amber-50 border border-amber-100 p-2 rounded-lg font-bold">Hanya Panitia yang memiliki hak menambahkan timbangan Kambing.</p>}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {timbanganQurbanKambing.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 px-3 py-2 rounded-xl text-xs font-semibold">
                        <span className="text-slate-400">Timbangan Kambing #{index + 1}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-900 font-extrabold">{berat} Kg</span>
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
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Filter & Alokasi Jatah per KK Terpilih</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Filter Wilayah Distribusi</label>
                    <select value={filterWilayahQurban} onChange={(e) => setFilterWilayahQurban(e.target.value)} className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-bold text-slate-700">
                      <option value="Semua">Semua RT / RW (Seluruh Jamaah)</option>
                      <option value="RT 01">Hanya RT 01</option>
                      <option value="RT 02">Hanya RT 02</option>
                      <option value="RT 03">Hanya RT 03</option>
                      <option value="RW 01">Hanya RW 01</option>
                      <option value="RW 02">Hanya RW 02</option>
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
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">Jumlah Penerima</p>
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
              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
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
                            <input type="file" accept="image/png" onChange={handleLogoUpload} className="hidden" />
                          </label>
                          {tempMasjidLogoUrl && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">Gambar Siap Disimpan</span>}
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
                    <button type="button" onClick={() => { setTempMasjidName(masjidName); setTempMasjidLogoUrl(masjidLogoUrl); addNotification("Perubahan identitas dibatalkan.", "warning"); }} className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                    <button type="button" onClick={() => { if (!tempMasjidName.trim()) { addNotification("Nama Masjid tidak boleh kosong!", "error"); return; } setMasjidName(tempMasjidName); setMasjidLogoUrl(tempMasjidLogoUrl); addNotification("Identitas dan Logo Masjid berhasil diperbarui!", "success"); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10">Simpan Perubahan</button>
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
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
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
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-xs text-amber-800 space-y-1">
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
