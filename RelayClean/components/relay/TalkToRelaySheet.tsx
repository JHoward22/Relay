import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ds } from '@/constants/design-system';
import { RelayDraftItem, useRelayStore } from '@/store/relay-store';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { GlassCard } from './GlassCard';
import { SectionHeader } from './SectionHeader';
import { SheetModal } from './SheetModal';

const SUGGESTED_PROMPTS = [
  'Remind me to call the vet tomorrow',
  'Schedule dentist checkup in six months',
  "Create a follow-up message for Emma's teacher",
];

function parseToDraft(input: string): RelayDraftItem[] {
  const cleaned = input.trim();
  if (!cleaned) return [];

  const pieces = cleaned
    .split(/\band\b|,/i)
    .map((part) => part.trim())
    .filter(Boolean);

  return pieces.map((piece, index) => {
    const lower = piece.toLowerCase();
    let type: RelayDraftItem['type'] = 'task';

    if (lower.includes('appointment') || lower.includes('meeting') || lower.includes('schedule')) {
      type = 'event';
    } else if (lower.includes('remind')) {
      type = 'reminder';
    } else if (lower.includes('message') || lower.includes('reply') || lower.includes('follow-up')) {
      type = 'message';
    }

    let dueLabel = 'Upcoming';
    if (lower.includes('today')) dueLabel = 'Today';
    if (lower.includes('tomorrow')) dueLabel = 'Tomorrow';
    if (lower.includes('next week')) dueLabel = 'Next week';
    if (lower.includes('six months')) dueLabel = 'In 6 months';

    return {
      id: `draft-${index}`,
      title: piece.charAt(0).toUpperCase() + piece.slice(1),
      type,
      dueLabel,
    };
  });
}

function destination(type: RelayDraftItem['type']) {
  if (type === 'event') return 'Calendar';
  if (type === 'message') return 'Life Inbox';
  return 'Tasks';
}

function WaveBar({ progress, delay }: { progress: SharedValue<number>; delay: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.45 + progress.value * (0.6 + delay * 0.1) }],
    opacity: 0.45 + progress.value * 0.45,
  }));

  return <Animated.View style={[styles.waveBar, animatedStyle]} />;
}

