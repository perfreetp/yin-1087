import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StepIndicator from '@/components/StepIndicator';
import { useMigrateStore } from '@/store/migrate';
import { mockMigrateSteps, formatBytes } from '@/data/mockData';

const MigratePage: React.FC = () => {
  const {
    deviceConnected,
    storageInfo,
    setCurrentStep,
    setConnectionStatus,
    updateStorageRequirement,
    getSelectedSize,
    getSelectedCount
  } = useMigrateStore();

  const [steps, setSteps] = useState(mockMigrateSteps.map((step, idx) => ({
    ...step,
    active: idx === 2,
    completed: idx < 2
  })));

  useEffect(() => {
    console.log('[MigratePage] 页面加载，更新存储空间需求');
    updateStorageRequirement();
  }, [updateStorageRequirement]);

  const selectedSize = getSelectedSize();
  const selectedCount = getSelectedCount();

  const usedPercent = selectedSize > 0
    ? Math.round((storageInfo.availableBytes - selectedSize) / storageInfo.availableBytes * 100)
    : 100;

  const getStorageStatus = () => {
    if (selectedSize === 0) return 'ok';
    if (storageInfo.sufficient) return 'ok';
    const ratio = selectedSize / storageInfo.availableBytes;
    if (ratio > 0.9) return 'danger';
    return 'warning';
  };

  const formatRequiredSize = () => {
    if (selectedSize === 0) return '请先选择资料';
    return formatBytes(selectedSize);
  };

  const handleConnectDevice = () => {
    Taro.showLoading({ title: '正在连接...' });
    setTimeout(() => {
      Taro.hideLoading();
      setConnectionStatus(true);
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        active: idx === 2,
        completed: idx < 3
      })));
      Taro.showToast({ title: '连接成功', icon: 'success' });
    }, 1500);
  };

  const handleGoToSelect = () => {
    setSteps(prev => prev.map((step, idx) => ({
      ...step,
      active: idx === 3,
      completed: idx < 3
    })));
    setCurrentStep(4);
    Taro.switchTab({ url: '/pages/select/index' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.hero}>
        <Text className={styles.heroIcon}>📱</Text>
        <Text className={styles.heroTitle}>轻松换机，安心迁移</Text>
        <Text className={styles.heroSubtitle}>跟着步骤走，资料不会丢</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>换机步骤</Text>
        <StepIndicator steps={steps} currentStep={3} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>设备连接</Text>
        <View className={styles.connectionCard}>
          <View className={styles.connectionStatus}>
            <View className={classnames(
              styles.statusDot,
              deviceConnected ? styles.connected : styles.disconnected
            )} />
            <Text className={styles.statusText}>
              {deviceConnected ? '设备已连接' : '等待连接新手机'}
            </Text>
          </View>
          {deviceConnected && (
            <View className={styles.deviceNames}>
              <Text className={styles.deviceName}>旧手机</Text>
              <Text className={styles.connectionArrow}>→</Text>
              <Text className={styles.deviceName}>新手机</Text>
            </View>
          )}
          {!deviceConnected && (
            <Button className="btn-primary" onClick={handleConnectDevice}>
              扫码连接新手机
            </Button>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>存储空间检测</Text>
        <View className={styles.storageCard}>
          <View className={styles.storageHeader}>
            <Text className={styles.storageTitle}>新手机存储空间</Text>
            <View className={classnames(
              styles.storageStatus,
              styles[getStorageStatus()]
            )}>
              {selectedSize === 0
                ? '等待选择'
                : storageInfo.sufficient
                  ? '空间充足'
                  : '空间不足'
              }
            </View>
          </View>
          <View className={styles.storageBar}>
            <View
              className={classnames(styles.storageFill, styles[getStorageStatus()])}
              style={{ width: `${Math.max(0, Math.min(usedPercent, 100))}%` }}
            />
          </View>
          <View className={styles.storageDetails}>
            <Text>总容量：{storageInfo.total}</Text>
            <Text>可用：{storageInfo.available}</Text>
            <Text>
              需要：{formatRequiredSize()}
            </Text>
          </View>
          {selectedCount > 0 && (
            <View className={styles.selectionSummary}>
              <Text className={styles.summaryText}>
                已选择 <Text className={styles.summaryHighlight}>{selectedCount}</Text> 项资料
              </Text>
              <Text
                className={styles.modifyLink}
                onClick={() => Taro.switchTab({ url: '/pages/select/index' })}
              >
                修改选择
              </Text>
            </View>
          )}
          {!storageInfo.sufficient && selectedSize > 0 && (
            <View className={styles.storageWarning}>
              <Text className={styles.warningText}>
                ⚠️ 空间不足！请取消选择一些资料，或清理新手机存储空间
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>💡 换机小贴士</Text>
          <View className={styles.tipsList}>
            <Text className={styles.tipsItem}>请保持两部手机电量在 50% 以上</Text>
            <Text className={styles.tipsItem}>传输过程中请保持应用在前台运行</Text>
            <Text className={styles.tipsItem}>尽量将两部手机放在一起，距离不超过 1 米</Text>
            <Text className={styles.tipsItem}>如遇中断可随时续传，不会丢失进度</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomActions}>
        {!storageInfo.sufficient && selectedSize > 0 ? (
          <Button
            className="btn-secondary"
            onClick={() => Taro.switchTab({ url: '/pages/select/index' })}
          >
            请先减少迁移内容
          </Button>
        ) : (
          <Button className="btn-primary" onClick={handleGoToSelect}>
            下一步：选择迁移资料
          </Button>
        )}
      </View>
    </View>
  );
};

export default MigratePage;
