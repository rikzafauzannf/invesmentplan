import { NextRequest, NextResponse } from 'next/server';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const COLLECTION_NAME = 'investments';

// GET - Fetch all investments
export async function GET() {
  try {
    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records?sort=-date`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform PocketBase response to match our interface
    const investments = data.items.map((item: any) => ({
      id: item.id,
      date: item.date,
      coinSymbol: item.coinSymbol || 'btc',
      amount: item.amount !== undefined ? item.amount : item.btcAmount,
      price: item.price !== undefined ? item.price : item.btcPrice,
      quantity: item.quantity !== undefined ? item.quantity : item.btcQuantity,
      type: item.type || ((item.amount < 0 || item.btcAmount < 0) ? 'sell' : 'buy'),
    }));


    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new investment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: body.date,
          coinSymbol: body.coinSymbol,
          amount: body.amount,
          price: body.price,
          quantity: body.quantity,
          type: body.type || 'buy',
          // Legacy fields for backward compatibility if user hasn't added new ones yet
          btcAmount: body.coinSymbol === 'btc' ? body.amount : 0,
          btcPrice: body.coinSymbol === 'btc' ? body.price : 0,
          btcQuantity: body.coinSymbol === 'btc' ? body.quantity : 0,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`PocketBase error: ${errorData}`);
    }

    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      date: data.date,
      coinSymbol: data.coinSymbol,
      amount: data.amount,
      price: data.price,
      quantity: data.quantity,
      type: data.type,
    });

  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Failed to create investment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


