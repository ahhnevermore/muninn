import { getExistingTags } from "./forms.js";
import { activeSidebar, projects, setActiveSidebar, todos } from "./index.js";
import { orderThumbnails } from "./main.js";

export function setupSidebar() {
  document.querySelector(".sidebar").addEventListener("click", (e) => {
    const btn = e.target.closest(".sidebar-item");
    if (!btn) return;

    switchSidebar(btn.dataset.key);
  });

  updateSidebarTagsList();
}

function switchSidebar(item) {
  document.querySelectorAll(".sidebar-item").forEach((el) => el.classList.remove("selected"));

  setActiveSidebar(item);

  const next = document.querySelector(`[data-key="${item}"]`);
  if (next) next.classList.add("selected");

  orderThumbnails();
}

export function updateSidebarTagsList() {
  const projectsDiv = document.querySelector(".projects");
  projectsDiv.replaceChildren();

  const ts = getExistingTags();

  ts.forEach((t) => {
    if (todos.some((todo) => todo.tags.includes(t))) {
      const btn = document.createElement("button");
      btn.classList.add("sidebar-item");
      btn.dataset.key = `tag:${t}`;
      btn.textContent = t;

      projectsDiv.append(btn);
    }
    const active = document.querySelector(`[data-key="${activeSidebar}"]`);
    if (active) active.classList.add("selected");
  });
}
