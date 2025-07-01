import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { isAdmin, walletAddress } = await validateAdminRequest(request);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin wallet address' },
        { status: 401 }
      );
    }
    
    // Create admin session
    const sessionToken = await createAdminSession(walletAddress!);
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Failed to create admin session' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      sessionToken,
      walletAddress: walletAddress,
      message: 'Admin authentication successful'
    });
    
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 