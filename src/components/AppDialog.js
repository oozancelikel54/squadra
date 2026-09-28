import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useTheme, useThemedStyles, motion } from '../theme';
import { APP_HASHTAG } from '../constants/appBrand';

const DialogContext = createContext(null);

/**
 * Themed dialog — native Alert yerine.
 *
 * const choice = await showDialog({ title, message, buttons });
 * // choice = basılan butonun text’i veya null (backdrop)
 *
 * Butonlarda onPress opsiyonel; tercih edilen yol await + dönen text.
 */
export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);
  const visibleRef = useRef(false);
  const queueRef = useRef([]);
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        ...motion.softSpring,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  const openNext = useCallback(() => {
    const next = queueRef.current.shift();
    if (!next) {
      visibleRef.current = false;
      setDialog(null);
      return;
    }
    visibleRef.current = true;
    resolveRef.current = next.resolve;
    setDialog({
      title: next.title,
      message: next.message,
      buttons: next.buttons,
    });
    requestAnimationFrame(animateIn);
  }, [animateIn]);

  const dismiss = useCallback(
    (after) => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setDialog(null);
        visibleRef.current = false;
        // Modal’ın native tarafta kapanması için kısa gecikme
        setTimeout(() => {
          try {
            after?.();
          } catch (e) {
            console.warn('[dialog] after-dismiss error', e);
          }
          if (queueRef.current.length) openNext();
        }, 180);
      });
    },
    [opacity, openNext]
  );

  const showDialog = useCallback(
    ({ title, message, buttons } = {}) =>
      new Promise((resolve) => {
        const normalized =
          Array.isArray(buttons) && buttons.length
            ? buttons
            : [{ text: 'OK', style: 'default' }];

        const job = {
          title,
          message,
          buttons: normalized,
          resolve,
        };

        if (visibleRef.current) {
          queueRef.current.push(job);
          return;
        }

        visibleRef.current = true;
        resolveRef.current = resolve;
        setDialog({ title, message, buttons: normalized });
        requestAnimationFrame(animateIn);
      }),
    [animateIn]
  );

  const handleButton = useCallback(
    (btn) => {
      const resolve = resolveRef.current;
      resolveRef.current = null;
      dismiss(() => {
        resolve?.(btn?.text ?? null);
        if (typeof btn?.onPress === 'function') {
          setTimeout(() => {
            try {
              btn.onPress();
            } catch (e) {
              console.warn('[dialog] onPress error', e);
            }
          }, 50);
        }
      });
    },
    [dismiss]
  );

  const handleBackdrop = useCallback(() => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    dismiss(() => resolve?.(null));
  }, [dismiss]);

  const value = useMemo(() => ({ showDialog }), [showDialog]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <AppDialogView
        visible={!!dialog}
        dialog={dialog}
        scale={scale}
        opacity={opacity}
        onButtonPress={handleButton}
        onBackdrop={handleBackdrop}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return ctx;
}

function AppDialogView({
  visible,
  dialog,
  scale,
  opacity,
  onButtonPress,
  onBackdrop,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const buttons = dialog?.buttons || [];
  const stacked = buttons.length > 2;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onBackdrop}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} />
        <Animated.View
          style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}
        >
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={styles.brand}>{APP_HASHTAG}</Text>
            {!!dialog?.title && (
              <Text style={styles.title}>{dialog.title}</Text>
            )}
            {!!dialog?.message && (
              <Text style={styles.message}>{dialog.message}</Text>
            )}

            <View style={[styles.actions, stacked && styles.actionsStacked]}>
              {buttons.map((btn, index) => {
                const kind = btn.style || 'default';
                const isPrimary =
                  kind !== 'cancel' &&
                  (kind === 'destructive' || index === buttons.length - 1);
                return (
                  <Pressable
                    key={`${btn.text}-${index}`}
                    style={[
                      styles.btn,
                      stacked && styles.btnStacked,
                      kind === 'cancel' && styles.btnCancel,
                      isPrimary && kind !== 'destructive' && styles.btnPrimary,
                      kind === 'destructive' && styles.btnDanger,
                    ]}
                    onPress={() => onButtonPress(btn)}
                    android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        kind === 'cancel' && styles.btnTextCancel,
                        isPrimary &&
                          kind !== 'destructive' &&
                          styles.btnTextPrimary,
                        kind === 'destructive' && styles.btnTextDanger,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay || 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    cardWrap: {
      width: '100%',
      maxWidth: 340,
      zIndex: 2,
    },
    card: {
      borderRadius: 22,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.cardShadow || '#000',
      shadowOpacity: 1,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 16,
    },
    brand: {
      alignSelf: 'flex-start',
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.2,
      color: colors.accentBright,
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    message: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      lineHeight: 21,
      marginBottom: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
    },
    actionsStacked: {
      flexDirection: 'column-reverse',
      alignItems: 'stretch',
    },
    btn: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgElevated || colors.surfaceSoft,
      flexGrow: 1,
      flexBasis: 0,
    },
    btnStacked: {
      flexGrow: 0,
      flexBasis: 'auto',
      width: '100%',
    },
    btnCancel: {
      backgroundColor: 'transparent',
    },
    btnPrimary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    btnDanger: {
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.4)',
    },
    btnText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    btnTextCancel: {
      color: colors.textMuted,
    },
    btnTextPrimary: {
      color: '#FFFFFF',
    },
    btnTextDanger: {
      color: colors.danger,
    },
  });
}
