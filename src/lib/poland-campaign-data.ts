import { useState, useEffect } from "react";

export type EnvelopeKey =
  | "flight_visa"
  | "living_deposit"
  | "tech_mobile_core"
  | "poznan_studio_hardware"
  | "emergency_buffer";

export interface CapitalEnvelope {
  key: EnvelopeKey;
  label: string;
  targetUSD: number;
  description: string;
  category: "logistics" | "living" | "tech" | "studio" | "buffer";
  iconName: string;
}

export const CAMPAIGN_ENVELOPES: CapitalEnvelope[] = [
  {
    key: "flight_visa",
    label: "Flight, Visa & Sworn Translations",
    targetUSD: 1500,
    description: "Flights (ADD → WAW/POZ), D-Type National Visa fees, sworn translations (tłumacz przysięgły), apostilles.",
    category: "logistics",
    iconName: "Plane",
  },
  {
    key: "living_deposit",
    label: "Apartment Deposit & 6-Mo Living Runway",
    targetUSD: 7500,
    description: "Poznań rental contract deposit (2-month kaucja) + 6-month buffer @ $1,200/mo.",
    category: "living",
    iconName: "Home",
  },
  {
    key: "tech_mobile_core",
    label: "Tech & Mobile Core (Addis Carry-On)",
    targetUSD: 3000,
    description: "M-Series Workstation Laptop, iPad Pro/Air (Scripts/Prompter), Shure/Rode Mic & Audio Interface, 4K Camera body.",
    category: "tech",
    iconName: "Laptop",
  },
  {
    key: "poznan_studio_hardware",
    label: "Poznań Studio Hardware (Allegro / Amazon.pl)",
    targetUSD: 2500,
    description: "32\" 4K Monitor, Motorized Standing Desk, Godox Key Light & C-Stands, Acoustic Foam Panels, EU Power Strips.",
    category: "studio",
    iconName: "Tv",
  },
  {
    key: "emergency_buffer",
    label: "Contingency & Medical Buffer",
    targetUSD: 1000,
    description: "International health insurance deductible, unforeseen transit costs, currency fluctuation buffer.",
    category: "buffer",
    iconName: "ShieldAlert",
  },
];

export interface StudioGearItem {
  id: string;
  name: string;
  category: "computing" | "audio_visual" | "lighting" | "furniture" | "acoustics" | "power";
  procurementLocation: "addis_carry_on" | "poznan_allegro";
  targetUSD: number;
  targetPLN: number;
  priority: "essential_alpha" | "studio_core" | "expansion";
  notes: string;
}

export const DEFAULT_STUDIO_GEAR: StudioGearItem[] = [
  {
    id: "gear-laptop",
    name: "M-Series Workstation Laptop",
    category: "computing",
    procurementLocation: "addis_carry_on",
    targetUSD: 2000,
    targetPLN: 7900,
    priority: "essential_alpha",
    notes: "Primary engineering & 4K video editing powerhouse. Carried in hand luggage.",
  },
  {
    id: "gear-ipad",
    name: "iPad Pro / Air + Pencil",
    category: "computing",
    procurementLocation: "addis_carry_on",
    targetUSD: 800,
    targetPLN: 3160,
    priority: "essential_alpha",
    notes: "Mounted on teleprompter, script markups, second portable display.",
  },
  {
    id: "gear-mic-audio",
    name: "Dynamic Broadcast Mic & Interface",
    category: "audio_visual",
    procurementLocation: "addis_carry_on",
    targetUSD: 400,
    targetPLN: 1580,
    priority: "essential_alpha",
    notes: "Shure SM7B / Rode PodMic + Focusrite/Elgato Wave XLR interface.",
  },
  {
    id: "gear-cam-lens",
    name: "Mirrorless 4K Camera + Prime Lens",
    category: "audio_visual",
    procurementLocation: "addis_carry_on",
    targetUSD: 1000,
    targetPLN: 3950,
    priority: "essential_alpha",
    notes: "Sony/Panasonic 4K body with low-light f/1.4 lens. Clean HDMI out.",
  },
  {
    id: "gear-monitor",
    name: "32\" 4K Color-Accurate Production Display",
    category: "audio_visual",
    procurementLocation: "poznan_allegro",
    targetUSD: 500,
    targetPLN: 1975,
    priority: "studio_core",
    notes: "Dell UltraSharp / LG 4K IPS with heavy-duty gas spring desk arm.",
  },
  {
    id: "gear-standing-desk",
    name: "Dual-Motor Motorized Standing Desk (140×80cm)",
    category: "furniture",
    procurementLocation: "poznan_allegro",
    targetUSD: 450,
    targetPLN: 1775,
    priority: "studio_core",
    notes: "Heavy steel frame, solid tabletop, anti-collision, cable tray.",
  },
  {
    id: "gear-chair",
    name: "High-Back Ergonomic Lumbar Chair",
    category: "furniture",
    procurementLocation: "poznan_allegro",
    targetUSD: 300,
    targetPLN: 1185,
    priority: "studio_core",
    notes: "Breathable mesh, 3D armrests for 16-hour focus ergonomics.",
  },
  {
    id: "gear-lighting",
    name: "Godox/Aputure Key Light + Dome Softbox + C-Stand",
    category: "lighting",
    procurementLocation: "poznan_allegro",
    targetUSD: 400,
    targetPLN: 1580,
    priority: "studio_core",
    notes: "100W daylight-balanced COB video light with 90cm parabolic softbox.",
  },
  {
    id: "gear-acoustics",
    name: "High-Density Acoustic Panels & Bass Traps (24pk)",
    category: "acoustics",
    procurementLocation: "poznan_allegro",
    targetUSD: 350,
    targetPLN: 1380,
    priority: "studio_core",
    notes: "Kills room reverberation for pristine voiceover recording.",
  },
  {
    id: "gear-power-dock",
    name: "100W USB-C Dock + EU 230V Surge Strips & Cables",
    category: "power",
    procurementLocation: "poznan_allegro",
    targetUSD: 250,
    targetPLN: 985,
    priority: "studio_core",
    notes: "Single-cable workstation dock, Type E/F European grounded surge protectors.",
  },
];

