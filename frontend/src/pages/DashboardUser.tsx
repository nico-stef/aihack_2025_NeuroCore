import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { CheckSquare, Clock, AlertTriangle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { burnoutApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardUser() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [burnoutData, setBurnoutData] = useState<any>(null);
  const [loadingBurnout, setLoadingBurnout] = useState(true);

  useEffect(() => {
    const fetchBurnoutScore = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingBurnout(true);
        const score = await burnoutApi.getScore(user.id);
        setBurnoutData(score);
      } catch (error) {
        console.error('Error fetching burnout score:', error);
        toast({
          title: "Error",
          description: "Failed to load burnout score",
          variant: "destructive",
        });
      } finally {
        setLoadingBurnout(false);
      }
    };

    fetchBurnoutScore();
  }, [user?.id]);
  
  const myTasks = mockTasks.filter(t => t.assigneeId === user?.id);
  const completedTasks = myTasks.filter(t => t.status === "done").length;
  const inProgressTasks = myTasks.filter(t => t.status === "in-progress").length;
  const overdueTasks = myTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== "done").length;

  const totalEstimatedHours = myTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalActualHours = myTasks.reduce((sum, t) => sum + t.actualHours, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "success";
      case "in-progress": return "default";
      case "review": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's your task overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActualHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">of {totalEstimatedHours}h estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Burnout Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBurnout ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : burnoutData ? (
              <>
                <div className="text-2xl font-bold">{burnoutData.score}/100</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk: {burnoutData.riskLevel?.toUpperCase() || 'N/A'}
                </p>
                <Progress value={burnoutData.score} className="mt-2" />
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Tasks currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks
                .filter(t => t.status === "in-progress")
                .map((task) => (
                  <Link key={task.id} to={`/tasks/${task.id}`}>
                    <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{task.actualHours}h / {task.estimatedHours}h</span>
                      </div>
                    </div>
                  </Link>
                ))}
              {inProgressTasks === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks in progress
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks to start soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks
                .filter(t => t.status === "todo")
                .slice(0, 3)
                .map((task) => (
                  <Link key={task.id} to={`/tasks/${task.id}`}>
                    <div className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        </div>
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{task.estimatedHours}h estimated</span>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            <Button asChild className="w-full mt-4">
              <Link to="/my-tasks">View All My Tasks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
