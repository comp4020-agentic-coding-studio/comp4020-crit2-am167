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

// Demo fixture — the logged-in nav chip's account name. Kept generic since
// this repo is public.
export const ACCOUNT_NAME = "User";

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

export interface NetworkNode {
  id: string;
  name: string;
  /** Compact label used on the diagram — full `name` stays in the side panel. */
  shortName: string;
  kind: "interchange" | "stop";
  /** Schematic diagram coordinates in a 0–1000 × 0–700 viewBox — loosely
   * follow real compass relationships (Gungahlin north, Belconnen
   * north-west, Woden/Tuggeranong south) but aren't real GPS coordinates.
   * Same "abstract diagram, not literal geography" approach as
   * `LIGHT_RAIL_LINE`'s stop list. */
  x: number;
  y: number;
  /** SVG text-anchor for the stop label. */
  labelAnchor?: "start" | "middle" | "end";
  labelDx?: number;
  labelDy?: number;
}

// Interchange / stop names are real Transport Canberra places; coordinates
// and intermediate spacing are invented for a readable schematic, not a
// real map.
export const NETWORK_NODES: NetworkNode[] = [
  {
    id: "gungahlin",
    name: "Gungahlin Place",
    shortName: "Gungahlin",
    kind: "interchange",
    x: 520,
    y: 72,
    labelDy: -18,
  },
  {
    id: "well-station",
    name: "Well Station Drive",
    shortName: "Well Station",
    kind: "stop",
    x: 520,
    y: 155,
    labelAnchor: "start",
    labelDx: 14,
    labelDy: 4,
  },
  {
    id: "dickson",
    name: "Dickson Interchange",
    shortName: "Dickson",
    kind: "interchange",
    x: 520,
    y: 230,
    labelAnchor: "start",
    labelDx: 16,
    labelDy: 4,
  },
  {
    id: "macarthur",
    name: "Macarthur Avenue",
    shortName: "Macarthur",
    kind: "stop",
    x: 520,
    y: 300,
    labelAnchor: "start",
    labelDx: 14,
    labelDy: 4,
  },
  {
    id: "city",
    name: "City Interchange",
    shortName: "City",
    kind: "interchange",
    x: 500,
    y: 390,
    labelAnchor: "start",
    labelDx: 22,
    labelDy: 5,
  },
  {
    id: "bruce",
    name: "Bruce",
    shortName: "Bruce",
    kind: "stop",
    x: 328,
    y: 290,
    labelAnchor: "end",
    labelDx: -12,
    labelDy: -8,
  },
  {
    id: "belconnen",
    name: "Belconnen Interchange",
    shortName: "Belconnen",
    kind: "interchange",
    x: 170,
    y: 175,
    labelAnchor: "middle",
    labelDy: -18,
  },
  {
    id: "phillip",
    name: "Phillip",
    shortName: "Phillip",
    kind: "stop",
    x: 455,
    y: 500,
    labelAnchor: "end",
    labelDx: -14,
    labelDy: 4,
  },
  {
    id: "woden",
    name: "Woden Interchange",
    shortName: "Woden",
    kind: "interchange",
    x: 420,
    y: 575,
    labelAnchor: "end",
    labelDx: -16,
    labelDy: 4,
  },
  {
    id: "mawson",
    name: "Mawson",
    shortName: "Mawson",
    kind: "stop",
    x: 365,
    y: 630,
    labelAnchor: "end",
    labelDx: -14,
    labelDy: 4,
  },
  {
    id: "tuggeranong",
    name: "Tuggeranong Interchange",
    shortName: "Tuggeranong",
    kind: "interchange",
    x: 330,
    y: 680,
    labelAnchor: "end",
    labelDx: -16,
    labelDy: 6,
  },
  {
    // On the City→Erindale corridor (south then east into the valley) —
    // not via Fyshwick, which sits east of the city toward the airport.
    id: "wanniassa",
    name: "Wanniassa",
    shortName: "Wanniassa",
    kind: "stop",
    x: 520,
    y: 620,
    labelAnchor: "start",
    labelDx: 14,
    labelDy: 4,
  },
  {
    // Northeast of Tuggeranong Interchange in the southern valley.
    id: "erindale",
    name: "Erindale Centre",
    shortName: "Erindale",
    kind: "interchange",
    x: 580,
    y: 655,
    labelAnchor: "start",
    labelDx: 14,
    labelDy: 6,
  },
];

