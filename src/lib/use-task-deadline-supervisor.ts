import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { type DailyTodoItem } from "./mission-data";
import { playTaskAlertTone, sendBrowserNotification } from "./task-timer-sound";

type AlertState = {
  lastPlannedSec: number;
  third: boolean;
  quarter: boolean;
  five_min: boolean;
  time_up: boolean;
  overtime_intervals: Set<number>;
};

export function useTaskDeadlineSupervisor(
  todos: DailyTodoItem[],
  activeFocusLabel?: string,
  activeFocusElapsedSec: number = 0
) {
  const alertsRef = useRef<Record<string, AlertState>>({});

  useEffect(() => {
    const interval = window.setInterval(() => {
      todos.forEach((todo) => {
        if (todo.done) {
          if (alertsRef.current[todo.id]) {
            delete alertsRef.current[todo.id];
          }
          return;
        }

        // Determine estimated duration in seconds
        let plannedSec = (todo.estimated_minutes || 0) * 60;

        // If deadline_time is set (e.g., "16:30"), calculate planned seconds relative to creation time or now
        if (todo.deadline_time && !plannedSec) {
          const parts = todo.deadline_time.split(":");
          const hours = parts[0] ? parseInt(parts[0], 10) : NaN;
          const mins = parts[1] ? parseInt(parts[1], 10) : NaN;

          if (!isNaN(hours) && !isNaN(mins)) {
            const deadlineDate = new Date();
            deadlineDate.setHours(hours, mins, 0, 0);
            const created = new Date(todo.created_at || Date.now());
            const diff = Math.max(0, Math.floor((deadlineDate.getTime() - created.getTime()) / 1000));
            if (diff > 0) plannedSec = diff;
          }
        }

        if (!plannedSec || plannedSec <= 0) return;

        // Calculate time spent so far
        const isCurrentFocus =
          Boolean(activeFocusLabel) &&
          (activeFocusLabel!.includes(todo.label) || todo.label.includes(activeFocusLabel!));
        const currentElapsed = (todo.time_spent_seconds || 0) + (isCurrentFocus ? activeFocusElapsedSec : 0);
        const remaining = plannedSec - currentElapsed;

        // Initialize alert state if needed or recalibrate if plannedSec changed
        if (!alertsRef.current[todo.id]) {
          alertsRef.current[todo.id] = {
            lastPlannedSec: plannedSec,
            third: remaining <= plannedSec / 3 && remaining > 0,
            quarter: remaining <= plannedSec / 4 && remaining > 0,
            five_min: remaining <= 300 && remaining > 0,
            time_up: remaining <= 0,
            overtime_intervals: new Set<number>(),
          };
        } else if (alertsRef.current[todo.id]?.lastPlannedSec !== plannedSec) {
          // Duration was modified by user! Recalibrate all alert thresholds for the new duration
          const alertState = alertsRef.current[todo.id]!;
          alertState.lastPlannedSec = plannedSec;
          // Re-arm alerts if new remaining time is now larger than thresholds
          alertState.time_up = remaining <= 0;
          alertState.five_min = remaining <= 300 && remaining > 0;
          alertState.quarter = remaining <= plannedSec / 4 && remaining > 0;
          alertState.third = remaining <= plannedSec / 3 && remaining > 0;
          alertState.overtime_intervals = new Set<number>();
        }

        const alertState = alertsRef.current[todo.id];
        if (!alertState) return;

        // 1. 1/3 Time Remaining Alert
        if (
          plannedSec >= 600 &&
          remaining <= plannedSec / 3 &&
          remaining > plannedSec / 4 &&
          !alertState.third
        ) {
          alertState.third = true;
          playTaskAlertTone("third");
          const minsLeft = Math.max(1, Math.round(remaining / 60));
          sendBrowserNotification("⏳ 1/3 Time Remaining", `You have ${minsLeft}m left to complete "${todo.label}".`);
          toast.warning(`⏳ 1/3 TIME LEFT: ${minsLeft}m remaining for "${todo.label}"!`, {
            duration: 6000,
          });
        }

        // 2. 1/4 Time Remaining Alert
        if (
          plannedSec >= 480 &&
          remaining <= plannedSec / 4 &&
          remaining > 300 &&
          !alertState.quarter
        ) {
          alertState.quarter = true;
          playTaskAlertTone("quarter");
          const minsLeft = Math.max(1, Math.round(remaining / 60));
          sendBrowserNotification("⏳ 1/4 Time Remaining", `Only ${minsLeft}m left on "${todo.label}"!`);
          toast.warning(`⏳ 1/4 TIME LEFT: Only ${minsLeft}m left for "${todo.label}"! Accelerate pace.`, {
            duration: 7000,
          });
        }

        // 3. 5 Minutes Remaining Alert
        if (remaining <= 300 && remaining > 0 && !alertState.five_min) {
          alertState.five_min = true;
          playTaskAlertTone("five_min");
          const minsLeft = Math.max(1, Math.ceil(remaining / 60));
          sendBrowserNotification("⚠️ 5 Minutes Left", `Only ${minsLeft}m left to finish "${todo.label}"!`);
          toast.error(`⚠️ 5 MINUTES REMAINING: ${minsLeft}m left for "${todo.label}"! Wrap up the deliverable.`, {
            duration: 8000,
          });
        }

        // 4. Time's Up Alert
        if (remaining <= 0 && !alertState.time_up) {
          alertState.time_up = true;
          playTaskAlertTone("time_up");
          sendBrowserNotification(
            "🚨 Time Is Up!",
            `Target duration of ${todo.estimated_minutes || Math.round(plannedSec / 60)}m reached for "${todo.label}".`
          );
          toast.error(
            `🚨 TIME'S UP: Planned duration reached for "${todo.label}"! Total spent: ${Math.round(currentElapsed / 60)}m.`,
            {
              duration: 10000,
            }
          );
        }

        // 5. Overtime Notification Every 10 Minutes Past Deadline
        if (currentElapsed > plannedSec) {
          const overtimeSec = currentElapsed - plannedSec;
          const intervalIndex = Math.floor(overtimeSec / 600); // 1 for 10m, 2 for 20m, etc.
          if (intervalIndex >= 1 && !alertState.overtime_intervals.has(intervalIndex)) {
            alertState.overtime_intervals.add(intervalIndex);
            playTaskAlertTone("overtime");
            const overtimeMins = intervalIndex * 10;
            const totalMins = Math.round(currentElapsed / 60);
            sendBrowserNotification(
              "⚠️ Overtime Alert",
              `Task "${todo.label}" not done! You have spent ${overtimeMins}m more than planned (Total: ${totalMins}m).`
            );
            toast.error(
              `⚠️ OVERTIME: You have now spent ${overtimeMins}m MORE than planned on "${todo.label}"! Total time spent: ${totalMins}m. Please finish or mark complete.`,
              {
                duration: 10000,
              }
            );
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [todos, activeFocusLabel, activeFocusElapsedSec]);
}
