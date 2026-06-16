import { create } from 'zustand';
import {
  DataCategory,
  TransferProgress,
  StorageInfo,
  FamilyMember,
  TransferItem,
  RemoteProgressView,
  BackupRecord
} from '@/types';
import {
  mockDataCategories,
  mockStorageInfo,
  mockTransferProgress,
  mockFamilyMembers,
  generateHelpCode,
  formatBytes,
  formatDate,
  getAvatarById
} from '@/data/mockData';

interface MigrateState {
  currentStep: number;
  categories: DataCategory[];
  storageInfo: StorageInfo;
  transferProgress: TransferProgress;
  deviceConnected: boolean;
  transferItems: TransferItem[];
  familyMembers: FamilyMember[];
  remoteProgress: RemoteProgressView | null;
  myHelpCode: string;
  selectedMemberForBackup: FamilyMember | null;

  setCurrentStep: (step: number) => void;
  toggleCategory: (id: string) => void;
  setCategoryPriority: (id: string, priority: 'high' | 'normal' | 'low') => void;
  selectAllCategories: () => void;
  deselectAllCategories: () => void;
  getSelectedSize: () => number;
  getSelectedCount: () => number;
  updateStorageRequirement: () => void;
  generateTransferList: () => TransferItem[];
  startTransfer: () => void;
  pauseTransfer: () => void;
  resumeTransfer: () => void;
  setConnectionStatus: (connected: boolean) => void;
  updateProgress: (progress: Partial<TransferProgress>) => void;

  addFamilyMember: (name: string, relation: string) => void;
  removeFamilyMember: (id: string) => void;
  getMemberByHelpCode: (code: string) => FamilyMember | undefined;
  viewRemoteProgress: (helpCode: string) => boolean;
  clearRemoteProgress: () => void;

  addBackupRecordForMember: (memberId: string, record: Omit<BackupRecord, 'id'>) => void;
}

const sampleNames: Record<string, string[]> = {
  '父亲': ['爸爸', '老爸', '父亲'],
  '母亲': ['妈妈', '老妈', '母亲'],
  '祖父': ['爷爷', '祖父'],
  '祖母': ['奶奶', '祖母'],
  '岳父': ['岳父'],
  '岳母': ['岳母'],
  '儿子': ['儿子'],
  '女儿': ['女儿'],
  '兄弟': ['哥哥', '弟弟'],
  '姐妹': ['姐姐', '妹妹']
};

const generateSampleTransferItems = (categories: DataCategory[]): TransferItem[] => {
  const items: TransferItem[] = [];
  let itemId = 1;

  const sampleItems: Record<string, { names: string[]; categoryId: string }> = {
    'contacts': {
      categoryId: 'contacts',
      names: ['爸爸的电话号码', '妈妈的电话号码', '爷爷的电话号码', '儿子的电话', '女儿的电话', '家里固定电话']
    },
    'sms': {
      categoryId: 'sms',
      names: ['银行提醒消息', '医院预约确认', '快递取件通知', '水电费账单', '子女的问候短信']
    },
    'photos': {
      categoryId: 'photos',
      names: ['2024春节全家福.jpg', '孙子生日派对.jpg', '旅行风景照.jpg', '家庭聚餐照片.jpg', '孙子学走路.jpg', '公园游玩.jpg', '年夜饭.jpg']
    },
    'videos': {
      categoryId: 'videos',
      names: ['家庭聚餐.mp4', '孙子学走路.mp4', '生日派对视频.mp4', '春节晚会.mp4', '旅行记录.mp4']
    },
    'calendar': {
      categoryId: 'calendar',
      names: ['孙子生日提醒', '体检预约', '家庭聚餐', '医院复查', '春节火车票抢票提醒']
    },
    'todo': {
      categoryId: 'todo',
      names: ['买降压药', '交水电费', '给孙子买礼物', '预约体检', '整理相册']
    },
    'wechat': {
      categoryId: 'wechat',
      names: ['家庭群照片.png', '体检报告.pdf', '旅游攻略.docx', '孙子的语音.mp3', '红包记录截图.jpg']
    },
    'apps': {
      categoryId: 'apps',
      names: ['微信', '支付宝', '抖音', '今日头条', '拼多多', '京东', '淘宝']
    }
  };

  categories.filter(c => c.selected).forEach(category => {
    const sample = sampleItems[category.id];
    if (sample) {
      sample.names.forEach(name => {
        const sizeBytes = Math.floor(Math.random() * 5000000) + 100000;
        items.push({
          id: String(itemId++),
          category: category.name,
          categoryId: category.id,
          name,
          size: formatBytes(sizeBytes),
          sizeBytes,
          status: 'pending',
          progress: 0,
          priority: category.priority
        });
      });
    }
  });

  return items;
};

