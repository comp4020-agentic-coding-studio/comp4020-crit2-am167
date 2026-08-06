// Tiny typed localStorage wrapper for the prototype's fake account state.
// Only ever imported from client <script> blocks — never from Astro
// frontmatter — since there's no localStorage during static build.
const PREFIX = "myway-demo:";

export interface AutoTopUpState {
  enabled: boolean;
  thresholdCents: number;
  targetCents: number;
  method: "visa" | "mastercard";
}

export interface ConcessionState {
  typeId: string;
  expiry: string;
}

const DEFAULT_BALANCE_CENTS = 4230;
const DEFAULT_AUTO_TOP_UP: AutoTopUpState = {
  enabled: false,
  thresholdCents: 1000,
  targetCents: 2500,
  method: "visa",
};
const DEFAULT_CONCESSION: ConcessionState = {
  typeId: "student",
  expiry: "2027-02-28",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private browsing, quota) — state just
    // won't persist across page loads this session.
  }
}

export const demoState = {
  isLoggedIn(): boolean {
    return read<boolean>("loggedIn", false);
  },

  login(): void {
    write("loggedIn", true);
    if (localStorage.getItem(PREFIX + "balanceCents") === null) {
      write("balanceCents", DEFAULT_BALANCE_CENTS);
      write("autoTopUp", DEFAULT_AUTO_TOP_UP);
      write("concession", DEFAULT_CONCESSION);
    }
  },

  getBalanceCents(): number {
    return read<number>("balanceCents", DEFAULT_BALANCE_CENTS);
  },

  addBalanceCents(delta: number): number {
    const next = demoState.getBalanceCents() + delta;
    write("balanceCents", next);
    return next;
  },

  getAutoTopUp(): AutoTopUpState {
    return read<AutoTopUpState>("autoTopUp", DEFAULT_AUTO_TOP_UP);
  },

  setAutoTopUp(state: AutoTopUpState): void {
    write("autoTopUp", state);
  },

  getConcession(): ConcessionState {
    return read<ConcessionState>("concession", DEFAULT_CONCESSION);
  },

  setConcession(state: ConcessionState): void {
    write("concession", state);
  },
};
