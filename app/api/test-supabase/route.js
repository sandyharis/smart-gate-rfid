import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Coba lakukan kueri ringan ke tabel mahasiswa atau device_config
    const { data, error, status } = await supabase
      .from('device_config')
      .select('*')
      .eq('id', 1);

    if (error) {
      return NextResponse.json({
        status: 'Gagal Terhubung ke Database',
        details: error.message,
        hint: 'Periksa kembali URL dan Kunci API di .env.local'
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'Koneksi Berhasil!',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      data_result: data
    });
  } catch (err) {
    return NextResponse.json({
      status: 'Fetch Error / Jaringan Terputus',
      error: err.message
    }, { status: 500 });
  }
}