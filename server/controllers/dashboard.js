import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/leads.js'
import { Lead } from '../models/lead.js'
import { utcDay, addUtcDays, utcDateLabel } from '../utils/utc-dates.js'

function countsByKey(groups) {
  return new Map(groups.map(({ _id, count }) => [_id, count]))
}

export async function getSummary(req, res) {
  const today = utcDay(new Date())
  const firstDay = addUtcDays(today, -29)
  const tomorrow = addUtcDays(today, 1)
  const [result] = await Lead.aggregate([{
    $facet: {
      total: [{ $count: 'count' }],
      statuses: [{ $group: { _id: '$leadStatus', count: { $sum: 1 } } }],
      sources: [{ $group: { _id: '$leadSource', count: { $sum: 1 } } }],
      days: [
        { $match: { createdAt: { $gte: firstDay, $lt: tomorrow } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
            count: { $sum: 1 },
          },
        },
      ],
    },
  }])
  const statuses = countsByKey(result.statuses)
  const sources = countsByKey(result.sources)
  const days = countsByKey(result.days)
  const leadsOverTime = Array.from({ length: 30 }, (_, offset) => {
    const date = utcDateLabel(addUtcDays(firstDay, offset))
    return { date, count: days.get(date) ?? 0 }
  })

  res.json({
    success: true,
    data: {
      totalLeads: result.total[0]?.count ?? 0,
      newLeads: statuses.get('New') ?? 0,
      contactedLeads: statuses.get('Contacted') ?? 0,
      interestedLeads: statuses.get('Interested') ?? 0,
      convertedLeads: statuses.get('Converted') ?? 0,
      lostLeads: statuses.get('Lost') ?? 0,
      byStatus: LEAD_STATUSES.map((status) => ({ status, count: statuses.get(status) ?? 0 })),
      bySource: LEAD_SOURCES.map((source) => ({ source, count: sources.get(source) ?? 0 })),
      leadsOverTime,
    },
  })
}
