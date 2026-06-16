import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type TransferStatus = 'idle' | 'transferring' | 'paused' | 'completed' | 'failed' | 'connecting' | 'reconnecting';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  status?: TransferStatus;
  showLabel?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 360,
  strokeWidth = 20,
  status = 'idle',
  showLabel = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const statusConfig = {
    idle: { color: '#86909C', text: '等待中' },
    transferring: { color: '#28A745', text: '传输中' },
    paused: { color: '#FF7D00', text: '已暂停' },
    completed: { color: '#00B42A', text: '已完成' },
    failed: { color: '#F53F3F', text: '传输失败' },
    connecting: { color: '#1890FF', text: '连接中' },
    reconnecting: { color: '#1890FF', text: '重连中' }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <View className={styles.container}>
      <View className={styles.ringWrapper} style={{ width: `${size}rpx`, height: `${size}rpx` }}>
        <svg width={size} height={size} className={styles.svg}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E6EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <View className={styles.centerContent}>
          {showLabel && (
            <>
              <Text className={classnames(styles.percentage, status === 'transferring' && styles.pulse)}>
                {safePercentage}%
              </Text>
              <Text className={styles.statusText} style={{ color: config.color }}>
                {config.text}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProgressRing;
