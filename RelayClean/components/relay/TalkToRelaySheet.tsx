import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { useAIMemory } from '@/app/ai/ai-memory-context';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import { RelayDraftItem, useRelayStore } from '@/store/relay-store';
import {
  executeVoiceIntent,
  routeVoiceIntent,
  tabFromPath,
  VoiceExecutionOutcome,
  VoiceInterpretation,
} from '@/store/voice-router';

type RelayPhase =
  | 'listening'
  | 'processing'
  | 'followup'
  | 'confirmation'
  | 'response';

type RelayMessage = {
  id: string;
  role: 'user' | 'relay' | 'system';
  text: string;
  meta?: string;
};

const SAMPLE_PROMPTS = [
  'Schedule a vet appointment for Luna next Thursday at 3 PM',
  'Delete task call the vet',
  'Mark electricity bill paid',
  'Why did you remind me about evening tasks?',
];

const PROCESSING_LINES = [
  'Relay is understanding your request...',
  'Relay is routing this to the right workspace...',
  'Relay is preparing a confirmation preview...',
];

function NoiseLayer() {
  const dots = Array.from({ length: 40 }).map((_, index) => (
    <View
      key={index}
      style={[
        styles.noiseDot,
        {
          width: 4 + ((index * 5) % 11),
          height: 4 + ((index * 5) % 11),
          borderRadius: 999,
          top: (index * 37) % 740,
          left: (index * 47) % 360,
          opacity: 0.03 + (index % 4) * 0.012,
        },
      ]}
    />
  ));

  return <View style={styles.noiseLayer}>{dots}</View>;
}

function draftFromInterpretation(
  interpretation: VoiceInterpretation,
  prompt: string
): RelayDraftItem[] {
  const { intent, slots } = interpretation;

  if (
    intent === 'create_task' ||
    intent === 'delete_task' ||
    intent === 'assign_chore' ||
    intent === 'reassign_chore' ||
    intent === 'add_grocery_item' ||
    intent === 'add_bill' ||
    intent === 'mark_bill_paid' ||
    intent === 'add_subscription' ||
    intent === 'cancel_subscription' ||
    intent === 'log_feeding' ||
    intent === 'add_medication' ||
    intent === 'mark_medication_given' ||
    intent === 'delete_note'
  ) {
    return [
      {
        id: 'review-1',
        title: slots.title || slots.item || prompt,
        type: intent === 'add_bill' || intent === 'add_subscription' ? 'reminder' : 'task',
        dueLabel: slots.date || 'Soon',
      },
    ];
  }

  if (
    intent === 'create_event' ||
    intent === 'delete_event' ||
    intent === 'add_family_event' ||
    intent === 'schedule_vet_visit' ||
    intent === 'complete_vet_visit'
  ) {
    return [
      {
        id: 'review-1',
        title: slots.title || `${slots.pet || 'Pet'} visit`,
        type: 'event',
        dueLabel: slots.date || 'Soon',
      },
    ];
  }

  if (intent === 'create_note' || intent === 'save_summary_as_note') {
    return [
      {
        id: 'review-1',
        title: slots.title || 'Quick note',
        type: 'message',
        dueLabel: 'Now',
      },
    ];
  }

  return [];
}

