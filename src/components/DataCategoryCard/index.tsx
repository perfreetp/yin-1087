import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { DataCategory } from '@/types';

interface DataCategoryCardProps {
  category: DataCategory;
  onToggle?: (id: string) => void;
  onPriorityChange?: (id: string, priority: 'high' | 'normal' | 'low') => void;
  showPriority?: boolean;
}

const DataCategoryCard: React.FC<DataCategoryCardProps> = ({
  category,
  onToggle,
  onPriorityChange,
  showPriority = false
}) => {
  const priorityConfig = {
    high: { label: '优先传', className: 'tag-error' },
    normal: { label: '普通', className: 'tag-info' },
    low: { label: '延后', className: 'tag-primary' }
  };

  return (
    <View
      className={classnames(styles.card, category.selected && styles.cardSelected)}
      onClick={() => onToggle?.(category.id)}
    >
      <View className={styles.iconWrapper}>
        <Text className={styles.icon}>{category.icon}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{category.name}</Text>
          {showPriority && category.selected && (
            <View
              className={classnames('tag', priorityConfig[category.priority].className)}
              onClick={(e) => {
                e.stopPropagation();
                const priorities: Array<'high' | 'normal' | 'low'> = ['high', 'normal', 'low'];
                const nextIndex = (priorities.indexOf(category.priority) + 1) % priorities.length;
                onPriorityChange?.(category.id, priorities[nextIndex]);
              }}
            >
              {priorityConfig[category.priority].label}
            </View>
          )}
        </View>
        <Text className={styles.description}>{category.description}</Text>
        <View className={styles.meta}>
          <Text className={styles.metaText}>{category.count} 项</Text>
          <Text className={styles.metaDivider}>·</Text>
          <Text className={styles.metaText}>{category.size}</Text>
        </View>
      </View>
      <View className={classnames(styles.checkbox, category.selected && styles.checkboxChecked)}>
        {category.selected && <Text className={styles.checkMark}>✓</Text>}
      </View>
    </View>
  );
};

export default DataCategoryCard;
