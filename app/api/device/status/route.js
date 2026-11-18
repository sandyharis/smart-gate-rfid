import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Ambil status konfigurasi perangkat (untuk ESP32 / Frontend)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('device_config')
      .select('is_register_mode, pending_uid')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Error GET device_config:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Jika data belum ada sama sekali, kembalikan nilai default
    if (!data) {
      return NextResponse.json({ is_register_mode: false, pending_uid: null });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Server Error GET device_config:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Ubah status register mode dari Frontend
export async function POST(request) {
  try {
    const body = await request.json();
    const { is_register_mode } = body;

    const { data, error } = await supabase
      .from('device_config')
      .update({ 
        is_register_mode, 
        pending_uid: null 
      })
      .eq('id', 1)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error POST device_config:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || { is_register_mode, pending_uid: null });
  } catch (err) {
    console.error('Server Error POST device_config:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}