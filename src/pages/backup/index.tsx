import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import { mockFamilyMembers, mockBackupRecords } from '@/data/mockData';
import { FamilyMember } from '@/types';

const BackupPage: React.FC = () => {
  const [members] = useState<FamilyMember[]>(mockFamilyMembers);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [myHelpCode] = useState('4521 8793');

  const handleShowHelpCode = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowHelpModal(true);
  };

  const handleCopyCode = (code: string) => {
    Taro.setClipboardData({
      data: code.replace(/\s/g, ''),
      success: () => {
        Taro.showToast({ title: '已复制协助码', icon: 'success' });
      }
    });
  };

  const handleShareCode = () => {
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleAddMember = () => {
    Taro.showToast({ title: '添加家庭成员', icon: 'none' });
  };

  const handleRestoreBackup = (id: string) => {
    Taro.showModal({
      title: '确认恢复',
      content: '恢复备份将覆盖当前设备上的同名数据，是否继续？',
      confirmText: '确认恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '开始恢复备份', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.title}>家庭备份中心</Text>
        <Text className={styles.subtitle}>管理家人的手机数据备份，远程协助父母换机</Text>
      </View>

      <View className={styles.helpCodeSection}>
        <View className={styles.helpCodeCard}>
          <View className={styles.helpCodeHeader}>
            <Text className={styles.helpCodeTitle}>🎯 我的协助码</Text>
            <View className={styles.helpCodeActions}>
              <Button
                className={styles.helpCodeActionBtn}
                onClick={() => handleCopyCode(myHelpCode)}
              >
                复制
              </Button>
              <Button
                className={styles.helpCodeActionBtn}
                onClick={handleShareCode}
              >
                分享给子女
              </Button>
            </View>
          </View>
          <View className={styles.helpCodeDisplay}>
            <Text className={styles.helpCodeText}>{myHelpCode}</Text>
          </View>
          <Text className={styles.helpCodeDesc}>
            将此协助码告诉子女，他们可以远程查看您的操作进度{'\n'}
            在您遇到困难时提供远程帮助
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>家庭成员</Text>
          <Button className={styles.addMemberBtn} onClick={handleAddMember}>
            + 添加家人
          </Button>
        </View>
        {members.map(member => (
          <FamilyMemberCard
            key={member.id}
            member={member}
            onShowHelpCode={() => handleShowHelpCode(member)}
          />
        ))}
      </View>

      <View className={styles.backupHistory}>
        <Text className={styles.sectionTitle}>我的备份记录</Text>
        {mockBackupRecords.map(record => (
          <View key={record.id} className={styles.historyCard}>
            <View className={styles.historyIcon}>
              <Text className={styles.historyIconText}>💾</Text>
            </View>
            <View className={styles.historyInfo}>
              <Text className={styles.historyDate}>{record.date}</Text>
              <View className={styles.historyMeta}>
                <Text className={styles.historyDevice}>{record.device}</Text>
                <Text className={styles.historySize}>{record.size}</Text>
              </View>
              <View className={styles.historyCategories}>
                {record.categories.map((cat, idx) => (
                  <View key={idx} className="tag tag-primary" style={{ marginRight: 8 }}>
                    {cat}
                  </View>
                ))}
              </View>
            </View>
            <Button
              className={styles.historyAction}
              onClick={() => handleRestoreBackup(record.id)}
            >
              恢复
            </Button>
          </View>
        ))}
      </View>

      {showHelpModal && selectedMember && (
        <View className={styles.modalMask} onClick={() => setShowHelpModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {selectedMember.name}的协助码
            </Text>
            <Text className={styles.modalText}>
              请让{selectedMember.name}在换机助手中输入此协助码，{'\n'}
              您即可远程查看TA的操作进度
            </Text>
            <View className={styles.modalCode}>
              <Text className={styles.modalCodeText}>{selectedMember.helpCode}</Text>
            </View>
            <View className={styles.modalActions}>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowHelpModal(false)}
              >
                关闭
              </Button>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={() => handleCopyCode(selectedMember.helpCode)}
              >
                复制协助码
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BackupPage;
