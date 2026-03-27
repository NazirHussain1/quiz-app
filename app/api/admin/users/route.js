import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { verifyAdmin } from '@/app/lib/authMiddleware';

export async function GET(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      students: users.filter(u => u.role === 'student').length
    };

    return NextResponse.json({
      success: true,
      users,
      stats
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, error: '