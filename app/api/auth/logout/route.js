import { success } from '@/app/lib/responses';

export async function POST() {
  const response = success(null, 'Logged out successfully');
  
  response.cookies.delete('auth-token');
  
  return response;
}
