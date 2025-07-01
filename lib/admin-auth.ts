import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS || '0x9474FCc86224b8c614eEe0096B4bEcFeF244DaF2';

export function isAdminWallet(walletAddress: string): boolean {
  return walletAddress.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
}

export async function validateAdminRequest(request: NextRequest): Promise<{ isAdmin: boolean; walletAddress?: string }> {
  try {
    const body = await request.json();
    const walletAddress = body.walletAddress || body.wallet_address;
    
    console.log('🔍 Admin Auth Debug:', {
      receivedWalletAddress: walletAddress,
      adminWalletAddress: ADMIN_WALLET_ADDRESS,
      receivedLower: walletAddress?.toLowerCase(),
      adminLower: ADMIN_WALLET_ADDRESS.toLowerCase(),
      isMatch: walletAddress?.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()
    });
    
    if (!walletAddress) {
      return { isAdmin: false };
    }
    
    const isAdmin = isAdminWallet(walletAddress);
    return { isAdmin, walletAddress };
  } catch (error) {
    console.error('Error validating admin request:', error);
    return { isAdmin: false };
  }
}

export async function createAdminSession(walletAddress: string): Promise<string | null> {
  try {
    // Generate a simple session token (in production, use a more secure method)
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    
    const { error } = await supabaseAdmin
      .from('admin_sessions')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        session_token: sessionToken,
        expires_at: expiresAt
      });
    
    if (error) {
      console.error('Error creating admin session:', error);
      return null;
    }
    
    return sessionToken;
  } catch (error) {
    console.error('Error creating admin session:', error);
    return null;
  }
}

export async function validateAdminSession(sessionToken: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return isAdminWallet(data.wallet_address);
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
} 