export function TalkToRelaySheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter() as any;
  const pathname = usePathname();
  const modalRef = useRef<BottomSheetModal>(null);
  const processingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageCounterRef = useRef(0);

  const waveProgress = useSharedValue(0);

  const { state, addTask, updateTask, toggleTask, deleteTask, addEvent, updateEvent, deleteEvent } =
    useRelayStore();
  const { answerVoiceMemoryQuery, state: memoryState } = useAIMemory();

  const [phase, setPhase] = useState<RelayPhase>('listening');
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [status, setStatus] = useState(PROCESSING_LINES[0]);
  const [response, setResponse] = useState('Relay is ready when you are.');
  const [messages, setMessages] = useState<RelayMessage[]>([]);

  const [interpretation, setInterpretation] =
    useState<VoiceInterpretation | null>(null);
  const [outcome, setOutcome] = useState<VoiceExecutionOutcome | null>(null);

  const snapPoints = useMemo(() => ['40%', '75%', '95%'], []);
  const context = useMemo(
    () => ({
      pathname,
      tab: tabFromPath(pathname),
      familyMode: state.familyModeEnabled,
      selectedDateISO: new Date().toISOString().slice(0, 10),
    }),
    [pathname, state.familyModeEnabled]
  );

  const pushMessage = useCallback((role: RelayMessage['role'], text: string, meta?: string) => {
    messageCounterRef.current += 1;
    const id = `msg-${messageCounterRef.current}`;
    setMessages((prev) => [...prev, { id, role, text, meta }].slice(-20));
  }, []);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      setPhase('listening');
      setLiveTranscript('');
      setInterpretation(null);
      setOutcome(null);
      setMessages([
        {
          id: 'msg-0',
          role: 'system',
          text: 'Relay can create, edit, and delete across Tasks, Calendar, Meals, Finances, Pets, Notes, and Family.',
          meta: 'Voice-first command center',
        },
      ]);
      messageCounterRef.current = 0;
      return;
    }
    modalRef.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    if (phase === 'listening' || phase === 'processing' || phase === 'followup') {
      waveProgress.value = withRepeat(
        withTiming(1, { duration: 780, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      return;
    }

    waveProgress.value = withTiming(0, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  }, [phase, waveProgress]);

  useEffect(() => {
    if (phase !== 'listening') return;

    if (transcriptRef.current) clearInterval(transcriptRef.current);
    let idx = 0;
    const script = prompt || SAMPLE_PROMPTS[0];

    transcriptRef.current = setInterval(() => {
      idx += 1;
      setLiveTranscript(script.slice(0, idx));
      if (idx >= script.length && transcriptRef.current) {
        clearInterval(transcriptRef.current);
        transcriptRef.current = null;
      }
    }, 22);

    return () => {
      if (transcriptRef.current) {
        clearInterval(transcriptRef.current);
        transcriptRef.current = null;
      }
    };
  }, [phase, prompt]);

  useEffect(() => {
    if (phase !== 'processing') return;

    let idx = 0;
    setStatus(PROCESSING_LINES[idx]);

    if (processingRef.current) clearInterval(processingRef.current);
    processingRef.current = setInterval(() => {
      idx = (idx + 1) % PROCESSING_LINES.length;
      setStatus(PROCESSING_LINES[idx]);
    }, 860);

    const timeout = setTimeout(() => {
      const parsed = routeVoiceIntent(prompt, context);
      setInterpretation(parsed);

      const isReasoningQuery =
        /\b(why|forget|usually|remember|pattern|what did i|what do i)\b/i.test(prompt) &&
        (prompt.trim().endsWith('?') || parsed.intent === 'unknown_intent');
      if (
        isReasoningQuery &&
        (parsed.intent === 'unknown_intent' || parsed.intent === 'small_talk_qna')
      ) {
        const memoryReply = answerVoiceMemoryQuery(prompt);
        const result: VoiceExecutionOutcome = {
          message: memoryReply.answer,
          detail: memoryReply.sources.length
            ? `Sources: ${memoryReply.sources.join(' • ')}`
            : undefined,
          route: '/ai/memory',
          informational: true,
          explain: 'Used memory and insight snapshots to answer a reasoning question.',
        };
        setOutcome(result);
        setResponse(result.message);
        pushMessage('relay', result.message, result.detail);
        setPhase('response');
        return;
      }

      if (parsed.missingSlots.length && parsed.followUp) {
        setPhase('followup');
        setStatus(parsed.spec.processingLabel);
        pushMessage('system', parsed.followUp.question, 'Needs one detail before execution');
        return;
      }

      if (parsed.requiresConfirmation) {
        setPhase('confirmation');
        setStatus(parsed.spec.processingLabel);
        return;
      }

      const result = executeVoiceIntent(parsed, {
        relay: {
          state,
          addTask,
          updateTask,
          toggleTask,
          deleteTask,
          addEvent,
          updateEvent,
          deleteEvent,
        },
        context,
        navigate: () => {
          // defer navigation to explicit chip action in response phase
        },
      });

      setOutcome(result);
      setResponse(result.message);
      pushMessage('relay', result.message, result.detail);
      setPhase('response');

      emitAIMemoryEvent({
        source: 'voice',
        kind: 'action',
        payload: {
          intent: parsed.intent,
          confidence: parsed.confidence,
          previewOnly: true,
        },
      });
    }, 1200);

    return () => {
      clearTimeout(timeout);
      if (processingRef.current) {
        clearInterval(processingRef.current);
        processingRef.current = null;
      }
    };
  }, [
    addEvent,
    addTask,
    context,
    deleteEvent,
    deleteTask,
    phase,
    prompt,
    state,
    toggleTask,
    updateEvent,
    updateTask,
    answerVoiceMemoryQuery,
    pushMessage,
  ]);

  useEffect(
    () => () => {
      if (processingRef.current) clearInterval(processingRef.current);
      if (transcriptRef.current) clearInterval(transcriptRef.current);
    },
    []
  );

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + waveProgress.value * 0.08 }],
    opacity: 0.88 + waveProgress.value * 0.12,
  }));

  const runInterpretation = async (value: string) => {
    const clean = value.trim();
    if (!clean) return;

    await Haptics.selectionAsync();
    setPrompt(clean);
    setLiveTranscript('');
    setOutcome(null);
    setInterpretation(null);
    setPhase('processing');
    pushMessage('user', clean, `Context: ${context.tab}`);

    emitAIMemoryEvent({
      source: 'voice',
      kind: 'action',
      payload: {
        intent: 'voice_capture',
        text: clean,
        path: pathname,
      },
    });
  };

  const onConfirm = async () => {
    if (!interpretation) return;

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const result = executeVoiceIntent(interpretation, {
      relay: {
        state,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addEvent,
        updateEvent,
        deleteEvent,
      },
      context,
      navigate: () => {
        // explicit navigation via chips only
      },
    });

    setOutcome(result);
    setResponse(result.message);
    pushMessage('relay', result.message, result.detail);
    setPhase('response');

    emitAIMemoryEvent({
      source: 'voice',
      kind: 'action',
      payload: {
        intent: interpretation.intent,
        confirmed: true,
        confidence: interpretation.confidence,
      },
    });
  };

  const onFollowUpAnswer = async (answer: string) => {
    const merged = `${prompt} ${answer}`.trim();
    setPrompt(merged);
    pushMessage('user', answer, 'Follow-up answer');
    await runInterpretation(merged);
  };

  const onTurnIntoTask = async () => {
    await Haptics.selectionAsync();
    addTask({
      title: response.slice(0, 80),
      dueDate: 'Tomorrow',
      priority: 'medium',
      category: 'Follow-up',
      recurring: false,
      createdBy: 'voice',
      note: outcome?.detail,
    });
    setResponse('Saved as a task.');
    pushMessage('relay', 'Saved as a task.', 'Created from response');
  };

  const onTurnIntoEvent = async () => {
    await Haptics.selectionAsync();
    addEvent({
      title: response.slice(0, 72),
      date: new Date().toISOString().slice(0, 10),
      time: '3:00 PM',
      allDay: false,
      type: 'general',
      createdBy: 'voice',
      shared: false,
      color: '#4B84E8',
      aiContext: 'Captured from Relay response',
      location: 'No location set',
      reminder: '1 hour before',
      notes: outcome?.detail,
      repeat: 'None',
    });
    setResponse('Saved as an event in Calendar.');
    pushMessage('relay', 'Saved as an event in Calendar.', 'Created from response');
  };

  const onOpenRoute = () => {
    if (!outcome?.route) return;
    router.push(outcome.route);
  };

  const onExplainWhy = () => {
    if (interpretation?.intent) {
      const memoryReply = answerVoiceMemoryQuery(`Why did you ${interpretation.intent}?`);
      setResponse(memoryReply.answer);
      pushMessage('relay', memoryReply.answer, `Sources: ${memoryReply.sources.join(' • ')}`);
      setPhase('response');
      return;
    }
    router.push('/ai/memory');
  };

  const phaseLabel =
    phase === 'listening'
      ? 'Listening…'
      : phase === 'processing'
        ? 'Processing…'
        : phase === 'followup'
          ? 'Need one detail'
          : phase === 'confirmation'
            ? 'Action preview'
            : 'Relay response';

  const previewItems = interpretation?.previewLines ?? [];
  const draftItems = interpretation ? draftFromInterpretation(interpretation, prompt) : [];
  const workspaceStats = [
    { icon: 'checkbox-outline' as const, label: 'Tasks', value: String(state.tasks.filter((item) => !item.completed).length) },
    { icon: 'calendar-outline' as const, label: 'Events', value: String(state.events.length) },
    { icon: 'sparkles-outline' as const, label: 'Insights', value: String(memoryState.insights.length) },
    { icon: 'people-outline' as const, label: 'Family', value: state.familyModeEnabled ? 'On' : 'Off' },
  ];
  const recentMessages = messages.slice(-6);

  return (
    <BottomSheetModal
      ref={modalRef}
      index={2}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
        />
      )}
    >
      <View style={styles.sheetContent}>
        <LinearGradient
          colors={['#12396D', '#2A5E95', '#79A6CE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <NoiseLayer />
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Talk to Relay</Text>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerMic}
                onPress={() => runInterpretation(prompt)}
              >
                <Ionicons name="mic" size={17} color="#FFFFFF" />
              </Pressable>
              <Pressable style={styles.headerMic} onPress={onClose}>
                <Ionicons name="close" size={17} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <GlassCard blur tone="dark" style={styles.transcriptCard}>
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
            <Text style={styles.transcript}>{`“${
              phase === 'listening' ? liveTranscript || '…' : prompt
            }”`}</Text>
            {interpretation ? (
              <Text style={styles.summaryMeta}>
                Intent: {interpretation.intent} · Confidence {Math.round(interpretation.confidence * 100)}%
              </Text>
            ) : null}
          </GlassCard>

          <GlassCard blur tone="dark" style={styles.statusCard}>
            <Text style={styles.confirmTitle}>Connected Workspaces</Text>
            <View style={styles.workspaceRow}>
              {workspaceStats.map((item) => (
                <View key={item.label} style={styles.workspacePill}>
                  <Ionicons name={item.icon} size={13} color="#DCEBFF" />
                  <Text style={styles.workspaceLabel}>
                    {item.label}: {item.value}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <GlassCard blur tone="dark" style={styles.threadCard}>
            <Text style={styles.confirmTitle}>Conversation</Text>
            {recentMessages.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.threadBubble,
                  item.role === 'user'
                    ? styles.threadBubbleUser
                    : item.role === 'relay'
                      ? styles.threadBubbleRelay
                      : styles.threadBubbleSystem,
                ]}
              >
                <Text style={styles.threadText}>{item.text}</Text>
                {item.meta ? <Text style={styles.threadMeta}>{item.meta}</Text> : null}
              </View>
            ))}
          </GlassCard>

          {phase === 'processing' ? (
            <GlassCard blur tone="dark" style={styles.statusCard}>
              <Text style={styles.statusText}>
                {interpretation?.spec.processingLabel || status}
              </Text>
            </GlassCard>
          ) : null}

          {phase === 'followup' && interpretation?.followUp ? (
            <GlassCard blur tone="dark" style={styles.confirmWrap}>
              <Text style={styles.confirmTitle}>One quick question</Text>
              <Text style={styles.responseText}>{interpretation.followUp.question}</Text>
              <View style={styles.chipRow}>
                {interpretation.followUp.chips.map((chip) => (
                  <BubbleChip
                    key={chip}
                    icon="chatbubble-ellipses-outline"
                    label={chip}
                    tone="primary"
                    onDark
                    onPress={() => onFollowUpAnswer(chip)}
                  />
                ))}
                <BubbleChip
                  icon="create-outline"
                  label="Edit"
                  tone="neutral"
                  onDark
                  onPress={() => setPhase('listening')}
                />
                <BubbleChip
                  icon="close"
                  label="Cancel"
                  tone="neutral"
                  onDark
                  onPress={onClose}
                />
              </View>
            </GlassCard>
          ) : null}

          {phase === 'confirmation' && interpretation ? (
            <GlassCard blur tone="dark" style={styles.confirmWrap}>
              <Text style={styles.confirmTitle}>{interpretation.spec.previewTitle}</Text>
              <Text style={styles.statusText}>
                Destination: {interpretation.destinationLabel}
              </Text>

              {previewItems.map((line) => (
                <View key={line} style={styles.summaryRow}>
                  <Ionicons name="sparkles-outline" size={14} color="#D7E9FF" />
                  <View style={styles.summaryTextWrap}>
                    <Text style={styles.summaryTitle}>{line}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.chipRow}>
                <BubbleChip
                  icon="checkmark"
                  label="Confirm"
                  tone="success"
                  onDark
                  onPress={onConfirm}
                />
                <BubbleChip
                  icon="create-outline"
                  label="Edit"
                  tone="primary"
                  onDark
                  onPress={() => setPhase('listening')}
                />
                <BubbleChip
                  icon="list-outline"
                  label="Review"
                  tone="neutral"
                  onDark
                  onPress={() => {
                    const draft = encodeURIComponent(JSON.stringify(draftItems));
                    router.push(`/relay/review?draft=${draft}`);
                  }}
                />
                <BubbleChip
                  icon="help-circle-outline"
                  label="Why"
                  tone="neutral"
                  onDark
                  onPress={onExplainWhy}
                />
                <BubbleChip
                  icon="close"
                  label="Cancel"
                  tone="neutral"
                  onDark
                  onPress={onClose}
                />
              </View>
            </GlassCard>
          ) : null}

          {phase === 'response' ? (
            <GlassCard blur tone="dark" style={styles.responseCard}>
              <Text style={styles.responseText}>{response}</Text>
              {outcome?.detail ? (
                <Text style={styles.summaryMeta}>{outcome.detail}</Text>
              ) : null}

              <View style={styles.chipRow}>
                {outcome?.route ? (
                  <BubbleChip
                    icon="open-outline"
                    label="Open"
                    tone="primary"
                    onDark
                    onPress={onOpenRoute}
                  />
                ) : null}

                {outcome?.undo ? (
                  <BubbleChip
                    icon="arrow-undo-outline"
                    label="Undo"
                    tone="neutral"
                    onDark
                    onPress={() => {
                      outcome.undo?.run();
                      setResponse('Undone.');
                    }}
                  />
                ) : null}

                <BubbleChip
                  icon="help-circle-outline"
                  label="Why"
                  tone="neutral"
                  onDark
                  onPress={onExplainWhy}
                />

                {outcome?.informational ? (
                  <BubbleChip
                    icon="checkmark-circle-outline"
                    label="Task"
                    tone="primary"
                    onDark
                    onPress={onTurnIntoTask}
                  />
                ) : null}

                {outcome?.informational ? (
                  <BubbleChip
                    icon="calendar-outline"
                    label="Event"
                    tone="primary"
                    onDark
                    onPress={onTurnIntoEvent}
                  />
                ) : null}

                <BubbleChip
                  icon="close"
                  label="Done"
                  tone="neutral"
                  onDark
                  onPress={onClose}
                />
              </View>
            </GlassCard>
          ) : null}

          <View style={styles.promptRow}>
            {SAMPLE_PROMPTS.map((item) => (
              <Pressable
                key={item}
                style={styles.promptChip}
                onPress={() => runInterpretation(item)}
              >
                <Text style={styles.promptChipText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Tell Relay what’s on your mind…"
              placeholderTextColor="rgba(228,237,255,0.7)"
              onSubmitEditing={() => runInterpretation(prompt)}
              style={styles.input}
            />
          </View>

          <View style={styles.bottomMicArea}>
            <Animated.View style={[styles.bottomMicHalo, waveStyle]}>
              <Pressable
                style={styles.bottomMic}
                onPressIn={() => setPhase('listening')}
                onPressOut={() => runInterpretation(prompt)}
              >
                <LinearGradient
                  colors={['#5AB5FF', '#298DFF', '#1E73F8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bottomMicGradient}
                >
                  <Ionicons name="mic" size={30} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#2A5F9A',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(240,248,255,0.6)',
  },
  sheetContent: {
    flex: 1,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
  },
  noiseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  noiseDot: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s24,
    gap: ds.spacing.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  headerTitle: {
    fontFamily: ds.font,
    fontSize: 38 * 0.76,
    lineHeight: 32,
    color: '#F5FAFF',
    fontWeight: '700',
  },
  headerMic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(221,236,255,0.56)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(220,236,255,0.46)',
  },
  phaseLabel: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(241,249,255,0.88)',
    fontWeight: '600',
  },
  transcript: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 38 * 0.72,
    lineHeight: 38,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(220,236,255,0.48)',
  },
  statusText: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#F6FAFF',
    fontWeight: '600',
  },
  confirmWrap: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderColor: 'rgba(220,236,255,0.5)',
  },
  confirmTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#F6FAFF',
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  summaryMeta: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(230,241,255,0.86)',
    fontWeight: '500',
  },
  workspaceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  workspacePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214,233,255,0.42)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  workspaceLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: '#E7F2FF',
    fontWeight: '600',
  },
  threadCard: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(220,236,255,0.44)',
    gap: ds.spacing.s8,
  },
  threadBubble: {
    borderRadius: 12,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
    borderWidth: 1,
  },
  threadBubbleUser: {
    borderColor: 'rgba(164,212,255,0.44)',
    backgroundColor: 'rgba(69,150,255,0.22)',
  },
  threadBubbleRelay: {
    borderColor: 'rgba(200,225,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  threadBubbleSystem: {
    borderColor: 'rgba(203,222,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  threadText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: '#F8FBFF',
    fontWeight: '600',
  },
  threadMeta: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(226,240,255,0.86)',
    fontWeight: '500',
  },
  responseCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(220,236,255,0.48)',
  },
  responseText: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: ds.spacing.s8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  promptChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(219,237,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  promptChipText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(239,248,255,0.92)',
    fontWeight: '500',
  },
  inputWrap: {
    marginTop: ds.spacing.s4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(219,237,255,0.46)',
    backgroundColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  input: {
    minHeight: 44,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: '#F5FAFF',
    fontWeight: '500',
  },
  bottomMicArea: {
    alignItems: 'center',
    marginTop: ds.spacing.s12,
  },
  bottomMicHalo: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(139, 196, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomMic: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#D7E9FF',
    overflow: 'hidden',
    ...ds.shadow.card,
  },
  bottomMicGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
