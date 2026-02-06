import { useEffect, useMemo, useState } from 'react';

export type RelayTaskType = 'task' | 'reminder' | 'recurring';

export type RelayTask = {
  id: string;
  title: string;
  type: RelayTaskType;
  dueDate: string;
  assignedTo?: string;
  completed: boolean;
};

export type NewRelayTask = Omit<RelayTask, 'id' | 'completed'>;

let idCounter = 1000;
let tasksState: RelayTask[] = [
  {
    id: 't1',
    title: 'Call the vet',
    type: 'task',
    dueDate: 'Today',
    completed: false,
  },
  {
    id: 't2',
    title: 'Take vitamins',
    type: 'reminder',
    dueDate: 'Today · Evening',
    completed: false,
  },
  {
    id: 't3',
    title: 'Schedule dentist appointment',
    type: 'reminder',
    dueDate: 'Aug 6',
    completed: false,
  },
  {
    id: 't4',
    title: 'Weekly household reset',
    type: 'recurring',
    dueDate: 'Sat · Weekly',
    completed: false,
  },
];

const listeners = new Set<(tasks: RelayTask[]) => void>();

function emitTasks() {
  listeners.forEach((listener) => listener(tasksState));
}

function setTasksState(next: RelayTask[] | ((prev: RelayTask[]) => RelayTask[])) {
  tasksState = typeof next === 'function' ? next(tasksState) : next;
  emitTasks();
}

export function useRelayTasks() {
  const [tasks, setTasks] = useState<RelayTask[]>(tasksState);

  useEffect(() => {
    const listener = (nextTasks: RelayTask[]) => setTasks(nextTasks);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const api = useMemo(
    () => ({
      addTasks: (items: NewRelayTask[]) => {
        if (!items.length) return;
        const nextItems = items.map((item) => {
          idCounter += 1;
          return {
            id: `task-${idCounter}`,
            title: item.title,
            type: item.type,
            dueDate: item.dueDate,
            assignedTo: item.assignedTo,
            completed: false,
          } as RelayTask;
        });

        setTasksState((prev) => [...nextItems, ...prev]);
      },
      toggleCompleted: (id: string) => {
        setTasksState((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
      },
      markAllTodayComplete: () => {
        setTasksState((prev) =>
          prev.map((task) =>
            task.dueDate.toLowerCase().includes('today')
              ? { ...task, completed: true }
              : task
          )
        );
      },
      clearCompleted: () => {
        setTasksState((prev) => prev.filter((task) => !task.completed));
      },
    }),
    []
  );

  return {
    tasks,
    ...api,
  };
}