export function TalkToRelaySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter() as any;
  const { addFromRelay } = useRelayStore();

  const [prompt, setPrompt] = useState('');
  const [listening, setListening] = useState(false);
  const [editable, setEditable] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<RelayDraftItem[]>([]);
  const [status, setStatus] = useState('');

  const waveProgress = useSharedValue(0);

  useEffect(() => {
    if (listening) {
      waveProgress.value = withRepeat(
        withTiming(1, {
          duration: 220,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      );
    } else {
      waveProgress.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
    }
  }, [listening, waveProgress]);

  const responseText = useMemo(() => {
    if (!draft.length) return 'Relay will organize what you say into tasks, reminders, or events.';
    return `I understood ${draft.length} item${draft.length > 1 ? 's' : ''}. Confirm to add them.`;
  }, [draft.length]);

  const applyPrompt = (text: string) => {
    setPrompt(text);
    const next = parseToDraft(text);
    setDraft(next);
    setSelectedIds(next.map((item) => item.id));
    setEditable(false);
    setStatus('');
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const selectedDraft = draft.filter((item) => selectedIds.includes(item.id));

  return (
    <SheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Talk to Relay</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={16} color={ds.colors.textSoft} />
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <GlassCard>
            <SectionHeader title="What’s on your mind?" />
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Tell Relay what’s on your mind…"
              style={styles.input}
              onSubmitEditing={() => applyPrompt(prompt)}
            />

            <View style={styles.quickRow}>
              {SUGGESTED_PROMPTS.map((item) => (
                <Pressable key={item} style={styles.chip} onPress={() => applyPrompt(item)}>
                  <Text style={styles.chipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </GlassCard>

          <GlassCard>
            <SectionHeader title="Relay" />
            <Text style={styles.responseText}>{responseText}</Text>
            {status ? <Text style={styles.statusText}>{status}</Text> : null}
          </GlassCard>

          {draft.length ? (
            <GlassCard>
              <SectionHeader title="I understood these items:" />
              {draft.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Pressable
                    style={[styles.check, selectedIds.includes(item.id) && styles.checkSelected]}
                    onPress={() => toggleSelected(item.id)}
                  >
                    {selectedIds.includes(item.id) ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
                  </Pressable>

                  <View style={styles.itemTextWrap}>
                    {editable ? (
                      <TextInput
                        value={item.title}
                        onChangeText={(value) =>
                          setDraft((prev) =>
                            prev.map((draftItem) =>
                              draftItem.id === item.id ? { ...draftItem, title: value } : draftItem
                            )
                          )
                        }
                        style={styles.editInput}
                      />
                    ) : (
                      <Text style={styles.itemTitle}>{item.title}</Text>
                    )}
                    <Text style={styles.itemMeta}>
                      {item.type} · {item.dueLabel} · {destination(item.type)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.actionRow}>
                <PrimaryButton
                  label="Add All"
                  onPress={() => {
                    addFromRelay(selectedDraft);
                    setStatus('Added. Relay routed items to Tasks, Calendar, and Inbox.');
                    setTimeout(() => onClose(), 450);
                  }}
                  style={styles.flex}
                />
                <SecondaryButton
                  label="Review Individually"
                  onPress={() => {
                    router.push({
                      pathname: '/relay/review',
                      params: {
                        draft: encodeURIComponent(JSON.stringify(selectedDraft)),
                      },
                    });
                    onClose();
                  }}
                  style={styles.flex}
                />
              </View>

              <View style={styles.actionRow}>
                <SecondaryButton label={editable ? 'Done Editing' : 'Edit'} onPress={() => setEditable((prev) => !prev)} style={styles.flex} />
                <SecondaryButton label="Cancel" onPress={onClose} style={styles.flex} />
              </View>
            </GlassCard>
          ) : null}
        </ScrollView>

        <View style={styles.bottomRow}>
          <Pressable style={styles.sendButton} onPress={() => applyPrompt(prompt)}>
            <Ionicons name="arrow-up" size={14} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={[styles.holdButton, listening && styles.holdButtonActive]}
            onPressIn={() => setListening(true)}
            onPressOut={() => setListening(false)}
          >
            <Ionicons name="mic" size={18} color="#FFFFFF" />
            <View style={styles.waveWrap}>
              <WaveBar progress={waveProgress} delay={1} />
              <WaveBar progress={waveProgress} delay={2} />
              <WaveBar progress={waveProgress} delay={3} />
            </View>
            <Text style={styles.holdLabel}>{listening ? 'Listening…' : 'Hold to talk'}</Text>
          </Pressable>
        </View>
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '90%',
    paddingHorizontal: ds.spacing.s12,
    paddingTop: ds.spacing.s8,
    paddingBottom: ds.spacing.s12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8D1E7',
    alignSelf: 'center',
    marginBottom: ds.spacing.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds.spacing.s12,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: ds.radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.colors.cardSoft,
  },
  scroll: {
    maxHeight: 540,
  },
  scrollContent: {
    gap: ds.spacing.s12,
    paddingBottom: ds.spacing.s12,
  },
  input: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    marginBottom: ds.spacing.s8,
  },
  quickRow: {
    gap: ds.spacing.s8,
  },
  chip: {
    borderRadius: ds.radius.card,
    backgroundColor: ds.colors.cardSoft,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  chipText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
  responseText: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textSoft,
    fontWeight: '400',
  },
  statusText: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.success,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ds.colors.border,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.4,
    borderColor: '#9DAAC7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkSelected: {
    borderColor: ds.colors.primary,
    backgroundColor: ds.colors.primary,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
  itemMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    textTransform: 'capitalize',
  },
  editInput: {
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginTop: ds.spacing.s12,
  },
  flex: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginTop: ds.spacing.s8,
    alignItems: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.colors.primary,
  },
  holdButton: {
    flex: 1,
    borderRadius: ds.radius.surface,
    backgroundColor: ds.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds.spacing.s8,
    paddingVertical: ds.spacing.s12,
  },
  holdButtonActive: {
    backgroundColor: '#234A96',
  },
  holdLabel: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  waveBar: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
