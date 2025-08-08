import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, isSameDay, startOfDay, subDays } from "date-fns";
import { Area, AreaId, Habit, HabitLog, Metric, MetricEntry, Reflection } from "@/types/domain";
import { calculateXpForHabitCompletion } from "@/lib/xp";

interface AppState {
  areas: Record<AreaId, Area>;
  habits: Habit[];
  habitLogs: HabitLog[];
  metrics: Metric[];
  metricEntries: MetricEntry[];
  reflections: Reflection[];
  xp: number;
  seedIfEmpty: () => void;
  addHabit: (habit: Omit<Habit, "id">) => void;
  logHabitCompletion: (habitId: string, note?: string, value?: number) => void;
  getStreakForHabit: (habitId: string) => number;
  getStreakForArea: (areaId: AreaId) => number;
  addMetricEntry: (entry: Omit<MetricEntry, "id">) => void;
  addReflection: (r: Omit<Reflection, "id" | "created_at">) => void;
}

const defaultAreas: Record<AreaId, Area> = {
  health: {
    id: "health",
    slug: "health",
    name: "Health",
    icon: "🏋️‍♂️",
    color: "152 76% 66%",
    subcategories: [
      "Fitness & exercise",
      "Nutrition & hydration",
      "Sleep quality",
      "Medical check-ups & prevention",
      "Energy levels",
    ],
  },
  mind: {
    id: "mind",
    slug: "mind",
    name: "Mind & Emotions",
    icon: "🧠",
    color: "217 91% 66%",
    subcategories: [
      "Stress management",
      "Mindfulness & meditation",
      "Self-awareness",
      "Emotional regulation",
      "Therapy & mental health practices",
    ],
  },
  relationships: {
    id: "relationships",
    slug: "relationships",
    name: "Relationships",
    icon: "🤝",
    color: "0 80% 70%",
    subcategories: [
      "Family relationships",
      "Romantic life",
      "Friendships",
      "Community & social skills",
      "Networking & collaboration",
    ],
  },
  wealth: {
    id: "wealth",
    slug: "wealth",
    name: "Wealth",
    icon: "💰",
    color: "140 60% 50%",
    subcategories: [
      "Income & career growth",
      "Saving & investing",
      "Budgeting & debt management",
      "Financial education",
      "Long-term wealth building",
    ],
  },
  purpose: {
    id: "purpose",
    slug: "purpose",
    name: "Purpose & Growth",
    icon: "🚀",
    color: "260 70% 70%",
    subcategories: [
      "Career purpose or calling",
      "Skill development",
      "Hobbies & creativity",
      "Continuous learning",
      "Setting & achieving goals",
    ],
  },
  lifestyle: {
    id: "lifestyle",
    slug: "lifestyle",
    name: "Lifestyle & Contribution",
    icon: "🌍",
    color: "48 96% 60%",
    subcategories: [
      "Fun, travel & leisure",
      "Environment & home organization",
      "Minimalism & sustainability",
      "Volunteering & giving back",
      "Legacy projects",
    ],
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      areas: {} as Record<AreaId, Area>,
      habits: [],
      habitLogs: [],
      metrics: [],
      metricEntries: [],
      reflections: [],
      xp: 0,
      seedIfEmpty: () => {
        const { areas } = get();
        if (!areas || Object.keys(areas).length === 0) {
          set({ areas: defaultAreas });
        }
      },
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            { id: crypto.randomUUID(), ...habit },
          ],
        })),
      logHabitCompletion: (habitId, note, value) => {
        const streak = get().getStreakForHabit(habitId);
        const gained = calculateXpForHabitCompletion(streak);
        set((state) => ({
          habitLogs: [
            ...state.habitLogs,
            {
              id: crypto.randomUUID(),
              habit_id: habitId,
              completed_at: new Date().toISOString(),
              note,
              value,
            },
          ],
          xp: state.xp + gained,
        }));
      },
      getStreakForHabit: (habitId) => {
        const logs = get().habitLogs
          .filter((l) => l.habit_id === habitId)
          .sort((a, b) => a.completed_at.localeCompare(b.completed_at));
        if (logs.length === 0) return 0;
        let streak = 0;
        let day = startOfDay(new Date());
        // Walk backwards from today
        while (true) {
          const has = logs.some((l) => isSameDay(new Date(l.completed_at), day));
          if (has) {
            streak += 1;
            day = subDays(day, 1);
          } else {
            break;
          }
        }
        return streak;
      },
      getStreakForArea: (areaId) => {
        const areaHabits = get().habits.filter((h) => h.area_id === areaId).map((h) => h.id);
        let streak = 0;
        let day = startOfDay(new Date());
        while (true) {
          const has = get().habitLogs.some(
            (l) => areaHabits.includes(l.habit_id) && isSameDay(new Date(l.completed_at), day)
          );
          if (has) {
            streak += 1;
            day = subDays(day, 1);
          } else {
            break;
          }
        }
        return streak;
      },
      addMetricEntry: (entry) =>
        set((state) => ({
          metricEntries: [
            ...state.metricEntries,
            { id: crypto.randomUUID(), ...entry },
          ],
        })),
      addReflection: (r) =>
        set((state) => ({
          reflections: [
            ...state.reflections,
            { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...r },
          ],
        })),
    }),
    { name: "itrackiwin-store" }
  )
);
