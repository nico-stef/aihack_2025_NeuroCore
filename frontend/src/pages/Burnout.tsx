import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBurnoutData } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { BurnoutHeatmap } from "@/components/BurnoutHeatmap";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Burnout() {
  const { user } = useAuth();

  const weeklyData = mockBurnoutData.weeklyHours.map((hours, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    hours,
  }));

  const getBurnoutLevel = (score: number) => {
    if (score < 40) return { level: "Low", color: "success", icon: CheckCircle2 };
    if (score < 70) return { level: "Moderate", color: "warning", icon: AlertTriangle };
    return { level: "High", color: "destructive", icon: AlertTriangle };
  };

  const burnoutLevel = getBurnoutLevel(mockBurnoutData.score);
  const BurnoutIcon = burnoutLevel.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Burnout Analysis</h1>
        <p className="text-muted-foreground mt-1">Monitor your workload and well-being</p>
      </div>

      <Alert variant={burnoutLevel.color === "destructive" ? "destructive" : "default"}>
        <BurnoutIcon className="h-4 w-4" />
        <AlertTitle>Burnout Level: {burnoutLevel.level}</AlertTitle>
        <AlertDescription>
          Your current burnout score is {mockBurnoutData.score}/100. 
          {burnoutLevel.color === "destructive" && " Please consider taking a break and redistributing your workload."}
          {burnoutLevel.color === "warning" && " Monitor your workload carefully."}
          {burnoutLevel.color === "success" && " You're maintaining a healthy work-life balance!"}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Burnout Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{mockBurnoutData.score}/100</div>
            <Progress 
              value={mockBurnoutData.score} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {burnoutLevel.level} risk level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize mb-2">
              {mockBurnoutData.trend}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockBurnoutData.trend === "increasing" 
                ? "Workload has been increasing" 
                : "Workload is stable"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Weekly Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {(mockBurnoutData.weeklyHours.reduce((a, b) => a + b, 0) / 7).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Per day this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Hours</CardTitle>
            <CardDescription>Hours worked each day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Actions to improve work-life balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBurnoutData.recommendations.map((rec, index) => (
                <div key={index} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BurnoutHeatmap score={mockBurnoutData.score} weeklyHours={mockBurnoutData.weeklyHours} />
    </div>
  );
}
