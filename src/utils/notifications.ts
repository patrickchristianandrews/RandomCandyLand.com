/**
 * Trumpagotchi Emergency Phone Notifications Engine
 * Sends push notifications to mobile and desktop lock screens when Donald's vitals drop into the danger zone.
 */

import { PetStats } from '../types/game';
import { sound } from './audio';

const LAST_NOTIF_KEY = 'trumpagotchi_last_notifs';
const NOTIF_ENABLED_KEY = 'trumpagotchi_notifs_enabled';

interface LastNotifMap {
  [key: string]: number; // timestamp
}

class NotificationEngine {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;
  private lastNotifs: LastNotifMap = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window;
      const savedEnabled = localStorage.getItem(NOTIF_ENABLED_KEY);
      this.isEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;

      try {
        const saved = localStorage.getItem(LAST_NOTIF_KEY);
        if (saved) this.lastNotifs = JSON.parse(saved);
      } catch (e) {
        this.lastNotifs = {};
      }
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem(NOTIF_ENABLED_KEY, String(enabled));
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        this.setEnabled(true);
        this.sendNotification(
          "🦅 PRESIDENTIAL NOTIFICATIONS ACTIVE!",
          "Trumpagotchi will now alert your phone lock screen if things start going bad for Donald!",
          'trump_welcome'
        );
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Notification permission request failed", e);
      return false;
    }
  }

  public sendNotification(title: string, body: string, tag: string): boolean {
    if (!this.isSupported || !this.isEnabled) return false;
    if (Notification.permission !== 'granted') return false;

    // Throttle notifications of the same tag to at most once every 90 seconds
    const now = Date.now();
    const lastTime = this.lastNotifs[tag] || 0;
    if (now - lastTime < 90 * 1000) {
      return false;
    }

    this.lastNotifs[tag] = now;
    try {
      localStorage.setItem(LAST_NOTIF_KEY, JSON.stringify(this.lastNotifs));
    } catch (e) {}

    try {
      const notif = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/apple-touch-icon.png',
        tag: `trumpagotchi_${tag}`,
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      // Play executive alert sound
      sound.playCancel();
      return true;
    } catch (e) {
      // In mobile PWA service workers or standard fallback
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            tag: `trumpagotchi_${tag}`,
          });
        });
        return true;
      }
      return false;
    }
  }

  /**
   * Monitor Trump's vitals and trigger urgent phone notifications if stats collapse
   */
  public checkAndNotifyVitals(stats: PetStats) {
    if (!this.isEnabled || Notification.permission !== 'granted') return;

    // 1. STARVATION EMERGENCY: Hunger < 22%
    if (stats.hunger < 22) {
      this.sendNotification(
        "🚨 EMERGENCY: DONALD IS STARVING!",
        `Hunger is down to ${Math.round(stats.hunger)}%! Bring prime steaks with ketchup to the Oval Office immediately!`,
        'starving'
      );
      return;
    }

    // 2. RATINGS COLLAPSE: Ratings < 25%
    if (stats.ratings < 25) {
      this.sendNotification(
        "📺 FAKE NEWS CRISIS: RATINGS CRASHING!",
        `Approval rating plummeted to ${stats.ratings}%! Turn on TV to expose the fake news and dance to rally the base!`,
        'ratings'
      );
      return;
    }

    // 3. EXHAUSTION COLLAPSE: Energy < 18%
    if (stats.energy < 18 && !stats.isSleeping) {
      this.sendNotification(
        "🛌 COLLAPSE WARNING: EXECUTIVE NAP NEEDED!",
        `Donald's energy has fallen to ${Math.round(stats.energy)}%! Turn off the Oval Office lights for an executive power nap!`,
        'exhausted'
      );
      return;
    }

    // 4. CLASSIFIED PAPERS OVERFLOW: Messes >= 3
    if (stats.messCount >= 3) {
      this.sendNotification(
        "📁 CLASSIFIED DOCUMENT OVERFLOW!",
        `There are ${stats.messCount} messy document piles all over the floor! Tap Button A to shred papers and clean up!`,
        'messes'
      );
      return;
    }

    // 5. UNHAPPINESS CRISIS: Happiness < 20%
    if (stats.happiness < 20) {
      this.sendNotification(
        "😢 MOOD EMERGENCY: DONALD IS MISERABLE!",
        `Happiness dropped to ${Math.round(stats.happiness)}%! Cue the YMCA dance or give him a press conference rally!`,
        'unhappy'
      );
      return;
    }

    // 6. HEALTH EMERGENCY: Sick
    if (stats.isSick) {
      this.sendNotification(
        "💊 MEDICAL ALERT: DR. RONNIE JACKSON NEEDED!",
        "Donald is under the weather! Call the White House physician for an immediate vitamin booster pack!",
        'sick'
      );
      return;
    }
  }

  /** Send a fun test notification right to the phone */
  public sendTestAlert() {
    if (Notification.permission !== 'granted') {
      this.requestPermission();
      return;
    }
    this.sendNotification(
      "🦅 TEST EXECUTIVE ALERT: TREMENDOUS!",
      "Donald Trump confirms: Phone emergency notifications are 100% operational and winning big league!",
      'test_alert_' + Date.now()
    );
  }
}

export const notificationEngine = new NotificationEngine();
