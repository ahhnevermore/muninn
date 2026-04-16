import { openForm } from "./forms.js";

export function setupTopBar() {
  let newTodo = document.querySelector("#newTodo");

  newTodo.addEventListener("click", () => {
    openForm("create");
  });
}
