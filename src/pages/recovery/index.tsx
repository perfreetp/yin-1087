import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import RecoveryItem from '@/components/RecoveryItem';
import { mockRecoveryItems } from '@/data/mockData';
import { RecoveryItem as RecoveryItemType } from '@/types';

const RecoveryPage: React.FC = () => {
  const [items, setItems] = useState<RecoveryItemType[]>(mockRecoveryItems);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: '全部' },
    { key: '照片', label: '照片' },
    { key: '视频', label: '视频' },
    { key: '通讯录', label: '通讯录' },
    { key: '微信文件', label: '微信文件' }
  ];

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter(item => item.category === activeFilter);

  const handleRecover = (id: string) => {
    Taro.showModal({
      title: '确认恢复',
      content: '将恢复此文件到原位置，是否继续？',
      confirmText: '确认恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setItems(prev => prev.filter(item => item.id !== id));
          Taro.showToast({ title: '已恢复', icon: 'success' });
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '永久删除',
      content: '删除后将无法恢复此文件，确认删除吗？',
      confirmText: '确认删除',
      cancelText: '取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          setItems(prev => prev.filter(item => item.id !== id));
          Taro.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  };

  const handleRecoverAll = () => {
    if (filteredItems.length === 0) {
      Taro.showToast({ title: '暂无可恢复项目', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '批量恢复',
      content: `将恢复 ${filteredItems.length} 个文件到原位置，是否继续？`,
      confirmText: '确认恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const filteredIds = filteredItems.map(i => i.id);
          setItems(prev => prev.filter(item => !filteredIds.includes(item.id)));
          Taro.showToast({ title: '批量恢复成功', icon: 'success' });
        }
      }
    });
  };

  const handleDeleteAll = () => {
    if (filteredItems.length === 0) {
      Taro.showToast({ title: '暂无可删除项目', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '批量永久删除',
      content: `将永久删除 ${filteredItems.length} 个文件，删除后无法恢复，确认吗？`,
      confirmText: '确认删除',
      cancelText: '取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          const filteredIds = filteredItems.map(i => i.id);
          setItems(prev => prev.filter(item => !filteredIds.includes(item.id)));
          Taro.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>资料找回中心</Text>
        <Text className={styles.subtitle}>误删的资料在这里，30天内可以恢复</Text>
      </View>

      <View className={styles.recycleInfo}>
        <Text className={styles.recycleIcon}>🗑️</Text>
        <View className={styles.recycleText}>
          <Text className={styles.recycleTitle}>回收站说明</Text>
          <Text className={styles.recycleDesc}>
            删除的资料会在回收站保留30天，超过时间将自动永久删除。
            您可以随时恢复或永久删除这些资料。
          </Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {filters.map(filter => (
          <Button
            key={filter.key}
            className={classnames(
              styles.filterTab,
              activeFilter === filter.key && styles.active
            )}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </View>

      {filteredItems.length > 0 && (
        <View className={styles.summaryBar}>
          <Text className={styles.summaryText}>
            共 <Text className={styles.summaryHighlight}>{filteredItems.length}</Text> 个项目
          </Text>
          <View className={styles.batchActions}>
            <Button
              className={`${styles.batchBtn} ${styles.recoverAllBtn}`}
              onClick={handleRecoverAll}
            >
              全部恢复
            </Button>
            <Button
              className={`${styles.batchBtn} ${styles.deleteAllBtn}`}
              onClick={handleDeleteAll}
            >
              全部删除
            </Button>
          </View>
        </View>
      )}

      <ScrollView scrollY style={{ maxHeight: 'calc(100vh - 700rpx)' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <RecoveryItem
              key={item.id}
              item={item}
              onRecover={() => handleRecover(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✨</Text>
            <Text className={styles.emptyTitle}>回收站空空如也</Text>
            <Text className={styles.emptyDesc}>
              暂无删除的资料{'\n'}
              删除的资料会自动出现在这里
            </Text>
          </View>
        )}
      </ScrollView>

      <View className={styles.guideSection}>
        <Text className="section-title" style={{ fontSize: 32, marginBottom: 24 }}>
          数据恢复指南
        </Text>
        <View className={styles.guideCard}>
          <View className={styles.guideHeader}>
            <Text className={styles.guideIcon}>📱</Text>
            <Text className={styles.guideTitle}>从备份恢复</Text>
          </View>
          <View className={styles.guideSteps}>
            <Text className={styles.guideStep}>1. 进入"家庭备份"页面</Text>
            <Text className={styles.guideStep}>2. 选择需要恢复的备份记录</Text>
            <Text className={styles.guideStep}>3. 点击"恢复"按钮</Text>
            <Text className={styles.guideStep}>4. 等待恢复完成，请勿退出应用</Text>
          </View>
        </View>
        <View className={styles.guideCard}>
          <View className={styles.guideHeader}>
            <Text className={styles.guideIcon}>🛡️</Text>
            <Text className={styles.guideTitle}>如何避免数据丢失</Text>
          </View>
          <View className={styles.guideSteps}>
            <Text className={styles.guideStep}>1. 定期使用"家庭备份"功能备份资料</Text>
            <Text className={styles.guideStep}>2. 换机前先完成一次完整备份</Text>
            <Text className={styles.guideStep}>3. 删除重要资料前先确认内容</Text>
            <Text className={styles.guideStep}>4. 建议开启自动备份功能</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecoveryPage;
