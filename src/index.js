import style from "./style/style.css";
import topbar from "./style/topbar.css";
import sidebar from "./style/sidebar.css";
import forms from "./style/forms.css";
import main from "./style/main.css";
import { setupSidebar } from "./sidebar.js";
import { setupTopBar } from "./topbar.js";
import { setupForms } from "./forms.js";
import { setupMain } from "./main.js";

export let tags = {
  arr: [],
  startup: true,
};

export let intermediateTodo = {
  tags: [],
  id: "",
};

export let activeSidebar = "recent";
export function setActiveSidebar(val) {
  activeSidebar = val;
}
let raw;
try {
  raw = JSON.parse(localStorage.getItem("todos"));
} catch {
  raw = null;
}
export let todos = raw != null ? raw : [];

(() => {
  setupTopBar();
  setupForms();
  setupMain();
  setupSidebar();
})();
