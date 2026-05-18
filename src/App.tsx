import React, { useState, useEffect } from 'react';
import { 
  Compass, Users, BookOpen, Gift, Heart, UserCheck, 
  Settings, Trash2, Plus, Edit2, Check, X, AlertTriangle, 
  Clock, MapPin, Printer, UsersRound, Calendar, Coins,
  LogOut, Lock, KeyRound, User, Eye, EyeOff, UserPlus, Image, FileText,
  Phone, Send, MessageSquare, BellRing, Upload
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

// Data Jamaah disesuaikan dengan batasan wilayah baru: 3 RT (01, 02, 03) dan 2 RW (01, 02)
const INITIAL_JAMAAH = [
  { id: "1", nama: "Ahmad Subarjo", anggota: 4, rt: "01", rw: "01", alamat: "Jl. Masjid No. 12", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" },
  { id: "2", nama: "Slamet Rahardjo", anggota: 3, rt: "01", rw: "01", alamat: "Gang Kelinci No. 2", ekonomi: "Sangat Kurang", fitrah: "1. Fakir", zuru: "1. Fakir" },
  { id: "3", nama: "Budi Santoso", anggota: 5, rt: "02", rw: "01", alamat: "Jl. Mangga No. 5", ekonomi: "Kurang Mampu", fitrah: "2. Miskin", zuru: "2. Miskin" },
  { id: "4", nama: "H. Abdul Rozak", anggota: 2, rt: "02", rw: "02", alamat: "Jl. Diponegoro No. 88", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" },
  { id: "5", nama: "Ustadz Hasan", anggota: 4, rt: "03", rw: "02", alamat: "Kamar Marbot Masjid", ekonomi: "Kurang Mampu", fitrah: "7. Fisabilillah", zuru: "Bukan Mustahik" },
  { id: "6", nama: "Mbah Sutini", anggota: 1, rt: "03", rw: "01", alamat: "Gubuk RT 3", ekonomi: "Sangat Kurang", fitrah: "1. Fakir", zuru: "Bukan Mustahik" },
  { id: "7", nama: "Andi Wijaya", anggota: 3, rt: "01", rw: "02", alamat: "Jl. Baru No. 17", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "6. Gharim" }
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

export default function App() {
  // =========================================================
  // 1. SEMUA USESTATE DEKLARASI PALING ATAS
  // =========================================================
  
  // --- STATE IDENTITAS MASJID CUSTOM ---
  const [masjidName, setMasjidName] = useState("Masjid Al-Abadi");
  const [masjidLogoUrl, setMasjidLogoUrl] = useState("");

  // State Sementara untuk Form Identitas Masjid agar tidak langsung tersimpan saat diketik
  const [tempMasjidName, setTempMasjidName] = useState("Masjid Al-Abadi");
  const [tempMasjidLogoUrl, setTempMasjidLogoUrl] = useState("");

  // --- STATE SYSTEM, AUTH & DYNAMIC USERS ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("Admin");
  const [currentUserLabel, setCurrentUserLabel] = useState("");
  const [currentUserUsername, setCurrentUserUsername] = useState("");
  const [rolesConfig, setRolesConfig] = useState(INITIAL_ROLES);
  const [userDatabase, setUserDatabase] = useState(INITIAL_USER_DATABASE);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  
  // State Form Login
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State Form Tambah Akun (Admin Only)
  const [newAccUsername, setNewAccUsername] = useState("");
  const [newAccPassword, setNewAccPassword] = useState("");
  const [newAccRole, setNewAccRole] = useState("Jamaah");
  const [newAccLabel, setNewAccLabel] = useState("");

  // --- STATE LOKASI & JADWAL SHOLAT ---
  const [lokasi, setLokasi] = useState(INITIAL_LOKASI);
  const [isSettingLokasi, setIsSettingLokasi] = useState(false);
  const [tempLokasi, setTempLokasi] = useState(INITIAL_LOKASI);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- STATE PETUGAS SHOLAT JUMAT ABADI ---
  const [petugasAbadi, setPetugasAbadi] = useState(INITIAL_PETUGAS_ABADI);
  const [editingPasaran, setEditingPasaran] = useState(null);
  const [pasaranForm, setPasaranForm] = useState({
    khatib: "", imam: "", muadzin: "", bilal: "", telp: ""
  });

  // State Simulasi Notifikasi HP Petugas
  const [activeNotificationSim, setActiveNotificationSim] = useState(null);
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // --- STATE DATA MASTER ---
  const [jamaahList, setJamaahList] = useState(INITIAL_JAMAAH);

  // --- STATE MANAGEMENT ZAKAT FITRAH ---
  const [timbanganFitrah, setTimbanganFitrah] = useState([25, 50, 15, 30]);
  const [tempBeratFitrah, setTempBeratFitrah] = useState("");
  const [alokasiFitrah, setAlokasiFitrah] = useState({
    "1. Fakir": 5.0,
    "2. Miskin": 3.0,
    "3. Amil": 2.5,
    "4. Muallaf": 3.0,
    "5. Riqab": 0.0,
    "6. Gharim": 2.5,
    "7. Fisabilillah": 3.0,
    "8. Ibnu Sabil": 2.5,
    "Muzakki": 0.0
  });

  // --- STATE MANAGEMENT ZAKAT ZURU' ---
  const [timbanganZuru, setTimbanganZuru] = useState([120, 250, 80]);
  const [tempBeratZuru, setTempBeratZuru] = useState("");
  const [alokasiZuru, setAlokasiZuru] = useState({
    "1. Fakir": 15.0,
    "2. Miskin": 10.0,
    "3. Amil": 8.0,
    "4. Muallaf": 10.0,
    "5. Riqab": 0.0,
    "6. Gharim": 8.0,
    "7. Fisabilillah": 10.0,
    "8. Ibnu Sabil": 8.0,
    "Bukan Mustahik": 0.0
  });

  // --- STATE MANAGEMENT QURBAN ---
  const [timbanganQurban, setTimbanganQurban] = useState([85.5, 120.0, 45.0, 95.0, 65.5]);
  const [tempBeratQurban, setTempBeratQurban] = useState("");
  const [filterWilayahQurban, setFilterWilayahQurban] = useState("Semua"); // Menyatukan RT & RW di filter
  const [qurbanHanyaMustahik, setQurbanHanyaMustahik] = useState(false);

  // --- FORM STATE JAMAAH ---
  const [showJamaahModal, setShowJamaahModal] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState(null);
  const [jamaahForm, setJamaahForm] = useState({
    nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik"
  });

  // =========================================================
  // 2. FUNGSI UTILITAS DASAR - HARUS DIDEKLARASIKAN PALING AWAL
  // =========================================================

  // Toast notification helper
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

  const navigateTo = (tabName) => {
    if (hasAccess(tabName)) {
      setActiveTab(tabName);
    } else {
      addNotification(`Akses Ditolak! Peran Anda (${rolesConfig[currentRole].label}) tidak memiliki hak akses ke modul ini.`, "error");
    }
  };

  // Render Logo Dinamis (Mengembalikan elemen murni dengan perataan dan transparansi penuh)
  const renderMasjidLogo = (imgClassName, fallbackClassName) => {
    if (masjidLogoUrl && masjidLogoUrl.trim() !== "") {
      return (
        <img 
          src={masjidLogoUrl} 
          alt="Logo Masjid" 
          className={imgClassName} 
          onError={() => {
            addNotification("Tampilan Logo kustom gagal dimuat atau URL tidak valid! Menggunakan logo kubah bawaan.", "error");
            setMasjidLogoUrl("");
          }}
        />
      );
    }
    return <KubahMasjidIcon className={fallbackClassName} />;
  };

  // Mock Generator Jadwal Sholat berdasarkan nama Kabupaten/Kota
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

  const [jadwalSholat, setJadwalSholat] = useState(getJadwalSholat(INITIAL_LOKASI.kabupaten));

  // Fungsi getNextSholat diletakkan DI ATAS inisialisasi nextSholat
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

  // --- KALKULATOR PASARAN JAWA SECARA AKURAT ---
  const getPasaranJawa = (date) => {
    const anchor = new Date(2026, 0, 2); 
    const diffTime = date.getTime() - anchor.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    let pasaranIndex = (diffDays + 3) % 5;
    if (pasaranIndex < 0) pasaranIndex += 5;
    return PASARAN_LIST[pasaranIndex];
  };

  // --- MENCARI JUMAT TERDEKAT UNTUK DIHITUNG PASARANNYA ---
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

  // --- LOGIC: PERHITUNGAN OTOMATIS ASNAF ---
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

  // Kalkulasi Beras Fitrah
  const totalTimbanganFitrah = timbanganFitrah.reduce((a, b) => a + b, 0);
  const rincianKebutuhanFitrah = Object.entries(alokasiFitrah).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriFitrah(kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhFitrah = rincianKebutuhanFitrah.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusFitrah = totalTimbanganFitrah - totalButuhFitrah;

  // Kalkulasi Pertanian Zuru'
  const totalTimbanganZuru = timbanganZuru.reduce((a, b) => a + b, 0);
  const rincianKebutuhanZuru = Object.entries(alokasiZuru).map(([kategori, jatah]) => {
    const jumlahJiwa = getJumlahJiwaPerKategoriZuru(kategori);
    const totalButuh = jumlahJiwa * jatah;
    return { kategori, jumlahJiwa, jatah, totalButuh };
  }).filter(item => item.totalButuh > 0);

  const totalButuhZuru = rincianKebutuhanZuru.reduce((sum, item) => sum + item.totalButuh, 0);
  const statusZuru = totalTimbanganZuru - totalButuhZuru;

  // Kalkulasi Qurban
  const totalTimbanganQurban = timbanganQurban.reduce((a, b) => a + b, 0);
  
  const getWargaPenerimaQurban = () => {
    return jamaahList.filter(warga => {
      // Filter Wilayah Qurban RT/RW kustom
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
  const jatahDagingPerKK = totalPenerimaKK > 0 ? (totalTimbanganQurban / totalPenerimaKK).toFixed(2) : 0;

  // =========================================================
  // 3. FUNGSI HANDLER INTERAKSI DAN MANAJEMEN DATA
  // =========================================================

  // --- LOGIC: LOGIN & LOGOUT SECURE ---
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
      addNotification("Username atau Kata Sandi salah! Mohon hubungi Super Admin.", "error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserUsername("");
    setCurrentUserLabel("");
    addNotification("Anda telah berhasil keluar dari sistem.", "warning");
  };

  // --- LOGIC: CUSTOM USER CREATION (ADMIN ONLY) ---
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

  // --- LOGIC: EDIT TEMPLATE PETUGAS JUMAT ABADI (PASARAN) ---
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

  // --- LOGIC: SIMULASI PENGIRIMAN WHATSAPP H-1 ---
  const handlePrepareSimMessage = (fridayData) => {
    const defaultMsg = `Assalamualaikum Wr. Wb. Yth. *${fridayData.petugas.khatib}*, kami dari pengurus *${masjidName}* menginfokan bahwa besok (hari Jumat ${fridayData.pasaran}, tanggal ${fridayData.formattedDate.replace(/^Jumat, /, "")}) adalah jadwal bapak bertugas sebagai *Khatib & Imam Sholat Jumat*. Mohon kehadirannya 15 menit sebelum adzan berkumandang. Terima kasih. Wassalamualaikum Wr. Wb.`;
    setSimulatedMessageText(defaultMsg);
    setActiveNotificationSim(fridayData);
  };

  const handleSendSimMessage = () => {
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      addNotification(`Notifikasi WhatsApp pengingat H-1 sukses terkirim ke ${activeNotificationSim.petugas.khatib} (${activeNotificationSim.petugas.telp})!`);
      setActiveNotificationSim(null);
    }, 1500);
  };

  // --- LOGIC: TIMBANGAN ZAKAT & QURBAN ---
  const addTimbangan = (tipe) => {
    if (tipe === 'fitrah') {
      const val = parseFloat(tempBeratFitrah);
      if (isNaN(val) || val <= 0) return;
      setTimbanganFitrah(prev => [...prev, val]);
      setTempBeratFitrah("");
      addNotification("Timbangan Fitrah ditambahkan");
    } else if (tipe === 'zuru') {
      const val = parseFloat(tempBeratZuru);
      if (isNaN(val) || val <= 0) return;
      setTimbanganZuru(prev => [...prev, val]);
      setTempBeratZuru("");
      addNotification("Timbangan Zuru' ditambahkan");
    } else if (tipe === 'qurban') {
      const val = parseFloat(tempBeratQurban);
      if (isNaN(val) || val <= 0) return;
      setTimbanganQurban(prev => [...prev, val]);
      setTempBeratQurban("");
      addNotification("Timbangan perolehan daging qurban berhasil ditambahkan");
    }
  };

  const deleteTimbangan = (tipe, index) => {
    if (tipe === 'fitrah') {
      setTimbanganFitrah(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan Fitrah dihapus", "warning");
    } else if (tipe === 'zuru') {
      setTimbanganZuru(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan Zuru' dihapus", "warning");
    } else if (tipe === 'qurban') {
      setTimbanganQurban(prev => prev.filter((_, i) => i !== index));
      addNotification("Timbangan perolehan daging qurban berhasil dihapus", "warning");
    }
  };

  // --- DATA MASTER JAMAAH LOGIC ---
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

  // --- LOGIC: HANDLER UNGGAH LOGO PNG (ADMIN ONLY) ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi format berkas gambar harus PNG
    if (file.type !== "image/png") {
      addNotification("Harap pilih berkas gambar berformat khusus PNG (.png)!", "error");
      return;
    }

    // Membaca berkas gambar dan mengubahnya menjadi Base64 Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempMasjidLogoUrl(reader.result);
      addNotification("Berkas logo PNG sukses diunggah ke memori sementara. Tekan 'Simpan Perubahan' untuk menerapkan!", "info");
    };
    reader.readAsDataURL(file);
  };

  // =========================================================
  // RENDER SEBELUM LOGIN (HALAMAN LOGIN BERSIH - FORM AMAN)
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

        {/* Card Login Utama */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden z-10 flex flex-col p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 text-emerald-600 flex items-center justify-center mx-auto overflow-hidden">
              {renderMasjidLogo("w-16 h-16 object-contain rounded-lg", "w-14 h-14")}
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

        <p className="text-center text-slate-500 text-[10px] font-semibold mt-4 z-10">
          &copy; {new Date().getFullYear()} {masjidName}. Keamanan sistem dienkripsi secara lokal.
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER SETELAH LOGIN (DASBOR & MENU UTAMA)
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased animate-fadeIn">
      
      {/* === TOAST NOTIFICATIONS === */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 rounded-xl shadow-lg border text-white text-sm font-medium flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
            n.type === 'error' ? 'bg-rose-600 border-rose-700' : 
            n.type === 'warning' ? 'bg-amber-500 border-amber-600' : 'bg-emerald-600 border-emerald-700'
          }`}>
            {n.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
            <span>{n.message}</span>
          </div>
        ))}
      </div>

      {/* === MAIN HEADER === */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 text-emerald-600 flex items-center justify-center overflow-hidden">
            {renderMasjidLogo("w-12 h-12 object-contain rounded-lg", "w-10 h-10")}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{masjidName}</h1>
            <p className="text-xs text-slate-500">Manajemen Jama'ah, Zakat Fitrah/Zuru' & Distribusi Qurban</p>
          </div>
        </div>

        {/* CLOCK & SHOLAT COUNTDOWN WIDGET */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200/60 text-slate-700 text-xs font-semibold">
            <div className="flex items-center gap-1.5 border-r border-slate-300 pr-4">
              <Clock className="text-emerald-600 w-4 h-4" />
              <span className="font-mono text-sm tracking-widest">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Menuju</span>
              <span className="text-emerald-700 font-bold uppercase">{nextSholat.name}</span>
              <span className="text-slate-500 font-mono">Pukul {nextSholat.time}</span>
            </div>
          </div>

          {/* User profile with logout link */}
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 pl-3 pr-2 py-1 rounded-2xl">
            <div className="text-left">
              <span className="text-[10px] text-emerald-600 font-bold block leading-none">Masuk Sebagai:</span>
              <span className="text-xs font-extrabold text-emerald-955">{currentUserLabel}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-xl transition-all"
              title="Keluar dari sistem"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* === BODY WRAPPER === */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* === SIDEBAR NAVIGATION === */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1.5 shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2 hidden md:block">Menu Navigasi</p>
          
          {[
            { id: "dashboard", label: "Dashboard Utama", icon: Compass },
            { id: "petugas", label: "Petugas Sholat Jumat", icon: Calendar },
            { id: "jamaah", label: "Data Jama'ah & RT/RW", icon: Users },
            { id: "fitrah", label: "Zakat Fitrah", icon: Gift },
            { id: "zuru", label: "Zakat Zuru' (Tani)", icon: Coins },
            { id: "qurban", label: "Daging Qurban", icon: Heart },
            { id: "rbac", label: "Hak Akses, Akun & Identitas", icon: UserCheck }
          ].map((item) => {
            const allowed = hasAccess(item.id);
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                disabled={!allowed && currentRole !== 'Admin'} 
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap md:whitespace-normal ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' 
                    : !allowed 
                      ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : !allowed ? 'text-slate-300' : 'text-slate-400'}`} />
                <span className="text-left flex-1">{item.label}</span>
                {!allowed && (
                  <span className="text-[9px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider scale-90">Kunci</span>
                )}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 hidden md:block">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </aside>

        {/* === CONTENT CONTAINER === */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD UTAMA                                    */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Lokasi Banner */}
              <div className="bg-emerald-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-700/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-emerald-300 w-5 h-5" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-200">Lokasi Penentuan Jadwal Sholat</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{lokasi.kecamatan}, {lokasi.kabupaten}, {lokasi.provinsi}</h2>
                  <p className="text-xs text-emerald-100">Setiap perubahan lokasi akan mengkalkulasi ulang Jadwal Sholat Abadi secara dinamis.</p>
                </div>
                
                {hasAccess("rbac") && ( 
                  <button 
                    onClick={() => {
                      setTempLokasi(lokasi);
                      setIsSettingLokasi(true);
                    }}
                    className="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Settings size={15} />
                    Atur Lokasi Baru
                  </button>
                )}
              </div>

              {/* Atur Lokasi Modal Inline */}
              {isSettingLokasi && (
                <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-lg space-y-4 animate-fadeIn">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 text-emerald-700">
                    <MapPin size={16} /> Konfigurasi Geografis Masjid
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Provinsi</label>
                      <input 
                        type="text" 
                        value={tempLokasi.provinsi}
                        onChange={(e) => setTempLokasi({...tempLokasi, provinsi: e.target.value})}
                        className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kabupaten / Kota</label>
                      <input 
                        type="text" 
                        value={tempLokasi.kabupaten}
                        onChange={(e) => setTempLokasi({...tempLokasi, kabupaten: e.target.value})}
                        className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">Kecamatan / Desa</label>
                      <input 
                        type="text" 
                        value={tempLokasi.kecamatan}
                        onChange={(e) => setTempLokasi({...tempLokasi, kecamatan: e.target.value})}
                        className="w-full text-sm bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button 
                      onClick={() => setIsSettingLokasi(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={() => {
                        setLokasi(tempLokasi);
                        setIsSettingLokasi(false);
                        addNotification("Lokasi masjid berhasil dikonfigurasi ulang!");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10"
                    >
                      Terapkan Perubahan
                    </button>
                  </div>
                </div>
              )}

              {/* Grid: Jadwal Sholat & Statistik Ringkas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kartu Jadwal Sholat */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-950 flex items-center gap-2">
                      <Clock className="text-emerald-600 w-5 h-5" />
                      Jadwal Sholat Abadi Hari Ini
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Metode Kemenag RI</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(jadwalSholat).map(([sholatName, time]) => {
                      const isNext = nextSholat.name === sholatName;
                      return (
                        <div 
                          key={sholatName} 
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isNext 
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10 scale-105' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <p className={`text-[11px] font-bold ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{sholatName}</p>
                          <p className="text-lg font-extrabold tracking-wider mt-1">{time}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ringkasan Cepat */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-950">Statistik Masjid</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Warga Terdaftar</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">{jamaahList.length} KK</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Jiwa Terdata</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                        {jamaahList.reduce((sum, item) => sum + parseInt(item.anggota), 0)} Jiwa
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Zakat Fitrah</p>
                      <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{totalTimbanganFitrah.toFixed(1)} Kg</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Daging Qurban</p>
                      <p className="text-xl font-extrabold text-rose-700 mt-0.5">{totalTimbanganQurban.toFixed(1)} Kg</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Petugas Jumat Terdekat & Mustahik Quick View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Widget Petugas Jumat Terdekat */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-950 flex items-center gap-2">
                    <Calendar className="text-emerald-600 w-5 h-5" />
                    Petugas Sholat Jumat Terdekat (Hari Pasaran)
                  </h3>
                  {upcomingFridays.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-bold">{upcomingFridays[0].formattedDate}</span>
                        <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                          Jumat {upcomingFridays[0].pasaran}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                        <div>
                          <p className="text-slate-400">Khatib Utama</p>
                          <p className="text-slate-800 text-sm font-extrabold">{upcomingFridays[0].petugas.khatib}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Imam Sholat</p>
                          <p className="text-slate-800 text-sm font-extrabold">{upcomingFridays[0].petugas.imam}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Muadzin</p>
                          <p className="text-slate-800 text-sm font-bold">{upcomingFridays[0].petugas.muadzin}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Bilal / Pembawa Acara</p>
                          <p className="text-slate-800 text-sm font-bold">{upcomingFridays[0].petugas.bilal}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Belum ada agenda petugas sholat Jumat.</p>
                  )}
                </div>

                {/* Sebaran Golongan Mustahik */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-950 flex items-center gap-2">
                    <UsersRound className="text-emerald-600 w-5 h-5" />
                    Sebaran Jiwa Mustahik (Basis RT)
                  </h3>
                  <div className="space-y-2">
                    {["1. Fakir", "2. Miskin", "7. Fisabilillah", "6. Gharim"].map((asnaf) => {
                      const fitrahCount = getJumlahJiwaPerKategoriFitrah(asnaf);
                      const zuruCount = getJumlahJiwaPerKategoriZuru(asnaf);
                      return (
                        <div key={asnaf} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl border border-slate-200/50">
                          <span className="font-bold text-slate-700">{asnaf}</span>
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

          {/* ========================================================= */}
          {/* TAB 2: JADWAL PETUGAS SHOLAT JUMAT (ABADI & PASARAN JAWA) */}
          {/* ========================================================= */}
          {activeTab === "petugas" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Konfigurasi Petugas Sholat Jumat Abadi</h2>
                  <p className="text-xs text-slate-500">
                    Sistem otomatis mengikat petugas berdasarkan 5 Hari Pasaran Jawa. Tidak perlu membuat jadwal mingguan baru selamanya!
                  </p>
                </div>
              </div>

              {/* Seksi Notifikasi H-1 Banner */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-start gap-3">
                  <BellRing className="text-amber-600 shrink-0 w-5 h-5 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold">Sistem Notifikasi Pengingat Otomatis H-1 (Hari Kamis)</p>
                    <p className="text-amber-700">Simulasikan pengiriman pesan pengingat WhatsApp ke ponsel petugas dengan menekan tombol kirim di bawah.</p>
                  </div>
                </div>
              </div>

              {/* Grid 5 Hari Pasaran Template */}
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
                            {hasAccess("petugas") && (
                              <button 
                                onClick={() => handleEditPasaran(pasaran)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
                                title="Ubah Template Petugas"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">KHATIB / IMAM</span>
                              <span className="text-slate-800 font-extrabold">{data.khatib || "-"}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">IMAM CADANGAN</span>
                              <span className="text-slate-800 font-semibold">{data.imam || "-"}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">MUADZIN</span>
                              <span className="text-slate-700 font-medium">{data.muadzin || "-"}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">BILAL</span>
                              <span className="text-slate-700 font-medium">{data.bilal || "-"}</span>
                            </div>
                          </div>
                        </div>
                        {data.telp && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <Phone size={10} />
                            <span>{data.telp}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generasi Otomatis Jadwal Jum'at Mendatang */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Daftar Riil Sholat Jumat Mendatang & Kirim Notifikasi H-1
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="pb-3">Tanggal Sholat</th>
                        <th className="pb-3">Kombinasi Pasaran Jawa</th>
                        <th className="pb-3">Khatib Utama</th>
                        <th className="pb-3">Muadzin & Bilal</th>
                        <th className="pb-3 text-center">Pengingat H-1 (Kamis)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {upcomingFridays.map((friday, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3 text-slate-900 font-bold">{friday.formattedDate}</td>
                          <td className="py-3">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                              Jumat {friday.pasaran}
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="font-bold text-slate-900">{friday.petugas.khatib}</p>
                            <p className="text-[10px] text-slate-400">Ponsel: {friday.petugas.telp}</p>
                          </td>
                          <td className="py-3">
                            <p className="text-slate-800">Muadzin: <strong className="text-slate-900">{friday.petugas.muadzin}</strong></p>
                            <p className="text-slate-500">Bilal: {friday.petugas.bilal}</p>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handlePrepareSimMessage(friday)}
                              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] inline-flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <Phone size={12} />
                              Simulasi Kirim H-1
                            </button>
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
                        <input 
                          type="text" required
                          value={pasaranForm.khatib}
                          onChange={(e) => setPasaranForm({...pasaranForm, khatib: e.target.value})}
                          className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">No. Telp / WA Khatib *</label>
                        <input 
                          type="text" required placeholder="Contoh: 081234567890"
                          value={pasaranForm.telp}
                          onChange={(e) => setPasaranForm({...pasaranForm, telp: e.target.value})}
                          className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Imam Cadangan *</label>
                        <input 
                          type="text" required
                          value={pasaranForm.imam}
                          onChange={(e) => setPasaranForm({...pasaranForm, imam: e.target.value})}
                          className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Muadzin</label>
                          <input 
                            type="text"
                            value={pasaranForm.muadzin}
                            onChange={(e) => setPasaranForm({...pasaranForm, muadzin: e.target.value})}
                            className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Bilal</label>
                          <input 
                            type="text"
                            value={pasaranForm.bilal}
                            onChange={(e) => setPasaranForm({...pasaranForm, bilal: e.target.value})}
                            className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button 
                          type="button" onClick={() => setEditingPasaran(null)}
                          className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl"
                        >
                          Batal
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                        >
                          Simpan Template
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL SIMULATOR WHATSAPP NOTIFIKASI H-1 */}
              {activeNotificationSim && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-[#eae6df] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleIn h-[520px]">
                    
                    {/* WA Header */}
                    <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center font-bold text-sm text-white">
                          WA
                        </div>
                        <div>
                          <p className="font-bold text-sm">Masjid Gateway</p>
                          <p className="text-[10px] text-emerald-100">Online • Kepada: {activeNotificationSim.petugas.khatib}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveNotificationSim(null)} 
                        className="text-white hover:text-slate-200"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Chat Bubble Area */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-end space-y-4" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundSize: "contain" }}>
                      
                      {/* Hari Kamis Info Badge */}
                      <div className="bg-[#f0f2f5] text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold text-center self-center shadow-xs max-w-xs uppercase">
                        H-1 (Hari Kamis) • Pengingat Sholat Jumat
                      </div>

                      {/* Bubble Chat */}
                      <div className="bg-[#d9fdd3] text-slate-800 p-3.5 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] self-end relative border border-[#c1ebd0]">
                        <p className="text-xs whitespace-pre-line leading-relaxed">{simulatedMessageText}</p>
                        <span className="text-[9px] text-slate-500 text-right block mt-2 font-mono">14:00 ✓✓</span>
                      </div>
                    </div>

                    {/* WA Input Footer */}
                    <div className="bg-[#f0f2f5] p-3 flex gap-2 items-center border-t border-[#e3e3e3]">
                      <input 
                        type="text" 
                        value={simulatedMessageText}
                        onChange={(e) => setSimulatedMessageText(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-full text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      />
                      <button 
                        onClick={handleSendSimMessage}
                        disabled={isSendingMessage}
                        className="w-10 h-10 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full flex items-center justify-center transition-all disabled:bg-slate-400 shrink-0 shadow"
                      >
                        {isSendingMessage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send size={16} className="ml-0.5" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: DATA JAMAAH BERBASIS RT/RW (3 RT, 2 RW)            */}
          {/* ========================================================= */}
          {activeTab === "jamaah" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Database Jemaah Berbasis RT/RW</h2>
                  <p className="text-xs text-slate-500">
                    Sistem database jemaah kustom yang dibatasi pada **3 RT** (RT 01, 02, 03) dan **2 RW** (RW 01, 02).
                  </p>
                </div>
                {hasAccess("jamaah") && (
                  <button 
                    onClick={() => {
                      setEditingJamaah(null);
                      setJamaahForm({ nama: "", anggota: 1, rt: "01", rw: "01", alamat: "", ekonomi: "Mampu", fitrah: "Muzakki", zuru: "Bukan Mustahik" });
                      setShowJamaahModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow shadow-emerald-600/10"
                  >
                    <Plus size={16} /> Tambah Warga Baru
                  </button>
                )}
              </div>

              {/* Tabel Jama'ah */}
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
                        {hasAccess("jamaah") && <th className="p-4 text-right">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {jamaahList.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-4 text-slate-900 font-bold">{item.nama}</td>
                          <td className="p-4">
                            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200/50 font-mono font-bold">
                              RT {item.rt} / RW {item.rw}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-slate-500">{item.alamat}</td>
                          <td className="p-4 text-center text-slate-900">{item.anggota} Jiwa</td>
                          <td className="p-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.ekonomi === 'Mampu' ? 'bg-emerald-50 text-emerald-700' :
                              item.ekonomi === 'Kurang Mampu' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {item.ekonomi}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs ${item.fitrah === 'Muzakki' ? 'text-slate-400 font-normal' : 'text-emerald-700 font-bold'}`}>
                              {item.fitrah}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-xs ${item.zuru === 'Bukan Mustahik' ? 'text-slate-400 font-normal' : 'text-teal-700 font-bold'}`}>
                              {item.zuru}
                            </span>
                          </td>
                          {hasAccess("jamaah") && (
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button 
                                  onClick={() => handleEditJamaah(item)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-all"
                                  title="Ubah Data"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteJamaah(item.id)}
                                  className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-all"
                                  title="Hapus Data"
                                >
                                  <Trash2 size={14} />
                                </button>
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
                          <input 
                            type="text" placeholder="Masukkan nama Kepala Keluarga" required
                            value={jamaahForm.nama}
                            onChange={(e) => setJamaahForm({...jamaahForm, nama: e.target.value})}
                            className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold"
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah Jiwa</label>
                            <input 
                              type="number" min="1" required
                              value={jamaahForm.anggota}
                              onChange={(e) => setJamaahForm({...jamaahForm, anggota: parseInt(e.target.value) || 1})}
                              className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">RT (Maks 3 RT)</label>
                            <select 
                              value={jamaahForm.rt}
                              onChange={(e) => setJamaahForm({...jamaahForm, rt: e.target.value})}
                              className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-bold"
                            >
                              {["01", "02", "03"].map(rt => (
                                <option key={rt} value={rt}>RT {rt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">RW (Maks 2 RW)</label>
                            <select 
                              value={jamaahForm.rw}
                              onChange={(e) => setJamaahForm({...jamaahForm, rw: e.target.value})}
                              className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-bold"
                            >
                              {["01", "02"].map(rw => (
                                <option key={rw} value={rw}>RW {rw}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Rumah *</label>
                          <textarea 
                            placeholder="Alamat lengkap warga" required rows="2"
                            value={jamaahForm.alamat}
                            onChange={(e) => setJamaahForm({...jamaahForm, alamat: e.target.value})}
                            className="w-full text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold resize-none"
                          />
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <label className="block text-xs font-bold text-slate-600 mb-1">Status Ekonomi</label>
                          <div className="flex gap-3">
                            {["Mampu", "Kurang Mampu", "Sangat Kurang"].map((opsi) => (
                              <label key={opsi} className="flex-1 border p-2.5 rounded-xl text-center text-xs font-semibold cursor-pointer select-none flex items-center justify-center gap-1.5">
                                <input 
                                  type="radio" 
                                  name="ekonomi" 
                                  value={opsi}
                                  checked={jamaahForm.ekonomi === opsi}
                                  onChange={() => setJamaahForm({...jamaahForm, ekonomi: opsi})}
                                  className="accent-emerald-600"
                                />
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
                              {Object.keys(alokasiFitrah).filter(k => k !== "Muzakki").map(k => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-teal-700 mb-1">Klasifikasi Mustahik Zuru'</label>
                            <select 
                              value={jamaahForm.zuru}
                              onChange={(e) => setJamaahForm({...jamaahForm, zuru: e.target.value})}
                              className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-semibold text-teal-800"
                            >
                              <option value="Bukan Mustahik">Bukan Mustahik Zuru'</option>
                              {Object.keys(alokasiZuru).filter(k => k !== "Bukan Mustahik").map(k => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={() => setShowJamaahModal(false)}
                          className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl"
                        >
                          Batal
                        </button>
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                        >
                          Simpan Warga
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PENGELOLAAN ZAKAT FITRAH                           */}
          {/* ========================================================= */}
          {activeTab === "fitrah" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Pengelolaan Zakat Fitrah (Beras)</h2>
                <p className="text-xs text-slate-500">Log timbangan berkala, totalisasi penerimaan otomatis, dan simulasi penyaluran asnaf.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bagian 1: Log Timbangan Masuk */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Log Timbangan Fitrah Masuk</h3>
                  
                  {hasAccess("fitrah") ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" step="0.1" placeholder="Berat (kg)"
                        value={tempBeratFitrah}
                        onChange={(e) => setTempBeratFitrah(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('fitrah')}
                        className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold"
                      />
                      <button 
                        onClick={() => addTimbangan('fitrah')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl font-bold text-xs"
                      >
                        Tambah
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">
                      Hanya Amil Zakat yang memiliki hak menambahkan data timbangan.
                    </p>
                  )}

                  {/* List Timbangan */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {timbanganFitrah.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan # {index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 font-extrabold">{berat} Kg</span>
                          {hasAccess("fitrah") && (
                            <button 
                              onClick={() => deleteTimbangan('fitrah', index)}
                              className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Akumulasi */}
                  <div className="bg-emerald-50 border border-emerald-100/40 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-emerald-800 font-extrabold uppercase">Total Beras Terkumpul</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">{totalTimbanganFitrah.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* Bagian 2: Pengaturan Parameter & Distribusi */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-2 gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">Rencana Penyaluran & Ketersediaan Beras</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">Status Kebutuhan:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        statusFitrah >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {statusFitrah >= 0 ? `SURPLUS ${statusFitrah.toFixed(1)} Kg` : `DEFISIT ${(Math.abs(statusFitrah)).toFixed(1)} Kg`}
                      </span>
                    </div>
                  </div>

                  {/* Parameter Alokasi */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Parameter Pembagian Jatah per Jiwa (Beras)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {Object.keys(alokasiFitrah).filter(k => k !== "Muzakki").map((k) => (
                        <div key={k} className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                          <p className="text-slate-400 truncate font-semibold">{k}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <input 
                              type="number" step="0.5" min="0"
                              disabled={!hasAccess("fitrah")}
                              value={alokasiFitrah[k]}
                              onChange={(e) => setAlokasiFitrah({...alokasiFitrah, [k]: parseFloat(e.target.value) || 0})}
                              className="w-full font-extrabold text-sm text-slate-800 outline-none bg-transparent"
                            />
                            <span className="text-slate-400 font-bold text-[10px]">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulasi Otomatis */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Kategori Mustahik</th>
                          <th className="pb-2 text-center">Jumlah Jiwa (Database)</th>
                          <th className="pb-2 text-center">Jatah / Jiwa</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {rincianKebutuhanFitrah.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900 font-bold">{item.kategori}</td>
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

          {/* ========================================================= */}
          {/* TAB 5: PENGELOLAAN ZAKAT ZURU' (PERTANIAN)                */}
          {/* ========================================================= */}
          {activeTab === "zuru" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Pengelolaan Zakat Zuru' (Pertanian / Hasil Panen)</h2>
                <p className="text-xs text-slate-500">Sama persis dengan Zakat Fitrah, namun tersinkronisasi khusus ke Data Mustahik Zuru'.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bagian 1: Log Timbangan Masuk */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Log Timbangan Zuru' Masuk</h3>
                  
                  {hasAccess("zuru") ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" step="0.5" placeholder="Berat (kg)"
                        value={tempBeratZuru}
                        onChange={(e) => setTempBeratZuru(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('zuru')}
                        className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold"
                      />
                      <button 
                        onClick={() => addTimbangan('zuru')}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 rounded-xl font-bold text-xs"
                      >
                        Tambah
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">
                      Hanya Amil Zakat yang memiliki hak menambahkan data timbangan.
                    </p>
                  )}

                  {/* List Timbangan */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {timbanganZuru.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan # {index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 font-extrabold">{berat} Kg</span>
                          {hasAccess("zuru") && (
                            <button 
                              onClick={() => deleteTimbangan('zuru', index)}
                              className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Akumulasi */}
                  <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-teal-800 font-extrabold uppercase">Total Zuru' Terkumpul</span>
                    <span className="text-2xl font-black text-teal-700 font-mono">{totalTimbanganZuru.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* Bagian 2: Pengaturan Parameter & Distribusi */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-2 gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">Rencana Penyaluran & Ketersediaan Hasil Pertanian</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">Status Kebutuhan:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                        statusZuru >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {statusZuru >= 0 ? `SURPLUS ${statusZuru.toFixed(1)} Kg` : `DEFISIT ${(Math.abs(statusZuru)).toFixed(1)} Kg`}
                      </span>
                    </div>
                  </div>

                  {/* Parameter Alokasi */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Parameter Pembagian Jatah per Jiwa (Zuru')</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {Object.keys(alokasiZuru).filter(k => k !== "Bukan Mustahik").map((k) => (
                        <div key={k} className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                          <p className="text-slate-400 truncate font-semibold">{k}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <input 
                              type="number" step="0.5" min="0"
                              disabled={!hasAccess("zuru")}
                              value={alokasiZuru[k]}
                              onChange={(e) => setAlokasiZuru({...alokasiZuru, [k]: parseFloat(e.target.value) || 0})}
                              className="w-full font-extrabold text-sm text-slate-800 outline-none bg-transparent"
                            />
                            <span className="text-slate-400 font-bold text-[10px]">Kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulasi Otomatis */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-2">Kategori Mustahik Zuru'</th>
                          <th className="pb-2 text-center">Jumlah Jiwa (Database)</th>
                          <th className="pb-2 text-center">Jatah / Jiwa</th>
                          <th className="pb-2 text-right">Total Kebutuhan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {rincianKebutuhanZuru.map((item) => (
                          <tr key={item.kategori}>
                            <td className="py-2.5 text-slate-900 font-bold">{item.kategori}</td>
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

          {/* ========================================================= */}
          {/* TAB 6: PENGELOLAAN DAGING QURBAN (SISTEM TIMBANGAN RIIL)  */}
          {/* ========================================================= */}
          {activeTab === "qurban" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Pengelolaan & Distribusi Daging Qurban</h2>
                <p className="text-xs text-slate-500">Log timbangan berkala perolehan daging bersih, dan perhitungan jatah otomatis per KK penerima aktif.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bagian 1: Log Timbangan Daging Qurban */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-2">Log Timbangan Hasil Qurban</h3>
                  
                  {hasAccess("qurban") ? (
                    <div className="flex gap-2">
                      <input 
                        type="number" step="0.1" placeholder="Berat Daging (kg)"
                        value={tempBeratQurban}
                        onChange={(e) => setTempBeratQurban(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTimbangan('qurban')}
                        className="flex-1 text-sm border border-slate-200 p-2.5 rounded-xl outline-none font-semibold"
                      />
                      <button 
                        onClick={() => addTimbangan('qurban')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 rounded-xl font-bold text-xs transition-all"
                      >
                        Tambah
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2 rounded-lg font-bold">
                      Hanya Amil Zakat / Panitia Qurban yang memiliki hak menambahkan data timbangan daging.
                    </p>
                  )}

                  {/* List Timbangan Qurban */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {timbanganQurban.map((berat, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-2.5 rounded-xl text-sm font-semibold">
                        <span className="text-slate-500">Timbangan Daging #{index + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-950 font-extrabold">{berat} Kg</span>
                          {hasAccess("qurban") && (
                            <button 
                              onClick={() => deleteTimbangan('qurban', index)}
                              className="text-rose-500 p-1 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Akumulasi Daging Bersih */}
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-rose-800 font-extrabold uppercase">Total Daging Bersih</span>
                    <span className="text-2xl font-black text-rose-700 font-mono">{totalTimbanganQurban.toFixed(1)} Kg</span>
                  </div>
                </div>

                {/* Bagian 2: Algoritma Distribusi Kuota */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">Filter & Jatah Penerima Manfaat</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Filter Wilayah Distribusi</label>
                      <select 
                        value={filterWilayahQurban}
                        onChange={(e) => setFilterWilayahQurban(e.target.value)}
                        className="w-full text-xs border border-slate-200 p-2.5 rounded-xl outline-none font-bold text-slate-700"
                      >
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
                        <input 
                          type="checkbox"
                          id="mustahikSaja"
                          checked={qurbanHanyaMustahik}
                          onChange={(e) => setQurbanHanyaMustahik(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="mustahikSaja" className="text-xs font-bold text-slate-700 cursor-pointer">
                          Hanya berikan ke Golongan Mustahik
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Output Jatah Kalkulasi Otomatis */}
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs text-emerald-800 font-extrabold uppercase">Jumlah Penerima (KK) Terpilih</p>
                      <p className="text-2xl font-black text-emerald-700">{totalPenerimaKK} KK</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-emerald-800 font-extrabold uppercase">Rata-rata Jatah Daging / KK</p>
                      <p className="text-2xl font-black text-emerald-700 font-mono">{jatahDagingPerKK} Kg</p>
                    </div>
                  </div>

                  {/* Daftar Penerima & Simulasi Kupon */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Simulasi Lembar Daftar Penerima / Kupon Qurban</p>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                      {wargaPenerimaQurban.map((warga) => (
                        <div key={warga.id} className="p-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-900">{warga.nama}</p>
                            <p className="text-slate-400 font-semibold text-[10px]">RT {warga.rt} / RW {warga.rw} • {warga.alamat}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg font-bold font-mono text-[11px]">
                              {jatahDagingPerKK} Kg
                            </span>
                            <button 
                              onClick={() => addNotification(`Cetak Kupon Qurban untuk KK: ${warga.nama}`)}
                              className="border border-slate-200 hover:border-slate-300 p-1 rounded-lg hover:bg-slate-50 transition-all text-slate-500"
                              title="Cetak Kupon"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: HAK AKSES, AKUN & IDENTITAS MASJID (RBAC)         */}
          {/* ========================================================= */}
          {activeTab === "rbac" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Seksi Kontrol Identitas Masjid Custom (Hanya untuk Admin) */}
              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Settings className="text-emerald-600 w-5 h-5 animate-spin-slow" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Pengaturan Identitas & Logo Masjid</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    {/* Input Nama Masjid */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Nama Masjid (Akan mengganti semua teks sistem)</label>
                      <input 
                        type="text" 
                        value={tempMasjidName} 
                        onChange={(e) => {
                          setTempMasjidName(e.target.value);
                        }}
                        placeholder="Contoh: Masjid Al-Ikhlas"
                        className="w-full text-sm border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    {/* Input URL/File Logo Custom */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Unggah Berkas Logo PNG atau Tautan Gambar</label>
                      <div className="space-y-3">
                        {/* Pilihan Unggah Berkas PNG */}
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                            <Upload size={14} className="text-emerald-600" />
                            Pilih Berkas Gambar PNG
                            <input 
                              type="file" 
                              accept="image/png" 
                              onChange={handleLogoUpload} 
                              className="hidden" 
                            />
                          </label>
                          {tempMasjidLogoUrl && (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                              Gambar Siap Disimpan
                            </span>
                          )}
                        </div>

                        {/* Input Link Cadangan */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={tempMasjidLogoUrl} 
                            onChange={(e) => setTempMasjidLogoUrl(e.target.value)}
                            placeholder="Atau tempel tautan gambar disini (https://...)"
                            className="flex-1 text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          {tempMasjidLogoUrl.trim() !== "" && (
                            <button 
                              type="button"
                              onClick={() => {
                                setTempMasjidLogoUrl("");
                                addNotification("Pratinjau logo kustom dibersihkan.");
                              }}
                              className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 rounded-xl border border-rose-200 text-xs font-bold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Simpan Perubahan Identitas */}
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => {
                        setTempMasjidName(masjidName);
                        setTempMasjidLogoUrl(masjidLogoUrl);
                        addNotification("Perubahan identitas dibatalkan.", "warning");
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        if (!tempMasjidName.trim()) {
                          addNotification("Nama Masjid tidak boleh kosong!", "error");
                          return;
                        }
                        setMasjidName(tempMasjidName);
                        setMasjidLogoUrl(tempMasjidLogoUrl);
                        addNotification("Identitas dan Logo Masjid berhasil diperbarui!", "success");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-emerald-600/10"
                    >
                      Simpan Perubahan
                    </button>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                      {/* Pratinjau Sementara */}
                      {tempMasjidLogoUrl.trim() !== "" ? (
                        <img src={tempMasjidLogoUrl} alt="Pratinjau" className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <KubahMasjidIcon className="w-6 h-6 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs text-emerald-800 font-semibold">
                      <p className="font-bold">Pratinjau Identitas Sementara:</p>
                      <p className="text-slate-500 mt-0.5">{tempMasjidName} (Logo: {tempMasjidLogoUrl.trim() !== "" ? "Gambar Kustom Terdeteksi" : "Menggunakan Kubah Masjid Default"})</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seksi Pembuatan & Manajemen Akun Custom (Hanya untuk Admin) */}
              {currentRole === "Admin" && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <UserPlus className="text-emerald-600 w-5 h-5" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Pendaftaran Akun Pengurus Custom</h3>
                  </div>

                  {/* Form Pendaftaran User Baru */}
                  <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Tampilan (Contoh: Bpk. Jufri)</label>
                      <input 
                        type="text" required placeholder="Nama Lengkap / Panggilan"
                        value={newAccLabel}
                        onChange={(e) => setNewAccLabel(e.target.value)}
                        className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Username Baru</label>
                      <input 
                        type="text" required placeholder="username (huruf kecil)"
                        value={newAccUsername}
                        onChange={(e) => setNewAccUsername(e.target.value)}
                        className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Password Baru</label>
                      <input 
                        type="text" required placeholder="Sandi minimal 6 karakter"
                        value={newAccPassword}
                        onChange={(e) => setNewAccPassword(e.target.value)}
                        className="w-full text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Tingkatan Peran (Role)</label>
                      <div className="flex gap-2">
                        <select 
                          value={newAccRole}
                          onChange={(e) => setNewAccRole(e.target.value)}
                          className="flex-1 text-xs border border-slate-200 bg-white p-2.5 rounded-xl outline-none font-bold text-slate-800"
                        >
                          <option value="Admin">Super Admin</option>
                          <option value="Takmir">Takmir Masjid</option>
                          <option value="Amil">Amil Zakat</option>
                          <option value="Jamaah">Jama'ah / Warga</option>
                        </select>
                        <button 
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center transition-all"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Daftar Akun yang Terdaftar di Sistem */}
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
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                User: <span className="font-extrabold text-slate-700">{usernameKey}</span> • Pass: {userObj.password}
                              </p>
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1.5 ${
                                userObj.role === 'Admin' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                userObj.role === 'Takmir' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                userObj.role === 'Amil' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {rolesConfig[userObj.role]?.label || userObj.role}
                              </span>
                            </div>

                            {!isDefault && (
                              <button 
                                onClick={() => handleDeleteAccount(usernameKey)}
                                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                                title="Hapus Akun"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Seksi 3: Matriks Otoritas Modul (Sesuai Batas Akses yang Ditetapkan) */}
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
                        {Object.keys(rolesConfig).map((r) => (
                          <th key={r} className="p-4 text-center">{rolesConfig[r].label}</th>
                        ))}
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
                                <button
                                  type="button"
                                  disabled={isSelfAdminRbac || currentRole !== "Admin"}
                                  onClick={() => {
                                    setRolesConfig(prev => {
                                      const updatedAccess = isAllowed 
                                        ? prev[role].access.filter(id => id !== menu.id)
                                        : [...prev[role].access, menu.id];
                                      return {
                                        ...prev,
                                        [role]: { ...prev[role], access: updatedAccess }
                                      };
                                    });
                                    addNotification(`Akses menu "${menu.label}" untuk peran ${rolesConfig[role].label} telah diubah!`);
                                  }}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                    isAllowed 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                                  } ${currentRole === "Admin" && !isSelfAdminRbac ? "hover:scale-105" : "cursor-not-allowed"}`}
                                >
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