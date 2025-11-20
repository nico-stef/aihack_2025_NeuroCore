import { Task } from "@/data/mockData";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: () => void;
}

export const TaskList = ({ tasks, onTaskUpdate }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No tasks found
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onStatusChange={onTaskUpdate} />
      ))}
    </div>
  );
};