const sortByPriority = (items: TransferItem[]): TransferItem[] => {
  const priorityOrder = { high: 0, normal: 1, low: 2 };
  return [...items].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return parseInt(a.id) - parseInt(b.id);
  });
};

export const useMigrateStore = create<MigrateState>((set, get) => ({
  currentStep: 3,
  categories: mockDataCategories,
  storageInfo: { ...mockStorageInfo },
  transferProgress: { ...mockTransferProgress },
  deviceConnected: true,
  transferItems: [],
  familyMembers: [...mockFamilyMembers],
  remoteProgress: null,
  myHelpCode: '45218793',
  selectedMemberForBackup: null,

  setCurrentStep: (step) => {
    console.log('[MigrateStore] 设置当前步骤:', step);
    set({ currentStep: step });
  },

  toggleCategory: (id) => {
    console.log('[MigrateStore] 切换分类:', id);
    set((state) => ({
      categories: state.categories.map(cat =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    }));
    get().updateStorageRequirement();
  },

  setCategoryPriority: (id, priority) => {
    console.log('[MigrateStore] 设置优先级:', id, priority);
    set((state) => ({
      categories: state.categories.map(cat =>
        cat.id === id ? { ...cat, priority } : cat
      )
    }));
  },

  selectAllCategories: () => {
    console.log('[MigrateStore] 全选');
    set((state) => ({
      categories: state.categories.map(cat => ({ ...cat, selected: true }))
    }));
    get().updateStorageRequirement();
  },

  deselectAllCategories: () => {
    console.log('[MigrateStore] 清空选择');
    set((state) => ({
      categories: state.categories.map(cat => ({ ...cat, selected: false }))
    }));
    get().updateStorageRequirement();
  },

  getSelectedSize: () => {
    const state = get();
    const size = state.categories
      .filter(cat => cat.selected)
      .reduce((sum, cat) => sum + cat.sizeBytes, 0);
    console.log('[MigrateStore] 选中大小:', formatBytes(size));
    return size;
  },

  getSelectedCount: () => {
    const state = get();
    return state.categories
      .filter(cat => cat.selected)
      .reduce((sum, cat) => sum + cat.count, 0);
  },

  updateStorageRequirement: () => {
    const state = get();
    const requiredBytes = state.getSelectedSize();
    const sufficient = requiredBytes <= state.storageInfo.availableBytes;

    console.log('[MigrateStore] 更新存储空间需求:', {
      required: formatBytes(requiredBytes),
      available: state.storageInfo.available,
      sufficient
    });

    set((state) => ({
      storageInfo: {
        ...state.storageInfo,
        requiredBytes,
        sufficient
      }
    }));
  },

  generateTransferList: () => {
    const state = get();
    const items = generateSampleTransferItems(state.categories);
    const sortedItems = sortByPriority(items);

    console.log('[MigrateStore] 生成传输列表，共', sortedItems.length, '项');
    console.log('[MigrateStore] 高优先级:', sortedItems.filter(i => i.priority === 'high').length, '项');
    console.log('[MigrateStore] 普通优先级:', sortedItems.filter(i => i.priority === 'normal').length, '项');
    console.log('[MigrateStore] 低优先级:', sortedItems.filter(i => i.priority === 'low').length, '项');

    set({ transferItems: sortedItems });
    return sortedItems;
  },

  startTransfer: () => {
    console.log('[MigrateStore] 开始传输');
    const state = get();
    const transferList = state.generateTransferList();
    const totalSize = state.getSelectedSize();
    const totalCount = state.getSelectedCount();

    set({
      transferProgress: {
        ...state.transferProgress,
        status: 'transferring',
        overall: 0,
        total: totalCount,
        transferred: 0,
        totalSize: formatBytes(totalSize),
        transferredSize: '0 GB',
        speed: '计算中...',
        estimatedTime: '计算中...',
        currentItem: transferList.length > 0 ? transferList[0].name : '等待中...',
        missedItems: []
      }
    });

    set({ currentStep: 5 });
  },

  pauseTransfer: () => {
    console.log('[MigrateStore] 暂停传输');
    set((state) => ({
      transferProgress: {
        ...state.transferProgress,
        status: 'paused'
      }
    }));
  },

  resumeTransfer: () => {
    console.log('[MigrateStore] 继续传输');
    set((state) => ({
      transferProgress: {
        ...state.transferProgress,
        status: 'transferring'
      }
    }));
  },

  setConnectionStatus: (connected) => {
    console.log('[MigrateStore] 连接状态:', connected);
    set({ deviceConnected: connected });
  },

  updateProgress: (progress) => {
    console.log('[MigrateStore] 更新进度:', progress);
    set((state) => ({
      transferProgress: { ...state.transferProgress, ...progress }
    }));
  },

  addFamilyMember: (name, relation) => {
    console.log('[MigrateStore] 添加家庭成员:', name, relation);
    const newId = String(Date.now());
    const helpCode = generateHelpCode();
    const avatarId = Math.floor(Math.random() * 100) + 100;

    const newMember: FamilyMember = {
      id: newId,
      name: name || (sampleNames[relation]?.[0] || '家人'),
      relation,
      avatar: getAvatarById(avatarId),
      lastBackup: '暂无备份',
      backupCount: 0,
      helpCode,
      online: false,
      backupRecords: []
    };

    set((state) => ({
      familyMembers: [...state.familyMembers, newMember]
    }));

    console.log('[MigrateStore] 新成员协助码:', helpCode);
    Taro.showToast({ title: '添加成功', icon: 'success' });
  },

  removeFamilyMember: (id) => {
    console.log('[MigrateStore] 删除家庭成员:', id);
    set((state) => ({
      familyMembers: state.familyMembers.filter(m => m.id !== id)
    }));
  },

  getMemberByHelpCode: (code) => {
    const cleanCode = code.replace(/\s/g, '');
    console.log('[MigrateStore] 根据协助码查找成员:', cleanCode);
    return get().familyMembers.find(m => m.helpCode === cleanCode);
  },

  viewRemoteProgress: (helpCode) => {
    const cleanCode = helpCode.replace(/\s/g, '');
    console.log('[MigrateStore] 查看远程进度:', cleanCode);

    const member = get().getMemberByHelpCode(cleanCode);
    if (!member) {
      console.log('[MigrateStore] 未找到成员');
      Taro.showToast({ title: '协助码无效', icon: 'none' });
      return false;
    }

    const remoteView: RemoteProgressView = {
      helpCode: cleanCode,
      memberName: member.name,
      memberRelation: member.relation,
      currentStep: member.transferProgress ? 5 : 3,
      transferProgress: member.transferProgress || null,
      lastUpdated: formatDate(new Date())
    };

    set({ remoteProgress: remoteView });
    console.log('[MigrateStore] 远程进度已加载:', remoteView);
    return true;
  },

  clearRemoteProgress: () => {
    console.log('[MigrateStore] 清除远程进度视图');
    set({ remoteProgress: null });
  },

  addBackupRecordForMember: (memberId, record) => {
    console.log('[MigrateStore] 为成员添加备份记录:', memberId, record);
    const newRecord: BackupRecord = {
      ...record,
      id: String(Date.now())
    };

    set((state) => ({
      familyMembers: state.familyMembers.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            backupRecords: [newRecord, ...m.backupRecords],
            backupCount: m.backupCount + 1,
            lastBackup: record.date
          };
        }
        return m;
      })
    }));
  }
}));
