
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  // STATE LOGIN
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // STATE DATA DAN UI
  const [mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // STATE FORM
  const [nim, setNim] = useState('');
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);

  // HAPUS SESI LOGIN SAAT REFRESH
  useEffect(() => {
    localStorage.removeItem('gate_auth');
    setIsLoggedIn(false);
  }, []);

  // LOGIN
  const handleLogin = (e: any) => {
    e.preventDefault();

    if (passwordInput === 'harisadmin') {
      setIsLoggedIn(true);
      localStorage.setItem('gate_auth', 'true');
    } else {
      alert('Password salah!');
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('gate_auth');
    setIsLoggedIn(false);
    setPasswordInput('');
  };

  // AMBIL DATA MAHASISWA
  const fetchMahasiswa = async () => {
    try {
      const res = await fetch('/api/mahasiswa');

      if (!res.ok) {
        console.warn('Gagal mengambil data:', res.statusText);
        return;
      }

      const data = await res.json();

      setMahasiswa(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Koneksi API terputus.');
      setMahasiswa([]);
    }
  };

  // FETCH DATA SETELAH LOGIN
  useEffect(() => {
    if (isLoggedIn) {
      fetchMahasiswa();
    }
  }, [isLoggedIn]);

  // POLLING RFID
  useEffect(() => {
    let interval: any;

    if (showModal && isRegisterMode && !isEditMode) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/device/status');

          if (res.ok) {
            const data = await res.json();

            if (data.pending_uid) {
              setRfidUid(data.pending_uid);
            }
          }
        } catch (err) {
          console.error('Gagal polling status device:', err);
        }
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [showModal, isRegisterMode, isEditMode]);

  // BUKA MODAL TAMBAH
  const handleOpenAddModal = async () => {
    setIsEditMode(false);
    setShowModal(true);
    setIsRegisterMode(true);

    setNim('');
    setNama('');
    setProdi('');
    setRfidUid('');
    setStatusAktif(true);

    try {
      await fetch('/api/device/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_register_mode: true })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // BUKA MODAL EDIT
  const handleOpenEditModal = (m: any) => {
    setIsEditMode(true);
    setEditId(m.id);

    setNim(m.nim);
    setNama(m.nama);
    setProdi(m.prodi);
    setRfidUid(m.rfid_uid || '');
    setStatusAktif(m.status_aktif);

    setShowModal(true);
  };

  // TUTUP MODAL
  const handleCloseModal = async () => {
    setShowModal(false);
    setIsRegisterMode(false);

    try {
      await fetch('/api/device/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_register_mode: false })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // SIMPAN DATA MAHASISWA
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        const res = await fetch('/api/mahasiswa', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            nim,
            nama,
            prodi,
            status_aktif: statusAktif
          })
        });

        if (res.ok) {
          alert('Data mahasiswa berhasil diperbarui!');
          handleCloseModal();
          fetchMahasiswa();
        } else {
          const error = await res.json().catch(() => null);
          alert(error?.error || 'Gagal memperbarui data.');
        }

      } else {
        const res = await fetch('/api/mahasiswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nim,
            nama,
            prodi,
            rfid_uid: rfidUid,
            status_aktif: statusAktif
          })
        });

        if (res.ok) {
          alert('Mahasiswa berhasil ditambahkan!');
          handleCloseModal();
          fetchMahasiswa();
        } else {
          const error = await res.json().catch(() => null);
          alert(error?.error || 'Gagal menyimpan data.');
        }
      }
    } catch (err) {
      alert('Tidak dapat terhubung ke server.');
      console.error(err);
    }
  };

  // HAPUS MAHASISWA
  const handleDelete = async (id: string, namaMhs: string) => {
    if (confirm(`Yakin ingin menghapus data ${namaMhs}?`)) {
      try {
        const res = await fetch(`/api/mahasiswa?id=${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          alert('Data berhasil dihapus.');
          fetchMahasiswa();
        } else {
          alert('Gagal menghapus data.');
        }
      } catch (err) {
        alert('Tidak dapat terhubung ke server.');
      }
    }
  };

  // HALAMAN LOGIN
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">

          <div className="text-center mb-6">

            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20">
              UIN Sunan Ampel Surabaya
            </span>

            <h1 className="text-xl font-bold text-white tracking-tight mt-3">
              Project IoT Smart Gate
            </h1>

            <p className="text-sm text-indigo-300 font-medium mt-1">
              Haris Sandy Setiawan
            </p>

            <p className="text-xs text-slate-400">
              Program Studi Sistem Informasi
            </p>

          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Password Admin
              </label>

              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Masukkan password..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
            >
              Masuk Dashboard
            </button>

          </form>

          <p className="text-[11px] text-center text-slate-500 mt-6">
            Sistem Keamanan Akses Gerbang Kampus Berbasis IoT
          </p>

        </div>
      </main>
    );
  }

  // DASHBOARD
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 px-3 py-4 sm:p-6 md:p-12">

      <div className="mx-auto w-full max-w-6xl">

        {/* HEADER */}
        <header className="mb-5 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:mb-8 sm:pb-6 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Smart Gate Dashboard
            </h1>

            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Project IoT oleh{' '}
              <span className="text-indigo-400 font-medium">
                Haris Sandy Setiawan
              </span>{' '}
              (Sistem Informasi UINSA)
            </p>
          </div>

          {/* TOMBOL HEADER */}
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">

            <button
              onClick={handleOpenAddModal}
              className="rounded-xl bg-indigo-600 px-3 py-3 text-xs font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              + Tambah Mahasiswa
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs font-medium text-rose-400 transition hover:bg-slate-700 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Keluar
            </button>

          </div>
        </header>

        {/* DATA MAHASISWA */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-800 p-4 text-sm font-semibold text-slate-200">
            Daftar Mahasiswa & Kartu RFID Terdaftar ({mahasiswa.length})
          </div>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">

            <table className="w-full text-left border-collapse text-sm">

              <thead>
                <tr className="bg-slate-950/50 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="p-4">NIM</th>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Prodi</th>
                  <th className="p-4">UID RFID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">

                {mahasiswa.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition">

                    <td className="p-4 font-mono text-slate-300">
                      {m.nim}
                    </td>

                    <td className="p-4 font-medium text-white">
                      {m.nama}
                    </td>

                    <td className="p-4 text-slate-300">
                      {m.prodi}
                    </td>

                    <td className="p-4 font-mono text-indigo-400">
                      {m.rfid_uid || '-'}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        m.status_aktif
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {m.status_aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="p-4 text-center">

                      <div className="flex items-center justify-center gap-2">

                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-slate-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(m.id, m.nama)}
                          className="bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium transition border border-slate-700"
                        >
                          Hapus
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

                {mahasiswa.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Belum ada data mahasiswa terdaftar.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-3 p-3">

            {mahasiswa.map((m) => (
              <article
                key={m.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs font-mono text-indigo-400 break-all">
                      {m.nim}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white break-words">
                      {m.nama}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400 break-words">
                      {m.prodi || 'Program studi belum diisi'}
                    </p>

                  </div>

                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    m.status_aktif
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                  }`}>
                    {m.status_aktif ? 'Aktif' : 'Nonaktif'}
                  </span>

                </div>

                {/* UID RFID */}
                <div className="mt-3 rounded-lg bg-slate-900 px-3 py-2">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    UID RFID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-indigo-300">
                    {m.rfid_uid || 'Belum terdaftar'}
                  </p>

                </div>

                {/* TOMBOL AKSI MOBILE */}
                <div className="mt-3 grid grid-cols-2 gap-2">

                  <button
                    onClick={() => handleOpenEditModal(m)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-slate-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(m.id, m.nama)}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-slate-700"
                  >
                    Hapus
                  </button>

                </div>

              </article>
            ))}

            {mahasiswa.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-800 px-4 py-10 text-center text-sm text-slate-500">
                Belum ada data mahasiswa terdaftar.
              </div>
            )}

          </div>
        </div>

        {/* ================= MODAL TAMBAH / EDIT ================= */}
        {showModal && (

          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">

            <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-800 bg-slate-900 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-6">

              <h2 className="text-lg font-bold mb-4 text-white">
                {isEditMode ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* NIM */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    NIM
                  </label>

                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="09020624033"
                  />
                </div>

                {/* NAMA */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Haris Sandy"
                  />
                </div>

                {/* PRODI */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Program Studi
                  </label>

                  <input
                    type="text"
                    required
                    value={prodi}
                    onChange={(e) => setProdi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Sistem Informasi"
                  />
                </div>

                {/* RFID */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    UID Kartu RFID {isEditMode ? '' : '(Otomatis Dari Alat)'}
                  </label>

                  <input
                    type="text"
                    required
                    readOnly={!isEditMode}
                    value={rfidUid}
                    onChange={(e) => setRfidUid(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl p-3 text-sm font-mono text-indigo-300 focus:outline-none ${
                      isEditMode
                        ? 'border-slate-800'
                        : 'border-indigo-500/50 animate-pulse'
                    }`}
                    placeholder={isEditMode ? '' : 'Tempelkan kartu ke alat...'}
                  />

                  {!isEditMode && (
                    <p className="text-[11px] text-indigo-400 mt-2">
                      Tempelkan kartu RFID pada reader untuk membaca UID secara otomatis.
                    </p>
                  )}
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Status Kartu
                  </label>

                  <select
                    value={statusAktif ? 'true' : 'false'}
                    onChange={(e) => setStatusAktif(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="true">
                      Aktif (Bisa Masuk Gerbang)
                    </option>

                    <option value="false">
                      Nonaktif / Diblokir
                    </option>
                  </select>
                </div>

                {/* TOMBOL FORM */}
                <div className="grid grid-cols-2 gap-2 pt-3 sm:flex sm:justify-end">

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm transition border border-slate-700"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20"
                  >
                    Simpan
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
