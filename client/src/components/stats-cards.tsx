import { Book, Calendar, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Entry } from "@shared/schema";

interface StatsCardsProps {
  entries: Entry[];
}

export default function StatsCards({ entries }: StatsCardsProps) {
  const totalEntries = entries.length;
  
  // Calculate current streak
  const currentStreak = calculateStreak(entries);
  
  // Calculate this month's entries
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="apple-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[hsl(215,4%,56%)] text-sm font-medium">Total Entries</p>
              <p className="text-2xl font-semibold text-foreground">{totalEntries}</p>
            </div>
            <div className="w-12 h-12 bg-[hsl(207,90%,54%)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <Book className="text-[hsl(207,90%,54%)] text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="apple-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[hsl(215,4%,56%)] text-sm font-medium">Current Streak</p>
              <p className="text-2xl font-semibold text-foreground">{currentStreak}</p>
            </div>
            <div className="w-12 h-12 bg-[hsl(142,71%,45%)] bg-opacity-10 rounded-xl flex items-center justify-center">
              <Flame className="text-[hsl(142,71%,45%)] text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="apple-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[hsl(215,4%,56%)] text-sm font-medium">This Month</p>
              <p className="text-2xl font-semibold text-foreground">{monthlyEntries}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 bg-opacity-10 rounded-xl flex items-center justify-center">
              <Calendar className="text-purple-500 text-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
