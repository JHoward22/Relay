import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MemberRole, roleLabel } from '../../family-context';
import { FamilyShell } from '../../components/FamilyShell';

const ROLES: MemberRole[] = ['admin', 'adult', 'child', 'viewer'];

export default function InviteMemberScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ mode?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('adult');

  return (
    <FamilyShell title="Invite Member" subtitle="Set role and permissions" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.modeLabel}>{params.mode === 'link' ? 'Link invite' : 'Email invite'}</Text>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Alex" />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="alex@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map((item) => (
            <BubbleChip
              key={item}
              icon={role === item ? 'checkmark-circle' : 'ellipse-outline'}
              label={roleLabel(item)}
              tone={role === item ? 'primary' : 'neutral'}
              onPress={() => setRole(item)}
            />
          ))}
        </View>
      </GlassCard>

      <PrimaryButton
        label="Preview permissions"
        onPress={() =>
          router.push({
            pathname: '/family/members/invite/review',
            params: {
              name: name || 'New member',
              email: email || 'pending@invite.local',
              role,
            },
          })
        }
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  modeLabel: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  sectionLabel: {
    marginTop: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textSoft,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