const STORAGE_KEY = "mission_poland_campaign_allocations";

export interface PolandCampaignData {
  envelopes: Record<EnvelopeKey, number>;
  checklist: Record<string, boolean>;
  gearAllocations: Record<string, number>;
}

const DEFAULT_CAMPAIGN_DATA: PolandCampaignData = {
  envelopes: {
    flight_visa: 500,
    living_deposit: 2500,
    tech_mobile_core: 1200,
    poznan_studio_hardware: 800,
    emergency_buffer: 500,
  },
  checklist: {
    passport_valid: true,
    sworn_translations: false,
    visa_d_type: false,
    flight_ticket: false,
    carry_on_packed: false,
    airbnb_booked: false,
    // Post-arrival
    apartment_lease_signed: false,
    meldunek_pesel_issued: false,
    polish_bank_active: false,
    fiber_internet_installed: false,
    allegro_gear_ordered: false,
    studio_assembled: false,
    first_video_published: false,
    trc_karta_pobytu_filed: false,
    eu_b2b_entity_active: false,
  },
  gearAllocations: {},
};

export function getPolandCampaignData(): PolandCampaignData {
  if (typeof window === "undefined") return DEFAULT_CAMPAIGN_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CAMPAIGN_DATA;
    const parsed = JSON.parse(raw);
    return {
      envelopes: { ...DEFAULT_CAMPAIGN_DATA.envelopes, ...(parsed.envelopes || {}) },
      checklist: { ...DEFAULT_CAMPAIGN_DATA.checklist, ...(parsed.checklist || {}) },
      gearAllocations: { ...(parsed.gearAllocations || {}) },
    };
  } catch {
    return DEFAULT_CAMPAIGN_DATA;
  }
}

export function savePolandCampaignData(data: PolandCampaignData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("mission_campaign_updated"));
  } catch (err) {
    console.warn("Failed to persist Poland Campaign data", err);
  }
}

export function usePolandCampaign() {
  const [data, setData] = useState<PolandCampaignData>(getPolandCampaignData);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPolandCampaignData());
    };
    window.addEventListener("mission_campaign_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("mission_campaign_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setEnvelopeAmount = (key: EnvelopeKey, amountUSD: number) => {
    const next: PolandCampaignData = {
      ...data,
      envelopes: {
        ...data.envelopes,
        [key]: Math.max(0, amountUSD),
      },
    };
    savePolandCampaignData(next);
  };

  const toggleChecklist = (id: string) => {
    const next: PolandCampaignData = {
      ...data,
      checklist: {
        ...data.checklist,
        [id]: !data.checklist[id],
      },
    };
    savePolandCampaignData(next);
  };

  const totalAllocatedUSD = Object.values(data.envelopes).reduce((sum, v) => sum + (v || 0), 0);
  const totalTargetUSD = CAMPAIGN_ENVELOPES.reduce((sum, env) => sum + env.targetUSD, 0);
  const totalProgressPct = Math.min(100, Math.round((totalAllocatedUSD / totalTargetUSD) * 100));

  return {
    data,
    envelopes: CAMPAIGN_ENVELOPES,
    gearList: DEFAULT_STUDIO_GEAR,
    totalAllocatedUSD,
    totalTargetUSD,
    totalProgressPct,
    setEnvelopeAmount,
    toggleChecklist,
  };
}
