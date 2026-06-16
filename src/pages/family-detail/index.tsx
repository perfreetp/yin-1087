import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useMigrateStore } from '@/store/migrate';
import { BackupRecord, FamilyMember } from '@/types';
import ProgressRing from '@/components/ProgressRing';
import styles from './index.module.scss';

const formatHelpCode = (code: string): string => {
  if (!code) return '';
  const clean = code.replace(/\s/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const FamilyDetailPage: React.FC = () => {
  const {
    familyMembers,
    viewRemoteProgress,
    clearRemoteProgress,
    remoteProgress,
    removeFamilyMember,
  } = useMigrateStore();

  const [memberId, setMemberId] = useState<string>('');
  const [showRemoteView, setShowRemoteView] = useState(false);

  const member = useMemo<FamilyMember | undefined>(() => {
    return familyMembers.find(m => m.id === memberId);
  }, [familyMembers, memberId]);

  const formattedCode = useMemo(() => {
    return member ? formatHelpCode(member.helpCode) : '';
  }, [member]);

  const latestBackup = useMemo(() => {
    if (!member || member.backupRecords.length === 0) return null;
    return member.backupRecords[0];
  }, [member]);

  const historyBackups = useMemo(() => {
    if (!member || member.backupRecords.length <= 1) return [];
    return member.backupRecords.slice(1);
  }, [member]);

  React.useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1] as any;
    const options = currentPage?.options || {};
    const id = options.id || '';
    console.log('[FamilyDetail] 页面参数:', options, 'memberId:', id);
    setMemberId(id);

    if (id && member) {
      Taro.setNavigationBarTitle({ title: `${member.name}的详情` });
    }
  }, [member]);

  const handleCopyCode = () => {
    if (!member) return;
    Taro.setClipboardData({
      data: member.helpCode,
      success: () => {
        Taro.showToast({ title: '已复制协助码', icon: 'success' });
      }
    });
  };

  const handleViewProgress = () => {
    if (!member) return;
    console.log('[FamilyDetail] 查看详细进度，协助码:', member.helpCode);
    clearRemoteProgress();
    const success = viewRemoteProgress(member.helpCode);
    if (success) {
      setShowRemoteView(true);
    }
  };

  const handleBackToDetail = () => {
    setShowRemoteView(false);
    clearRemoteProgress();
  };

  const handleBackToBackup = () => {
    clearRemoteProgress();
    Taro.navigateBack();
  };

  const handleRestoreBackup = (record: BackupRecord) => {
    Taro.showModal({
      title: '确认恢复',
      content: `恢复「${record.date}」的备份将覆盖当前设备上的同名数据，是否继续？`,
      confirmText: '确认恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '开始恢复备份', icon: 'success' });
        }
      }
    });
  };

  const handleDeleteMember = () => {
    if (!member) return;
    Taro.showModal({
      title: '移除家人',
      content: `确定要移除「${member.name}（${member.relation}）」吗？\n\n移除后将无法再查看其进度和备份记录。`,
      confirmText: '移除',
      confirmColor: '#F56C6C',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          console.log('[FamilyDetail] 确认移除成员:', member.id, member.name);
          removeFamilyMember(member.id);
          Taro.showToast({ title: '已移除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 500);
        } else {
          console.log('[FamilyDetail] 取消移除');
        }
      }
    });
  };

  if (!member) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyIcon}>👤</Text>
        <Text className={styles.emptyText}>未找到该家人信息</Text>
        <Button className="btn-primary" style={{ marginTop: 40 }} onClick={() => Taro.navigateBack()}>
          返回
        </Button>
      </View>
    );
  }

  if (showRemoteView && remoteProgress) {
    const rp = remoteProgress;
    const tp = rp.transferProgress;
    return (
      <View className={styles.pageContainer}>
        <View className={styles.remoteViewHeader}>
          <Text className={styles.backBtn} onClick={handleBackToDetail}>
            ← 返回详情
          </Text>
          <Text className={styles.remoteViewTitle}>
            {rp.memberName}的迁移进度
          </Text>
          <Text className={styles.backBtn} onClick={handleBackToBackup}>
            返回列表
          </Text>
        </View>

        <ScrollView scrollY className={styles.remoteViewContent}>
          <View className={styles.remoteProgressHeader}>
            {tp ? (
              <ProgressRing
                percentage={tp.overall}
                status={tp.status}
                size={280}
                strokeWidth={18}
              />
            ) : (
              <ProgressRing
                percentage={0}
                status="idle"
                size={280}
                strokeWidth={18}
              />
            )}
            <View className={styles.remoteMemberInfo}>
              <Text className={styles.remoteMemberName}>{rp.memberName}（{rp.memberRelation}）</Text>
              <Text className={styles.remoteUpdateTime}>更新于 {rp.lastUpdated}</Text>
            </View>
          </View>

          {tp && (
            <>
              <View className={styles.remoteStats}>
                <View className={styles.remoteStatItem}>
                  <Text className={styles.remoteStatValue}>{tp.transferredSize}</Text>
                  <Text className={styles.remoteStatLabel}>已传输</Text>
                </View>
                <View className={styles.remoteStatItem}>
                  <Text className={styles.remoteStatValue}>{tp.speed}</Text>
                  <Text className={styles.remoteStatLabel}>传输速度</Text>
                </View>
                <View className={styles.remoteStatItem}>
                  <Text className={styles.remoteStatValue}>{tp.estimatedTime}</Text>
                  <Text className={styles.remoteStatLabel}>剩余时间</Text>
                </View>
              </View>
              <View className={styles.remoteCurrentItem}>
                <Text className={styles.remoteCurrentLabel}>当前状态</Text>
                <Text className={styles.remoteCurrentText}>
                  {tp.status === 'completed' ? '迁移完成' : tp.currentItem}
                </Text>
              </View>
              <View className={styles.remoteProgressInfo}>
                <Text className={styles.remoteProgressText}>
                  共 {tp.transferred}/{tp.total} 项
                </Text>
              </View>
              {tp.missedItems.length > 0 && (
                <View className={styles.remoteMissed}>
                  <Text className={styles.remoteMissedTitle}>
                    ⚠️ {tp.missedItems.length} 项未迁移
                  </Text>
                  {tp.missedItems.map((item, idx) => (
                    <View key={idx} className={styles.remoteMissedItem}>
                      <Text>{item.name}</Text>
                      <Text className={styles.remoteMissedReason}>{item.reason}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {!tp && (
            <View className={styles.remoteNoProgress}>
              <Text className={styles.remoteNoProgressIcon}>📤</Text>
              <Text className={styles.remoteNoProgressText}>暂无迁移进度</Text>
              <Text className={styles.remoteNoProgressTip}>对方还未开始迁移</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  const tp = member.transferProgress;
  const hasProgress = tp && tp.status !== 'idle';

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>{member.name.slice(0, 1)}</Text>
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{member.name}</Text>
          <View className={styles.relationTag}>
            <Text className={styles.relationText}>{member.relation}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>协助码</Text>
        <View className={styles.codeCard}>
          <Text className={styles.codeText}>{formattedCode}</Text>
          <Button className={`${styles.codeBtn} btn-secondary`} onClick={handleCopyCode}>
            复制
          </Button>
        </View>
        <Text className={styles.tip}>
          💡 将协助码发送给对方，可远程查看迁移进度
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>当前迁移状态</Text>
        {hasProgress ? (
          <View className={styles.progressCard}>
            <View className={styles.progressHeader}>
              <ProgressRing
                percentage={tp!.overall}
                status={tp!.status}
                size={120}
                strokeWidth={10}
              />
              <View className={styles.progressInfo}>
                <Text className={styles.progressStatus}>
                  {tp!.status === 'completed' ? '迁移完成' :
                   tp!.status === 'transferring' ? '迁移中' :
                   tp!.status === 'paused' ? '已暂停' :
                   tp!.status === 'failed' ? '迁移失败' : '准备中'}
                </Text>
                <Text className={styles.progressDetail}>
                  已传 {tp!.transferredSize} / 共 {tp!.totalSize}
                </Text>
                <Text className={styles.progressCount}>
                  {tp!.transferred}/{tp!.total} 项
                </Text>
              </View>
            </View>
            <Button className="btn-primary" style={{ marginTop: 24 }} onClick={handleViewProgress}>
              查看详细进度
            </Button>
          </View>
        ) : (
          <View className={styles.noProgress}>
            <Text className={styles.noProgressIcon}>📤</Text>
            <Text className={styles.noProgressText}>暂无迁移任务</Text>
            <Text className={styles.noProgressTip}>对方开始迁移后可在此查看进度</Text>
            <Button className="btn-secondary" style={{ marginTop: 24 }} onClick={handleViewProgress}>
              查看详细进度
            </Button>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>最近备份</Text>
        {latestBackup ? (
          <View className={styles.latestBackup}>
            <View className={styles.latestBackupIcon}>
              <Text>💾</Text>
            </View>
            <View className={styles.latestBackupInfo}>
              <Text className={styles.latestBackupLabel}>最近一次</Text>
              <Text className={styles.latestBackupDate}>{latestBackup.date}</Text>
              <Text className={styles.latestBackupMeta}>
                {latestBackup.size} · {latestBackup.device}
              </Text>
              <View className={styles.latestBackupTags}>
                {latestBackup.categories.map((cat, idx) => (
                  <Text key={idx} className={styles.backupTag}>{cat}</Text>
                ))}
              </View>
            </View>
            <Button
              className={`${styles.restoreBtn} btn-secondary`}
              onClick={() => handleRestoreBackup(latestBackup)}
            >
              恢复
            </Button>
          </View>
        ) : (
          <View className={styles.noLatestBackup}>
            <Text className={styles.noLatestBackupIcon}>📦</Text>
            <View>
              <Text className={styles.noLatestBackupText}>还没有备份记录</Text>
              <Text className={styles.noLatestBackupTip}>
                首次备份后这里会显示最近的备份
              </Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>历史备份记录</Text>
          <Text className={styles.sectionSub}>
            {member.backupCount > 1 ? `${member.backupCount - 1} 条更早记录` : '暂无更早记录'}
          </Text>
        </View>
        {historyBackups.length > 0 ? (
          <View className={styles.backupList}>
            {historyBackups.map(record => (
              <View key={record.id} className={styles.backupItem}>
                <View className={styles.backupIcon}>
                  <Text>📦</Text>
                </View>
                <View className={styles.backupInfo}>
                  <Text className={styles.backupDate}>{record.date}</Text>
                  <Text className={styles.backupMeta}>
                    {record.size} · {record.device}
                  </Text>
                  <View className={styles.backupTags}>
                    {record.categories.map((cat, idx) => (
                      <Text key={idx} className={styles.backupTag}>{cat}</Text>
                    ))}
                  </View>
                </View>
                <Button
                  className={`${styles.restoreBtn} btn-secondary`}
                  onClick={() => handleRestoreBackup(record)}
                >
                  恢复
                </Button>
              </View>
            ))}
          </View>
        ) : (
          <View className={styles.noBackup}>
            <Text className={styles.noBackupText}>暂无更早的备份记录</Text>
          </View>
        )}
      </View>

      <View className={styles.dangerSection}>
        <Button className={styles.dangerBtn} onClick={handleDeleteMember}>
          移除该家人
        </Button>
      </View>
    </ScrollView>
  );
};

export default FamilyDetailPage;
