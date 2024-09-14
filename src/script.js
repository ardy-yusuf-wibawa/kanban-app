// === Constants and Selectors ===
const SELECTORS = {
  modal: "#task-modal",
  editModal: "#edit-modal",
  taskForm: "#task-form",
  editForm: "#edit-form",
  addTaskButton: "#add-task-button",
  deleteDoneButton: "#delete-done-button",
  error: {
    add: "#task-error",
    edit: "#edit-error",
  },
  inputs: {
    title: "#task-title",
    priority: "#task-priority",
    deadline: "#task-deadline",
    editId: "#edit-task-id",
    editTitle: "#edit-task-title",
    editPriority: "#edit-task-priority",
    editDeadline: "#edit-task-deadline",
  },
  columns: {
    todo: "#todo",
    inprogress: "#inprogress",
    done: "#done",
  },
};

const PRIORITY_CLASSES = {
  High: "border-red-500 text-red-500",
  Normal: "border-yellow-500 text-yellow-500",
  Low: "border-green-500 text-green-500",
};

const PRIORITY_ORDER = { High: 1, Normal: 2, Low: 3 };

// === State Variables ===
let taskIdCounter = 0;
let selectedTasks = [];

// === Utility Functions ===

/**
 * Formats a Date object to 'YYYY-MM-DDTHH:MM' suitable for datetime-local inputs.
 * @param {Date} date
 * @returns {string}
 */
