import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { RecoveryItem as RecoveryItemType } from '@/types';

interface RecoveryItemProps {
  item: RecoveryItemType;
  onRecover?: () => void;
  onDelete?: () => void;
}

const RecoveryItem: React.FC<RecoveryItemProps> = ({ item, onRecover, onDelete }) => {
  const categoryIcons: Record<string, string> = {
    '照片': '🖼️',
    '视频': '🎬',
    '通讯录': '📞',
    '短信': '💬',
    '微信文件': '💚',
    '日历': '📅',
    '待办': '✅'
  };

  return (
    <View className={styles.card}>
      <View className={styles.thumbnailWrapper}>
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            className={styles.thumbnail}
            mode="aspectFill"
          />
        ) : (
          <View className={styles.iconPlaceholder}>
            <Text className={styles.categoryIcon}>
              {categoryIcons[item.category] || '📁'}
            </Text>
          </View>
        )}
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{item.name}</Text>
          <View className="tag tag-info">{item.category}</View>
        </View>
        <Text className={styles.deleteTime}>删除于：{item.deleteTime}</Text>
        <Text className={styles.expireTime}>{item.expireTime}</Text>
        <Text className={styles.size}>{item.size}</Text>
      </View>
      <View className={styles.actions}>
        <View
          className={classnames(styles.actionBtn, styles.recoverBtn)}
          onClick={onRecover}
        >
          <Text className={styles.recoverBtnText}>恢复</Text>
        </View>
        <View
          className={classnames(styles.actionBtn, styles.deleteBtn)}
          onClick={onDelete}
        >
          <Text className={styles.deleteBtnText}>删除</Text>
        </View>
      </View>
    </View>
  );
};

export default RecoveryItem;
