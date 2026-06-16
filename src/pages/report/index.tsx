import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useMigrateStore } from '@/store/migrate';
import { MigrationReport, MissedItem } from '@/types';
import styles from './index.module.scss';

const ReportPage: React.FC = () => {
  const { migrationReport, migrationReports } = useMigrateStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showMissedDetail, setShowMissedDetail] = useState<MissedItem | null>(null);

  const report = useMemo(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1] as any;
    const options = currentPage?.options || {};
    const reportId = options.id;

    if (reportId) {
      return migrationReports.find(r => r.id === reportId) || migrationReport;
    }
    return migrationReport;
  }, [migrationReport, migrationReports]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleViewMissed = (item: MissedItem) => {
    setShowMissedDetail(item);
  };

  const handleCloseMissed = () => {
    setShowMissedDetail(null);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleGoHome = () => {
    Taro.switchTab({ url: '/pages/migrate/index' });
  };

  if (!report) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyIcon}>📋</Text>
        <Text className={styles.emptyText}>暂无迁移报告</Text>
        <Text className={styles.emptyTip}>完成一次迁移后即可查看报告</Text>
        <Button className="btn-primary" style={{ marginTop: 40 }} onClick={handleGoHome}>
          去换机
        </Button>
      </View>
    );
  }

  const isSuccess = report.overall >= 100 && report.failedItems === 0;
  const isPartial = report.overall >= 100 && report.failedItems > 0;

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.statusIcon}>
          {isSuccess ? '✅' : isPartial ? '⚠️' : '❌'}
        </View>
        <Text className={styles.statusTitle}>
          {isSuccess ? '迁移完成' : isPartial ? '部分完成' : '迁移未完成'}
        </Text>
        <Text className={styles.statusSub}>{report.date}</Text>
      </View>

      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{report.successItems}</Text>
            <Text className={styles.summaryLabel}>成功</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{report.skippedItems}</Text>
            <Text className={styles.summaryLabel}>跳过</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={`${styles.summaryValue} ${styles.failed}`}>{report.failedItems}</Text>
            <Text className={styles.summaryLabel}>失败</Text>
          </View>
        </View>
        <View className={styles.sizeRow}>
          <View className={styles.sizeItem}>
            <Text className={styles.sizeValue}>{report.successSize}</Text>
            <Text className={styles.sizeLabel}>已传输</Text>
          </View>
          <View className={styles.sizeItem}>
            <Text className={styles.sizeValue}>{report.totalSize}</Text>
            <Text className={styles.sizeLabel}>总计</Text>
          </View>
          <View className={styles.sizeItem}>
            <Text className={styles.sizeValue}>{report.duration}</Text>
            <Text className={styles.sizeLabel}>耗时</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>按资料类型</Text>
        {report.categories.map(cat => (
          <View key={cat.categoryId} className={styles.categoryCard}>
            <View className={styles.categoryHeader} onClick={() => toggleCategory(cat.categoryId)}>
              <View className={styles.categoryLeft}>
                <Text className={styles.categoryIcon}>{cat.icon}</Text>
                <View className={styles.categoryInfo}>
                  <Text className={styles.categoryName}>{cat.categoryName}</Text>
                  <Text className={styles.categoryMeta}>
                    {cat.successCount} 成功 · {cat.failedCount} 失败 · {cat.totalSize}
                  </Text>
                </View>
              </View>
              <Text className={styles.categoryArrow}>
                {expandedCategory === cat.categoryId ? '▲' : '▼'}
              </Text>
            </View>
            {expandedCategory === cat.categoryId && (
              <View className={styles.categoryDetail}>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>成功传输</Text>
                  <Text className={styles.detailValue}>{cat.successSize}</Text>
                </View>
                <View className={styles.detailRow}>
                  <Text className={styles.detailLabel}>失败数量</Text>
                  <Text className={`${styles.detailValue} ${styles.failed}`}>{cat.failedCount} 项</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {report.missedItems.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            未迁移项 ({report.missedItems.length} 项)
          </Text>
          <View className={styles.missedList}>
            {report.missedItems.map((item, idx) => (
              <View key={idx} className={styles.missedItem} onClick={() => handleViewMissed(item)}>
                <View className={styles.missedIcon}>⚠️</View>
                <View className={styles.missedInfo}>
                  <Text className={styles.missedName}>{item.name}</Text>
                  <Text className={styles.missedCategory}>{item.category}</Text>
                </View>
                <Text className={styles.missedArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.devices}>
        <View className={styles.deviceItem}>
          <Text className={styles.deviceIcon}>📱</Text>
          <Text className={styles.deviceName}>{report.deviceFrom}</Text>
          <Text className={styles.deviceLabel}>旧设备</Text>
        </View>
        <Text className={styles.deviceArrow}>→</Text>
        <View className={styles.deviceItem}>
          <Text className={styles.deviceIcon}>📲</Text>
          <Text className={styles.deviceName}>{report.deviceTo}</Text>
          <Text className={styles.deviceLabel}>新设备</Text>
        </View>
      </View>

      <View className={styles.actions}>
        <Button className="btn-secondary" onClick={handleBack}>
          返回
        </Button>
        <Button className="btn-primary" onClick={handleGoHome}>
          返回首页
        </Button>
      </View>

      {showMissedDetail && (
        <View className={styles.modalMask} onClick={handleCloseMissed}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>失败原因</Text>
            <View className={styles.modalItem}>
              <Text className={styles.modalItemLabel}>文件名称</Text>
              <Text className={styles.modalItemValue}>{showMissedDetail.name}</Text>
            </View>
            <View className={styles.modalItem}>
              <Text className={styles.modalItemLabel}>资料类型</Text>
              <Text className={styles.modalItemValue}>{showMissedDetail.category}</Text>
            </View>
            <View className={styles.modalItem}>
              <Text className={styles.modalItemLabel}>失败原因</Text>
              <Text className={`${styles.modalItemValue} ${styles.failed}`}>
                {showMissedDetail.reason}
              </Text>
            </View>
            <View className={styles.modalTip}>
              <Text className={styles.modalTipText}>
                💡 建议：检查文件是否损坏，或尝试重新传输
              </Text>
            </View>
            <Button className="btn-primary" style={{ marginTop: 24 }} onClick={handleCloseMissed}>
              知道了
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReportPage;