function formatDateToLocalInputValue(date) {
  const pad = (num) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Retrieves tasks from localStorage or initializes an empty array.
 * @returns {Array}
 */
function getStoredTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

/**
 * Saves the provided tasks array to localStorage.
 * @param {Array} tasks
 */
function storeTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Generates a unique task ID.
 * @returns {string}
 */
function generateTaskId() {
  return `task-${taskIdCounter++}`;
}

/**
 * Displays an error message in the specified error element.
 * @param {string} selector
 * @param {string} message
 */
function displayError(selector, message) {
  const errorElem = document.querySelector(selector);
  errorElem.textContent = message;
  errorElem.classList.remove("hidden");
}

/**
 * Clears the error message from the specified error element.
 * @param {string} selector
 */
function clearError(selector) {
  const errorElem = document.querySelector(selector);
  errorElem.textContent = "";
  errorElem.classList.add("hidden");
}

/**
 * Toggles the visibility of a modal.
 * @param {string} selector
 * @param {boolean} show
 */
function toggleModal(selector, show) {
  const modal = document.querySelector(selector);
  if (show) {
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

/**
 * Retrieves the current timestamp.
 * @returns {number}
 */
function getCurrentTimestamp() {
  return Date.now();
}

/**
 * Validates the task input fields.
 * @param {string} title
 * @param {string} deadline
 * @param {string} errorSelector
 * @returns {boolean}
 */
function validateTaskInput(title, deadline, errorSelector) {
  if (!title) {
    displayError(errorSelector, "Please enter a task description.");
    return false;
  }

  if (deadline) {
    const deadlineTimestamp = new Date(deadline).getTime();
    if (deadlineTimestamp < getCurrentTimestamp()) {
      displayError(errorSelector, "Deadline cannot be in the past.");
      return false;
    }
  }

  clearError(errorSelector);
  return true;
}

// === Modal Management ===

/**
 * Opens the Add Task modal and initializes input constraints.
 */
function openAddTaskModal() {
  toggleModal(SELECTORS.modal, true);
  clearError(SELECTORS.error.add);

  const deadlineInput = document.querySelector(SELECTORS.inputs.deadline);
  deadlineInput.min = formatDateToLocalInputValue(new Date());
}

/**
 * Closes the Add Task modal and resets the form.
 */
function closeAddTaskModal() {
  toggleModal(SELECTORS.modal, false);
  document.querySelector(SELECTORS.taskForm).reset();
}

/**
 * Opens the Edit Task modal with pre-filled data.
 * @param {Object} taskData
 */
function openEditTaskModal(taskData) {
  toggleModal(SELECTORS.editModal, true);
  clearError(SELECTORS.error.edit);

  const { id, title, priority, deadline } = taskData;

  document.querySelector(SELECTORS.inputs.editId).value = id;
  document.querySelector(SELECTORS.inputs.editTitle).value = title;
  document.querySelector(SELECTORS.inputs.editPriority).value = priority;

  const deadlineInput = document.querySelector(SELECTORS.inputs.editDeadline);
  deadlineInput.min = formatDateToLocalInputValue(new Date());

  deadlineInput.value = deadline
    ? formatDateToLocalInputValue(new Date(deadline))
    : "";
}

/**
 * Closes the Edit Task modal and resets the form.
 */
function closeEditTaskModal() {
  toggleModal(SELECTORS.editModal, false);
  document.querySelector(SELECTORS.editForm).reset();
}

/**
 * Closes a modal if the user clicks outside the modal content.
 * @param {Event} e
 */
function handleModalClick(e) {
  if (e.target.matches(SELECTORS.modal)) {
    closeAddTaskModal();
  } else if (e.target.matches(SELECTORS.editModal)) {
    closeEditTaskModal();
  }
}

// === Task Operations ===

/**
 * Adds a new task to the 'To Do' column.
 * @param {Event} e
 */
function addTask(e) {
  e.preventDefault();

  const title = document.querySelector(SELECTORS.inputs.title).value.trim();
  const priority = document.querySelector(SELECTORS.inputs.priority).value;
  const deadline = document.querySelector(SELECTORS.inputs.deadline).value;

  if (!validateTaskInput(title, deadline, SELECTORS.error.add)) return;

  const taskData = {
    id: generateTaskId(),
    title,
    priority,
    deadline: deadline ? new Date(deadline).getTime() : null,
    created: getCurrentTimestamp(),
    column: "todo",
    position: 0,
  };

  const taskElement = createTaskElement(taskData);
  document.querySelector(SELECTORS.columns.todo).appendChild(taskElement);

  closeAddTaskModal();
  saveTasksToLocalStorage();
  updateOverdueTasks();
  sortTasksInColumn(document.querySelector(SELECTORS.columns.todo));
}

/**
 * Creates a DOM element representing a task.
 * @param {Object} taskData
 * @returns {HTMLElement}
 */
function createTaskElement(taskData) {
  const { id, title, priority, deadline, created } = taskData;

  const task = document.createElement("div");
  task.className = `bg-gray-200 p-2 mt-2 rounded draggable flex items-start border-l-4 ${PRIORITY_CLASSES[priority]}`;
  task.draggable = true;
  task.id = id;
  task.setAttribute("data-priority", priority);
  task.setAttribute("data-deadline", deadline || "");
  task.setAttribute("data-created", created);

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className =
    "form-checkbox h-5 w-5 text-blue-600 rounded-full mt-1 mr-2";
  checkbox.addEventListener("change", handleCheckboxChange);

  // Content Container
  const content = document.createElement("div");
  content.className = "flex-grow";

  // Title
  const titleElem = document.createElement("div");
  titleElem.className = "font-semibold task-title";
  titleElem.textContent = title;

  // Priority
  const priorityElem = document.createElement("div");
  priorityElem.className = `text-sm mt-1 priority ${
    PRIORITY_CLASSES[priority].split(" ")[0]
  }`;
  priorityElem.textContent = `Priority: ${priority}`;

  // Deadline
  const deadlineElem = document.createElement("div");
  deadlineElem.className = "text-xs text-gray-600 mt-1 deadline";
  deadlineElem.textContent = `Deadline: ${
    deadline ? new Date(deadline).toLocaleString() : "No Deadline"
  }`;

  // Created Date
  const createdDateElem = document.createElement("div");
  createdDateElem.className = "text-xs text-gray-500 mt-1";
  createdDateElem.textContent = `Created: ${new Date(
    created
  ).toLocaleString()}`;

  // Icons Container
  const iconsContainer = document.createElement("div");
  iconsContainer.className = "flex items-center mt-2";

  // Edit Button
  const editButton = document.createElement("button");
  editButton.innerHTML = `<img src="./assets/edit.svg" class="h-5 w-5 mr-2" alt="Edit">`;
  editButton.addEventListener("click", () => openEditTaskModal(taskData));

  // Delete Button
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = `<img src="./assets/trash.svg" class="h-5 w-5" alt="Delete">`;
  deleteButton.addEventListener("click", () => deleteTask(id));

  // Assemble Icons
  iconsContainer.appendChild(editButton);
  iconsContainer.appendChild(deleteButton);

  // Assemble Content
  content.appendChild(titleElem);
  content.appendChild(priorityElem);
  content.appendChild(deadlineElem);
  content.appendChild(createdDateElem);
  content.appendChild(iconsContainer);

  // Assemble Task
  task.appendChild(checkbox);
  task.appendChild(content);

  // Drag Events
  task.addEventListener("dragstart", handleDragStart);
  task.addEventListener("dragend", handleDragEnd);

  return task;
}

/**
 * Deletes a task after confirmation.
 * @param {string} taskId
 */
function deleteTask(taskId) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.remove();
  }

  // Update localStorage
  const tasks = getStoredTasks();
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  storeTasks(updatedTasks);

  updateOverdueTasks();
  sortAllColumns();
}

/**
 * Saves edits made to a task.
 * @param {Event} e
 */
function saveTaskEdits(e) {
  e.preventDefault();

  const id = document.querySelector(SELECTORS.inputs.editId).value;
  const title = document.querySelector(SELECTORS.inputs.editTitle).value.trim();
  const priority = document.querySelector(SELECTORS.inputs.editPriority).value;
  const deadline = document.querySelector(SELECTORS.inputs.editDeadline).value;

  if (!validateTaskInput(title, deadline, SELECTORS.error.edit)) return;

  const tasks = getStoredTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    displayError(SELECTORS.error.edit, "Task not found.");
    return;
  }

  // Update task data
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title,
    priority,
    deadline: deadline ? new Date(deadline).getTime() : null,
  };

  storeTasks(tasks);

  // Update DOM
  const updatedTaskElement = createTaskElement(tasks[taskIndex]);
  const oldTaskElement = document.getElementById(id);
  oldTaskElement.replaceWith(updatedTaskElement);

  closeEditTaskModal();
  updateOverdueTasks();
  sortAllColumns();
}