export interface NetworkLine {
  id: string;
  mode: "bus" | "light-rail";
  route: string;
  /** Compact route badge drawn on the diagram (e.g. R3, LR). */
  shortLabel: string;
  /** Ordered `NetworkNode` ids this line's path passes through. */
  nodeIds: string[];
  /** Hand-tuned SVG path — curved spokes, not straight hub lines. */
  pathD: string;
  /** Placement for the on-diagram route chip. */
  labelAt: { x: number; y: number };
}

// Same routes as `DEPARTURES` above, laid out as a hub-and-spoke schematic
// centred on City Interchange — not the real route geometry.
export const NETWORK_LINES: NetworkLine[] = [
  {
    id: "line-light-rail",
    mode: "light-rail",
    route: "Light Rail",
    shortLabel: "LR",
    nodeIds: ["gungahlin", "well-station", "dickson", "macarthur", "city"],
    pathD: "M 520,72 L 520,155 L 520,230 L 520,300 L 500,390",
    labelAt: { x: 455, y: 145 },
  },
  {
    id: "line-rapid-3",
    mode: "bus",
    route: "Rapid 3",
    shortLabel: "R3",
    nodeIds: ["city", "phillip", "woden"],
    pathD: "M 500,390 Q 470,480 420,575",
    labelAt: { x: 515, y: 505 },
  },
  {
    id: "line-rapid-4",
    mode: "bus",
    route: "Rapid 4",
    shortLabel: "R4",
    nodeIds: ["city", "bruce", "belconnen"],
    pathD: "M 500,390 Q 340,310 170,175",
    labelAt: { x: 270, y: 230 },
  },
  {
    id: "line-rapid-7",
    mode: "bus",
    route: "Rapid 7",
    shortLabel: "R7",
    // Drawn west of Rapid 3 so the shared southern corridor still reads as
    // two services, then continues past Woden to Tuggeranong.
    nodeIds: ["city", "woden", "mawson", "tuggeranong"],
    pathD: "M 500,390 Q 420,495 400,575 L 365,630 L 330,680",
    labelAt: { x: 300, y: 555 },
  },
  {
    id: "line-rapid-2",
    mode: "bus",
    route: "Rapid 2",
    shortLabel: "R2",
    // South from City toward the Woden corridor, then east to Erindale —
    // matching the real southern-valley approach rather than an eastern
    // hop through Fyshwick.
    nodeIds: ["city", "wanniassa", "erindale"],
    pathD: "M 500,390 Q 490,520 520,620 L 580,655",
    labelAt: { x: 565, y: 545 },
  },
];

/** Cosmetic animation pacing — roughly proportional to schematic length.
 * Kept deliberately slow so the diagram reads as a live board, not a race. */
export const NETWORK_LINE_DURATIONS_SECONDS: Record<string, number> = {
  "line-light-rail": 48,
  "line-rapid-3": 28,
  "line-rapid-4": 32,
  "line-rapid-7": 40,
  "line-rapid-2": 34,
};

export interface NetworkVehicleMeta {
  departureId: string;
  lineId: string;
  /** 0–1 offset along the path so vehicles don't all start together. */
  progress: number;
  nextStop: string;
  /** When true, animate toward the first node instead of the last. */
  reverse?: boolean;
}

// Presentation extras for the live map, keyed to the shared DEPARTURES
// fixture so the map and departures board stay in sync.
export const NETWORK_VEHICLE_META: NetworkVehicleMeta[] = [
  {
    departureId: "d1",
    lineId: "line-light-rail",
    progress: 0.72,
    nextStop: "Macarthur Avenue",
  },
  {
    departureId: "d2",
    lineId: "line-rapid-3",
    progress: 0.35,
    nextStop: "Phillip",
  },
  {
    departureId: "d3",
    lineId: "line-rapid-7",
    progress: 0.55,
    nextStop: "Woden Interchange",
  },
  {
    departureId: "d4",
    lineId: "line-light-rail",
    progress: 0.28,
    nextStop: "Dickson Interchange",
    reverse: true,
  },
  {
    departureId: "d5",
    lineId: "line-rapid-4",
    progress: 0.48,
    nextStop: "Bruce",
  },
  {
    departureId: "d6",
    lineId: "line-rapid-2",
    progress: 0.22,
    nextStop: "Wanniassa",
  },
];

// Simulated feed chrome for the live-map page — invented, not a real API.
export const LIVE_FEED = {
  updatedLabel: "Demo feed · updated just now",
  statusLabel: "All routes reporting",
} as const;
