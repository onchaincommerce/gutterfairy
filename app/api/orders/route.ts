import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByWallet, getProductById, createOrder, getOrdersByUserId } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Order creation request received');
    
    const body = await request.json();
    const { 
      walletAddress,
      productId, 
      shippingAddress,
      shippingCost,
      shippingMethod,
      selectedRateId,
      transactionHash
    } = body;

    // Validate required fields
    if (!walletAddress || !productId || !shippingAddress || !transactionHash) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: walletAddress, productId, shippingAddress, transactionHash' 
      }, { status: 400 });
    }

    // Get or create user
    let user = await getUserByWallet(walletAddress);
    if (!user) {
      user = await createUser(walletAddress);
    }

    // Get product details
    const product = await getProductById(parseInt(productId));
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // Check stock
    if (product.stock_quantity <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product is out of stock' 
      }, { status: 400 });
    }

    // Calculate total amount (product price + shipping)
    const productPriceCents = Math.round(product.price_usdc / 10000); // Convert from 6-decimal USDC to cents
    const shippingCostCents = Math.round((shippingCost || 0) * 100); // Convert dollars to cents
    const totalAmount = productPriceCents + shippingCostCents;

    // Create order
    const order = await createOrder({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_price: productPriceCents,
      shipping_address: shippingAddress,
      shipping_cost: shippingCostCents,
      shipping_method: shippingMethod,
      total_amount: totalAmount,
      transaction_hash: transactionHash
    });

    console.log(`✅ Order created: ${order.order_number}`);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        product_name: order.product_name,
        total_amount: order.total_amount,
        created_at: order.created_at
      },
      message: 'Order created successfully'
    });
    
  } catch (error: any) {
    console.error('🚨 Order creation error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address is required' 
      }, { status: 400 });
    }

    // Get user
    const user = await getUserByWallet(walletAddress);
    if (!user) {
      return NextResponse.json({
        success: true,
        orders: [],
        message: 'No orders found for this wallet'
      });
    }

    // Get user's orders
    const orders = await getOrdersByUserId(user.id);

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        product_name: order.product_name,
        total_amount: order.total_amount,
        shipping_method: order.shipping_method,
        tracking_number: order.tracking_number,
        created_at: order.created_at
      }))
    });
    
  } catch (error: any) {
    console.error('🚨 Orders fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
} 