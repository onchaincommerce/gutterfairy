import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch all products (public)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      products: data || []
    });
    
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 