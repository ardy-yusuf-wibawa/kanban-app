# Kanban Board Application

A dynamic and interactive Kanban Board application built with vanilla JavaScript and Tailwind CSS. This application allows users to manage tasks across three columns: **To Do**, **In Progress**, and **Done**. It includes features such as adding, editing, deleting tasks, drag-and-drop functionality, overdue task detection with visual indicators, and periodic checks to ensure real-time updates.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [JavaScript Overview](#javascript-overview)
  - [Constants and Selectors](#constants-and-selectors)
  - [State Variables](#state-variables)
  - [Utility Functions](#utility-functions)
  - [Modal Management](#modal-management)
  - [Task Operations](#task-operations)
  - [Checkbox Handling](#checkbox-handling)
  - [Drag and Drop Handling](#drag-and-drop-handling)
  - [Sorting and Overdue Handling](#sorting-and-overdue-handling)
  - [Local Storage Handling](#local-storage-handling)
  - [Done Column Handling](#done-column-handling)
  - [Event Listeners Setup](#event-listeners-setup)
  - [Initialization](#initialization)
- [Visual Indicators for Overdue Tasks](#visual-indicators-for-overdue-tasks)
- [Scheduled Overdue Task Checks](#scheduled-overdue-task-checks)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Task Management:** Add, edit, and delete tasks with descriptions, priorities, and deadlines.
- **Drag-and-Drop:** Easily move tasks between **To Do**, **In Progress**, and **Done** columns.
- **Overdue Detection:** Automatically detect overdue tasks and highlight them with visual indicators.
- **Real-Time Updates:** Periodically checks for overdue tasks every minute to ensure the board remains up-to-date.
- **Persistent Storage:** Tasks are saved in the browser's `localStorage`, ensuring data persists across sessions.
- **Responsive Design:** Optimized for various screen sizes and devices using Tailwind CSS.
- **Accessibility:** Ensures keyboard navigation and ARIA attributes for improved accessibility.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/kanban-board.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd kanban-board
   ```

3. **Install Dependencies:**

   This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. Ensure you have [Node.js](https://nodejs.org/) installed.

   ```bash
   npm install
   ```

4. **Build Tailwind CSS:**

   ```bash
   npx tailwindcss -i ./src/input.css -o ./output.css --watch
   ```

   This command watches for changes in your CSS and rebuilds the `output.css` accordingly.

5. **Open the Application:**

   Simply open the `index.html` file in your preferred web browser.

   ```bash
   open index.html
   ```

   Or, you can use a local development server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for a better development experience.

## Usage

1. **Adding a Task:**
   - Click the **"Add Task"** button in the **To Do** column.
   - Fill in the task description, select priority, and optionally set a deadline.
   - Click **"Add Task"** to save.

2. **Editing a Task:**
   - Click the **edit icon** (🖉) on the task you wish to modify.
   - Update the desired fields in the modal that appears.
   - Click **"Save Changes"** to apply.

3. **Deleting a Task:**
   - Click the **delete icon** (🗑️) on the task you wish to remove.
   - Confirm the deletion in the prompt.

4. **Moving Tasks:**
   - Click and hold a task to drag it to another column.
   - Release to drop it into the desired column.

5. **Handling Overdue Tasks:**
   - Tasks with deadlines past the current time will automatically be highlighted in red.
   - The priority indicator and task title will turn red to signify urgency.
   - The application checks for overdue tasks every minute and updates the UI accordingly.

6. **Managing Done Tasks:**
   - In the **Done** column, select tasks using the checkboxes.
   - Click **"Delete Selected or Clear All"** to remove them.

## Project Structure

```
kanban-board/
│
├── assets/
│   ├── edit.svg
│   ├── trash.svg
│   └── screenshot.png
│
├── src/
│   └── input.css
│
├── output.css
├── index.html
├── script.js
├── package.json
├── package-lock.json
└── README.md
```

- **assets/**: Contains images and icons used in the application.
- **src/input.css**: Tailwind CSS input file.
- **output.css**: Compiled Tailwind CSS output.
- **index.html**: Main HTML file for the application.
- **script.js**: JavaScript logic for the Kanban board.
- **package.json & package-lock.json**: Node.js dependencies and scripts.

## JavaScript Overview

The `script.js` file orchestrates the functionality of the Kanban board. Here's a breakdown of its components:

### Constants and Selectors

Defines all the necessary selectors and priority configurations.

```javascript
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
```

### State Variables

Manages the application's state, such as task IDs and selected tasks.

```javascript
let taskIdCounter = 0;
let selectedTasks = [];
```

### Utility Functions

Helper functions for formatting dates, managing local storage, generating task IDs, and handling errors.

```javascript
function formatDateToLocalInputValue(date) { /* ... */ }
function getStoredTasks() { /* ... */ }
function storeTasks(tasks) { /* ... */ }
function generateTaskId() { /* ... */ }
function displayError(selector, message) { /* ... */ }
function clearError(selector) { /* ... */ }
function toggleModal(selector, show) { /* ... */ }
function getCurrentTimestamp() { /* ... */ }
function validateTaskInput(title, deadline, errorSelector) { /* ... */ }
```

### Modal Management

Handles opening and closing of the **Add Task** and **Edit Task** modals.

```javascript
function openAddTaskModal() { /* ... */ }
function closeAddTaskModal() { /* ... */ }
function openEditTaskModal(taskData) { /* ... */ }
function closeEditTaskModal() { /* ... */ }
function handleModalClick(e) { /* ... */ }
```

### Task Operations

Core functionalities for adding, creating, editing, and deleting tasks.

```javascript
function addTask(e) { /* ... */ }
function createTaskElement(taskData) { /* ... */ }
function deleteTask(taskId) { /* ... */ }
function saveTaskEdits(e) { /* ... */ }
```

### Checkbox Handling

Manages the selection of tasks for batch operations.

```javascript
function handleCheckboxChange(e) { /* ... */ }
```

### Drag and Drop Handling

Enables dragging tasks between columns and updating their statuses accordingly.

```javascript
function handleDragStart(e) { /* ... */ }
function handleDragEnd(e) { /* ... */ }
function handleDragOver(e) { /* ... */ }
function handleDrop(e) { /* ... */ }
function initializeDragAndDrop() { /* ... */ }
```

### Sorting and Overdue Handling

Sorts tasks based on priority and deadline and handles overdue task detection with visual indicators.

```javascript
function sortTasksInColumn(column) { /* ... */ }
function sortAllColumns() { /* ... */ }
function updateOverdueTasks() { /* ... */ }
```

### Local Storage Handling

Ensures tasks persist across browser sessions by saving and loading from `localStorage`.

```javascript
function saveTasksToLocalStorage() { /* ... */ }
function loadTasksFromLocalStorage() { /* ... */ }
```

### Done Column Handling

Manages deletion of tasks in the **Done** column, allowing for both selective and bulk deletions.

```javascript
function handleDoneTasks() { /* ... */ }
```

### Event Listeners Setup

Attaches event listeners to various interactive elements like buttons and forms.

```javascript
function initializeEventListeners() { /* ... */ }
```

### Initialization

Bootstraps the application by setting up event listeners, initializing drag-and-drop, loading tasks, and scheduling overdue checks.

```javascript
function initializeKanbanApp() { /* ... */ }

document.addEventListener("DOMContentLoaded", () => {
  initializeKanbanApp();
});
```

## Visual Indicators for Overdue Tasks

When a task's deadline has passed, the application provides immediate visual feedback:

- **Priority Indicator:** Changes to red to signify high urgency.
- **Task Title:** Turns red to draw attention.
- **Deadline Text:** Appends "(Overdue)" in red.

These changes ensure that users can quickly identify and prioritize overdue tasks.

## Scheduled Overdue Task Checks

To maintain real-time accuracy, the application performs periodic checks for overdue tasks every **1 minute**. This is achieved using JavaScript's `setInterval` function, which invokes the `updateOverdueTasks` function at the specified interval.

### How It Works

1. **Immediate Check:** Upon loading, the application checks for any overdue tasks and updates their visual indicators.
2. **Periodic Checks:** Every minute, the application re-evaluates all tasks to detect newly overdue items.
3. **Scheduler Management:** A flag ensures that only one scheduler runs at any time, preventing multiple intervals from being set accidentally.

### Benefits

- **Real-Time Updates:** Ensures that the Kanban board remains up-to-date without manual refreshes.
- **Enhanced User Experience:** Users are promptly informed of overdue tasks, aiding in effective task management.

## Contributing

Contributions are welcome! If you'd like to enhance the Kanban Board application, please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

   Describe your changes and submit the PR for review.

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Acknowledgements

- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
- Icons from [Heroicons](https://heroicons.com/) or your preferred icon library.