// === Checkbox Handling ===

/**
 * Handles changes to task selection checkboxes.
 * @param {Event} e
 */
function handleCheckboxChange(e) {
  const taskId = e.target.closest(".draggable").id;
  if (e.target.checked) {
    selectedTasks.push(taskId);
  } else {
    selectedTasks = selectedTasks.filter((id) => id !== taskId);
  }
}

// === Drag and Drop Handling ===

/**
 * Handles the start of a drag event.
 * @param {Event} e
 */
function handleDragStart(e) {
  const taskId = e.target.id;
  const dragData = selectedTasks.includes(taskId) ? selectedTasks : [taskId];

  e.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  e.dataTransfer.effectAllowed = "move";

  dragData.forEach((id) => {
    const taskElem = document.getElementById(id);
    taskElem.classList.add("opacity-50");
  });
}

/**
 * Handles the end of a drag event.
 * @param {Event} e
 */
function handleDragEnd(e) {
  document.querySelectorAll(".draggable").forEach((task) => {
    task.classList.remove("opacity-50");
  });
}

/**
 * Allows dropping by preventing default behavior.
 * @param {Event} e
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

/**
 * Handles the drop event, moving tasks to the target column.
 * @param {Event} e
 */
function handleDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData("text/plain");
  const taskIds = JSON.parse(data);
  const dropTarget = e.target.closest(".kanban-column");

  if (!dropTarget) return;

  taskIds.forEach((id) => {
    const task = document.getElementById(id);
    dropTarget.appendChild(task);

    // Update task's column in localStorage
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].column = dropTarget.id; // Ensure lowercase
    }
    storeTasks(tasks);
  });

  // Clear selection and uncheck checkboxes
  taskIds.forEach((id) => {
    const checkbox = document.querySelector(`#${id} input[type="checkbox"]`);
    if (checkbox) {
      checkbox.checked = false;
    }
    selectedTasks = selectedTasks.filter((selectedId) => selectedId !== id);
  });

  updateOverdueTasks();
  sortTasksInColumn(dropTarget);
  saveTasksToLocalStorage();
}

/**
 * Attaches drag and drop event listeners to columns.
 */
function initializeDragAndDrop() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach((column) => {
    column.addEventListener("dragover", handleDragOver);
    column.addEventListener("drop", handleDrop);
  });
}

// === Sorting and Overdue Handling ===

/**
 * Sorts tasks within a specific column based on priority and deadline.
 * @param {HTMLElement} column
 */
