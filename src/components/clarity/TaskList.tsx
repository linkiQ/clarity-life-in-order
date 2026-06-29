import { sortTasks, type Task } from "@/lib/store";
import { TaskItem } from "./TaskItem";

export function TaskList({ tasks, empty }: { tasks: Task[]; empty?: string }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-10">
        {empty ?? "Nothing here yet."}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {sortTasks(tasks).map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
    </div>
  );
}
