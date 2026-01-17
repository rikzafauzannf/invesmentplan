// PocketBase client configuration
// PocketBase runs locally, so we use API routes to interact with it

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pocketbaseUrl = POCKETBASE_URL;

// Helper function to make API calls to PocketBase through Next.js API routes
export async function fetchInvestments() {
  const response = await fetch('/api/investments');
  if (!response.ok) {
    throw new Error('Failed to fetch investments');
  }
  return response.json();
}

export async function createInvestment(data: {
  date: string;
  coinSymbol: string;
  amount: number;
  price: number;
  quantity: number;
  type?: 'buy' | 'sell';
}) {
  const response = await fetch('/api/investments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create investment');
  }
  return response.json();
}

export async function deleteInvestment(id: string) {
  const response = await fetch(`/api/investments/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete investment');
  }
  return response.json();
}


