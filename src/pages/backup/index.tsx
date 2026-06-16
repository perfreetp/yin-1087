import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';

import styles from './index.module.scss';
import FamilyMemberCard from '@/components/FamilyMemberCard';
import ProgressRing from '@/components/ProgressRing';
import { useMigrateStore } from '@/store/migrate';
import { FamilyMember } from '@/types';

const formatHelpCode = (code: string): string => {
  if (!code) return '';
  const clean = code.replace(/\s/g, '');
  return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const relationOptions = [
  { label: '父亲', value: '父亲' },
  { label: '母亲', value: '母亲' },
  { label: '祖父', value: '祖父' },
  { label: '祖母', value: '祖母' },
  { label: '岳父', value: '岳父' },
  { label: '岳母', value: '岳母' },
  { label: '儿子', value: '儿子' },
  { label: '女儿', value: '女儿' },
  { label: '兄弟', value: '兄弟' },
  { label: '姐妹', value: '姐妹' },
  { label: '其他', value: '其他' }
];

const BackupPage: React.FC = () => {
  const {
    familyMembers,
    myHelpCode,
    addFamilyMember,
    remoteProgress,
    viewRemoteProgress,
    clearRemoteProgress,
  } = useMigrateStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelationIndex, setNewMemberRelationIndex] = useState(0);
  const [remoteHelpCode, setRemoteHelpCode] = useState('');

  const formattedMyCode = useMemo(() => formatHelpCode(myHelpCode), [myHelpCode]);

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
    setNewMemberName('');
    setNewMemberRelationIndex(0);
    setShowAddModal(true);
  };

  const handleConfirmAddMember = () => {
    if (!newMemberName.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    const relation = relationOptions[newMemberRelationIndex].value;
    console.log('[BackupPage] 添加成员:', { name: newMemberName.trim(), relation, index: newMemberRelationIndex });
    addFamilyMember(newMemberName.trim(), relation);
    setShowAddModal(false);
  };

  const handleViewRemoteProgress = () => {
    clearRemoteProgress();
    setRemoteHelpCode('');
    setShowRemoteModal(true);
  };

  const handleConfirmViewRemote = () => {
    const code = remoteHelpCode.replace(/\s/g, '');
    if (code.length !== 8) {
      Taro.showToast({ title: '请输入8位协助码', icon: 'none' });
      return;
    }
    console.log('[BackupPage] 尝试查看远程进度，协助码:', code);
    const success = viewRemoteProgress(code);
    if (success) {
      setShowRemoteModal(false);
      Taro.showToast({ title: '加载成功', icon: 'success' });
    }
  };

  const handleRestoreBackup = (memberId: string, record: any) => {
    Taro.showModal({
      title: '确认恢复',
      content: `恢复"${record.date}"的备份将覆盖当前设备上的同名数据，是否继续？`,
      confirmText: '确认恢复',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '开始恢复备份', icon: 'success' });
        }
      }
    });
  };

  const handleCloseRemoteView = () => {
    clearRemoteProgress();
  };

  const handleViewMemberProgress = (member: FamilyMember) => {
    if (member.transferProgress) {
      viewRemoteProgress(member.helpCode);
    } else {
      Taro.showToast({ title: '该用户暂无迁移进度', icon: 'none' });
    }
  };

  if (remoteProgress) {
    const rp = remoteProgress;
    const tp = rp.transferProgress;
    return (
      <View className={styles.pageContainer}>
        <View className={styles.remoteViewHeader}>
          <Text
            className={styles.backBtn}
            onClick={handleCloseRemoteView}
          >
            ← 返回
          </Text>
          <Text className={styles.remoteViewTitle}>
            查看{rp.memberName}的迁移进度
          </Text>
          <View style={{ width: 80 }} />
        </View>

        <View className={styles.remoteProgressSection}>
          <ProgressRing
            percentage={tp ? tp.overall : 0}
            status={tp?.status || 'idle'}
            size={320}
            strokeWidth={18}
          />
          <View className={styles.remoteMemberInfo}>
            <Text className={styles.remoteMemberName}>{rp.memberName}（{rp.memberRelation}）</Text>
            <Text className={styles.remoteUpdateTime}>更新于 {rp.lastUpdated}</Text>
          </View>
        </View>

        {tp && (
          <>
            <View className={styles.remoteStats}>
              <View className={styles.remoteStatItem}>
                <Text className={styles.remoteStatValue}>{tp.transferredSize}</Text>
                <Text className={styles.remoteStatLabel}>已传输</Text>
              </View>
              <View className={styles.remoteStatItem}>
                <Text className={styles.remoteStatValue}>{tp.speed}</Text>
                <Text className={styles.remoteStatLabel}>传输速度</Text>
              </View>
              <View className={styles.remoteStatItem}>
                <Text className={styles.remoteStatValue}>{tp.estimatedTime}</Text>
                <Text className={styles.remoteStatLabel}>剩余时间</Text>
              </View>
            </View>
            <View className={styles.remoteCurrentItem}>
              <Text className={styles.remoteCurrentLabel}>当前状态</Text>
              <Text className={styles.remoteCurrentText}>
                {tp.status === 'completed' ? '迁移完成' : tp.currentItem}
              </Text>
            </View>
            <View className={styles.remoteProgressInfo}>
              <Text className={styles.remoteProgressText}>
                共 {tp.transferred}/{tp.total} 项
              </Text>
            </View>
            {tp.missedItems.length > 0 && (
              <View className={styles.remoteMissed}>
                <Text className={styles.remoteMissedTitle}>
                  ⚠️ {tp.missedItems.length} 项未迁移
                </Text>
                {tp.missedItems.map((item, idx) => (
                  <View key={idx} className={styles.remoteMissedItem}>
                    <Text>{item.name}</Text>
                    <Text className={styles.remoteMissedReason}>{item.reason}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <Button
          className="btn-secondary"
          style={{ marginTop: 32 }}
          onClick={handleCloseRemoteView}
        >
          返回家庭备份
        </Button>
      </View>
    );
  }

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
            <Text className={styles.helpCodeText}>{formattedMyCode}</Text>
          </View>
          <Text className={styles.helpCodeDesc}>
            将此协助码告诉子女，他们可以远程查看您的操作进度{'\n'}
            在您遇到困难时提供远程帮助
          </Text>
        </View>
      </View>

      <View className={styles.viewProgressBtn} onClick={handleViewRemoteProgress}>
        <Text className={styles.viewProgressIcon}>👁️</Text>
        <View className={styles.viewProgressContent}>
          <Text className={styles.viewProgressTitle}>查看家人迁移进度</Text>
          <Text className={styles.viewProgressSubtitle}>输入协助码，远程查看家人的换机进度</Text>
        </View>
        <Text className={styles.viewProgressArrow}>→</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>家庭成员</Text>
          <Button className={styles.addMemberBtn} onClick={handleAddMember}>
            + 添加家人
          </Button>
        </View>
        {familyMembers.map(member => (
          <View key={member.id}>
            <FamilyMemberCard
              member={{
                ...member,
                helpCode: formatHelpCode(member.helpCode)
              }}
              onShowHelpCode={() => handleShowHelpCode(member)}
              onClick={() => handleViewMemberProgress(member)}
            />
            {member.backupRecords.length > 0 && (
              <View className={styles.memberBackups}>
                <Text className={styles.memberBackupsTitle}>
                  {member.name}的备份记录
                </Text>
                {member.backupRecords.slice(0, 2).map(record => (
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
                      onClick={() => handleRestoreBackup(member.id, record)}
                    >
                      恢复
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加家庭成员</Text>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>与您的关系</Text>
              <Picker
                mode="selector"
                range={relationOptions.map(r => r.label)}
                value={newMemberRelationIndex}
                onSelect={(e) => {
                  const idx = Number(e.detail.value);
                  console.log('[BackupPage] 选择关系索引:', idx, '值:', relationOptions[idx]?.value);
                  setNewMemberRelationIndex(idx);
                }}
              >
                <View className={styles.pickerView}>
                  <Text className={styles.pickerText}>
                    {relationOptions[newMemberRelationIndex]?.label || '请选择'}
                  </Text>
                  <Text className={styles.pickerArrow}>▼</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名/称呼</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入姓名或称呼，如：爸爸"
                value={newMemberName}
                onInput={(e) => setNewMemberName(e.detail.value)}
                maxlength={10}
              />
            </View>

            <View className={styles.modalTip}>
              <Text className={styles.modalTipText}>
                💡 添加后系统会自动生成协助码，可用于远程查看进度
              </Text>
            </View>

            <View className={styles.modalActions}>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowAddModal(false)}
              >
                取消
              </Button>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={handleConfirmAddMember}
              >
                确认添加
              </Button>
            </View>
          </View>
        </View>
      )}

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
              <Text className={styles.modalCodeText}>
                {formatHelpCode(selectedMember.helpCode)}
              </Text>
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

      {showRemoteModal && (
        <View className={styles.modalMask} onClick={() => setShowRemoteModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              输入家人协助码
            </Text>
            <Text className={styles.modalText}>
              请输入家人提供的8位协助码
            </Text>
            <Input
              className={styles.codeInput}
              placeholder="请输入8位协助码"
              type="number"
              maxlength={8}
              value={remoteHelpCode}
              onInput={(e) => setRemoteHelpCode(e.detail.value)}
            />
            <View className={styles.modalTip}>
              <Text className={styles.modalTipText}>
                💡 协助码在家人的"家庭备份"页面可以找到
              </Text>
            </View>
            <View className={styles.modalActions}>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnCancel}`}
                onClick={() => setShowRemoteModal(false)}
              >
                取消
              </Button>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnConfirm}`}
                onClick={handleConfirmViewRemote}
              >
                查看进度
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BackupPage;
