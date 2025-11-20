import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectsApi, tasksApi, teamsApi, githubApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, GitBranch, GitPullRequest, AlertCircle, Users, Plus, X } from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "./NotFound";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    estimateHours: ""
  });

  const fetchGithubStats = async () => {
    if (!id || user?.role !== 'manager') return;

    try {
      const stats = await githubApi.getProjectStats(id);
      setGithubStats(stats);
    } catch (error) {
      console.error("Failed to fetch GitHub stats:", error);
    }
  };

  const fetchProjectTasks = async () => {
    if (!id) return;

    try {
      const tasksData = await tasksApi.getAll({ projectId: id });
      setProjectTasks(tasksData);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [projectData, tasksData] = await Promise.all([
          projectsApi.getById(id),
          tasksApi.getAll({ projectId: id })
        ]);
        setProject(projectData);
        setProjectTasks(tasksData);

        // Fetch team members if user is manager
        if (user?.role === 'manager' && projectData.teamId) {
          const teamData = await teamsApi.getById(projectData.teamId._id || projectData.teamId);
          setTeamMembers(teamData.members || []);

          // Fetch GitHub statistics for the project
          await fetchGithubStats();
        }
      } catch (error) {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleAddMember = async () => {
    if (!selectedMember || !id) return;

    try {
      const updatedProject = await projectsApi.addMember(id, selectedMember);
      setProject(updatedProject);
      setSelectedMember("");
      setDialogOpen(false);
      toast.success("Member added successfully");
    } catch (error) {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;

    try {
      const updatedProject = await projectsApi.removeMember(id, memberId);
      setProject(updatedProject);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleSyncGithub = async () => {
    if (!id) return;

    setSyncing(true);
    try {
      await githubApi.syncProject(id);
      toast.success("GitHub activity synced successfully");
      await fetchGithubStats();
    } catch (error) {
      toast.error("Failed to sync GitHub activity");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !id) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const taskData = {
        projectId: id,
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo || undefined,
        createdBy: user?.id,
        priority: newTask.priority,
        estimateHours: newTask.estimateHours ? parseFloat(newTask.estimateHours) : undefined,
        status: 'to-do'
      };

      await tasksApi.create(taskData);

      // Refresh tasks
      await fetchProjectTasks();

      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        estimateHours: ""
      });
      setTaskDialogOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  // Filter team members who are not already in the project
  const availableMembers = teamMembers.filter(
    member => !project?.members?.some((pm: any) =>
      (pm._id || pm.id || pm) === (member._id || member.id || member)
    )
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <NotFound />;
  }

  const completed = projectTasks.filter(t => t.status === "done").length;
  const inProgress = projectTasks.filter(t => t.status === "in-progress").length;
  const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-1">{project.description}</p>
          </div>
          <Button variant="outline" asChild>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.members.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Burnout Risk Alerts - Only for Managers */}
          {user?.role === 'manager' && githubStats?.alerts && githubStats.alerts.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>High Burnout Risk Detected</AlertTitle>
              <AlertDescription>
                {githubStats.alerts.map((alert: any, idx: number) => (
                  <div key={idx} className="mt-1">
                    <strong>{alert.memberName}</strong>: {alert.message}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* GitHub Statistics - Only for Managers */}
          {user?.role === 'manager' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Burnout Analysis</CardTitle>
                    <CardDescription>
                      Based on commits and task load
                      {githubStats?.summary?.totalCommits > 0 && (
                        <span className="ml-2">• {githubStats.summary.totalCommits} total commits</span>
                      )}
                    </CardDescription>
                  </div>
                  {githubStats?.canSync && (
                    <Button
                      size="sm"
                      onClick={handleSyncGithub}
                      disabled={syncing}
                    >
                      {syncing ? "Syncing..." : "Sync GitHub"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!githubStats?.hasToken && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Manager needs to configure GitHub token to sync data
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  {githubStats?.memberStats && githubStats.memberStats.length > 0 ? (
                    githubStats.memberStats.map((member: any) => {
                      const riskColor = member.riskLevel === 'high' ? 'text-red-600' :
                        member.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600';
                      const bgColor = member.riskLevel === 'high' ? 'bg-red-100' :
                        member.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100';

                      return (
                        <div key={member.userId} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium">{member.memberName}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.role}
                                {member.githubUsername !== 'Not set' && (
                                  <span className="ml-2">• @{member.githubUsername}</span>
                                )}
                              </p>
                            </div>
                            <Badge className={bgColor + ' ' + riskColor}>
                              {member.riskLevel.toUpperCase()} - {member.burnoutRisk}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium">Commits:</span> {member.commits}
                            </div>
                            <div>
                              <span className="font-medium">PRs:</span> {member.pullRequests}
                            </div>
                            <div>
                              <span className="font-medium">Active:</span> {member.activeTasks}
                            </div>
                            <div>
                              <span className="font-medium">Done:</span> {member.completedTasks}
                            </div>
                          </div>
                          {member.recentCommits && member.recentCommits.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs font-medium mb-1">Recent Commits:</p>
                              <div className="space-y-1">
                                {member.recentCommits.slice(0, 3).map((commit: any, idx: number) => (
                                  <div key={idx} className="text-xs text-muted-foreground truncate">
                                    • {commit.message}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {member.lastActivity && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last synced: {new Date(member.lastActivity).toLocaleDateString()}
                            </p>
                          )}
                          <Progress value={member.burnoutRisk} className="h-2 mt-2" />
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No GitHub activity data available. Click \"Sync GitHub\" to fetch data.
                    </p>
                  )}

                  {githubStats?.summary && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Summary</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded bg-green-50">
                          <div className="text-green-600 font-bold">{githubStats.summary.lowRisk}</div>
                          <div className="text-xs text-muted-foreground">Low Risk</div>
                        </div>
                        <div className="text-center p-2 rounded bg-yellow-50">
                          <div className="text-yellow-600 font-bold">{githubStats.summary.mediumRisk}</div>
                          <div className="text-xs text-muted-foreground">Medium Risk</div>
                        </div>
                        <div className="text-center p-2 rounded bg-red-50">
                          <div className="text-red-600 font-bold">{githubStats.summary.highRisk}</div>
                          <div className="text-xs text-muted-foreground">High Risk</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
              <CardDescription>Overall completion status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {completed} of {projectTasks.length} tasks completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Tasks</CardTitle>
                  <CardDescription>All tasks for this project</CardDescription>
                </div>
                {user?.role === 'manager' && (
                  <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                          Add a new task to this project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="task-title">Task Title *</Label>
                          <Input
                            id="task-title"
                            placeholder="Implement login feature"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-description">Description</Label>
                          <Textarea
                            id="task-description"
                            placeholder="Add task details..."
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="task-assignee">Assign To</Label>
                          <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent>
                              {project?.members?.map((member: any) => (
                                <SelectItem key={member._id || member.id} value={member._id || member.id}>
                                  {member.name} ({member.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-estimate">Estimate (hours)</Label>
                            <Input
                              id="task-estimate"
                              type="number"
                              placeholder="8"
                              value={newTask.estimateHours}
                              onChange={(e) => setNewTask({ ...newTask, estimateHours: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleCreateTask} className="w-full" disabled={!newTask.title}>
                          Create Task
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <TaskList tasks={projectTasks} onTaskUpdate={fetchProjectTasks} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">{" "}
                <div>
                  <CardTitle>Project Members</CardTitle>
                  <CardDescription>Team members working on this project</CardDescription>
                </div>
                {user?.role === 'manager' && availableMembers.length > 0 && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Select a team member to add to this project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select value={selectedMember} onValueChange={setSelectedMember}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMembers.map((member) => (
                              <SelectItem key={member._id || member.id} value={member._id || member.id}>
                                {member.name} ({member.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAddMember} className="w-full" disabled={!selectedMember}>
                          Add Member
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.members && project.members.length > 0 ? (
                  project.members.map((member: any) => (
                    <div key={member._id || member.id || member} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{member.role || 'Member'}</p>
                        </div>
                      </div>
                      {user?.role === 'manager' && member._id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id || member.id || member)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No members assigned to this project
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
