import { tags, intermediateTodo, todos } from "./index.js";
import { createTodoThumbnail, orderThumbnails, updateTodoThumbnail } from "./main.js";
import { updateProjectsList, updateSidebarTagsList } from "./sidebar.js";
export function setupForms() {
  setupNewForm();
}

let tagOptionButtons = [];
function setupNewForm() {
  const form = document.querySelector("#new-todo-form");
  let tagInput = document.querySelector("#form-tag-search");
  let tagContainer = document.querySelector(".tag-container");
  let newTodo = document.querySelector("#newTodo");

  document.addEventListener("click", (e) => {
    if (form.classList.contains("hidden")) return;
    if (newTodo.contains(e.target)) return;

    if (form.contains(e.target)) {
      if (!(tagInput.contains(e.target) || tagContainer.contains(e.target))) {
        tagContainer.classList.add("hidden");
        return;
      }
    } else {
      form.classList.add("hidden");
    }
  });
  for (let i = 1; i < 6; i++) {
    let fts = document.querySelector("#fts" + i.toString());
    fts.addEventListener("click", (e) => {
      selectTag(fts.textContent);
    });
    tagOptionButtons.push(fts);
  }

  let addTagElem = document.querySelector("#fts-add-tag");
  addTagElem.addEventListener("click", (e) => {
    let val = tagInput.value.trim().toLowerCase();
    if (addTag(val)) {
      selectTag(val);
    }
  });

  tagInput.addEventListener("input", (e) => {
    updateTagSearch(e.target.value.toLowerCase());
  });
  tagInput.addEventListener("click", (e) => {
    updateTagSearch("");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    let update;
    let edit = form.dataset.mode == "edit";
    if (edit) {
      update = todos.find((e) => e.id == intermediateTodo.id);
    } else {
      update = createTodo();
      update.id = crypto.randomUUID();
      todos.push(update);
    }
    update.title = data.get("title").trim();
    update.project = data.get("project").trim();

    update.priority = data.get("priority");
    update.tags = intermediateTodo.tags;
    update.description = data.get("blurb").trim();
    const date = data.get("date");
    const time = data.get("time");
    if (date) {
      const local = `${date}T${time || "00:00"}`;
      const utc = new Date(local).toISOString();
      update.dueDate = utc;
    }
    const now = new Date();
    update.createdDate = now.toISOString();

    if (edit) {
      updateTodoThumbnail(update);
    } else {
      createTodoThumbnail(update);
    }
    updateSidebarTagsList();
    orderThumbnails();
    saveTodos();
    clearForm();

    form.classList.add("hidden");
  });
}

export function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function createTodo() {
  return {
    id: "",
    title: "",
    project: "",
    priority: "",
    tags: [],
    description: "",
    dueDate: "",
    createdDate: "",
    completedDate: "",
    completed: false,
    elem: {},
  };
}

function updateTagSearch(value) {
  let tagContainer = document.querySelector(".tag-container");

  tagContainer.classList.remove("hidden");

  let existing = getExistingTags();

  let tagArray = existing.filter((e) => e.includes(value));

  if (tagArray.length > 0) {
    for (let i = 0; i < 5; i++) {
      if (i < tagArray.length) {
        tagOptionButtons[i].textContent = tagArray[i];
        tagOptionButtons[i].classList.remove("hidden");
      } else {
        tagOptionButtons[i].classList.add("hidden");
      }
    }
  } else {
    for (let i = 0; i < 5; i++) {
      if (i < existing.length) {
        tagOptionButtons[i].textContent = existing[i];
        tagOptionButtons[i].classList.remove("hidden");
      } else {
        tagOptionButtons[i].classList.add("hidden");
      }
    }
  }
}

function displayTag(val) {
  let tagDisplay = document.querySelector(".form-tags");
  let btn = document.createElement("button");
  let sp1 = document.createElement("span");
  let sp2 = document.createElement("span");
  sp1.textContent = val;
  sp2.textContent = "x";
  btn.append(sp1, sp2);
  btn.classList.add("surface", "elev-24");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    intermediateTodo.tags = intermediateTodo.tags.filter((e) => e !== val);
    btn.remove();
  });
  tagDisplay.append(btn);
}

function addTag(val) {
  val = val.trim().toLowerCase(); // ✅ enforce here

  if (val === "") return false;

  if (!tags.arr.some((e) => e === val)) {
    tags.arr.push(val);
    localStorage.setItem("tags", JSON.stringify(tags.arr));
    return true;
  }

  return false;
}

function selectTag(val) {
  let tagInput = document.querySelector("#form-tag-search");
  let tagContainer = document.querySelector(".tag-container");
  let interTagsLen = intermediateTodo.tags.length;
  if (intermediateTodo.tags.some((e) => e == val) || interTagsLen >= 5) {
  } else {
    intermediateTodo.tags.push(val);
    displayTag(val);
    tagInput.value = "";
    if (interTagsLen == 4) {
      tagContainer.classList.add("hidden");
    } else {
      updateTagSearch("");
    }
  }
}
export function getExistingTags() {
  if (tags.startup) {
    const stored = JSON.parse(localStorage.getItem("tags"));
    tags.arr = Array.isArray(stored) ? stored : [];
    tags.startup = false;
  }
  return tags.arr;
}
export function openForm(mode, obj = null) {
  const form = document.querySelector("#new-todo-form");

  form.classList.remove("hidden");
  const formLegend = document.querySelector("#new-todo-form > legend");
  form.dataset.mode = mode;
  if (mode == "create") {
    formLegend.textContent = "Add New Task";
  } else {
    formLegend.textContent = "Edit Task";
  }
  clearForm();
  if (obj) {
    const title = document.querySelector("#form-task-name");
    title.value = obj.title;

    const radios = document.querySelectorAll('input[name="priority"]');
    let val = obj.priority;

    radios.forEach((radio) => {
      radio.checked = radio.value === val;
    });

    const d = new Date(obj.dueDate);
    const dateInput = document.querySelector("#form-task-date");
    const timeInput = document.querySelector("#form-task-time");
    dateInput.value = d.toLocaleDateString("en-CA");
    timeInput.value = d.toTimeString().slice(0, 5);

    const project = document.querySelector("#form-task-project");
    project.value = obj.project;

    const desc = document.querySelector("#form-task-blurb");
    desc.value = obj.description;

    intermediateTodo.id = obj.id;
    intermediateTodo.tags = obj.tags;

    intermediateTodo.tags.forEach((tag) => {
      displayTag(tag);
    });
  }
}

function clearForm() {
  intermediateTodo.id = "";
  intermediateTodo.tags = [];
  let tagDisplay = document.querySelector(".form-tags");
  tagDisplay.replaceChildren();
  const form = document.querySelector("#new-todo-form");
  form.reset();
}
