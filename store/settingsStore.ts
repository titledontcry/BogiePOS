import { create } from 'zustand';

export interface StoreSetting {
  id: number;
  storeName: string;
  storeBranch: string;
  storeAddress: string;
  storeTaxId: string;
  storePhone: string;
  receiptFooter: string;
  enableVat: boolean;
  vatRate: number;
  enablePromptpay: boolean;
  omiseMode: string;
  omisePublicKey: string;
  omiseSecretKey: string;
  updatedAt?: string;
}

interface SettingsStore {
  settings: StoreSetting | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<StoreSetting>) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      set({ settings: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'ไม่สามารถโหลดข้อมูลตั้งค่าได้', isLoading: false });
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to update settings');
      }

      set({ settings: resData, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'ไม่สามารถบันทึกข้อมูลตั้งค่าได้', isLoading: false });
      return false;
    }
  },
}));
