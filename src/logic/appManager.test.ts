import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSystemPackage,
  filterUserFacingApps,
  simulateKillApp,
  simulateKillAll,
  calculateMemoryUsage,
  formatRamDisplay,
  INITIAL_WATCH_APPS,
  AppInfo,
} from './appManager';

test('isSystemPackage correctly identifies Android and Xiaomi OS core services', () => {
  assert.equal(isSystemPackage('com.android.systemui'), true);
  assert.equal(isSystemPackage('com.google.android.wearable.sysui'), true);
  assert.equal(isSystemPackage('com.xiaomi.wearos.launcher'), true);
  assert.equal(isSystemPackage('com.spotify.music'), false);
  assert.equal(isSystemPackage('com.strava'), false);
  assert.equal(isSystemPackage('custom.app', true), true); // forced flag
});

test('filterUserFacingApps removes system apps by default', () => {
  const filtered = filterUserFacingApps(INITIAL_WATCH_APPS, false);
  assert.ok(filtered.every(app => !app.isSystem));
  assert.ok(filtered.some(app => app.packageName === 'com.spotify.music'));
  assert.ok(!filtered.some(app => app.packageName === 'com.android.systemui'));

  const allWithSystem = filterUserFacingApps(INITIAL_WATCH_APPS, true);
  assert.ok(allWithSystem.some(app => app.packageName === 'com.android.systemui'));
});

test('simulateKillApp removes the target app and calculates freed memory', () => {
  const userApps = filterUserFacingApps(INITIAL_WATCH_APPS, false);
  const initialLength = userApps.length;
  const target = 'com.spotify.music';
  const targetApp = userApps.find(a => a.packageName === target);
  assert.ok(targetApp);

  const result = simulateKillApp(userApps, target);
  assert.equal(result.updatedApps.length, initialLength - 1);
  assert.equal(result.freedRamMb, targetApp.ramMb);
  assert.ok(!result.updatedApps.some(a => a.packageName === target));
});

test('simulateKillAll terminates only user apps when includeSystem is false', () => {
  const mixedApps: AppInfo[] = [
    {
      id: 'app1',
      packageName: 'com.test.userapp1',
      appName: 'Test 1',
      iconName: 'music',
      category: 'music',
      ramMb: 100,
      lastActiveMinutesAgo: 1,
      isSystem: false,
      isRunning: true,
      versionName: '1.0',
    },
    {
      id: 'sys1',
      packageName: 'com.android.systemui',
      appName: 'System UI',
      iconName: 'cpu',
      category: 'system',
      ramMb: 250,
      lastActiveMinutesAgo: 0,
      isSystem: true,
      isRunning: true,
      versionName: '1.0',
    },
  ];

  const result = simulateKillAll(mixedApps, false);
  assert.equal(result.countKilled, 1);
  assert.equal(result.freedRamMb, 100);
  assert.equal(result.updatedApps.length, 1);
  assert.equal(result.updatedApps[0].packageName, 'com.android.systemui');
});

test('calculateMemoryUsage and formatRamDisplay output correctly', () => {
  const userApps = filterUserFacingApps(INITIAL_WATCH_APPS, false);
  const stats = calculateMemoryUsage(userApps, 2048);
  assert.ok(stats.usedMb > 820);
  assert.ok(stats.percentage > 0 && stats.percentage <= 100);
  assert.equal(stats.usedMb + stats.freeMb, 2048);

  assert.equal(formatRamDisplay(512), '512 MB');
  assert.equal(formatRamDisplay(2048), '2.0 GB');
  assert.equal(formatRamDisplay(1536), '1.5 GB');
});
