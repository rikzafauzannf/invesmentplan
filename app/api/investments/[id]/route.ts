import { NextRequest, NextResponse } from 'next/server';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
const COLLECTION_NAME = 'investments';

// DELETE - Delete investment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const response = await fetch(
      `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records/${id}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json(
      { error: 'Failed to delete investment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

