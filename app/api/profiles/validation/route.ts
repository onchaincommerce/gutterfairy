import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Add CORS headers for Smart Wallet
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const requestData = await request.json();
    console.log('Profile validation request:', JSON.stringify(requestData, null, 2));

    // Extract data from request following Base documentation format
    const email = requestData.requestedInfo?.email;
    const physicalAddress = requestData.requestedInfo?.physicalAddress;
    const walletAddress = requestData.requestedInfo?.walletAddress;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors: any = {};

    // Validate email
    if (email) {
      // Basic email validation (Smart Wallet already does basic validation)
      if (email.endsWith('@example.com') || email.endsWith('@test.com')) {
        errors.email = "Please use a valid email address";
      }
      
      // Check email length
      if (email.length > 254) {
        errors.email = "Email address too long";
      }

      // Additional email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Validate physical address - following Base documentation structure
    if (physicalAddress?.physicalAddress) {
      const addr = physicalAddress.physicalAddress;
      
      if (!errors.physicalAddress) errors.physicalAddress = {};
      
      // Validate required fields
      if (!addr.address1 || addr.address1.trim().length < 5) {
        errors.physicalAddress.address1 = "Street address must be at least 5 characters";
      }
      
      if (!addr.city || addr.city.trim().length < 2) {
        errors.physicalAddress.city = "City is required";
      }
      
      if (!addr.state || addr.state.trim().length < 2) {
        errors.physicalAddress.state = "State/Province is required";
      }
      
      if (!addr.postalCode || addr.postalCode.trim().length < 3) {
        errors.physicalAddress.postalCode = "Valid postal code is required";
      }
      
      if (!addr.countryCode || addr.countryCode.trim().length !== 2) {
        errors.physicalAddress.countryCode = "Valid country code is required";
      }
      
      // Business rules - countries we don't ship to
      const restrictedCountries = ['XX', 'YY']; // Add actual restricted country codes
      if (restrictedCountries.includes(addr.countryCode.toUpperCase())) {
        errors.physicalAddress.countryCode = "Sorry, we don't ship to this country yet";
      }
      
      // Remove physicalAddress from errors if no validation errors
      if (Object.keys(errors.physicalAddress).length === 0) {
        delete errors.physicalAddress;
      }
    }

    // If validation errors exist, return them
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors found:', errors);
      return NextResponse.json({ 
        errors,
        // Don't return request when there are errors
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Validation passed - log the collected data (database operations removed for deployment)
    if (walletAddress && email && physicalAddress?.physicalAddress) {
      console.log('✅ Profile data collected successfully:', {
        walletAddress,
        email,
        address: physicalAddress.physicalAddress
      });
    }

    // Success - MUST return the original calls (REQUIRED by Smart Wallet)
    console.log('Validation successful, returning original calls');
    return NextResponse.json({
      request: {
        calls: requestData.calls,
        chainId: requestData.chainId,
        version: requestData.version,
      },
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error processing profile validation:', error);
    
    // Return a proper error response that doesn't break the flow
    return NextResponse.json({
      errors: { 
        server: "Server error validating data. Please try again." 
      }
    }, { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }); // Use 400 instead of 500 to prevent breaking the flow
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 