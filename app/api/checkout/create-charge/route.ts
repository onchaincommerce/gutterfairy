import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, amount, currency, metadata } = body;

    // Convert amount from wei format to USDC (6 decimals)
    const usdcAmount = (parseInt(amount) / 1000000).toFixed(2);

    const chargeData = {
      local_price: { 
        amount: usdcAmount, 
        currency: currency || 'USDC' 
      },
      pricing_type: 'fixed_price',
      name: productName,
      description: `Gutter Fairy - ${productName}`,
      metadata: {
        ...metadata,
        source: 'gutter-fairy-website',
        productId,
      }
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!
      },
      body: JSON.stringify(chargeData),
    };

    const response = await fetch('https://api.commerce.coinbase.com/charges', options);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Coinbase Commerce API error:', errorData);
      throw new Error(`Coinbase Commerce API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      id: data.id,
      charge: data
    });

  } catch (error) {
    console.error('Error creating charge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create charge' 
      },
      { status: 500 }
    );
  }
} 