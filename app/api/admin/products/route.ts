import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/admin/products - List all products (including inactive)
export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM products ORDER BY created_at DESC
    `;
    
    return NextResponse.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: Request) {
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
      stock_quantity = 1
    } = body;

    const result = await sql`
      INSERT INTO products (
        name, description, price_usdc, size, measurements, 
        category, images, stock_quantity
      )
      VALUES (
        ${name}, ${description}, ${price_usdc}, ${size}, 
        ${measurements}, ${category}, ${JSON.stringify(images)}, 
        ${stock_quantity}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products - Update product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      price_usdc,
      size,
      measurements,
      category,
      images,
      stock_quantity,
      is_active
    } = body;

    const result = await sql`
      UPDATE products SET
        name = ${name},
        description = ${description},
        price_usdc = ${price_usdc},
        size = ${size},
        measurements = ${measurements},
        category = ${category},
        images = ${JSON.stringify(images)},
        stock_quantity = ${stock_quantity},
        is_active = ${is_active},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
} 