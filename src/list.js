const cardModule = require("./card");
const tools = require("./tools");
const listModule = {
  baseUrl: null,
  setBaseUrl(url) {
    listModule.baseUrl = url;
  },
  addListenerToActions() {
    document
      .querySelector("#addListButton")
      .addEventListener("click", listModule.showAddListModal);
    document.querySelectorAll(".close").forEach((element) => {
      element.addEventListener("click", tools.hideModal);
    });
    document
      .querySelector("#addListModal form")
      .addEventListener("submit", listModule.handleAddListForm);
  },
  showAddListModal() {
    document.querySelector("#addListModal").classList.add("is-active");
  },
  async handleAddListForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    // let result = await fetch(`${app.baseUrl}/lists`, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(tools.formDataToObject(formData)),
    // });
    // result = await result.json();

    let result = await axios({
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      url: `${listModule.baseUrl}/lists`,
      data: JSON.stringify(tools.formDataToObject(formData)),
    });
    result = result.data;
    if (result.error === "ERROR") {
      tools.hideModal();
      return alert(
        `${result.error}\nMessage: ${result.message}\nStack: ${result.stack}\nCode: ${result.code}`
      );
    }
    listModule.makeListInDOM(result);
  },
  makeListInDOM(param) {
    const newList = document.importNode(
      document.querySelector("#templateList").content,
      true
    );
    newList.querySelector("h2").textContent = param.name;

    newList.querySelector(".column").dataset.listId = `${param.id}`;

    newList
      .querySelector(".list-name")
      .addEventListener("dblclick", listModule.toggleEditForm);

    newList
      .querySelector(".list-form-name")
      .addEventListener("submit", listModule.handleEditListForm);

    newList
      .querySelector('.list-form-name input[name="name"]')
      .addEventListener("blur", listModule.toggleEditForm);

    newList
      .querySelector(".delete-list")
      .addEventListener("click", listModule.handleDeleteList);

    newList.querySelector(`form input[name='list_id']`).value = `${param.id}`;

    newList
      .querySelector(".is-pulled-right")
      .addEventListener("click", cardModule.showAddCardModal);
    const children = document
      .querySelector(".card-lists")
      .querySelectorAll(".column");
    const lastChild = children[children.length - 1];
    lastChild.before(newList);

    const list = document.querySelector(".card-lists.columns");
    const sortable = Sortable.create(list);

    tools.hideModal();
  },
  toggleEditForm(e) {
    const elList = e.target.closest(".panel");
    elList.querySelector(".list-name").classList.toggle("is-hidden");
    elList.querySelector(".list-form-name").classList.toggle("is-hidden");
    elList.querySelector('.list-form-name input[name="name"]').focus();
  },
  async handleEditListForm(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const body = tools.formDataToObject(formData);

    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${listModule.baseUrl}/lists/${body.list_id}`,
        data: JSON.stringify(body),
      });
      const data = res.data;
      const elList = e.target.closest(".panel");
      elList.querySelector(".list-name").textContent = data.name;
    } catch (err) {
      console.error(err);
    }
    listModule.toggleEditForm(e);
  },
  async handleDeleteList(event) {
    event.preventDefault();
    const parentList = event.target.closest(".column.is-one-quarter.panel");
    const id = parentList.dataset.listId;
    await axios({
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      url: `${listModule.baseUrl}/lists/${+id}`,
    });
    parentList.remove(parentList);
  },
};

module.exports = listModule;
