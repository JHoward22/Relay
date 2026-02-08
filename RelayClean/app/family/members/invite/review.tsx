import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { FamilySectionCard, FamilyShell } from '../../components/FamilyShell';
import { MemberRole, roleLabel, useFamilyStore } from '../../family-context';

export default function InviteReviewScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ name?: string; email?: string; role?: MemberRole }>();
  const { inviteMember } = useFamilyStore();
  const { addMember } = useRelayStore();

  const role = (params.role as MemberRole) || 'adult';
  const name = params.name || 'New member';
  const email = params.email || 'pending@invite.local';

  const canEdit = role === 'admin' || role === 'adult';
  const canDelete = role === 'admin';

  return (
    <FamilyShell title="Invite Review" subtitle="Confirm role permissions" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{email}</Text>
        <View style={styles.roleWrap}>
          <BubbleChip icon="person-outline" label={roleLabel(role)} tone="primary" onPress={() => router.back()} />
        </View>
      </GlassCard>

      <FamilySectionCard title="Permission preview">
        <View style={styles.permissionList}>
          <Text style={styles.permissionRow}>View shared plans: Yes</Text>
          <Text style={styles.permissionRow}>Edit tasks/events: {canEdit ? 'Yes' : 'No'}</Text>
          <Text style={styles.permissionRow}>Run voice actions: {canEdit ? 'Yes' : 'No'}</Text>
          <Text style={styles.permissionRow}>Remove members: {canDelete ? 'Yes' : 'No'}</Text>
        </View>
      </FamilySectionCard>

      <PrimaryButton
        label="Send invite"
        onPress={() => {
          inviteMember({ name, email, role });
          addMember({ name, role: roleLabel(role) });
          router.replace('/family/members');
        }}
      />
      <SecondaryButton label="Edit" onPress={() => router.back()} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  name: {
    fontFamily: ds.font,
    fontSize: 22,
    lineHeight: 28,
    color: ds.colors.text,
    fontWeight: '700',
  },
  meta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  roleWrap: {
    marginTop: ds.spacing.s12,
  },
  permissionList: {
    gap: ds.spacing.s8,
  },
  permissionRow: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
  },
});
