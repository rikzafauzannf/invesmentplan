import { NextResponse } from 'next/server';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const COLLECTION_NAME = 'investments';

// This endpoint can be polled for real-time updates
// For true real-time, you might want to use Server-Sent Events (SSE) or WebSockets
export async function GET() {
  try {
    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records?sort=-date`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const investments = data.items.map((item: any) => ({
      id: item.id,
      date: item.date,
      btcAmount: item.btcAmount,
      btcPrice: item.btcPrice,
      btcQuantity: item.btcQuantity,
    }));

    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

