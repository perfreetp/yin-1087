export interface DataCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  size: string;
  sizeBytes: number;
  selected: boolean;
  priority: 'high' | 'normal' | 'low';
}

export interface MigrateStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface TransferItem {
  id: string;
  category: string;
  categoryId: string;
  name: string;
  size: string;
  sizeBytes: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  progress: number;
  priority: 'high' | 'normal' | 'low';
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  lastBackup: string;
  backupCount: number;
  helpCode: string;
  online: boolean;
  backupRecords: BackupRecord[];
  transferProgress?: TransferProgress;
}

export interface BackupRecord {
  id: string;
  date: string;
  size: string;
  categories: string[];
  device: string;
}

export interface RecoveryItem {
  id: string;
  name: string;
  category: string;
  deleteTime: string;
  expireTime: string;
  size: string;
  thumbnail?: string;
}

export interface StorageInfo {
  total: string;
  used: string;
  available: string;
  availableBytes: number;
  requiredBytes: number;
  sufficient: boolean;
}

export interface TransferProgress {
  overall: number;
  speed: string;
  estimatedTime: string;
  transferred: number;
  total: number;
  transferredSize: string;
  totalSize: string;
  status: 'idle' | 'connecting' | 'transferring' | 'paused' | 'completed' | 'failed' | 'reconnecting';
  currentItem: string;
  missedItems: MissedItem[];
}

export interface MissedItem {
  name: string;
  category: string;
  reason: string;
}

export interface RemoteProgressView {
  helpCode: string;
  memberName: string;
  memberRelation: string;
  currentStep: number;
  transferProgress: TransferProgress | null;
  lastUpdated: string;
}

export interface CategoryReport {
  categoryId: string;
  categoryName: string;
  icon: string;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  successSize: string;
  skippedSize: string;
  failedSize: string;
  totalSize: string;
}

export interface MigrationReport {
  id: string;
  date: string;
  overall: number;
  totalItems: number;
  successItems: number;
  skippedItems: number;
  failedItems: number;
  totalSize: string;
  successSize: string;
  failedSize: string;
  duration: string;
  categories: CategoryReport[];
  missedItems: MissedItem[];
  deviceFrom: string;
  deviceTo: string;
}
