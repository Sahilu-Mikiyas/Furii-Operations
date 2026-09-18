import { toast } from "sonner";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    toast.error("Push notifications are not supported in this browser.");
    return false;
  }

  if (Notification.permission === "granted") {
    toast.success("Push notifications already enabled.");
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      toast.success("Daily Mission & Focus Window Push Notifications Enabled!");
      sendLocalNotification(
        "🇵🇱 MISSION POLAND READY",
        "Daily reminders are active. Your 16-hour focus window and identity loops are tracked."
      );
      return true;
    } else {
      toast.error("Notification permission was denied.");
      return false;
    }
  } catch (err) {
    console.warn("Notification request error:", err);
    return false;
  }
}

export function sendLocalNotification(title: string, body: string, url: string = "/today") {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          data: { url },
        });
      });
    } else {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  } catch (err) {
    console.warn("Failed to dispatch notification", err);
  }
}

export function scheduleDailyReminder(hour: number = 8, minute: number = 0) {
  // Store notification preference in local storage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mission_daily_reminder_time", `${hour}:${minute}`);
    } catch {}
  }
  toast.success(`Daily focus reminder set for ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
}
