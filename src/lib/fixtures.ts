// Real fares, effective 10 Jan 2026 — Transport Canberra tickets & MyWay+
// (transport.act.gov.au/tickets-and-myway). Restated here, not copied
// verbatim, for the redesign's top-up and concession pages.
export const FARE_TABLE = {
  effectiveFrom: "2026-01-10",
  adult: { peak: 3.41, offPeak: 2.7 },
  concession: { peak: 1.71, offPeak: 0.95 },
  student: { schoolDay: 1.29, nonSchoolDay: 1.71 },
  dailyCapAdultWeekday: 10.16,
  dailyCapConcessionWeekend: 2.3,
  monthlyCapTrips: 40,
  transferWindowMinutes: 90,
  autoTopUpDiscountPercent: 5,
  newCard: { adult: 5, concession: 2.5, seniorFree: true },
} as const;

// Demo fixture — the logged-in nav chip's account name.
export const ACCOUNT_NAME = "Advay";

export interface ConcessionType {
  id: string;
  name: string;
  description: string;
  /** All MyWay+ concessions expire 30 Jun 2026 except ACT Seniors. */
  expiresJune2026: boolean;
}

// Real concession categories, restated in plain language — Transport
// Canberra tickets & MyWay+ concessions page.
export const CONCESSION_TYPES: ConcessionType[] = [
  {
    id: "student",
    name: "Students",
    description: "Primary, secondary and tertiary students travelling to and from study.",
    expiresJune2026: true,
  },
  {
    id: "senior",
    name: "Seniors",
    description: "ACT Seniors Card holders. The only concession that doesn't expire each year.",
    expiresJune2026: false,
  },
  {
    id: "disability",
    name: "People with disabilities",
    description: "Holders of an eligible disability concession card.",
    expiresJune2026: true,
  },
  {
    id: "healthcare",
    name: "Health care and pension card holders",
    description: "Centrelink Health Care Card or Pensioner Concession Card holders.",
    expiresJune2026: true,
  },
  {
    id: "asylum",
    name: "Asylum seekers",
    description: "Asylum seekers holding an eligible Department of Home Affairs document.",
    expiresJune2026: true,
  },
  {
    id: "veteran",
    name: "Veterans",
    description: "Department of Veterans' Affairs card holders.",
    expiresJune2026: true,
  },
];

export interface Trip {
  id: string;
  date: string;
  time: string;
  mode: "bus" | "light-rail";
  route: string;
  from: string;
  to: string;
  fare: number;
  fareType: "peak" | "off-peak" | "transfer" | "capped";
}

