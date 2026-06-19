import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

// Helper to check admin access
async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const payload = verifyJWT(sessionCookie.value);
  if (!payload || payload.role !== 'admin') {
    return null;
  }

  return payload;
}

// GET /api/settings - Fetch store settings (creates default if empty)
export async function GET() {
  try {
    let settings = await prisma.storeSetting.findFirst();
    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          storeName: 'หจก.น้องพรีม',
          storeBranch: 'สำนักงานใหญ่ (Branch 00000)',
          storeAddress: 'แขวงเสนานิคม เขตจตุจักร กรุงเทพมหานคร',
          storeTaxId: '',
          storePhone: '064-514-5498',
          receiptFooter: 'ขอบคุณที่อุดหนุนสินค้าของเรา / Thank You for Your Business. สินค้าซื้อแล้วไม่รับเปลี่ยนหรือคืน / No Exchange, No Return.',
          enableVat: true,
          vatRate: 7.0,
          enablePromptpay: true,
          omiseMode: 'test',
          omisePublicKey: '',
          omiseSecretKey: '',
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลตั้งค่าระบบได้' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings (admin only)
export async function POST(request: Request) {
  try {
    const adminUser = await verifyAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขค่าตั้งค่าได้' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Pick allowed fields to prevent arbitrary updates (especially id)
    const {
      storeName,
      storeBranch,
      storeAddress,
      storeTaxId,
      storePhone,
      receiptFooter,
      enableVat,
      vatRate,
      enablePromptpay,
      omiseMode,
      omisePublicKey,
      omiseSecretKey,
    } = body;

    const updateData = {
      ...(storeName !== undefined && { storeName }),
      ...(storeBranch !== undefined && { storeBranch }),
      ...(storeAddress !== undefined && { storeAddress }),
      ...(storeTaxId !== undefined && { storeTaxId }),
      ...(storePhone !== undefined && { storePhone }),
      ...(receiptFooter !== undefined && { receiptFooter }),
      ...(enableVat !== undefined && { enableVat }),
      ...(vatRate !== undefined && { vatRate: parseFloat(vatRate) }),
      ...(enablePromptpay !== undefined && { enablePromptpay }),
      ...(omiseMode !== undefined && { omiseMode }),
      ...(omisePublicKey !== undefined && { omisePublicKey }),
      ...(omiseSecretKey !== undefined && { omiseSecretKey }),
    };

    let settings = await prisma.storeSetting.findFirst();
    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          ...updateData,
          id: 1,
        },
      });
    } else {
      settings = await prisma.storeSetting.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถบันทึกค่าตั้งค่าระบบได้' },
      { status: 500 }
    );
  }
}
