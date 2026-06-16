import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { FamilyMember } from '@/types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  onClick?: () => void;
  onShowHelpCode?: () => void;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  onClick,
  onShowHelpCode
}) => {
  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.avatarWrapper}>
        <Image
          src={member.avatar}
          className={styles.avatar}
          mode="aspectFill"
        />
        <View className={classnames(
          styles.onlineDot,
          member.online && styles.online
        )} />
      </View>
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{member.name}</Text>
          <View className="tag tag-primary">
            {member.relation}
          </View>
        </View>
        <Text className={styles.lastBackup}>
          最近备份：{member.lastBackup}
        </Text>
        <Text className={styles.backupCount}>
          共 {member.backupCount} 份备份
        </Text>
      </View>
      <View
        className={styles.helpBtn}
        onClick={(e) => {
          e.stopPropagation();
          onShowHelpCode?.();
        }}
      >
        <Text className={styles.helpBtnText}>协助码</Text>
      </View>
    </View>
  );
};

export default FamilyMemberCard;
