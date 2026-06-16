import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProgressRing from '@/components/ProgressRing';
import { useMigrateStore } from '@/store/migrate';
import { mockTransferItems } from '@/data/mockData';

const ProgressPage: React.FC = () => {
  const { transferProgress, pauseTransfer, resumeTransfer } = useMigrateStore();

  const isCompleted = transferProgress.status === 'completed';
  const isTransferring = transferProgress.status === 'transferring';
  const isPaused = transferProgress.status === 'paused';

  const getStatusIcon = (category: string) => {
    const icons: Record<string, string> = {
      '通讯录': '📞',
      '短信': '💬',
      '照片': '🖼️',
      '视频': '🎬',
      '日历': '📅',
      '待办': '✅',
      '微信文件': '💚',
      '应用': '📱'
    };
    return icons[category] || '📁';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: '✓',
      transferring: '...',
      pending: '等待',
      failed: '失败'
    };
    return texts[status] || '';
  };

  const handlePause = () => {
    pauseTransfer();
    Taro.showToast({ title: '已暂停', icon: 'none' });
  };

  const handleResume = () => {
    resumeTransfer();
    Taro.showToast({ title: '继续传输', icon: 'none' });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '取消后已传输的内容不会丢失，下次可以继续传输',
      confirmText: '确认取消',
      cancelText: '继续传输',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消传输', icon: 'none' });
        }
      }
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.progressSection}>
        <ProgressRing
          percentage={transferProgress.overall}
          status={transferProgress.status as any}
          size={360}
          strokeWidth={20}
        />
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{transferProgress.transferredSize}</Text>
            <Text className={styles.statLabel}>已传输</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{transferProgress.speed}</Text>
            <Text className={styles.statLabel}>传输速度</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{transferProgress.estimatedTime}</Text>
            <Text className={styles.statLabel}>剩余时间</Text>
          </View>
        </View>
      </View>

      {!isCompleted && (
        <View className={styles.currentItem}>
          <Text className={styles.currentIcon}>📤</Text>
          <View className={styles.currentInfo}>
            <Text className={styles.currentLabel}>正在传输</Text>
            <Text className={styles.currentName}>{transferProgress.currentItem}</Text>
          </View>
        </View>
      )}

      {!isCompleted && (
        <View className={styles.actionButtons}>
          {isTransferring && (
            <Button className={`${styles.actionBtn} ${styles.pauseBtn}`} onClick={handlePause}>
              暂停传输
            </Button>
          )}
          {isPaused && (
            <Button className={`${styles.actionBtn} ${styles.resumeBtn}`} onClick={handleResume}>
              继续传输
            </Button>
          )}
          <Button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={handleCancel}>
            取消
          </Button>
        </View>
      )}

      {isCompleted && (
        <View className={styles.completedCard}>
          <Text className={styles.completedIcon}>🎉</Text>
          <Text className={styles.completedTitle}>迁移完成！</Text>
          <Text className={styles.completedText}>
            共成功迁移 {transferProgress.transferred}/{transferProgress.total} 项资料
          </Text>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>传输详情</Text>
        <ScrollView scrollY style={{ maxHeight: '500rpx' }}>
          <View className={styles.transferList}>
            {mockTransferItems.map(item => (
              <View key={item.id} className={styles.transferItem}>
                <Text className={styles.itemIcon}>{getStatusIcon(item.category)}</Text>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.name}</Text>
                  <View className={styles.itemMeta}>
                    <Text className={styles.itemSize}>{item.size}</Text>
                    {item.status !== 'completed' && item.status !== 'pending' && (
                      <View className={styles.itemProgressBar}>
                        <View
                          className={styles.itemProgressFill}
                          style={{ width: `${item.progress}%` }}
                        />
                      </View>
                    )}
                  </View>
                </View>
                <Text className={classnames(
                  styles.itemStatus,
                  styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]
                )}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {transferProgress.missedItems.length > 0 && (
        <View className={styles.missedSection}>
          <Text className={styles.sectionTitle}>未迁移项目</Text>
          <View className={styles.missedCard}>
            <Text className={styles.missedTitle}>
              ⚠️ 以下 {transferProgress.missedItems.length} 项未能成功迁移
            </Text>
            {transferProgress.missedItems.map((item, index) => (
              <View key={index} className={styles.missedItem}>
                <Text className={styles.missedName}>{item.name}</Text>
                <Text className={styles.missedReason}>{item.reason}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default ProgressPage;
