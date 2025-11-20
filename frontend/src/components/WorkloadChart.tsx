import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WorkloadChartProps {
  data: { name: string; hours: number; tasks: number }[];
}

export const WorkloadChart = ({ data }: WorkloadChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
        <CardDescription>Hours and tasks per team member</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours" />
            <Bar dataKey="tasks" fill="hsl(var(--accent))" name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