function sortTasksInColumn(column) {
  const tasks = Array.from(column.querySelectorAll(".draggable"));

  tasks.sort((a, b) => {
    // Compare priority
    const priorityA = PRIORITY_ORDER[a.getAttribute("data-priority")];
    const priorityB = PRIORITY_ORDER[b.getAttribute("data-priority")];

    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Higher priority first
    }

    // Compare deadlines
    const deadlineA = parseInt(a.getAttribute("data-deadline")) || Infinity;
    const deadlineB = parseInt(b.getAttribute("data-deadline")) || Infinity;

    return deadlineA - deadlineB; // Earlier deadline first
  });

  // Re-append tasks in sorted order
  tasks.forEach((task) => column.appendChild(task));
}

/**
 * Sorts tasks in all columns.
 */
function sortAllColumns() {
  const columns = document.querySelectorAll(".kanban-column");
  columns.forEach(sortTasksInColumn);
}

/**
 * Updates tasks that are overdue by adjusting their priority and location.
 * Also changes the color of priority and title to red.
 * Also triggers a scheduled check for overdue tasks every 1 minute.
 */
function updateOverdueTasks() {
  const now = getCurrentTimestamp();
  const allTasks = document.querySelectorAll(".draggable");
  let hasOverdueTasks = false;

  allTasks.forEach((task) => {
    const deadline = parseInt(task.getAttribute("data-deadline"));
    const currentPriority = task.getAttribute("data-priority");
    const currentColumn = task.parentElement.id;

    if (deadline && deadline < now) {
      hasOverdueTasks = true;

      if (currentPriority !== "High") {
        task.setAttribute("data-priority", "High");
        const priorityElem = task.querySelector(".priority");
        priorityElem.textContent = "Priority: High";
        priorityElem.className = `text-sm mt-1 priority text-red-500 ${
          PRIORITY_CLASSES["High"].split(" ")[0]
        }`;

        task.classList.remove("border-yellow-500", "border-green-500");
        task.classList.add("border-red-500");
      }

      const deadlineElem = task.querySelector(".deadline");
      if (!deadlineElem.textContent.includes("(Overdue)")) {
        deadlineElem.textContent += " (Overdue)";
        deadlineElem.classList.add("text-red-500");
      }

      // Change the title color to red
      const titleElem = task.querySelector(".task-title");
      if (!titleElem.classList.contains("text-red-500")) {
        titleElem.classList.add("text-red-500");
      }

      if (currentColumn === "todo") {
        const inProgressColumn = document.querySelector(
          SELECTORS.columns.inprogress
        ); // Corrected key
        inProgressColumn.appendChild(task);

        // Update task's column in localStorage
        const tasks = getStoredTasks();
        const taskIndex = tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          tasks[taskIndex].column = "inprogress"; // Ensure lowercase
        }
        storeTasks(tasks);
      }
    } else {
      // If the task is no longer overdue, reset colors if necessary
      const deadlineElem = task.querySelector(".deadline");
      if (deadlineElem.textContent.includes("(Overdue)")) {
        deadlineElem.textContent = deadlineElem.textContent.replace(
          " (Overdue)",
          ""
        );
        deadlineElem.classList.remove("text-red-500");
      }

      const titleElem = task.querySelector(".task-title");
      if (titleElem.classList.contains("text-red-500")) {
        titleElem.classList.remove("text-red-500");
      }
    }
  });

  // Save tasks after updates
  storeTasks(getStoredTasks());
  sortAllColumns();

  // Schedule the next overdue task check after 1 minute (60000 ms)
  if (!updateOverdueTasks.schedulerSet) {
    setInterval(updateOverdueTasks, 60000); // 1 minute interval
    updateOverdueTasks.schedulerSet = true; // Prevent multiple intervals
  }

  // Optionally, you can notify the user about overdue tasks
  // if (hasOverdueTasks) {
  //   alert("There are overdue tasks!");
  // }
}

// === Local Storage Handling ===

/**
 * Saves the current state of tasks to localStorage.
 */
function saveTasksToLocalStorage() {
  const tasks = [];
  const columnKeys = Object.keys(SELECTORS.columns);

  columnKeys.forEach((key) => {
    const column = document.querySelector(SELECTORS.columns[key]);
    const taskElements = Array.from(column.querySelectorAll(".draggable"));

    taskElements.forEach((taskElem, index) => {
      tasks.push({
        id: taskElem.id,
        title: taskElem.querySelector(".task-title").textContent,
        priority: taskElem.getAttribute("data-priority"),
        deadline: parseInt(taskElem.getAttribute("data-deadline")) || null,
        created: parseInt(taskElem.getAttribute("data-created")),
        column: key.toLowerCase(), // Ensure lowercase
        position: index,
      });
    });
  });

  storeTasks(tasks);
}

