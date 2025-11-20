import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProjects, mockTasks } from "@/data/mockData";
import { FolderKanban, CheckSquare, Users, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardManager() {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === "done").length;
  const inProgressTasks = mockTasks.filter(t => t.status === "in-progress").length;
  const overdueTasks = mockTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "done").length;

  const completionRate = (completedTasks / totalTasks) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your team's projects and tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{completionRate.toFixed(0)}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProjects.map((project) => {
                const projectTasks = mockTasks.filter(t => t.projectId === project.id);
                const completed = projectTasks.filter(t => t.status === "done").length;
                const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

                return (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{completed}/{projectTasks.length} tasks complete</span>
                        <span>{project.members.length} members</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { status: "todo", label: "To Do", count: mockTasks.filter(t => t.status === "todo").length, color: "bg-muted" },
                { status: "in-progress", label: "In Progress", count: inProgressTasks, color: "bg-primary" },
                { status: "review", label: "In Review", count: mockTasks.filter(t => t.status === "review").length, color: "bg-warning" },
                { status: "done", label: "Completed", count: completedTasks, color: "bg-success" },
              ].map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.count} tasks</span>
                  </div>
                  <Progress value={(item.count / totalTasks) * 100} className="h-2" />
                </div>
              ))}
            </div>

            <Button asChild className="w-full mt-6">
              <Link to="/tasks">View All Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
