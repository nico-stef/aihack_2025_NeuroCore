import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks, mockProjects } from "@/data/mockData";
import { mockUsers } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { TaskChatBox } from "@/components/TaskChatBox";
import NotFound from "./NotFound";

export default function TaskDetail() {
  const { id } = useParams();
  const task = mockTasks.find(t => t.id === id);

  if (!task) {
    return <NotFound />;
  }

  const project = mockProjects.find(p => p.id === task.projectId);
  const assignee = mockUsers.find(u => u.id === task.assigneeId);

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

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const timeProgress = task.estimatedHours > 0 
    ? (task.actualHours / task.estimatedHours) * 100 
    : 0;

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground mt-1">
              Project: <Link to={`/projects/${project?.id}`} className="text-primary hover:underline">
                {project?.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant={getStatusColor(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{task.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    Assigned to
                  </div>
                  <p className="font-medium">{assignee?.name}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </div>
                  <p className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                    {new Date(task.dueDate).toLocaleDateString()}
                    {isOverdue && " (Overdue)"}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Time Tracking
                  </div>
                  <span className="text-sm font-medium">
                    {task.actualHours}h / {task.estimatedHours}h
                  </span>
                </div>
                <Progress value={timeProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {timeProgress > 100 ? "Over" : "Under"} estimated by {Math.abs(100 - timeProgress).toFixed(0)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <TaskChatBox taskId={task.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Edit Task
              </Button>
              <Button className="w-full" variant="outline">
                Change Status
              </Button>
              <Button className="w-full" variant="outline">
                Reassign Task
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Recent task updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="pb-3 border-b border-border">
                  <p className="text-muted-foreground">Task created</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status: {getStatusLabel(task.status)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Current status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
