import { Task } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface TaskCardProps {
  task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
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

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <Link to={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium flex-1">{task.title}</h4>
            <div className="flex gap-2 ml-2">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant={getStatusColor(task.status)}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{task.actualHours}h / {task.estimatedHours}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className={`h-3 w-3 ${isOverdue ? "text-destructive" : ""}`} />
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
