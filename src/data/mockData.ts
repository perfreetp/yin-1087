import { DataCategory, MigrateStep, TransferItem, FamilyMember, BackupRecord, RecoveryItem, StorageInfo, TransferProgress } from '@/types';

export const mockMigrateSteps: MigrateStep[] = [
  { id: 1, title: '准备新旧手机', description: '确保两部手机电量充足', completed: true, active: false },
  { id: 2, title: '连接新手机', description: '扫描二维码或使用热点连接', completed: true, active: false },
  { id: 3, title: '检查存储空间', description: '确认新手机有足够空间', completed: false, active: true },
  { id: 4, title: '选择迁移资料', description: '勾选需要迁移的内容', completed: false, active: false },
  { id: 5, title: '开始传输', description: '请保持两部手机靠近', completed: false, active: false }
];

export const mockDataCategories: DataCategory[] = [
  {
    id: 'contacts',
    name: '通讯录',
    icon: '📞',
    description: '联系人姓名、电话号码',
    count: 328,
    size: '2.3 MB',
    sizeBytes: 2359296,
    selected: true,
    priority: 'high'
  },
  {
    id: 'sms',
    name: '短信消息',
    icon: '💬',
    description: '短信和彩信记录',
    count: 1256,
    size: '45.8 MB',
    sizeBytes: 48034611,
    selected: true,
    priority: 'high'
  },
  {
    id: 'photos',
    name: '照片',
    icon: '🖼️',
    description: '相册中的照片',
    count: 2847,
    size: '8.6 GB',
    sizeBytes: 9232848814,
    selected: true,
    priority: 'high'
  },
  {
    id: 'videos',
    name: '视频',
    icon: '🎬',
    description: '拍摄和下载的视频',
    count: 156,
    size: '12.4 GB',
    sizeBytes: 13314398618,
    selected: true,
    priority: 'normal'
  },
  {
    id: 'calendar',
    name: '日历日程',
    icon: '📅',
    description: '日程安排和提醒',
    count: 89,
    size: '856 KB',
    sizeBytes: 876544,
    selected: true,
    priority: 'normal'
  },
  {
    id: 'todo',
    name: '待办事项',
    icon: '✅',
    description: '待办清单和提醒',
    count: 47,
    size: '320 KB',
    sizeBytes: 327680,
    selected: true,
    priority: 'normal'
  },
  {
    id: 'wechat',
    name: '微信文件',
    icon: '💚',
    description: '微信聊天中的图片和文件',
    count: 892,
    size: '3.2 GB',
    sizeBytes: 3435973837,
    selected: false,
    priority: 'normal'
  },
  {
    id: 'apps',
    name: '应用列表',
    icon: '📱',
    description: '已安装应用的清单',
    count: 68,
    size: '1.2 MB',
    sizeBytes: 1258291,
    selected: false,
    priority: 'low'
  }
];

export const mockStorageInfo: StorageInfo = {
  total: '256 GB',
  used: '86 GB',
  available: '170 GB',
  availableBytes: 182536110080,
  requiredBytes: 24567892992,
  sufficient: true
};

export const mockTransferItems: TransferItem[] = [
  { id: '1', category: '通讯录', name: '爸爸的电话号码', size: '2 KB', status: 'completed', progress: 100 },
  { id: '2', category: '通讯录', name: '妈妈的电话号码', size: '2 KB', status: 'completed', progress: 100 },
  { id: '3', category: '短信', name: '银行提醒消息', size: '15 KB', status: 'completed', progress: 100 },
  { id: '4', category: '照片', name: '2024春节全家福.jpg', size: '4.2 MB', status: 'transferring', progress: 65 },
  { id: '5', category: '照片', name: '孙子生日派对.jpg', size: '3.8 MB', status: 'pending', progress: 0 },
  { id: '6', category: '照片', name: '旅行风景照.jpg', size: '5.1 MB', status: 'pending', progress: 0 },
  { id: '7', category: '视频', name: '家庭聚餐.mp4', size: '128 MB', status: 'pending', progress: 0 },
  { id: '8', category: '视频', name: '孙子学走路.mp4', size: '256 MB', status: 'pending', progress: 0 }
];

export const mockTransferProgress: TransferProgress = {
  overall: 35,
  speed: '8.6 MB/s',
  estimatedTime: '约 12 分钟',
  transferred: 456,
  total: 5683,
  transferredSize: '14.2 GB',
  totalSize: '24.6 GB',
  status: 'transferring',
  currentItem: '2024春节全家福.jpg',
  missedItems: [
    { name: '损坏的旧照片.jpg', category: '照片', reason: '文件已损坏' },
    { name: '加密聊天记录.db', category: '微信文件', reason: '文件受保护' }
  ]
};

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: '爸爸',
    relation: '父亲',
    avatar: 'https://picsum.photos/id/64/200/200',
    lastBackup: '今天 14:30',
    backupCount: 12,
    helpCode: '8823 5671',
    online: true
  },
  {
    id: '2',
    name: '妈妈',
    relation: '母亲',
    avatar: 'https://picsum.photos/id/91/200/200',
    lastBackup: '昨天 20:15',
    backupCount: 8,
    helpCode: '3341 9285',
    online: false
  },
  {
    id: '3',
    name: '爷爷',
    relation: '祖父',
    avatar: 'https://picsum.photos/id/177/200/200',
    lastBackup: '3天前',
    backupCount: 5,
    helpCode: '6617 4428',
    online: true
  }
];

export const mockBackupRecords: BackupRecord[] = [
  { id: '1', date: '2024-06-15 14:30', size: '24.6 GB', categories: ['通讯录', '照片', '视频'], device: '华为 Mate 60' },
  { id: '2', date: '2024-06-08 09:15', size: '22.8 GB', categories: ['通讯录', '照片'], device: '华为 Mate 60' },
  { id: '3', date: '2024-06-01 18:45', size: '21.5 GB', categories: ['通讯录', '照片', '短信'], device: '华为 Mate 60' }
];

export const mockRecoveryItems: RecoveryItem[] = [
  {
    id: '1',
    name: '家庭聚餐照片.jpg',
    category: '照片',
    deleteTime: '2天前',
    expireTime: '28天后自动删除',
    size: '4.2 MB',
    thumbnail: 'https://picsum.photos/id/292/200/200'
  },
  {
    id: '2',
    name: '孙子生日视频.mp4',
    category: '视频',
    deleteTime: '5天前',
    expireTime: '25天后自动删除',
    size: '128 MB',
    thumbnail: 'https://picsum.photos/id/312/200/200'
  },
  {
    id: '3',
    name: '重要联系人.vcf',
    category: '通讯录',
    deleteTime: '1周前',
    expireTime: '23天后自动删除',
    size: '156 KB'
  },
  {
    id: '4',
    name: '旅行风景照片.jpg',
    category: '照片',
    deleteTime: '10天前',
    expireTime: '20天后自动删除',
    size: '3.8 MB',
    thumbnail: 'https://picsum.photos/id/1015/200/200'
  },
  {
    id: '5',
    name: '体检报告.pdf',
    category: '微信文件',
    deleteTime: '2周前',
    expireTime: '16天后自动删除',
    size: '2.1 MB'
  }
];
