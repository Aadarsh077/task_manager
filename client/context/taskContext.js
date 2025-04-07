import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useUserContext } from "./userContext";
import toast from "react-hot-toast";

const TasksContext = createContext();

const serverUrl = "https://task-manager-caf1.onrender.com/api/v1";

export const TasksProvider = ({ children }) => {
  const { user } = useUserContext(); // ✅ Safely access user
  const userId = user?._id; // ✅ Avoid crashing if user is undefined

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState("all");
  const [activeTask, setActiveTask] = useState(null);
  const [modalMode, setModalMode] = useState("");
  const [profileModal, setProfileModal] = useState(false);

  const openModalForAdd = () => {
    setModalMode("add");
    setIsEditing(true);
    setTask({});
  };

  const openModalForEdit = (task) => {
    setModalMode("edit");
    setIsEditing(true);
    setActiveTask(task);
  };

  const openProfileModal = () => {
    setProfileModal(true);
  };

  const closeModal = () => {
    setIsEditing(false);
    setProfileModal(false);
    setModalMode("");
    setActiveTask(null);
    setTask({});
  };

  // get tasks
  const getTasks = async () => {
    if (!userId) return; // ✅ Skip fetching if user is not available
    setLoading(true);
    try {
      const response = await axios.get(`${serverUrl}/tasks`);
      const fetchedTasks = response?.data?.tasks ?? []; // ✅ Safe fallback
      setTasks(fetchedTasks);
    } catch (error) {
      console.log("Error getting tasks", error);
    }
    setLoading(false);
  };

  // get single task
  const getTask = async (taskId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${serverUrl}/task/${taskId}`);
      const fetchedTask = response?.data ?? {};
      setTask(fetchedTask);
    } catch (error) {
      console.log("Error getting task", error);
    }
    setLoading(false);
  };

  const createTask = async (task) => {
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/task/create`, task);
      const newTask = res?.data ?? null;
      if (newTask) {
        setTasks([...tasks, newTask]);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.log("Error creating task", error);
    }
    setLoading(false);
  };

  const updateTask = async (task) => {
    setLoading(true);
    try {
      const res = await axios.patch(`${serverUrl}/task/${task._id}`, task);
      const updatedTask = res?.data ?? null;
      if (updatedTask) {
        const newTasks = tasks.map((tsk) =>
          tsk._id === updatedTask._id ? updatedTask : tsk
        );
        setTasks(newTasks);
        toast.success("Task updated successfully");
      }
    } catch (error) {
      console.log("Error updating task", error);
    }
    setLoading(false);
  };

  const deleteTask = async (taskId) => {
    setLoading(true);
    try {
      await axios.delete(`${serverUrl}/task/${taskId}`);
      const newTasks = tasks.filter((tsk) => tsk._id !== taskId);
      setTasks(newTasks);
    } catch (error) {
      console.log("Error deleting task", error);
    }
    setLoading(false);
  };

  const handleInput = (name) => (e) => {
    if (name === "setTask") {
      setTask(e);
    } else {
      setTask({ ...task, [name]: e.target.value });
    }
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const activeTasks = tasks.filter((task) => !task.completed);

  useEffect(() => {
    getTasks();
  }, [userId]); // ✅ Refetch when userId becomes available

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        task,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        priority,
        setPriority,
        handleInput,
        isEditing,
        setIsEditing,
        openModalForAdd,
        openModalForEdit,
        activeTask,
        closeModal,
        modalMode,
        openProfileModal,
        activeTasks,
        completedTasks,
        profileModal,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  return React.useContext(TasksContext);
};
