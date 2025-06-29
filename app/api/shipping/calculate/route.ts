import { NextRequest, NextResponse } from 'next/server';
import EasyPost from '@easypost/api';

// Initialize EasyPost client
// You'll need to add your EasyPost API key to environment variables
const easypost = new EasyPost(process.env.EASYPOST_API_KEY || 'your-test-key');

export async function POST(request: NextRequest) {
  try {
    console.log('🚚 Shipping calculation request received');
    
    const body = await request.json();
    const { 
      toAddress, 
      productId, 
      productName,
      weight = 8 // Default weight in ounces for clothing items
    } = body;

    // Validate required fields
    if (!toAddress || !toAddress.zip) {
      return NextResponse.json({ 
        success: false, 
        error: 'Shipping address with zip code is required' 
      }, { status: 400 });
    }

    // Your business address (ship from)
    const fromAddress = {
      street1: "123 Main St", // Replace with your actual address
      city: "San Francisco",
      state: "CA", 
      zip: "94105",
      country: "US"
    };

    // Create EasyPost addresses
    const fromAddr = await easypost.Address.create({
      street1: fromAddress.street1,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: fromAddress.country
    });

    const toAddr = await easypost.Address.create({
      street1: toAddress.street1 || toAddress.line1 || "123 Customer St",
      street2: toAddress.street2 || toAddress.line2 || "",
      city: toAddress.city,
      state: toAddress.state || toAddress.admin_area_1,
      zip: toAddress.zip || toAddress.postal_code,
      country: toAddress.country || "US"
    });

    // Create parcel (standard clothing package)
    const parcel = await easypost.Parcel.create({
      length: 12, // inches
      width: 10,  // inches  
      height: 3,  // inches
      weight: weight // ounces
    });

    // Create shipment to get rates
    const shipment = await easypost.Shipment.create({
      to_address: toAddr,
      from_address: fromAddr,
      parcel: parcel
    });

    // Format rates for frontend
    const rates = shipment.rates.map((rate: any) => ({
      id: rate.id,
      service: rate.service,
      carrier: rate.carrier,
      rate: parseFloat(rate.rate), // Price in dollars
      delivery_days: rate.delivery_days,
      delivery_date: rate.delivery_date,
      description: `${rate.carrier} ${rate.service}${rate.delivery_days ? ` (${rate.delivery_days} days)` : ''}`
    }));

    // Sort by price (cheapest first)
    rates.sort((a, b) => a.rate - b.rate);

    console.log(`✅ Found ${rates.length} shipping rates for ${toAddress.zip}`);

    return NextResponse.json({
      success: true,
      rates: rates,
      shipment_id: shipment.id, // Store this for later use
      from_address: fromAddress,
      to_address: toAddress
    });
    
  } catch (error: any) {
    console.error('🚨 Shipping calculation error:', error);
    
    // Handle specific EasyPost errors
    if (error.message?.includes('address')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid shipping address. Please check your address details.',
        details: error.message
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate shipping rates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Test endpoint to verify EasyPost connection
  try {
    // Test with a simple address verification
    const testAddress = await easypost.Address.create({
      street1: "388 Townsend St",
      city: "San Francisco", 
      state: "CA",
      zip: "94107",
      country: "US"
    });

    return NextResponse.json({
      success: true,
      message: 'EasyPost API connection successful',
      test_address: testAddress,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('🚨 EasyPost connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'EasyPost API connection failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 