import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "sw" | "en";

type Dict = Record<string, { sw: string; en: string }>;

export const dict: Dict = {
  appName: { sw: "SDLT", en: "SDLT" },
  appTagline: {
    sw: "Fuatilia vifaa vyako kwa muda halisi",
    en: "Track your devices in real time",
  },
  heroTitle: {
    sw: "Smart Device Location Tracker",
    en: "Smart Device Location Tracker",
  },
  heroBody: {
    sw: "Fuatilia location ya simu kwa muda halisi, hifadhi historia ya safari, angalia betri na kasi, na pata tahadhari za geofence.",
    en: "Track phone location in real time, keep trip history, watch battery and speed, and get geofence alerts.",
  },
  getStarted: { sw: "Anza sasa", en: "Get started" },
  openTracker: { sw: "Fungua tracker ya simu", en: "Open phone tracker" },
  signIn: { sw: "Ingia", en: "Sign in" },
  signUp: { sw: "Jisajili", en: "Register" },
  signOut: { sw: "Toka", en: "Sign out" },
  email: { sw: "Barua pepe", en: "Email" },
  password: { sw: "Nenosiri", en: "Password" },
  confirmPassword: { sw: "Thibitisha nenosiri", en: "Confirm password" },
  fullName: { sw: "Jina kamili", en: "Full name" },
  showPassword: { sw: "Onyesha nenosiri", en: "Show password" },
  forgotPassword: { sw: "Umesahau nenosiri?", en: "Forgot password?" },
  resetPassword: { sw: "Weka nenosiri jipya", en: "Set new password" },
  sendResetLink: { sw: "Tuma link ya kubadili", en: "Send reset link" },
  continueGoogle: { sw: "Endelea na Google", en: "Continue with Google" },
  passwordsMismatch: { sw: "Manenosiri hayafanani", en: "Passwords do not match" },
  checkEmail: {
    sw: "Angalia barua pepe yako ili kuthibitisha akaunti.",
    en: "Check your email to confirm your account.",
  },
  resetSent: { sw: "Link imetumwa kwenye barua pepe yako.", en: "Reset link sent to your email." },
  passwordUpdated: { sw: "Nenosiri limebadilishwa.", en: "Password updated." },
  dashboard: { sw: "Dashibodi", en: "Dashboard" },
  liveMap: { sw: "Ramani ya moja kwa moja", en: "Live map" },
  devices: { sw: "Vifaa", en: "Devices" },
  history: { sw: "Historia", en: "History" },
  geofence: { sw: "Geofence", en: "Geofence" },
  notifications: { sw: "Arifa", en: "Notifications" },
  settings: { sw: "Mipangilio", en: "Settings" },
  profile: { sw: "Wasifu", en: "Profile" },
  totalDevices: { sw: "Jumla ya vifaa", en: "Total devices" },
  online: { sw: "Mtandaoni", en: "Online" },
  offline: { sw: "Nje ya mtandao", en: "Offline" },
  avgBattery: { sw: "Wastani wa betri", en: "Average battery" },
  activeAlerts: { sw: "Tahadhari hai", en: "Active alerts" },
  recentActivity: { sw: "Matukio ya karibuni", en: "Recent activity" },
  deviceList: { sw: "Orodha ya vifaa", en: "Device list" },
  lastSeen: { sw: "Mara ya mwisho", en: "Last seen" },
  battery: { sw: "Betri", en: "Battery" },
  charging: { sw: "Inachaji", en: "Charging" },
  speed: { sw: "Kasi", en: "Speed" },
  altitude: { sw: "Kimo", en: "Altitude" },
  accuracy: { sw: "Usahihi", en: "Accuracy" },
  network: { sw: "Mtandao", en: "Network" },
  lastUpdate: { sw: "Sasisho la mwisho", en: "Last update" },
  trackingStatus: { sw: "Hali ya ufuatiliaji", en: "Tracking status" },
  tracking: { sw: "Inafuatilia", en: "Tracking" },
  stopped: { sw: "Imesimama", en: "Stopped" },
  addDevice: { sw: "Ongeza kifaa", en: "Add device" },
  deviceName: { sw: "Jina la kifaa", en: "Device name" },
  pairDevice: { sw: "Unganisha kifaa", en: "Pair device" },
  pairingCode: { sw: "Msimbo wa kuunganisha", en: "Pairing code" },
  scanQr: { sw: "Skani QR kwenye simu", en: "Scan QR on the phone" },
  rename: { sw: "Badilisha jina", en: "Rename" },
  remove: { sw: "Ondoa", en: "Remove" },
  save: { sw: "Hifadhi", en: "Save" },
  cancel: { sw: "Ghairi", en: "Cancel" },
  create: { sw: "Tengeneza", en: "Create" },
  noDevices: { sw: "Hakuna kifaa bado. Ongeza kimoja.", en: "No devices yet. Add one." },
  noData: { sw: "Hakuna taarifa bado.", en: "No data yet." },
  today: { sw: "Leo", en: "Today" },
  yesterday: { sw: "Jana", en: "Yesterday" },
  last7: { sw: "Siku 7", en: "Last 7 days" },
  last30: { sw: "Siku 30", en: "Last 30 days" },
  routePlayback: { sw: "Cheza njia", en: "Route playback" },
  play: { sw: "Cheza", en: "Play" },
  pause: { sw: "Simamisha", en: "Pause" },
  exportCsv: { sw: "Pakua CSV", en: "Export CSV" },
  points: { sw: "Pointi", en: "Points" },
  distance: { sw: "Umbali", en: "Distance" },
  zoneName: { sw: "Jina la eneo", en: "Zone name" },
  radius: { sw: "Radius (m)", en: "Radius (m)" },
  alertOnEnter: { sw: "Arifa ikiingia", en: "Alert on enter" },
  alertOnExit: { sw: "Arifa ikitoka", en: "Alert on exit" },
  clickMapToPick: { sw: "Bofya ramani kuchagua kitovu", en: "Click the map to pick the centre" },
  allDevices: { sw: "Vifaa vyote", en: "All devices" },
  language: { sw: "Lugha", en: "Language" },
  swahili: { sw: "Kiswahili", en: "Swahili" },
  english: { sw: "Kiingereza", en: "English" },
  trackingInterval: { sw: "Muda wa kutuma (sekunde)", en: "Tracking interval (seconds)" },
  enableNotifications: { sw: "Washa arifa", en: "Enable notifications" },
  markAllRead: { sw: "Weka zote zimesomwa", en: "Mark all read" },
  centerMap: { sw: "Rudisha katikati", en: "Center map" },
  trackerTitle: { sw: "Tracker ya simu", en: "Phone tracker" },
  trackerBody: {
    sw: "Fungua ukurasa huu kwenye simu inayofuatiliwa, weka msimbo wa kifaa na uanze kutuma location.",
    en: "Open this page on the tracked phone, enter the device code and start sending location.",
  },
  enterCode: { sw: "Weka msimbo wa kifaa", en: "Enter device code" },
  startTracking: { sw: "Anza kufuatilia", en: "Start tracking" },
  stopTracking: { sw: "Simamisha", en: "Stop tracking" },
  permissionNeeded: {
    sw: "Ruhusa ya location inahitajika. Kubali ombi la kivinjari.",
    en: "Location permission required. Accept the browser prompt.",
  },
  sent: { sw: "Zimetumwa", en: "Sent" },
  deviceNotFound: { sw: "Msimbo si sahihi", en: "Invalid device code" },
  connected: { sw: "Imeunganishwa", en: "Connected" },
  keepTabOpen: {
    sw: "Acha ukurasa huu wazi ili kuendelea kufuatilia.",
    en: "Keep this page open to keep tracking.",
  },
  copied: { sw: "Imenakiliwa", en: "Copied" },
  deviceOnline: { sw: "Kifaa kipo mtandaoni", en: "Device online" },
  deviceOffline: { sw: "Kifaa kimetoka mtandaoni", en: "Device offline" },
  lowBattery: { sw: "Betri chini", en: "Low battery" },
  enteredZone: { sw: "Imeingia eneo", en: "Entered zone" },
  exitedZone: { sw: "Imetoka eneo", en: "Exited zone" },
  error: { sw: "Hitilafu", en: "Error" },
  loading: { sw: "Inapakia...", en: "Loading..." },
  backHome: { sw: "Rudi mwanzo", en: "Back home" },
  account: { sw: "Akaunti", en: "Account" },
};

export type TKey = keyof typeof dict;

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
}>({ lang: "sw", setLang: () => {}, t: (k) => dict[k]?.sw ?? String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sw");

  useEffect(() => {
    const stored = localStorage.getItem("sdlt-lang");
    if (stored === "en" || stored === "sw") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("sdlt-lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((k: TKey) => dict[k]?.[lang] ?? String(k), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}