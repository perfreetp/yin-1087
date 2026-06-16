import React from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import DataCategoryCard from '@/components/DataCategoryCard';
import { useMigrateStore } from '@/store/migrate';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

const SelectPage: React.FC = () => {
  const {
    categories,
    toggleCategory,
    setCategoryPriority,
    selectAllCategories,
    deselectAllCategories,
    getSelectedSize,
    getSelectedCount,
    setCurrentStep,
    startTransfer
  } = useMigrateStore();

  const selectedSize = getSelectedSize();
  const selectedCount = getSelectedCount();

  const handleStartTransfer = () => {
    if (selectedCount === 0) {
      Taro.showToast({ title: '请先选择要迁移的资料', icon: 'none' });
      return;
    }
    setCurrentStep(5);
    startTransfer();
    Taro.switchTab({ url: '/pages/progress/index' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>选择要迁移的资料</Text>
        <Text className={styles.subtitle}>勾选您需要搬到新手机的内容</Text>
      </View>

      <View className={styles.actionBar}>
        <Button className={`${styles.actionBtn} ${styles.selectAllBtn}`} onClick={selectAllCategories}>
          全选
        </Button>
        <Button className={`${styles.actionBtn} ${styles.deselectAllBtn}`} onClick={deselectAllCategories}>
          清空选择
        </Button>
      </View>

      <View className={styles.priorityHint}>
        <Text className={styles.priorityHintText}>
          💡 提示：点击"优先传"标签可调整传输优先级，重要资料会优先传输
        </Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 520rpx)' }}>
        <Text className={styles.sectionLabel}>基础资料</Text>
        {categories
          .filter(c => ['contacts', 'sms'].includes(c.id))
          .map(category => (
            <DataCategoryCard
              key={category.id}
              category={category}
              onToggle={toggleCategory}
              onPriorityChange={setCategoryPriority}
              showPriority
            />
          ))}

        <Text className={styles.sectionLabel}>媒体资料</Text>
        {categories
          .filter(c => ['photos', 'videos'].includes(c.id))
          .map(category => (
            <DataCategoryCard
              key={category.id}
              category={category}
              onToggle={toggleCategory}
              onPriorityChange={setCategoryPriority}
              showPriority
            />
          ))}

        <Text className={styles.sectionLabel}>个人数据</Text>
        {categories
          .filter(c => ['calendar', 'todo'].includes(c.id))
          .map(category => (
            <DataCategoryCard
              key={category.id}
              category={category}
              onToggle={toggleCategory}
              onPriorityChange={setCategoryPriority}
              showPriority
            />
          ))}

        <Text className={styles.sectionLabel}>其他资料</Text>
        {categories
          .filter(c => ['wechat', 'apps'].includes(c.id))
          .map(category => (
            <DataCategoryCard
              key={category.id}
              category={category}
              onToggle={toggleCategory}
              onPriorityChange={setCategoryPriority}
              showPriority
            />
          ))}

        <View className={styles.hintCard}>
          <Text className={styles.hintText}>
            ⚠️ 微信聊天记录需要在微信内单独迁移，此处仅迁移聊天中的图片和文件
          </Text>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.summary}>
          <View className={styles.summaryLeft}>
            <Text className={styles.summaryLabel}>已选择</Text>
            <Text className={styles.summaryValue}>{selectedCount} 项资料</Text>
          </View>
          <Text className={styles.summarySize}>约 {formatBytes(selectedSize)}</Text>
        </View>
        <Button className="btn-primary" onClick={handleStartTransfer}>
          开始迁移
        </Button>
      </View>
    </View>
  );
};

export default SelectPage;
