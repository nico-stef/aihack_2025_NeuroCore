import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTasks, mockProjects } from "@/data/mockData";
import { mockUsers } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckSquare, Clock, UserX } from "lucide-react";
import { toast } from "sonner";

export default function Tasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState("");

  const handleReassign = () => {
    if (!selectedTask || !newAssignee) {
      toast.error("Please select a task and assignee");
      return;
    }

    setTasks(tasks.map(t => 
      t.id === selectedTask ? { ...t, assigneeId: newAssignee } : t
    ));
    setSelectedTask(null);
    setNewAssignee("");
    toast.success("Task reassigned successfully");
  };

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const reviewTasks = tasks.filter(t => t.status === "review");
  const doneTasks = tasks.filter(t => t.status === "done");

  const totalEstimated = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalActual = tasks.reduce((sum, t) => sum + t.actualHours, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Management</h1>
        <p className="text-muted-foreground mt-1">Manage and track all project tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimated}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Actual Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActual}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalActual / totalEstimated) * 100).toFixed(0)}% of estimated
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>Organized by workflow stage</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                  <TabsTrigger value="done">Done</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <TaskList tasks={tasks} />
                </TabsContent>
                <TabsContent value="todo" className="mt-4">
                  <TaskList tasks={todoTasks} />
                </TabsContent>
                <TabsContent value="in-progress" className="mt-4">
                  <TaskList tasks={inProgressTasks} />
                </TabsContent>
                <TabsContent value="review" className="mt-4">
                  <TaskList tasks={reviewTasks} />
                </TabsContent>
                <TabsContent value="done" className="mt-4">
                  <TaskList tasks={doneTasks} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Reassign Task
              </CardTitle>
              <CardDescription>Change task assignee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Task</Label>
                <Select value={selectedTask || ""} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>New Assignee</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.filter(u => u.role === "user").map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleReassign} className="w-full">
                Reassign Task
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
