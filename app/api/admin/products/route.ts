import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all products (public)
export async function GET() {
  try {
    
    const { data, error } = await supabaseAdmin
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

// POST - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const {
      name,
      description,
      price_usdc,
      size,
      measurements,
      category,
      images,
      stock_quantity = 0
    } = body;
    
    // Validate required fields
    if (!name || !price_usdc) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price_usdc: parseFloat(price_usdc),
        size,
        measurements,
        category,
        images: images || [],
        stock_quantity: parseInt(stock_quantity) || 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      product: data,
      message: 'Product created successfully'
    });
    
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 