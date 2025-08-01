import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import { CiEdit } from "react-icons/ci";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { IoCalendarOutline } from "react-icons/io5";
import { GrInProgress } from "react-icons/gr";
import { AiOutlineDelete, AiOutlineFileDone } from "react-icons/ai";

const TaskBoard = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [modalTask, setModalTask] = useState([]);
  const [tasks, setTasks] = useState({ ToDo: [], InProgress: [], Done: [] });
  const [loading, setLoading] = useState(true);

  // Get API URL with fallback
  const API_URL = import.meta.env.VITE_URL || "http://localhost:5000";

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/tasks?email=${user.email}`, {
        withCredentials: true,
      });

      // Format tasks by category
      const formattedTasks = response.data.reduce(
        (acc, task) => {
          acc[task.category] = acc[task.category] || [];
          acc[task.category].push(task);
          return acc;
        },
        { ToDo: [], InProgress: [], Done: [] }
      );
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // If dropped outside of droppable area
    if (!destination) return;

    const sourceCategory = source.droppableId;
    const destinationCategory = destination.droppableId;

    // Restrict dragging tasks from Done category
    if (sourceCategory === "Done") return;

    // Restrict direct movement from ToDo to Done
    if (sourceCategory === "ToDo" && destinationCategory === "Done") return;

    // Restrict movement from InProgress back to ToDo
    if (sourceCategory === "InProgress" && destinationCategory === "ToDo")
      return;

    const sourceTasks = [...tasks[sourceCategory]];

    if (sourceCategory === destinationCategory) {
      // Reorder within the same category and update serial
      const [movedTask] = sourceTasks.splice(source.index, 1);
      sourceTasks.splice(destination.index, 0, movedTask);

      const updatedTasks = sourceTasks.map((task, index) => ({
        ...task,
        serial: index + 1, // Update serial based on new position
      }));

      setTasks({
        ...tasks,
        [sourceCategory]: updatedTasks,
      });

      // Update order in backend
      try {
        await axios.put(
          `${API_URL}/tasksUpdateOrder`,
          { tasks: updatedTasks },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating task order:", error);
        toast.error("Failed to update task order");
      }
    } else {
      // Move task between categories
      const destinationTasks = [...(tasks[destinationCategory] || [])];
      const [movedTask] = sourceTasks.splice(source.index, 1);

      // Lock task if moved to Done category
      if (destinationCategory === "Done") {
        movedTask.isLocked = true;
        toast.success("🎉 Great job! Task completed successfully!", {
          icon: false,
          className: "text-center flex items-center justify-center flex-warp flex-row",
        });
      }
      if (destinationCategory === "InProgress") {
        toast.info("Task moved to InProgress", {
          className: "text-center flex items-center justify-center flex-warp flex-row",
          icon: <GrInProgress />,
        });
      }

      movedTask.category = destinationCategory;
      destinationTasks.splice(destination.index, 0, movedTask);

      // Update state with new task order
      setTasks({
        ...tasks,
        [sourceCategory]: sourceTasks,
        [destinationCategory]: destinationTasks,
      });

      // Update category in backend
      try {
        await axios.put(
          `${API_URL}/tasksUpdateCategory`,
          { 
            taskId: movedTask._id, 
            category: destinationCategory,
            isLocked: movedTask.isLocked 
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error updating task category:", error);
        toast.error("Failed to update task");
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        withCredentials: true,
      });
      toast.success("Task deleted successfully");
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {["ToDo", "InProgress", "Done"].map((category) => (
          <Droppable key={category} droppableId={category}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded-lg shadow-xl min-h-[200px] 
                ${
                  category === "Done"
                    ? `${
                        theme === "light"
                          ? "bg-[#A5D6A7] text-gray-600"
                          : "bg-[#1B5E20]/50 text-gray-300"
                      }`
                    : category === "InProgress"
                    ? `${
                        theme === "light"
                          ? "bg-[#FFE082] text-gray-600"
                          : "bg-[#947400]/50 text-gray-300"
                      }`
                    : `${
                        theme === "light"
                          ? "bg-[#BBDEFB] text-gray-600"
                          : "bg-[#1E3A8A]/50 text-gray-300"
                      }`
                }`}
              >
                <h2 className="text-lg font-semibold mb-2 flex justify-between items-center">
                  {category}{" "}
                  {category === "Done" ? (
                    <AiOutlineFileDone className={`text-xl md:text-2xl`} />
                  ) : category === "InProgress" ? (
                    <GrInProgress className={`text-xl md:text-2xl`} />
                  ) : (
                    <IoCalendarOutline className={`text-xl md:text-2xl`} />
                  )}
                </h2>

                {tasks[category]?.map((task, index) => (
                  <Draggable
                    key={task._id}
                    draggableId={task._id}
                    index={index}
                    isDragDisabled={task.isLocked}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-3 p-3 rounded-lg shadow-md cursor-pointer transition-all duration-200 ${
                          snapshot.isDragging
                            ? "opacity-50"
                            : "hover:shadow-lg"
                        } ${
                          task.isLocked
                            ? "bg-gray-200 opacity-75"
                            : theme === "light"
                            ? "bg-white"
                            : "bg-gray-800"
                        }`}
                        onClick={() => setModalTask(task)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm truncate flex-1">
                            {task.title}
                          </h3>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalTask(task);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <CiEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task._id);
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <AiOutlineDelete />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
      {modalTask.length > 0 && (
        <Modal task={modalTask} onClose={() => setModalTask([])} />
      )}
    </DragDropContext>
  );
};

export default TaskBoard;
