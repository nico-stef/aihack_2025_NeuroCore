import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tasksApi, projectsApi, usersApi } from "@/lib/api";
import { WorkloadChart } from "@/components/WorkloadChart";
import { BarChart3, TrendingUp, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Insights() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, projectsData, usersData] = await Promise.all([
          tasksApi.getAll(),
          projectsApi.getAll(),
          usersApi.getAll()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "done");
  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === "done").length / tasks.length) * 100 : 0;

  // Workload by user
  const developers = users.filter(u => u.role === "developer" || u.role === "tester");
  const workloadData = developers.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const totalHours = userTasks.reduce((sum, t) => sum + t.actualHours, 0);
    return {
      name: user.name.split(' ')[0],
      hours: totalHours,
      tasks: userTasks.length,
    };
  });

  // Task status distribution
  const statusData = [
    { name: "To Do", value: tasks.filter(t => t.status === "todo").length, color: "hsl(var(--muted))" },
    { name: "In Progress", value: tasks.filter(t => t.status === "in-progress").length, color: "hsl(var(--primary))" },
    { name: "Review", value: tasks.filter(t => t.status === "review").length, color: "hsl(var(--warning))" },
    { name: "Done", value: tasks.filter(t => t.status === "done").length, color: "hsl(var(--success))" },
  ];

  // Project completion
  const projectData = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const completed = projectTasks.filter(t => t.status === "done").length;
    const total = projectTasks.length;
    return {
      name: project.name.split(' ').slice(0, 2).join(' '),
      completed,
      total,
      rate: total > 0 ? (completed / total) * 100 : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Insights & Analytics</h1>
        <p className="text-muted-foreground mt-1">Team performance and workload analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall task completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Working on tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Hours logged per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours Logged" />
                <Bar dataKey="tasks" fill="hsl(var(--accent))" name="Task Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current task breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Completion Rates</CardTitle>
            <CardDescription>Progress across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--success))" name="Completed" />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
