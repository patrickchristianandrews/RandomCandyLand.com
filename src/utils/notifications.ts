/**
 * Trumpagotchi Emergency Phone Notifications Engine
 * Sends push notifications to mobile and desktop lock screens when Donald's vitals drop into the danger zone.
 */

import { PetStats } from '../types/game';
import { sound } from './audio';
/** Actual recorded audio headlines, with separate fictional game instructions. */
export interface TrumpTroubleAlert {key:string;title:string;detail:string;action:string;clip:string;icon:string;}
export function getTrumpTroubleAlert(s:PetStats):TrumpTroubleAlert|null{
 if(s.isSick || s.health < 40) return {key:"sick",title:"NOTHING BUT PROBLEMS!",detail:"Donald is unwell. His health needs attention.",action:"Select Medicine using A, then press B.",clip:"nothing_but_problem.mp3",icon:"💊"};
 if(s.hunger < 35) return {key:"hungry",title:"LOTS OF PROBLEMS!",detail:"His hunger numbers are terrible. Donald needs a meal.",action:"Select Feed using A, then press B.",clip:"lots_of_problems.mp3",icon:"🍔"};
 if(s.energy < 25 && !s.isSleeping) return {key:"tired",title:"WHAT'S GOING ON?",detail:"Donald's energy is extremely low.",action:"Select Lights using A, then press B to let him nap.",clip:"whats_going_on.mp3",icon:"💤"};
 if(s.messCount >= 3 || s.cleanliness < 35) return {key:"mess",title:"CAN YOU BELIEVE THIS?",detail:"The Oval Office is a mess and papers are everywhere.",action:"Select Clean using A, then press B.",clip:"can_you_believe_this.mp3",icon:"🧹"};
 if(s.happiness < 32) return {key:"sad",title:"NOTHING BUT PROBLEMS!",detail:"Donald isn't doing so good. His happiness is way down.",action:"Try Dance or Pep using buttons A and B.",clip:"nothing_but_problem.mp3",icon:"💔"};
 if(s.hairStyle < 27) return {key:"hair",title:"CAN YOU BELIEVE THIS?",detail:"The famous hair has seen better days.",action:"Select Groom using A, then press B.",clip:"can_you_believe_this.mp3",icon:"💇"};
 if(s.ratings < 30) return {key:"ratings",title:"WE HAVE LOSERS!",detail:"The polls are dropping. Donald needs your attention.",action:"Feed, groom, clean or try a rally to raise his ratings.",clip:"we_have_losers.mp3",icon:"📉"};
 return null;
}


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
      let savedEnabled: string | null = null;
      try { savedEnabled = localStorage.getItem(NOTIF_ENABLED_KEY); } catch {}
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
    try { localStorage.setItem(NOTIF_ENABLED_KEY, String(enabled)); } catch {}
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

    // Prevent repeated emergency notifications from flooding the phone.
    const now = Date.now();
    const lastTime = this.lastNotifs[tag] || 0;
    const cooldown = tag.startsWith('test_alert_') ? 0 : tag === 'trump_welcome' ? 90000 : 15 * 60 * 1000;
    if (now - lastTime < cooldown) {
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
    if (!this.isSupported || !this.isEnabled || Notification.permission !== 'granted') return;
    const trouble = getTrumpTroubleAlert(stats);
    if (!trouble) return;
    this.sendNotification(trouble.icon+' TRUMPAGOTCHI: '+trouble.title,trouble.detail+' '+trouble.action,'vital_'+trouble.key);
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
