import { create } from 'zustand';
import { DataCategory, TransferProgress, StorageInfo, MissedItem } from '@/types';
import { mockDataCategories, mockStorageInfo, mockTransferProgress } from '@/data/mockData';

interface MigrateState {
  currentStep: number;
  categories: DataCategory[];
  storageInfo: StorageInfo;
  transferProgress: TransferProgress;
  deviceConnected: boolean;

  setCurrentStep: (step: number) => void;
  toggleCategory: (id: string) => void;
  setCategoryPriority: (id: string, priority: 'high' | 'normal' | 'low') => void;
  selectAllCategories: () => void;
  deselectAllCategories: () => void;
  getSelectedSize: () => number;
  getSelectedCount: () => number;
  startTransfer: () => void;
  pauseTransfer: () => void;
  resumeTransfer: () => void;
  setConnectionStatus: (connected: boolean) => void;
  updateProgress: (progress: Partial<TransferProgress>) => void;
}

export const useMigrateStore = create<MigrateState>((set, get) => ({
  currentStep: 3,
  categories: mockDataCategories,
  storageInfo: mockStorageInfo,
  transferProgress: mockTransferProgress,
  deviceConnected: true,

  setCurrentStep: (step) => set({ currentStep: step }),

  toggleCategory: (id) => set((state) => ({
    categories: state.categories.map(cat =>
      cat.id === id ? { ...cat, selected: !cat.selected } : cat
    )
  })),

  setCategoryPriority: (id, priority) => set((state) => ({
    categories: state.categories.map(cat =>
      cat.id === id ? { ...cat, priority } : cat
    )
  })),

  selectAllCategories: () => set((state) => ({
    categories: state.categories.map(cat => ({ ...cat, selected: true }))
  })),

  deselectAllCategories: () => set((state) => ({
    categories: state.categories.map(cat => ({ ...cat, selected: false }))
  })),

  getSelectedSize: () => {
    const state = get();
    return state.categories
      .filter(cat => cat.selected)
      .reduce((sum, cat) => sum + cat.sizeBytes, 0);
  },

  getSelectedCount: () => {
    const state = get();
    return state.categories
      .filter(cat => cat.selected)
      .reduce((sum, cat) => sum + cat.count, 0);
  },

  startTransfer: () => set({
    transferProgress: {
      ...get().transferProgress,
      status: 'transferring'
    }
  }),

  pauseTransfer: () => set({
    transferProgress: {
      ...get().transferProgress,
      status: 'paused'
    }
  }),

  resumeTransfer: () => set({
    transferProgress: {
      ...get().transferProgress,
      status: 'transferring'
    }
  }),

  setConnectionStatus: (connected) => set({ deviceConnected: connected }),

  updateProgress: (progress) => set((state) => ({
    transferProgress: { ...state.transferProgress, ...progress }
  }))
}));
