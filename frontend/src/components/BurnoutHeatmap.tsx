import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BurnoutHeatmapProps {
  score: number;
  weeklyHours: number[];
}

export const BurnoutHeatmap = ({ score, weeklyHours }: BurnoutHeatmapProps) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 4;

  // Generate mock heatmap data for the last 4 weeks
  const heatmapData = Array.from({ length: weeks }, (_, weekIndex) => 
    weeklyHours.map((hours, dayIndex) => {
      // Vary the data slightly for different weeks
      const variance = (Math.random() - 0.5) * 10;
      return Math.max(0, hours + variance);
    })
  );

  const getIntensityColor = (hours: number) => {
    if (hours < 6) return "bg-success/20";
    if (hours < 8) return "bg-success/50";
    if (hours < 10) return "bg-warning/50";
    if (hours < 12) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>Daily work hours over the past 4 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-16"></div>
            {days.map((day) => (
              <div key={day} className="flex-1 text-center text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-2">
              <div className="w-16 text-xs text-muted-foreground flex items-center">
                Week {weeks - weekIndex}
              </div>
              {week.map((hours, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex-1 aspect-square rounded ${getIntensityColor(hours)} 
                    hover:ring-2 hover:ring-primary transition-all cursor-pointer
                    flex items-center justify-center text-xs font-medium`}
                  title={`${hours.toFixed(1)} hours`}
                >
                  {hours > 8 && <span className="text-foreground">{hours.toFixed(0)}</span>}
                </div>
              ))}
            </div>
          ))}

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-success/20"></div>
              <div className="w-4 h-4 rounded bg-success/50"></div>
              <div className="w-4 h-4 rounded bg-warning/50"></div>
              <div className="w-4 h-4 rounded bg-warning"></div>
              <div className="w-4 h-4 rounded bg-destructive"></div>
            </div>
            <span className="text-muted-foreground">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
