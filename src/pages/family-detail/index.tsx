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
  const { familyMembers, viewRemoteProgress, addBackupRecordForMember } = useMigrateStore();
  const [memberId, setMemberId] = useState<string>('');

  const member = useMemo<FamilyMember | undefined>(() => {
    return familyMembers.find(m => m.id === memberId);
  }, [familyMembers, memberId]);

  const formattedCode = useMemo(() => {
    return member ? formatHelpCode(member.helpCode) : '';
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
    const success = viewRemoteProgress(member.helpCode);
    if (success) {
      Taro.showToast({ title: '加载中...', icon: 'loading' });
    }
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
    Taro.showModal({
      title: '移除家人',
      content: `确定要移除「${member?.name}」吗？移除后将无法再查看其进度和备份记录。`,
      confirmText: '移除',
      confirmColor: '#F56C6C',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已移除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 500);
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
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>备份记录</Text>
          <Text className={styles.sectionSub}>{member.backupCount} 份备份</Text>
        </View>
        {member.backupRecords.length > 0 ? (
          <View className={styles.backupList}>
            {member.backupRecords.map(record => (
              <View key={record.id} className={styles.backupItem}>
                <View className={styles.backupIcon}>
                  <Text>💾</Text>
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
            <Text className={styles.noBackupIcon}>📦</Text>
            <Text className={styles.noBackupText}>暂无备份记录</Text>
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
