'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  IconSettings,
  IconBuildingStore,
  IconReceiptTax,
  IconCreditCard,
  IconLock,
  IconShieldCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, StoreSetting } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

type SettingsTab = 'store' | 'tax' | 'payment';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { settings, isLoading, error, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');

  // Form states
  const [storeName, setStoreName] = useState('');
  const [storeBranch, setStoreBranch] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeTaxId, setStoreTaxId] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('');
  
  const [enableVat, setEnableVat] = useState(true);
  const [vatRate, setVatRate] = useState('7.0');
  
  const [enablePromptpay, setEnablePromptpay] = useState(true);
  const [omiseMode, setOmiseMode] = useState('test');
  const [omisePublicKey, setOmisePublicKey] = useState('');
  const [omiseSecretKey, setOmiseSecretKey] = useState('');

  const isAdmin = user?.role === 'admin';

  // Load settings into form states
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setStoreBranch(settings.storeBranch || '');
      setStoreAddress(settings.storeAddress || '');
      setStoreTaxId(settings.storeTaxId || '');
      setStorePhone(settings.storePhone || '');
      setReceiptFooter(settings.receiptFooter || '');
      setEnableVat(settings.enableVat);
      setVatRate(settings.vatRate?.toString() || '7.0');
      setEnablePromptpay(settings.enablePromptpay);
      setOmiseMode(settings.omiseMode || 'test');
      setOmisePublicKey(settings.omisePublicKey || '');
      setOmiseSecretKey(settings.omiseSecretKey || '');
    }
  }, [settings]);

  // Fetch settings on mount if not already loaded
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('คุณไม่มีสิทธิ์ในการบันทึกการตั้งค่าระบบ');
      return;
    }

    const payload: Partial<StoreSetting> = {
      storeName,
      storeBranch,
      storeAddress,
      storeTaxId,
      storePhone,
      receiptFooter,
      enableVat,
      vatRate: parseFloat(vatRate) || 0,
      enablePromptpay,
      omiseMode,
      omisePublicKey,
      omiseSecretKey,
    };

    const success = await updateSettings(payload);
    if (success) {
      toast.success('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } else {
      toast.error(error || 'ไม่สามารถบันทึกการตั้งค่าได้');
    }
  };

  const tabs = [
    { id: 'store' as SettingsTab, label: 'ข้อมูลร้านค้า & ใบเสร็จ', icon: IconBuildingStore },
    { id: 'tax' as SettingsTab, label: 'ระบบภาษี & VAT', icon: IconReceiptTax },
    { id: 'payment' as SettingsTab, label: 'ชำระเงิน & Omise', icon: IconCreditCard },
  ];

  return (
    <div className="p-4 lg:p-6 w-full space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <IconSettings className="h-6 w-6 text-primary" /> ตั้งค่าระบบ POS
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            จัดการข้อมูลที่อยู่ร้าน รายละเอียดภาษีมูลค่าเพิ่ม และระบบเชื่อมต่อบัตรเครดิต/PromptPay
          </p>
        </div>
      </div>

      {/* Role Alert */}
      {!isAdmin && (
        <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex gap-3 items-start animate-fade-in-scale select-none shadow-sm">
          <IconAlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">โหมดการดูข้อมูล (View Only Mode)</h4>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
              เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขและบันทึกค่าระบบได้ พนักงานทั่วไป (Cashier) สามารถดูรายละเอียดข้อมูลที่อยู่อ้างอิงและคีย์ใช้งานได้เท่านั้น
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Left Side Tab Menu */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-card text-foreground shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Right Side Settings Form Card */}
        <div className="flex-1 bg-card border rounded-2xl p-5 lg:p-6 shadow-sm min-h-[400px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TAB 1: Store Information */}
            {activeTab === 'store' && (
              <div className="space-y-4 animate-fade-in-scale">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <IconBuildingStore className="h-4.5 w-4.5 text-primary" /> ข้อมูลทั่วไปของร้านค้า
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ข้อมูลส่วนนี้จะถูกนำไปพิมพ์ลงบนส่วนหัวของใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ
                  </p>
                </div>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">ชื่อร้านค้า / นิติบุคคล</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="เช่น หจก.น้องพรีม"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeBranch">สาขา</Label>
                    <Input
                      id="storeBranch"
                      value={storeBranch}
                      onChange={(e) => setStoreBranch(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="เช่น สำนักงานใหญ่"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="storeAddress">ที่อยู่ร้านค้า</Label>
                    <Input
                      id="storeAddress"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="ที่อยู่ร้านที่แสดงในใบเสร็จ"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeTaxId">เลขประจำตัวผู้เสียภาษี (TAX ID)</Label>
                    <Input
                      id="storeTaxId"
                      value={storeTaxId}
                      onChange={(e) => setStoreTaxId(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="เลข 13 หลัก"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storePhone">เบอร์โทรศัพท์ติดต่อ</Label>
                    <Input
                      id="storePhone"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="เช่น 02-123-4567, 08x-xxx-xxxx"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="receiptFooter">ข้อความขอบคุณท้ายบิล</Label>
                    <Input
                      id="receiptFooter"
                      value={receiptFooter}
                      onChange={(e) => setReceiptFooter(e.target.value)}
                      disabled={!isAdmin || isLoading}
                      placeholder="ข้อความขอบคุณท้ายบิลใบเสร็จ"
                      className="rounded-xl bg-muted/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Tax Systems Settings */}
            {activeTab === 'tax' && (
              <div className="space-y-4 animate-fade-in-scale">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <IconReceiptTax className="h-4.5 w-4.5 text-primary" /> ระบบภาษีและอัตราคิดคำนวณ
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ปรับอัตราภาษีมูลค่าเพิ่มตามกฎหมายและควบคุมการคิดเงินหลังร้าน
                  </p>
                </div>
                <Separator />

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableVat" className="text-sm font-bold">เปิดใช้ระบบภาษีมูลค่าเพิ่ม (VAT Included)</Label>
                      <p className="text-xs text-muted-foreground">
                        คำนวณยอดแยกฐานภาษี 7% แสดงในบิลของลูกค้าโดยอัตโนมัติ (ราคาในตะกร้ารวมภาษีไว้แล้ว)
                      </p>
                    </div>
                    <Switch
                      id="enableVat"
                      checked={enableVat}
                      onCheckedChange={setEnableVat}
                      disabled={!isAdmin || isLoading}
                    />
                  </div>

                  {enableVat && (
                    <div className="space-y-2 max-w-[200px] animate-fade-in-scale">
                      <Label htmlFor="vatRate">อัตราภาษีมูลค่าเพิ่ม (%)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="vatRate"
                          type="number"
                          step="0.1"
                          value={vatRate}
                          onChange={(e) => setVatRate(e.target.value)}
                          disabled={!isAdmin || isLoading}
                          className="rounded-xl bg-muted/20 text-center font-bold text-lg h-11"
                        />
                        <span className="font-bold text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Payment Gateway Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-4 animate-fade-in-scale">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <IconCreditCard className="h-4.5 w-4.5 text-primary" /> ตั้งค่า Omise Payment Gateway
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    จัดการคีย์เชื่อมต่อ Omise สำหรับระบบการสแกนโอน PromptPay QR อัตโนมัติ
                  </p>
                </div>
                <Separator />

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
                    <div className="space-y-0.5">
                      <Label htmlFor="enablePromptpay" className="text-sm font-bold">เปิดใช้งาน PromptPay QR Payment</Label>
                      <p className="text-xs text-muted-foreground">
                        เปิดใช้งานปุ่มสแกนคิวอาร์ในการชำระเงินที่หน้า POS
                      </p>
                    </div>
                    <Switch
                      id="enablePromptpay"
                      checked={enablePromptpay}
                      onCheckedChange={setEnablePromptpay}
                      disabled={!isAdmin || isLoading}
                    />
                  </div>

                  {enablePromptpay && (
                    <div className="space-y-4 animate-fade-in-scale border p-4 rounded-xl bg-muted/5">
                      <div className="space-y-2">
                        <Label htmlFor="omiseMode">โหมดเชื่อมต่อระบบ (Omise Connection Mode)</Label>
                        <select
                          id="omiseMode"
                          value={omiseMode}
                          onChange={(e) => setOmiseMode(e.target.value)}
                          disabled={!isAdmin || isLoading}
                          className="flex min-h-[48px] w-full rounded-xl border border-input bg-muted/20 px-3 py-0 text-xs font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="test">โหมดทดสอบ (Sandbox Test Mode)</option>
                          <option value="live">โหมดใช้งานจริง (Production Live Mode)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="omisePublicKey" className="flex items-center gap-1.5">
                            <IconLock className="h-3.5 w-3.5 text-muted-foreground" /> Omise Public Key
                          </Label>
                          <Input
                            id="omisePublicKey"
                            type="password"
                            value={omisePublicKey}
                            onChange={(e) => setStorePublicKeyMasked(e.target.value)}
                            disabled={!isAdmin || isLoading}
                            placeholder="pkey_test_..."
                            className="rounded-xl font-mono text-xs bg-muted/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="omiseSecretKey" className="flex items-center gap-1.5">
                            <IconLock className="h-3.5 w-3.5 text-muted-foreground" /> Omise Secret Key
                          </Label>
                          <Input
                            id="omiseSecretKey"
                            type="password"
                            value={omiseSecretKey}
                            onChange={(e) => setStoreSecretKeyMasked(e.target.value)}
                            disabled={!isAdmin || isLoading}
                            placeholder="skey_test_..."
                            className="rounded-xl font-mono text-xs bg-muted/20"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Footer Action */}
            {isAdmin && (
              <div className="flex justify-end pt-4 border-t gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl px-6 font-bold h-11 gap-1.5"
                >
                  <IconShieldCheck className="h-4.5 w-4.5" /> บันทึกการตั้งค่าระบบ
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  // Masks functions to prevent direct masked key issues
  function setStorePublicKeyMasked(val: string) {
    setOmisePublicKey(val);
  }

  function setStoreSecretKeyMasked(val: string) {
    setOmiseSecretKey(val);
  }
}
