import { useMemo } from 'react';
import Badge from './Badge';
import { useColors, type SemanticColors } from '@/lib/theme/colors';

interface StatusBadgeProps {
  status: string;
}

function buildMap(c: SemanticColors): Record<string, [string, string]> {
  return {
    confirmed: [c.green, 'Confirmed'],
    pending: [c.yellow, 'Pending'],
    completed: [c.ink, 'Completed'],
    cancelled: [c.red, 'Cancelled'],
    no_show: [c.red, 'No-Show'],
    active: [c.green, 'Active'],
    paused: [c.orange, 'Paused'],
    scheduled: [c.blue, 'Scheduled'],
    charged: [c.green, 'Paid'],
    failed_payment: [c.red, 'Failed'],
    pending_client_approval: [c.yellow, 'Awaiting'],
    pending_barber_approval: [c.yellow, 'Pending'],
    expired: [c.tertiary, 'Expired'],
    rejected: [c.red, 'Rejected'],
    ended: [c.tertiary, 'Ended'],
    pending_approval: [c.yellow, 'Pending'],
    past_due: [c.red, 'Past Due'],
  };
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = useColors();
  const map = useMemo(() => buildMap(colors), [colors]);

  const [accent, label] = map[status] ?? [colors.quaternary, status];

  return <Badge bg={accent + '1A'} color={accent} label={label} />;
}
