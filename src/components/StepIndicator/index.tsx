import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <View className={styles.container}>
      {steps.map((step, index) => (
        <View key={step.id} className={styles.stepWrapper}>
          <View className={styles.connector}>
            {index > 0 && (
              <View className={classnames(
                styles.line,
                steps[index - 1].completed && styles.lineCompleted
              )} />
            )}
          </View>
          <View className={styles.stepItem}>
            <View className={classnames(
              styles.circle,
              step.completed && styles.circleCompleted,
              step.active && styles.circleActive,
              !step.completed && !step.active && styles.circlePending
            )}>
              {step.completed ? (
                <Text className={styles.checkMark}>✓</Text>
              ) : (
                <Text className={styles.stepNumber}>{step.id}</Text>
              )}
            </View>
            <View className={styles.stepContent}>
              <Text className={classnames(
                styles.stepTitle,
                (step.active || step.completed) && styles.stepTitleActive
              )}>
                {step.title}
              </Text>
              <Text className={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default StepIndicator;
