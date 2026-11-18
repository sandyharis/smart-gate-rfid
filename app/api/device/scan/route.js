import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { uid } = body;
    
    if (!uid) {
      return NextResponse.json({ error: 'UID kosong' }, { status: 400 });
    }
    
    const cleanUid = uid.trim().toUpperCase();

    // 1. Ambil konfigurasi device (Gunakan .maybeSingle() agar tidak error jika kosong)
    const { data: config, error: configError } = await supabase
      .from('device_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (configError) {
      console.error('Error fetch config:', configError.message);
    }

    // Jika perangkat sedang dalam mode pendaftaran kartu baru
    if (config?.is_register_mode) {
      await supabase
        .from('device_config')
        .update({ pending_uid: cleanUid })
        .eq('id', 1);

      return NextResponse.json({ 
        action: 'REGISTERED_TEMP', 
        message: 'Kartu terbaca', 
        uid: cleanUid 
      });
    }

    // 2. Cek apakah kartu terdaftar di tabel mahasiswa (Gunakan .maybeSingle())
    const { data: mhs, error: mhsError } = await supabase
      .from('mahasiswa')
      .select('*')
      .eq('rfid_uid', cleanUid)
      .maybeSingle();

    if (mhsError) {
      console.error('Error fetch mahasiswa:', mhsError.message);
    }

    // 3. Validasi status mahasiswa
    if (mhs && mhs.status_aktif) {
      // Catat log sukses
      await supabase.from('access_logs').insert([{ 
        mahasiswa_id: mhs.id, 
        rfid_uid: cleanUid, 
        status: 'DITERIMA' 
      }]);

      return NextResponse.json({ 
        action: 'OPEN_GATE', 
        nama: mhs.nama, 
        nim: mhs.nim 
      });
    } else {
      // Catat log ditolak / kartu tidak dikenal / nonaktif
      await supabase.from('access_logs').insert([{ 
        rfid_uid: cleanUid, 
        status: 'DITOLAK' 
      }]);

      return NextResponse.json({ 
        action: 'DENY_GATE', 
        message: 'Tidak terdaftar atau diblokir' 
      }, { status: 403 });
    }

  } catch (err) {
    console.error('Server Error (RFID Endpoint):', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}