import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/leads.js'
import { addUtcDays, utcDay } from '../utils/utc-dates.js'

const STATUS_COUNTS = [12, 10, 8, 6, 4]
// Oldest to newest. Keep all 30 UTC buckets, including quiet stretches and two four-lead days.
const DAILY_LEADS = [1, 0, 0, 2, 1, 3, 1, 0, 2, 0, 1, 4, 2, 1, 0, 0, 2, 3, 1, 2, 0, 1, 1, 4, 1, 0, 2, 3, 0, 2]
const DAYS_AGO = DAILY_LEADS.flatMap((count, day) => Array(count).fill(DAILY_LEADS.length - 1 - day)).reverse()
const SEED_ID_PREFIX = '6744b17e000000000000'
const CONTACTS = [
  ['Avery Morgan', 'Asterfield Studio'],
  ['Sienna Patel', 'Cobalt Finch Design'],
  ['Miles Chen', 'Driftwood Signal'],
  ['Leena Rao', 'Paper Lantern Works'],
  ['Noah Bennett', 'Copper Vale Supply'],
  ['Isla Mehta', 'Juniper Loom'],
  ['Elliot Park', 'Blue Thistle Labs'],
  ['Mira Shah', 'Crescent Kite Media'],
  ['Freya Collins', 'Quartz Fern Creative'],
  ['Theo Nair', 'Harbor Thread'],
  ['Nina Flores', 'Linden Echo'],
  ['Arjun Reed', 'Maple Dune Systems'],
  ['Zara Gupta', 'Ember Grove Studio'],
  ['Jasper Ali', 'Cloud Spruce Logistics'],
  ['Amara Xu', 'Orchard Glass Works'],
  ['Liam Joshi', 'Little Fjord Publishing'],
  ['Ivy Brooks', 'Ochre Willow Retail'],
  ['Ravi Stone', 'Cinder Oak Digital'],
  ['Maeve Kapoor', 'Woven Pixel Lab'],
  ['Evan Iyer', 'Dawn Nettle Foods'],
  ['Anika Lane', 'Slate Acorn Consulting'],
  ['Rowan Desai', 'Ivory Current'],
  ['Esme Wilson', 'Fogberry Press'],
  ['Owen Kulkarni', 'Ridge Mint Studio'],
  ['Tara Singh', 'Dandelion Slate'],
  ['Finn Thomas', 'Silver Tamarind'],
  ['Jaya Wells', 'Kestrel Harbor'],
  ['Luca Verma', 'Stone Lotus Media'],
  ['Nora Das', 'Nightjar Cart'],
  ['Dev Scott', 'Tin Meadow Labs'],
  ['Elena Reddy', 'Willow Kite Commerce'],
  ['Amir Lewis', 'Mossline Events'],
  ['Maya Bose', 'Topaz Orchard'],
  ['Rohan Ellis', 'Saffron Pebble Co'],
  ['Aisha Sen', 'River Clover Design'],
  ['Eli Varma', 'Birch Moon Labs'],
  ['Lila James', 'Sable Fern Logistics'],
  ['Nikhil Rose', 'Opal Cedar Studio'],
  ['Ada Saxena', 'Spring Tide Supply'],
  ['Kiran Hayes', 'Amber Compass Works'],
]

export function buildSampleLeads(now) {
  const statuses = LEAD_STATUSES.flatMap((status, index) => Array(STATUS_COUNTS[index]).fill(status))
  const today = utcDay(now)

  return CONTACTS.map(([fullName, companyName], index) => {
    const _id = SEED_ID_PREFIX + (index + 1).toString(16).padStart(4, '0')
    const createdAt = addUtcDays(today, -DAYS_AGO[index])

    return {
      _id,
      fullName,
      companyName,
      email: `${fullName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: `+1 202-555-${String(100 + index).padStart(4, '0')}`,
      leadSource: LEAD_SOURCES[index % LEAD_SOURCES.length],
      leadStatus: statuses[index],
      createdAt,
      updatedAt: createdAt,
    }
  })
}
