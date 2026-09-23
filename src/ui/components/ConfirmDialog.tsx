import { Modal, StyleSheet, View } from 'react-native';
import { colors, maxContentWidth, radius, shadow, spacing } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Destructive confirmation. The safe action is the most prominent one. */
export function ConfirmDialog({ visible, title, body, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.scrim}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <AppText variant="h2" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {body}
          </AppText>
          <View style={styles.actions}>
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" sound="uiBack" />
            <Button label={confirmLabel} onPress={onConfirm} variant="danger" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: maxContentWidth - 80,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow('high'),
  },
  actions: { gap: spacing.xs, marginTop: spacing.xs },
});
