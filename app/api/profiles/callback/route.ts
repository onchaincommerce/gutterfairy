import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByWallet, createOrUpdateProfile } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🌍 Profiles callback received!');
    
    // Parse the request body
    const body = await request.json();
    console.log('📊 Profile data received:', body);
    
    // Extract data from Base profiles callback
    const { 
      walletAddress, 
      email, 
      physicalAddress,
      phone,
      name 
    } = body;

    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wallet address is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get or create user
    let user = await getUserByWallet(walletAddress);
    if (!user) {
      user = await createUser(walletAddress, email);
      console.log(`👤 Created new user for wallet: ${walletAddress}`);
    } else {
      console.log(`👤 Found existing user for wallet: ${walletAddress}`);
    }

    // Create or update profile
    const profile = await createOrUpdateProfile(user.id, {
      physical_address: physicalAddress,
      phone: phone,
      name: name
    });

    console.log('✅ Profile data saved to database successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile data received and stored in database',
      userId: user.id,
      profileId: profile.id,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('🚨 Error processing profile callback:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process profile data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  // Handle GET requests (for testing)
  return NextResponse.json({ 
    message: 'Eco-Cyber Profiles Callback Endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
} 