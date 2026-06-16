import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StepIndicator from '@/components/StepIndicator';
import { useMigrateStore } from '@/store/migrate';
import { mockMigrateSteps } from '@/data/mockData';

const MigratePage: React.FC = () => {
  const { deviceConnected, storageInfo, setCurrentStep, setConnectionStatus } = useMigrateStore();
  const [steps] = useState(mockMigrateSteps);

  const usedPercent = Math.round(
    (storageInfo.availableBytes - storageInfo.requiredBytes) / storageInfo.availableBytes * 100
  );

  const getStorageStatus = () => {
    if (storageInfo.sufficient) return 'ok';
    const ratio = storageInfo.requiredBytes / storageInfo.availableBytes;
    if (ratio > 0.9) return 'danger';
    return 'warning';
  };

  const handleConnectDevice = () => {
    Taro.showLoading({ title: '正在连接...' });
    setTimeout(() => {
      Taro.hideLoading();
      setConnectionStatus(true);
      Taro.showToast({ title: '连接成功', icon: 'success' });
    }, 1500);
  };

  const handleGoToSelect = () => {
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
              {storageInfo.sufficient ? '空间充足' : '空间紧张'}
            </View>
          </View>
          <View className={styles.storageBar}>
            <View
              className={classnames(styles.storageFill, styles[getStorageStatus()])}
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            />
          </View>
          <View className={styles.storageDetails}>
            <Text>总容量：{storageInfo.total}</Text>
            <Text>可用：{storageInfo.available}</Text>
            <Text>需要：约 24.6 GB</Text>
          </View>
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
        <Button className="btn-primary" onClick={handleGoToSelect}>
          下一步：选择迁移资料
        </Button>
      </View>
    </View>
  );
};

export default MigratePage;
