/**
 * Gamification Engine: Learning Streak Calculation
 * Computes consecutive active learning days, longest streak,
 * and current calendar week participation matrix.
 */

export interface DayActivity {
  dayName: string; // e.g. "Mon", "Tue"
  dateString: string; // "YYYY-MM-DD"
  active: boolean;
  isToday: boolean;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
  practicedYesterday: boolean;
  activeDatesCount: number;
  weeklyActivity: DayActivity[];
}

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates student daily practice streak from historical attempt timestamps.
 * 
 * @param timestamps Array of ISO timestamp strings or Date instances
 * @param referenceDate Optional current date anchor for deterministic testing
 */
export function calculateStreak(
  timestamps: (string | Date | null | undefined)[],
  referenceDate: Date = new Date()
): StreakSummary {
  // 1. Collect unique valid dates sorted in descending order
  const dateSet = new Set<string>();

  for (const t of timestamps) {
    if (!t) continue;
    const dateObj = typeof t === "string" ? new Date(t) : t;
    if (isNaN(dateObj.getTime())) continue;
    dateSet.add(formatLocalDate(dateObj));
  }

  const sortedDates = Array.from(dateSet).sort().reverse(); // newest first
  const todayStr = formatLocalDate(referenceDate);

  const yesterdayDate = new Date(referenceDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayDate);

  const practicedToday = dateSet.has(todayStr);
  const practicedYesterday = dateSet.has(yesterdayStr);

  // 2. Compute current consecutive streak
  let currentStreak = 0;

  if (practicedToday || practicedYesterday) {
    // Start counting from today or yesterday
    const checkDate = practicedToday ? new Date(referenceDate) : new Date(yesterdayDate);

    while (true) {
      const checkStr = formatLocalDate(checkDate);
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 3. Compute longest historical streak
  let longestStreak = 0;
  if (sortedDates.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = new Date(sortedDates[i] + "T00:00:00");
      const next = new Date(sortedDates[i + 1] + "T00:00:00");
      const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  // 4. Build current week's 7-day activity matrix (Monday to Sunday)
  const currentDayIndex = referenceDate.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (currentDayIndex + 6) % 7; // days since Monday
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - distanceToMonday);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyActivity: DayActivity[] = [];

  for (let i = 0; i < 7; i++) {
    const iterDate = new Date(monday);
    iterDate.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(iterDate);

    weeklyActivity.push({
      dayName: dayNames[i],
      dateString: dateStr,
      active: dateSet.has(dateStr),
      isToday: dateStr === todayStr,
    });
  }

  return {
    currentStreak,
    longestStreak,
    practicedToday,
    practicedYesterday,
    activeDatesCount: dateSet.size,
    weeklyActivity,
  };
}
