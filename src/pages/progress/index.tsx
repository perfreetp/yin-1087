import React, { useEffect, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import ProgressRing from '@/components/ProgressRing';
import { useMigrateStore } from '@/store/migrate';
import { formatBytes } from '@/data/mockData';

const ProgressPage: React.FC = () => {
  const {
    transferProgress,
    transferItems,
    pauseTransfer,
    resumeTransfer,
    updateProgress,
  } = useMigrateStore();

  const isCompleted = transferProgress.status === 'completed';
  const isTransferring = transferProgress.status === 'transferring';
  const isPaused = transferProgress.status === 'paused';
  const isIdle = transferProgress.status === 'idle';

  const displayItems = useMemo(() => {
    if (transferItems.length === 0) {
      return [];
    }
    return [...transferItems].slice(0, 30);
  }, [transferItems]);

  useEffect(() => {
    if (!isTransferring || transferItems.length === 0) return;

    const interval = setInterval(() => {
      const { transferProgress, transferItems, updateProgress } = useMigrateStore.getState();

      const pendingItems = transferItems.filter(i => i.status === 'pending');
      const transferringItems = transferItems.filter(i => i.status === 'transferring');

      if (transferringItems.length === 0 && pendingItems.length > 0) {
        const nextItem = pendingItems[0];
        const updatedItems = transferItems.map(item =>
          item.id === nextItem.id ? { ...item, status: 'transferring' as const } : item
        );
        useMigrateStore.setState({
          transferItems: updatedItems,
          transferProgress: {
            ...transferProgress,
            currentItem: nextItem.name
          }
        });
        return;
      }

      if (transferringItems.length > 0) {
        const currentItem = transferringItems[0];
        const newProgress = Math.min(currentItem.progress + 15, 100);

        const updatedItems = transferItems.map(item => {
          if (item.id === currentItem.id) {
            if (newProgress >= 100) {
              return { ...item, progress: 100, status: 'completed' as const };
            }
            return { ...item, progress: newProgress };
          }
          return item;
        });

        const completedCount = updatedItems.filter(i => i.status === 'completed').length;
        const overall = Math.round((completedCount / transferItems.length) * 100);

        const transferredBytes = updatedItems
          .filter(i => i.status === 'completed')
          .reduce((sum, i) => sum + i.sizeBytes, 0);

        const totalBytes = transferItems.reduce((sum, i) => sum + i.sizeBytes, 0);
        const speed = (Math.random() * 10 + 5).toFixed(1) + ' MB/s';
        const remainingBytes = totalBytes - transferredBytes;
        const speedBytes = parseFloat(speed) * 1024 * 1024;
        const remainingSeconds = Math.ceil(remainingBytes / speedBytes);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const estimatedTime = minutes > 0
          ? `约 ${minutes} 分 ${seconds} 秒`
          : `约 ${seconds} 秒`;

        useMigrateStore.setState({
          transferItems: updatedItems
        });

        updateProgress({
          overall,
          transferred: completedCount,
          total: transferItems.length,
          transferredSize: formatBytes(transferredBytes),
          totalSize: formatBytes(totalBytes),
          speed,
          estimatedTime: overall >= 100 ? '已完成' : estimatedTime,
          status: overall >= 100 ? 'completed' : 'transferring',
          currentItem: overall >= 100
            ? '迁移完成'
            : (currentItem?.name || '传输中...')
        });

        if (overall >= 100) {
          clearInterval(interval);
          Taro.showToast({ title: '迁移完成！', icon: 'success' });
        }
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isTransferring, transferItems.length, updateProgress]);

  const getStatusIcon = (category: string) => {
    const icons: Record<string, string> = {
      '通讯录': '📞',
      '短信消息': '💬',
      '照片': '🖼️',
      '视频': '🎬',
      '日历日程': '📅',
      '待办事项': '✅',
      '微信文件': '💚',
      '应用列表': '📱'
    };
    return icons[category] || '📁';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, { text: string; className: string }> = {
      high: { text: '优先', className: 'tag-error' },
      normal: { text: '普通', className: 'tag-info' },
      low: { text: '延后', className: 'tag-primary' }
    };
    return labels[priority] || labels.normal;
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

  if (isIdle) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📤</Text>
          <Text className={styles.emptyTitle}>等待传输</Text>
          <Text className={styles.emptyDesc}>
            请先在"资料选择"页面选择要迁移的内容，{'\n'}
            然后点击"开始迁移"按钮
          </Text>
          <Button
            className="btn-primary"
            style={{ marginTop: 40, width: 400 }}
            onClick={() => Taro.switchTab({ url: '/pages/select/index' })}
          >
            去选择资料
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.progressSection}>
        <ProgressRing
          percentage={transferProgress.overall}
          status={transferProgress.status}
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

      {displayItems.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            传输详情（按优先级排列）
          </Text>
          <ScrollView scrollY style={{ maxHeight: '500rpx' }}>
            <View className={styles.transferList}>
              {displayItems.map(item => (
                <View key={item.id} className={styles.transferItem}>
                  <Text className={styles.itemIcon}>{getStatusIcon(item.category)}</Text>
                  <View className={styles.itemInfo}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text className={styles.itemName}>{item.name}</Text>
                      <View className={classnames('tag', getPriorityLabel(item.priority).className)}
                        style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                        {getPriorityLabel(item.priority).text}
                      </View>
                    </View>
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
      )}

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
