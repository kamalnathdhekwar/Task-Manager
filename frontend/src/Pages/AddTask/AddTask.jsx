import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { MdAddTask, MdClose } from "react-icons/md";

const AddTask = () => {
  const [titleError, setTitleError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Get API URL with fallback
  const API_URL = import.meta.env.VITE_URL || "http://localhost:5000";

  const handleDate = (e) => {
    let date = new Date(e.target.value);
    date.setHours(23, 59, 59, 999);
    setDueDate(date.toISOString());
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const timestamp = new Date().toLocaleString();
    const category = "ToDo";
    
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user) {
      toast.error("Please login to add tasks", {
        className: "text-center flex items-center justify-center flex-warp flex-row gap-2",
      });
      setLoading(false);
      return;
    }

    const task = {
      title,
      description,
      timestamp,
      dueDate,
      category,
      userName: user.name,
      userEmail: user.email,
    };

    if (!title || !description || !category) {
      toast.error("All fields are required", {
        className: "text-center flex items-center justify-center flex-warp flex-row gap-2",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/addTask`, task, {
        withCredentials: true,
      });

      if (response.data.insertedId) {
        toast.success("Task added successfully", {
          icon: <MdAddTask />,
          className: "text-center flex items-center justify-center flex-warp flex-row gap-2",
        });
        form.reset();
        setDueDate("");
        document.getElementById("my_modal_4").close();
        
        // Trigger a page reload or emit an event to refresh tasks
        window.location.reload();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add task", {
          className: "text-center flex items-center justify-center flex-warp flex-row gap-2",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="my_modal_4" className="modal modal-bottom sm:modal-middle">
      <div className="modal-box p-6 md:p-8 lg:p-12 rounded-3xl shadow-xl relative bg-blue-100 text-gray-500">
        <form onSubmit={handleAddTask}>
          <h2 className="text-2xl mb-6 md:mb-8 lg:mb-10 md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-t from-blue-400 to-blue-500">
            Create a New Task
          </h2>
          <div className="flex flex-col gap-2 space-y-3 lg:space-y-4">
            <label className="flex flex-col gap-1 justify-start" htmlFor="title">
              Task Title*
              <input
                className="py-1 px-2 lg:py-1.5 lg:px-3 rounded-md border focus:outline-none focus:border-blue-300 border-gray-400 duration-300"
                type="text"
                name="title"
                max={50}
                onChange={(e) => {
                  if (e.target.value.length > 50)
                    return setTitleError("Task title cannot exceed 50 characters");
                  else setTitleError(null);
                }}
                required
                disabled={loading}
              />
              {titleError ? (
                <p className="text-red-500 text-xs py-2">{titleError}</p>
              ) : (
                ""
              )}
            </label>
            <label htmlFor="dueDate" className="flex flex-row items-start gap-2 truncate">
              Due Date*
              <input
                type="date"
                onChange={handleDate}
                className="py-1 px-2 lg:py-1.5 lg:px-3 w-full rounded-md border focus:outline-none focus:border-blue-300 border-gray-400 duration-300"
                required
                disabled={loading}
              />
            </label>
            <label className="flex flex-col gap-1 justify-start" htmlFor="description">
              Description*
              <textarea
                className="py-1 px-2 lg:py-1.5 lg:px-3 rounded-md border focus:outline-none focus:border-blue-300 border-gray-400 duration-300"
                type="text"
                name="description"
                maxLength={200}
                onChange={(e) => {
                  if (e.target.value.length > 200)
                    return setDescriptionError("Description cannot exceed 200 characters");
                  else setDescriptionError(null);
                }}
                required
                disabled={loading}
              />
              {descriptionError ? (
                <p className="text-red-500 text-xs py-2">{descriptionError}</p>
              ) : (
                ""
              )}
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="py-1 w-full btn px-2 lg:py-1.5 hover:rounded-2xl duration-300 transition-all ease-in-out lg:px-3 border rounded-md cursor-pointer bg-blue-400"
                disabled={loading}
              >
                {loading ? "Adding Task..." : "Add Task"}
              </button>
            </div>
          </div>
        </form>
        <div className="modal-action absolute -top-2 right-4">
          <form method="dialog">
            <button 
              className="cursor-pointer text-xl hover:rounded-full bg-base-200 p-2 rounded-md transition-all ease-in-out duration-300"
              disabled={loading}
            >
              <MdClose />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AddTask;
