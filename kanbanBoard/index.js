const todo = document.querySelector("#todo");
const progress = document.querySelector("#progress");
const done = document.querySelector("#done");

let dragElement = null;

// NEW: EDIT MODE VARIABLES
let editMode = false;
let taskBeingEdited = null;

/* ------------ COUNT FUNCTION ------------ */
function updateCount() {
    todo.querySelector(".right").innerText =
        todo.querySelectorAll(".task").length;

    progress.querySelector(".right").innerText =
        progress.querySelectorAll(".task").length;

    done.querySelector(".right").innerText =
        done.querySelectorAll(".task").length;
}

/* ------------ LOAD TASKS FROM LOCAL STORAGE ------------ */
window.onload = () => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const defaultTask = todo.querySelector(".task");
    if (savedTasks.length > 0 && defaultTask) {
        defaultTask.remove();
    }

    savedTasks.forEach(t => createTask(t.title, t.desc, t.column, false));
    updateCount();
};

/* ------------ SAVE TASKS ------------ */
function saveTasks() {
    const allTasks = [];

    document.querySelectorAll(".task").forEach(task => {
        allTasks.push({
            title: task.querySelector("h2").innerText,
            desc: task.querySelector("p").innerText,
            column: task.parentElement.id
        });
    });

    localStorage.setItem("tasks", JSON.stringify(allTasks));
}

/* ------------ DRAG LOGIC ------------ */
function addDragEventsOnColumn(column) {
    column.addEventListener("dragover", e => {
        e.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("hover-over");
    });

    column.addEventListener("drop", () => {
        column.append(dragElement);
        column.classList.remove("hover-over");
        saveTasks();
        updateCount();
    });
}

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

/* ------------ CREATE TASK FUNCTION ------------ */
function createTask(title, desc, column, save = true) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    div.innerHTML = `
        <h2>${title}</h2>
        <p>${desc}</p>
        <div class="task-buttons">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
        </div>
    `;

    // DRAG LOGIC
    div.addEventListener("drag", () => {
        dragElement = div;
    });

    // DELETE LOGIC
    div.querySelector(".delete").addEventListener("click", () => {
        div.remove();
        saveTasks();
        updateCount();
    });

    // CLEAN & FIXED EDIT LOGIC
    div.querySelector(".edit").addEventListener("click", () => {
        const titleInput = document.querySelector("#task-title-input");
        const descInput = document.querySelector("#task-desc-input");

        editMode = true;
        taskBeingEdited = div;

        titleInput.value = div.querySelector("h2").innerText;
        descInput.value = div.querySelector("p").innerText;

        addTaskButton.innerText = "Save Changes";
        modal.classList.add("active");
    });

    // Append to correct column
    if (column === "progress") progress.appendChild(div);
    else if (column === "done") done.appendChild(div);
    else todo.appendChild(div);

    if (save) saveTasks();
    updateCount();
}

/* ------------ MODAL LOGIC ------------ */
const toggleModalButton = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-task-btn");

toggleModalButton.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});

/* ------------ ADD / SAVE TASK BUTTON ------------ */
addTaskButton.addEventListener("click", () => {
    const title = document.querySelector("#task-title-input").value.trim();
    const desc = document.querySelector("#task-desc-input").value.trim();

    if (!title) {
        alert("Please enter task title!");
        return;
    }

    if (editMode) {
        // SAVE EDITED TASK
        taskBeingEdited.querySelector("h2").innerText = title;
        taskBeingEdited.querySelector("p").innerText = desc;

        saveTasks();
        updateCount();

        editMode = false;
        taskBeingEdited = null;
        addTaskButton.innerText = "Add Task";

    } else {
        // ADD NEW TASK
        createTask(title, desc, "todo", true);
    }

    document.querySelector("#task-title-input").value = "";
    document.querySelector("#task-desc-input").value = "";

    modal.classList.remove("active");
});
