// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: 'ไม่ได้เข้าสู่ระบบ' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(sessionCookie.value);

    if (!payload) {
      return NextResponse.json(
        { error: 'เซสชันหมดอายุหรือเซสชันไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        username: payload.username,
        name: payload.name,
        role: payload.role
      }
    });
  } catch (error) {
    console.error('Verify Auth API Error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    );
  }
}
