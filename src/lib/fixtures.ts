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
    to: "Alinga Street",
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
    from: "Alinga Street",
    to: "Dickson",
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
    from: "Alinga Street",
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
    to: "Mitchell",
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
    from: "Manning Clark",
    to: "Alinga Street",
    fare: 3.41,
    fareType: "peak",
  },
];
