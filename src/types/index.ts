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
  name: string;
  size: string;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  progress: number;
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
