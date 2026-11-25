export const STATUSES = ['New', 'Contacted', 'Interested', 'Converted', 'Lost']

export const SOURCES = ['Website', 'Instagram', 'LinkedIn', 'Referral', 'Advertisement', 'Cold Calling']

export const STATUS_STYLES = {
  New: { badge: 'bg-status-new-bg text-status-new-fg', dot: 'bg-status-new-dot' },
  Contacted: { badge: 'bg-status-contacted-bg text-status-contacted-fg', dot: 'bg-status-contacted-dot' },
  Interested: { badge: 'bg-status-interested-bg text-status-interested-fg', dot: 'bg-status-interested-dot' },
  Converted: { badge: 'bg-status-converted-bg text-status-converted-fg', dot: 'bg-status-converted-dot' },
  Lost: { badge: 'bg-status-lost-bg text-status-lost-fg', dot: 'bg-status-lost-dot' },
}

export const LEAD_FIELDS = ['fullName', 'email', 'phone', 'companyName', 'leadSource', 'leadStatus']

export function toOptions(values) {
  return values.map((value) => ({ value, label: value }))
}