/**
 * Loads tasks from localStorage and renders them in their respective columns.
 */
function loadTasksFromLocalStorage() {
  const tasks = getStoredTasks();

  if (tasks.length > 0) {
    const maxId = Math.max(
      ...tasks.map((task) => parseInt(task.id.replace("task-", "")))
    );
    taskIdCounter = maxId + 1;
  }

  tasks.forEach((taskData) => {
    const taskElement = createTaskElement(taskData);
    const column = document.querySelector(SELECTORS.columns[taskData.column]);
    if (column) {
      column.appendChild(taskElement);
    } else {
      console.warn(
        `Column '${taskData.column}' not found for task '${taskData.id}'.`
      );
    }
  });

  updateOverdueTasks();
  sortAllColumns();
}

// === Done Column Handling ===

/**
 * Handles deletion of tasks in the 'Done' column.
 */
function handleDoneTasks() {
  const doneColumn = document.querySelector(SELECTORS.columns.done);
  const selectedCheckboxes = doneColumn.querySelectorAll(
    '.draggable input[type="checkbox"]:checked'
  );

  if (selectedCheckboxes.length > 0) {
    if (!confirm("Are you sure you want to delete the selected tasks?")) return;

    const selectedTaskIds = Array.from(selectedCheckboxes).map(
      (checkbox) => checkbox.closest(".draggable").id
    );

    // Remove tasks from DOM
    selectedTaskIds.forEach((id) => {
      const taskElem = document.getElementById(id);
      if (taskElem) taskElem.remove();
    });

    // Update localStorage
    const tasks = getStoredTasks();
    const updatedTasks = tasks.filter(
      (task) => !selectedTaskIds.includes(task.id)
    );
    storeTasks(updatedTasks);
  } else {
    if (
      !confirm('No tasks selected. Do you want to clear all tasks in "Done"?')
    )
      return;

    const allTaskElements = Array.from(
      doneColumn.querySelectorAll(".draggable")
    );
    const allTaskIds = allTaskElements.map((task) => task.id);

    // Remove tasks from DOM
    allTaskIds.forEach((id) => {
      const taskElem = document.getElementById(id);
      if (taskElem) taskElem.remove();
    });

    // Update localStorage
    const tasks = getStoredTasks();
    const updatedTasks = tasks.filter((task) => !allTaskIds.includes(task.id));
    storeTasks(updatedTasks);
  }

  updateOverdueTasks();
  sortAllColumns();
}

// === Event Listeners Setup ===

function initializeEventListeners() {
  // Open Add Task Modal
  const addTaskBtn = document.querySelector(SELECTORS.addTaskButton);
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", openAddTaskModal);
  }

  // Close Modals on Overlay Click
  window.addEventListener("click", handleModalClick);

  // Add Task Form Submission
  const taskForm = document.querySelector(SELECTORS.taskForm);
  if (taskForm) {
    taskForm.addEventListener("submit", addTask);
  }

  // Edit Task Form Submission
  const editForm = document.querySelector(SELECTORS.editForm);
  if (editForm) {
    editForm.addEventListener("submit", saveTaskEdits);
  }

  // Delete Done Tasks Button
  const deleteDoneBtn = document.querySelector(SELECTORS.deleteDoneButton);
  if (deleteDoneBtn) {
    deleteDoneBtn.addEventListener("click", handleDoneTasks);
  }

  // Cancel Buttons in Modals
  const cancelAddBtn = document.getElementById("cancel-add-task");
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener("click", closeAddTaskModal);
  }

  const cancelEditBtn = document.getElementById("cancel-edit-task");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", closeEditTaskModal);
  }
}

// === Initialization ===

/**
 * Initializes the Kanban Task Manager application.
 */
function initializeKanbanApp() {
  initializeEventListeners();
  initializeDragAndDrop();
  loadTasksFromLocalStorage();

  // Schedule the first overdue task check immediately
  updateOverdueTasks();
}

/**
 * Handles closing modals when clicking outside the modal content.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeKanbanApp();
});
