/**
 * Wear OS App Manager Logic
 * Replicates the Android PackageManager & ActivityManager logic for Wear OS
 */

export interface AppInfo {
  id: string;
  packageName: string;
  appName: string;
  iconName: string;
  category: 'fitness' | 'music' | 'navigation' | 'communication' | 'utility' | 'system';
  ramMb: number;
  lastActiveMinutesAgo: number;
  isSystem: boolean;
  isRunning: boolean;
  versionName: string;
}

export const SYSTEM_PACKAGE_PREFIXES = [
  'com.android.',
  'com.google.android.wearable',
  'com.google.android.gms',
  'com.google.android.inputmethod',
  'com.xiaomi.wearos.launcher',
  'com.xiaomi.wearos.settings',
  'android',
  'com.qualcomm.',
];

/**
 * Checks if a package is a core OS or vendor system service
 */
export function isSystemPackage(packageName: string, isFlaggedSystem: boolean = false): boolean {
  if (isFlaggedSystem) return true;
  return SYSTEM_PACKAGE_PREFIXES.some(prefix => packageName.startsWith(prefix));
}

/**
 * Filters out system packages to only show user-installed or user-facing apps
 */
export function filterUserFacingApps(apps: AppInfo[], includeSystem: boolean = false): AppInfo[] {
  if (includeSystem) return apps;
  return apps.filter(app => !app.isSystem);
}

/**
 * Simulates closing an app and calculating recovered RAM
 */
export function simulateKillApp(
  currentApps: AppInfo[],
  targetPackage: string
): { updatedApps: AppInfo[]; freedRamMb: number; killedApp?: AppInfo } {
  const target = currentApps.find(a => a.packageName === targetPackage);
  if (!target) {
    return { updatedApps: currentApps, freedRamMb: 0 };
  }

  const updatedApps = currentApps.filter(a => a.packageName !== targetPackage);
  const freedRamMb = target.ramMb;

  return {
    updatedApps,
    freedRamMb,
    killedApp: target,
  };
}

/**
 * Simulates closing all user-running apps
 */
export function simulateKillAll(
  currentApps: AppInfo[],
  includeSystem: boolean = false
): { updatedApps: AppInfo[]; freedRamMb: number; countKilled: number } {
  const toKill = includeSystem ? currentApps : currentApps.filter(a => !a.isSystem);
  const freedRamMb = toKill.reduce((sum, app) => sum + app.ramMb, 0);
  const updatedApps = includeSystem ? [] : currentApps.filter(a => a.isSystem);

  return {
    updatedApps,
    freedRamMb,
    countKilled: toKill.length,
  };
}

/**
 * Total RAM calculator
 */
export function calculateMemoryUsage(apps: AppInfo[], totalDeviceRamMb: number = 2048): {
  usedMb: number;
  freeMb: number;
  percentage: number;
} {
  const baseSystemRam = 820; // Wear OS kernel + Xiaomi Launcher footprint
  const appsRam = apps.reduce((sum, a) => sum + (a.isRunning ? a.ramMb : 0), 0);
  const usedMb = Math.min(totalDeviceRamMb, baseSystemRam + appsRam);
  const freeMb = Math.max(0, totalDeviceRamMb - usedMb);
  const percentage = Math.round((usedMb / totalDeviceRamMb) * 100);

  return {
    usedMb,
    freeMb,
    percentage,
  };
}

/**
 * Formats RAM in MB or GB
 */
export function formatRamDisplay(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
}

/**
 * Default sample apps active on a Xiaomi Watch 2 (Wear OS 3.5 / 4)
 */
export const INITIAL_WATCH_APPS: AppInfo[] = [
  {
    id: 'spotify',
    packageName: 'com.spotify.music',
    appName: 'Spotify',
    iconName: 'music',
    category: 'music',
    ramMb: 112,
    lastActiveMinutesAgo: 2,
    isSystem: false,
    isRunning: true,
    versionName: '8.9.12',
  },
  {
    id: 'strava',
    packageName: 'com.strava',
    appName: 'Strava GPS',
    iconName: 'activity',
    category: 'fitness',
    ramMb: 145,
    lastActiveMinutesAgo: 5,
    isSystem: false,
    isRunning: true,
    versionName: '342.10',
  },
  {
    id: 'whatsapp',
    packageName: 'com.whatsapp.wear',
    appName: 'WhatsApp',
    iconName: 'message-circle',
    category: 'communication',
    ramMb: 88,
    lastActiveMinutesAgo: 12,
    isSystem: false,
    isRunning: true,
    versionName: '2.24.18',
  },
  {
    id: 'google_maps',
    packageName: 'com.google.android.apps.maps',
    appName: 'Google Maps',
    iconName: 'map-pin',
    category: 'navigation',
    ramMb: 168,
    lastActiveMinutesAgo: 18,
    isSystem: false,
    isRunning: true,
    versionName: '11.130',
  },
  {
    id: 'shazam',
    packageName: 'com.shazam.android',
    appName: 'Shazam',
    iconName: 'radio',
    category: 'music',
    ramMb: 64,
    lastActiveMinutesAgo: 35,
    isSystem: false,
    isRunning: true,
    versionName: '14.22',
  },
  {
    id: 'telegram',
    packageName: 'org.telegram.messenger.wear',
    appName: 'Telegram',
    iconName: 'send',
    category: 'communication',
    ramMb: 95,
    lastActiveMinutesAgo: 48,
    isSystem: false,
    isRunning: true,
    versionName: '10.9.1',
  },
  {
    id: 'xiaomi_fit',
    packageName: 'com.xiaomi.wearable.fitness',
    appName: 'Mi Fitness',
    iconName: 'heart',
    category: 'fitness',
    ramMb: 130,
    lastActiveMinutesAgo: 1,
    isSystem: false,
    isRunning: true,
    versionName: '3.25.0',
  },
  // System processes for filtering test
  {
    id: 'systemui',
    packageName: 'com.android.systemui',
    appName: 'System UI',
    iconName: 'cpu',
    category: 'system',
    ramMb: 240,
    lastActiveMinutesAgo: 0,
    isSystem: true,
    isRunning: true,
    versionName: '13.0',
  },
  {
    id: 'launcher',
    packageName: 'com.xiaomi.wearos.launcher',
    appName: 'Xiaomi Watch Launcher',
    iconName: 'layers',
    category: 'system',
    ramMb: 190,
    lastActiveMinutesAgo: 0,
    isSystem: true,
    isRunning: true,
    versionName: '2.1.4',
  },
];
