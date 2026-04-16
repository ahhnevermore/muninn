import { activeSidebar, todos } from "./index.js";
import { openForm, saveTodos } from "./forms.js";

export function setupMain() {
  todos.forEach((e) => {
    createTodoThumbnail(e);
  });
  orderThumbnails();
}

export function updateTodoThumbnail(todo) {
  let div = todo.elem;
  let title = div.querySelector(`.thumb-title`);
  title.textContent = todo.title;
  let project = div.querySelector(`.thumb-project`);
  project.textContent = todo.project;
  let priority = div.querySelector(`.thumb-priority`);
  priority.textContent = todo.priority;
  let due = div.querySelector(`.thumb-due`);
  if (todo.dueDate) {
    let diff = new Date(todo.dueDate) - new Date();
    if (diff > 0) {
      due.textContent = displayDueTime(diff);
      div.classList.remove("overdue");
    } else {
      due.textContent = "Overdue";
      div.classList.add("overdue");
    }
  }
  if (todo.completed) {
    let done = div.querySelector(".thumb-done");
    done.disabled = true;
    done.textContent = "Done!";
    div.classList.add("completed");
  }
}

export function createTodoThumbnail(todo) {
  let main = document.querySelector(".main");
  let div = document.createElement("div");
  div.classList.add("thumbnail");
  div.classList.add("surface", "elev-8");
  div.id = todo.id;

  let title = document.createElement("p");
  title.textContent = todo.title;
  title.classList.add("thumb-title");
  let priority = document.createElement("p");
  priority.textContent = todo.priority;
  priority.classList.add("thumb-priority");
  let project = document.createElement("p");
  project.classList.add("thumb-project");
  project.textContent = todo.project;
  let due = document.createElement("p");
  due.classList.add("thumb-due");
  if (todo.dueDate) {
    let diff = new Date(todo.dueDate) - new Date();
    if (diff > 0) {
      due.textContent = displayDueTime(diff);
    } else {
      due.textContent = "Overdue";
      div.classList.add("overdue");
    }
  } else {
  }
  let done = document.createElement("button");

  done.classList.add("thumb-done");
  if (todo.completed) {
    done.textContent = "Done!";
    done.disabled = true;
    div.classList.add("completed");
  } else {
    done.textContent = "Done";
    done.addEventListener("click", (e) => {
      todo.completed = true;
      saveTodos();
      updateTodoThumbnail(todo);
      orderThumbnails();
    });
  }
  let del = document.createElement("button");
  del.textContent = "Delete";
  del.classList.add("thumb-del");
  del.addEventListener("click", (e) => {
    const index = todos.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      todos.splice(index, 1);
    }
    saveTodos();
    div.remove();
    orderThumbnails();
  });

  div.append(title, project, priority, due, done, del);

  div.addEventListener("click", (e) => {
    if (div.contains(e.target) && !done.contains(e.target) && !del.contains(e.target)) {
      e.stopPropagation();
      let obj = todos.filter((t) => t.id == div.id)[0];
      openForm("edit", obj);
    }
  });
  todo.elem = div;
  main.appendChild(div);
}
const priorityMap = {
  S: 4,
  A: 3,
  B: 2,
  C: 1,
};
function displayDueTime(num) {
  let hours = Math.floor(num / (1000 * 60 * 60));
  let d = Math.floor(hours / 24);
  let h = hours % 24;
  return `Due: ${d}d ${h}h`;
}
export function orderThumbnails() {
  const sorted = [...todos].sort(
    (a, b) =>
      a.completed - b.completed ||
      priorityMap[b.priority] - priorityMap[a.priority] ||
      new Date(a.dueDate || 0) - new Date(b.dueDate || 0) ||
      new Date(b.createdDate) - new Date(a.createdDate),
  );

  let fil = [];

  switch (activeSidebar) {
    case "recent":
      fil = sorted;
      break;

    case "today":
      fil = sorted.filter((t) => isToday(t.dueDate));
      break;

    case "upcoming":
      fil = sorted.filter((t) => isThisWeek(t.dueDate) && !t.completed);
      break;

    default:
      if (activeSidebar.startsWith("tag:")) {
        const tag = activeSidebar.slice(4);
        fil = sorted.filter((t) => t.tags.includes(tag));
      }
  }

  const frag = document.createDocumentFragment();

  fil.forEach((todo) => {
    if (todo.elem) frag.append(todo.elem);
  });

  document.querySelector(".main").replaceChildren(frag);
}

function isToday(dateStr) {
  if (!dateStr) return false;

  const d = new Date(dateStr);
  const today = new Date();

  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;

  const d = new Date(dateStr);
  const today = new Date();

  // Get Monday of this week
  const day = today.getDay(); // 0 (Sun) → 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day; // adjust so Monday is start

  const start = new Date(today);
  start.setDate(today.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return d >= start && d <= end;
}