// Demo fixture — invented sample journeys for this prototype, not real trip
// records. Route numbers and light rail stops are the real ones Transport
// Canberra operates; the specific trips and timestamps are fabricated to
// demonstrate the trip history page.
export const SAMPLE_TRIPS: Trip[] = [
  {
    id: "t1",
    date: "2026-08-04",
    time: "08:12",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "Gungahlin Place",
    to: "Alinga Street, City",
    fare: 3.41,
    fareType: "peak",
  },
  {
    id: "t2",
    date: "2026-08-04",
    time: "08:41",
    mode: "bus",
    route: "Rapid 3",
    from: "City Bus Station",
    to: "Woden Interchange",
    fare: 0,
    fareType: "transfer",
  },
  {
    id: "t3",
    date: "2026-08-04",
    time: "17:35",
    mode: "bus",
    route: "Rapid 3",
    from: "Woden Interchange",
    to: "City Bus Station",
    fare: 3.41,
    fareType: "peak",
  },
  {
    id: "t4",
    date: "2026-08-04",
    time: "17:58",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "Alinga Street, City",
    to: "Dickson Interchange",
    fare: 0,
    fareType: "transfer",
  },
  {
    id: "t5",
    date: "2026-08-03",
    time: "09:20",
    mode: "bus",
    route: "Rapid 4",
    from: "Belconnen Interchange",
    to: "City Bus Station",
    fare: 3.41,
    fareType: "peak",
  },
  {
    id: "t6",
    date: "2026-08-03",
    time: "14:05",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "Alinga Street, City",
    to: "EPIC and Racecourse",
    fare: 2.7,
    fareType: "off-peak",
  },
  {
    id: "t7",
    date: "2026-08-03",
    time: "16:50",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "EPIC and Racecourse",
    to: "Phillip Avenue",
    fare: 0,
    fareType: "capped",
  },
  {
    id: "t8",
    date: "2026-08-01",
    time: "10:15",
    mode: "bus",
    route: "Rapid 7",
    from: "Tuggeranong Interchange",
    to: "City Bus Station",
    fare: 2.7,
    fareType: "off-peak",
  },
  {
    id: "t9",
    date: "2026-07-30",
    time: "07:55",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "Gungahlin Place",
    to: "Well Station Drive",
    fare: 3.41,
    fareType: "peak",
  },
  {
    id: "t10",
    date: "2026-07-30",
    time: "18:22",
    mode: "bus",
    route: "Rapid 2",
    from: "City Bus Station",
    to: "Erindale Centre",
    fare: 3.41,
    fareType: "peak",
  },
  {
    id: "t11",
    date: "2026-07-29",
    time: "12:40",
    mode: "bus",
    route: "Rapid 6",
    from: "Belconnen Interchange",
    to: "City Bus Station",
    fare: 2.7,
    fareType: "off-peak",
  },
  {
    id: "t12",
    date: "2026-07-28",
    time: "08:05",
    mode: "light-rail",
    route: "Light Rail Stage 1",
    from: "Manning Clark North",
    to: "Alinga Street, City",
    fare: 3.41,
    fareType: "peak",
  },
];

// Real Light Rail Stage 1 alignment, Gungahlin to the city — Transport
// Canberra / CMET's own stop list. `nextStopIndex` is a fixed demo position
// (a real build would read this from CMET's live vehicle feed).
export const LIGHT_RAIL_LINE = {
  name: "Light Rail Stage 1",
  stops: [
    "Gungahlin Place",
    "Manning Clark North",
    "Mapleton Avenue",
    "Nullarbor Avenue",
    "Well Station Drive",
    "Sandford Street",
    "EPIC and Racecourse",
    "Phillip Avenue",
    "Swinden Street",
    "Dickson Interchange",
    "Macarthur Avenue",
    "Ipima Street",
    "Elouera Street",
    "Alinga Street, City",
  ],
  nextStopIndex: 9,
} as const;

export interface Departure {
  id: string;
  mode: "bus" | "light-rail";
  route: string;
  headsign: string;
  etaMinutes: number;
  status: "on-time" | "delayed";
  delayMinutes?: number;
}

// Demo fixture — invented live departures, not a real feed. Route numbers
// are the real ones Transport Canberra operates (see SAMPLE_TRIPS above);
// the ETAs and delay statuses are fabricated to demonstrate the departures
// board.
export const DEPARTURES: Departure[] = [
  {
    id: "d1",
    mode: "light-rail",
    route: "Light Rail",
    headsign: "Alinga Street, City",
    etaMinutes: 0,
    status: "on-time",
  },
  {
    id: "d2",
    mode: "bus",
    route: "Rapid 3",
    headsign: "Woden Interchange",
    etaMinutes: 3,
    status: "on-time",
  },
  {
    id: "d3",
    mode: "bus",
    route: "Rapid 7",
    headsign: "Tuggeranong Interchange",
    etaMinutes: 6,
    status: "delayed",
    delayMinutes: 4,
  },
  {
    id: "d4",
    mode: "light-rail",
    route: "Light Rail",
    headsign: "Gungahlin Place",
    etaMinutes: 9,
    status: "on-time",
  },
  {
    id: "d5",
    mode: "bus",
    route: "Rapid 4",
    headsign: "Belconnen Interchange",
    etaMinutes: 12,
    status: "on-time",
  },
  {
    id: "d6",
    mode: "bus",
    route: "Rapid 2",
    headsign: "Erindale Centre",
    etaMinutes: 18,
    status: "delayed",
    delayMinutes: 2,
  },
];
