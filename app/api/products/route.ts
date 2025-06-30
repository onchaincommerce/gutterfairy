import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    console.log('Fetching products from database...');
    const products = await getAllProducts();
    
    // Filter by category if specified
    let filteredProducts = products;
    if (category && category !== 'ALL') {
      if (category === 'VINTAGE COLLECTION') {
        filteredProducts = products.filter(product => 
          product.name.toLowerCase().includes('vintage')
        );
      } else {
        filteredProducts = products.filter(product => 
          product.category === category
        );
      }
    }
    
    // Transform database format to frontend format
    const transformedProducts = filteredProducts.map(product => ({
      id: product.id.toString(),
      name: product.name,
      price: `${(product.price_usdc / 1000000).toFixed(0)} USDC`,
      priceInWei: product.price_usdc.toString(),
      images: product.images || [],
      description: product.description || '',
      size: product.size || '',
      measurements: product.measurements || '',
      category: product.category || ''
    }));
    
    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 