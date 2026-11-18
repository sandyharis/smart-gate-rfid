import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Ambil semua data mahasiswa
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('mahasiswa')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error GET mahasiswa:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Server Error GET mahasiswa:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Tambah mahasiswa baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { nim, nama, prodi, rfid_uid, status_aktif } = body;
    
    if (!rfid_uid) {
      return NextResponse.json({ error: 'UID RFID tidak boleh kosong' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('mahasiswa')
      .insert([{ 
        nim, 
        nama, 
        prodi, 
        rfid_uid: rfid_uid.trim().toUpperCase(),
        status_aktif: status_aktif ?? true 
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error POST mahasiswa:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Reset status register mode pada device_config
    await supabase
      .from('device_config')
      .update({ is_register_mode: false, pending_uid: null })
      .eq('id', 1);

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Server Error POST mahasiswa:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update / Edit data mahasiswa
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nim, nama, prodi, status_aktif } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID mahasiswa diperlukan untuk update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('mahasiswa')
      .update({ nim, nama, prodi, status_aktif })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error PUT mahasiswa:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Server Error PUT mahasiswa:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Hapus mahasiswa berdasarkan ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    }

    const { error } = await supabase
      .from('mahasiswa')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error DELETE mahasiswa:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Data berhasil dihapus' });
  } catch (err) {
    console.error('Server Error DELETE mahasiswa:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}