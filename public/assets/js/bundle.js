(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const cardModule = require("./card");
const labelModule = require("./label");
const listModule = require("./list");
const tools = require("./tools");
const app = {
  baseUrl: "http://localhost:5000",
  init() {
    app.addListenerToActions();
    app.setBaseUrl();
    app.getInitialDataFromAPI();
  },

  addListenerToActions() {
    listModule.addListenerToActions();
    cardModule.addListenerToActions();
    labelModule.addListenerToActions();
  },

  async getInitialDataFromAPI() {
    const container = document.querySelector(".columns.labels");
    const lists = await axios.get(`${app.baseUrl}/lists`);
    lists.data.forEach((element) => {
      listModule.makeListInDOM(element);
      element.cards.forEach((elem) => {
        cardModule.makeCardInDOM(elem);
        const cardAppended = document.querySelector(
          `.box[data-card-id="${elem.id}"]`
        );
        elem.labels.forEach((label) => {
          labelModule.makeLabelInDOM(
            label,
            ".label-in-card-template",
            cardAppended.querySelector(".columns .parent-div")
          );
        });
      });
    });
    const labels = await tools.getLabels();
    labels.forEach((element) => {
      labelModule.makeLabelInDOM(element, "#labelTemplate", container);
    });
  },
  setBaseUrl() {
    cardModule.setBaseUrl(app.baseUrl);
    listModule.setBaseUrl(app.baseUrl);
    labelModule.setBaseUrl(app.baseUrl);
    tools.setBaseUrl(app.baseUrl);
  },
};

document.addEventListener("DOMContentLoaded", app.init);

},{"./card":2,"./label":3,"./list":4,"./tools":5}],2:[function(require,module,exports){
const labelModule = require("./label");
const tools = require("./tools");
const cardModule = {
  baseUrl: null,
  setBaseUrl(url) {
    cardModule.baseUrl = url;
  },
  addListenerToActions() {
    document.querySelectorAll(".is-pulled-right").forEach((element) => {
      element.addEventListener("click", cardModule.showAddCardModal);
    });
    document.querySelectorAll(".close").forEach((element) => {
      element.addEventListener("click", tools.hideModal);
    });
    document
      .querySelector("#addCardModal form")
      .addEventListener("submit", cardModule.handleAddCardForm);
  },
  showAddCardModal(event) {
    document.querySelector("#addCardModal").classList.add("is-active");

    const elList = event.target.closest(".panel");
    const listId = elList.getAttribute("data-list-id");

    document
      .querySelector("#addCardModal")
      .querySelector('input[name="list_id"]').value = listId;
  },

  async handleAddCardForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    // let result = await fetch(`${cardModule.baseUrl}/cards`, {
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
      url: `${cardModule.baseUrl}/cards`,
      data: JSON.stringify(tools.formDataToObject(formData)),
    });
    result = result.data;

    if (result.error === "ERROR") {
      tools.hideModal();
      return alert(
        `${result.error}\nMessage: ${result.message}\nStack: ${result.stack}\nCode: ${result.code}`
      );
    }
    cardModule.makeCardInDOM(result);
  },
  async makeCardInDOM(param) {
    const newCard = document.importNode(
      document.querySelector("#cardTemplate").content,
      true
    );
    newCard.querySelector(".card-name").textContent = param.name;

    newCard.querySelector(".box").style.borderLeft = "0.3rem solid";
    newCard.querySelector(".box").style.borderLeftColor = param.color;
    newCard.querySelector(".box").dataset.cardId = `${param.id}`;
    newCard.querySelector(".column").dataset.cardId = `${param.id}`;
    newCard.querySelector('input[name="card-id"]').value = param.id;
    newCard.querySelector('input[name="color"]').value = param.color;

    //? NAME
    newCard
      .querySelector(".edit-button")
      .addEventListener("click", cardModule.toggleEditForm);

    newCard
      .querySelector(".card-form-name")
      .addEventListener("submit", cardModule.handleEditCardForm);

    // newCard
    //   .querySelector('.card-form-name input[name="name"]')
    //   .addEventListener("blur", cardModule.toggleEditForm);
    //? NAME

    //? COLOR
    newCard
      .querySelector(".color-button")
      .addEventListener("click", cardModule.toggleColorForm);

    newCard
      .querySelector(".card-form-color")
      .addEventListener("submit", cardModule.handleEditColorForm);

    // newCard
    //   .querySelector('.card-form-color input[name="color"]')
    //   .addEventListener("blur", cardModule.toggleColorForm);

    //? COLOR

    //? LABEL
    newCard
      .querySelector(".label-button")
      .addEventListener("click", cardModule.toggleLabelForm);

    newCard
      .querySelector(".card-form-label")
      .addEventListener("submit", cardModule.handleEditLabelForm);

    //? LABEL

    //? DELETE
    newCard
      .querySelector(".delete-button")
      .addEventListener("click", cardModule.handleDeleteCard);
    //? DELETE

    const theGoodList = document.querySelector(
      `[data-list-id='${param.list_id}']`
    );
    theGoodList.querySelector(".panel-block").appendChild(newCard);

    // //? DRAG

    // const cardContainer = theGoodList.querySelector(
    //   ".panel-block.is-block.has-background-light"
    // );
    // const sortable = Sortable.create(cardContainer);

    // //? DRAG

    tools.hideModal();
  },
  toggleEditForm: (e) => {
    const elCard = e.target.closest(".box");
    elCard.querySelector(".card-name").classList.toggle("is-hidden");
    elCard.querySelector(".card-form-name").classList.toggle("is-hidden");
    elCard.querySelector('.card-form-name input[name="name"]').focus();
  },
  handleEditCardForm: async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${cardModule.baseUrl}/cards/${+formData.get("card-id")}`,
        data: JSON.stringify(tools.formDataToObject(formData)),
      });
      const data = res.data;

      const elCard = e.target.closest(".box");

      elCard.querySelector(".card-name").textContent = data.name;
    } catch (err) {
      console.log(err);
    }

    cardModule.toggleEditForm(e);
  },
  async handleDeleteCard(event) {
    event.preventDefault();
    const parentCard = event.target.closest(".box");
    const id = parentCard.dataset.cardId;
    try {
      await axios({
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${cardModule.baseUrl}/cards/${+id}`,
      });
      parentCard.remove(parentCard);
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer la carte !");
    }
  },
  toggleColorForm(e) {
    const elCard = e.target.closest(".box");
    elCard.querySelector(".card-name").classList.toggle("is-hidden");
    elCard.querySelector(".card-form-color").classList.toggle("is-hidden");
    // elCard.querySelector('.card-form-color input[name="color"]').focus();
  },
  async handleEditColorForm(e) {
    e.preventDefault();
    const parentCard = e.target.closest(".box");
    const id = parentCard.dataset.cardId;
    const formData = new FormData(e.target);
    try {
      const res = await axios({
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${cardModule.baseUrl}/cards/${+id}`,
        data: JSON.stringify(tools.formDataToObject(formData)),
      });
      const data = res.data;
      parentCard.style.borderLeftColor = data.color;
    } catch (err) {
      console.log(err);
    }

    cardModule.toggleColorForm(e);
  },
  async toggleLabelForm(e) {
    const elCard = e.target.closest(".box");
    elCard.querySelector(".card-name").classList.toggle("is-hidden");
    elCard.querySelector(".card-form-label").classList.toggle("is-hidden");
    elCard.querySelector("#label-select").textContent = "";
    try {
      const result = await tools.getLabels();
      result.forEach((element) => {
        const label = document.importNode(
          document.querySelector(".label-card-template").content,
          true
        );
        elCard.querySelector(".label-color").value = element.color;
        label.querySelector("option").value = element.id;
        label.querySelector("option").textContent = element.name;
        elCard.querySelector("#label-select").appendChild(label);
      });
    } catch (err) {
      console.log(err);
    }
  },
  async handleEditLabelForm(e) {
    e.preventDefault();
    const parentCard = e.target.closest(".box");
    const id = parentCard.dataset.cardId;
    const formData = new FormData(e.target);
    try {
      const res = await axios({
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${cardModule.baseUrl}/cards/${+id}/label`,
        data: JSON.stringify(tools.formDataToObject(formData)),
      });
      const data = res.data;
      labelModule.makeLabelInDOM(
        data,
        ".label-in-card-template",
        parentCard.querySelector(".columns .parent-div")
      );
    } catch (err) {
      console.log(err);
    }

    cardModule.toggleLabelForm(e);
  },
};

module.exports = cardModule;

},{"./label":3,"./tools":5}],3:[function(require,module,exports){
const tools = require("./tools");
const labelModule = {
  baseUrl: null,
  setBaseUrl(url) {
    labelModule.baseUrl = url;
  },
  addListenerToActions() {
    document
      .querySelector("#addLabelButton")
      .addEventListener("click", labelModule.showAddLabelModal);
    document
      .querySelector("#addLabelModal form")
      .addEventListener("submit", labelModule.handleAddLabelForm);
  },
  showAddLabelModal() {
    document.querySelector("#addLabelModal").classList.add("is-active");
  },

  async handleAddLabelForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    let result = await axios({
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      url: `${labelModule.baseUrl}/labels`,
      data: JSON.stringify(tools.formDataToObject(formData)),
    });
    result = result.data;
    if (result.error === "ERROR") {
      tools.hideModal();
      return alert(
        `${result.error}\nMessage: ${result.message}\nStack: ${result.stack}\nCode: ${result.code}`
      );
    }
    labelModule.makeLabelInDOM(
      result,
      "#labelTemplate",
      document.querySelector(".columns.labels")
    );
  },
  makeLabelInDOM(param, template, container) {
    const newLabel = document.importNode(
      document.querySelector(template).content,
      true
    );
    newLabel.querySelector(".tag").dataset.labelId = `${param.id}`;
    newLabel.querySelector(".label-name").textContent = param.name;
    newLabel.querySelector(".tag").style.borderLeft = "0.3rem solid";
    newLabel.querySelector(".tag").style.borderLeftColor = param.color;

    if (template === "#labelTemplate") {
      newLabel
        .querySelector(".delete")
        .addEventListener("click", labelModule.handleDelete);
    }
    if (template === ".label-in-card-template") {
      newLabel
        .querySelector(".cardlabeldelete")
        .addEventListener("click", labelModule.handleAssociationDelete);
    }

    container.appendChild(newLabel);

    tools.hideModal();
  },
  async handleDelete(e) {
    const parentLabel = e.target.closest(".tag");
    const id = parentLabel.dataset.labelId;
    try {
      await axios({
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${labelModule.baseUrl}/labels/${+id}`,
      });
      parentLabel.remove(parentLabel);
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le label !");
    }
  },
  async handleAssociationDelete(e) {
    e.preventDefault();
    const parentLabel = e.target.closest(".tag");
    const labelId = parentLabel.dataset.labelId;
    const parentCard = e.target.closest(".box");
    const parentId = parentCard.dataset.cardId;
    try {
      await axios({
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        url: `${labelModule.baseUrl}/cards/${parentId}/label/${labelId}`,
      });
      parentLabel.remove(parentLabel);
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le label !");
    }
  },
};

module.exports = labelModule;

},{"./tools":5}],4:[function(require,module,exports){
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

},{"./card":2,"./tools":5}],5:[function(require,module,exports){
const tools = {
  baseUrl: null,
  setBaseUrl(url) {
    tools.baseUrl = url;
  },
  hideModal() {
    document
      .querySelectorAll(".modal.is-active")
      .forEach((element) => element.classList.remove("is-active"));
  },

  formDataToObject(formData) {
    let obj = {};
    formData.forEach((value, key) => (obj[key] = value));

    return obj;
  },
  async getLabels() {
    try {
      const result = await axios.get(`${tools.baseUrl}/labels`);
      return result.data;
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = tools;
// npx browserify -e src/app.js -o assets/js/bundle.js

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NhcmQuanMiLCJzcmMvbGFiZWwuanMiLCJzcmMvbGlzdC5qcyIsInNyYy90b29scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FyZE1vZHVsZSA9IHJlcXVpcmUoXCIuL2NhcmRcIik7XG5jb25zdCBsYWJlbE1vZHVsZSA9IHJlcXVpcmUoXCIuL2xhYmVsXCIpO1xuY29uc3QgbGlzdE1vZHVsZSA9IHJlcXVpcmUoXCIuL2xpc3RcIik7XG5jb25zdCB0b29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzXCIpO1xuY29uc3QgYXBwID0ge1xuICBiYXNlVXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6NTAwMFwiLFxuICBpbml0KCkge1xuICAgIGFwcC5hZGRMaXN0ZW5lclRvQWN0aW9ucygpO1xuICAgIGFwcC5zZXRCYXNlVXJsKCk7XG4gICAgYXBwLmdldEluaXRpYWxEYXRhRnJvbUFQSSgpO1xuICB9LFxuXG4gIGFkZExpc3RlbmVyVG9BY3Rpb25zKCkge1xuICAgIGxpc3RNb2R1bGUuYWRkTGlzdGVuZXJUb0FjdGlvbnMoKTtcbiAgICBjYXJkTW9kdWxlLmFkZExpc3RlbmVyVG9BY3Rpb25zKCk7XG4gICAgbGFiZWxNb2R1bGUuYWRkTGlzdGVuZXJUb0FjdGlvbnMoKTtcbiAgfSxcblxuICBhc3luYyBnZXRJbml0aWFsRGF0YUZyb21BUEkoKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb2x1bW5zLmxhYmVsc1wiKTtcbiAgICBjb25zdCBsaXN0cyA9IGF3YWl0IGF4aW9zLmdldChgJHthcHAuYmFzZVVybH0vbGlzdHNgKTtcbiAgICBsaXN0cy5kYXRhLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGxpc3RNb2R1bGUubWFrZUxpc3RJbkRPTShlbGVtZW50KTtcbiAgICAgIGVsZW1lbnQuY2FyZHMuZm9yRWFjaCgoZWxlbSkgPT4ge1xuICAgICAgICBjYXJkTW9kdWxlLm1ha2VDYXJkSW5ET00oZWxlbSk7XG4gICAgICAgIGNvbnN0IGNhcmRBcHBlbmRlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgYC5ib3hbZGF0YS1jYXJkLWlkPVwiJHtlbGVtLmlkfVwiXWBcbiAgICAgICAgKTtcbiAgICAgICAgZWxlbS5sYWJlbHMuZm9yRWFjaCgobGFiZWwpID0+IHtcbiAgICAgICAgICBsYWJlbE1vZHVsZS5tYWtlTGFiZWxJbkRPTShcbiAgICAgICAgICAgIGxhYmVsLFxuICAgICAgICAgICAgXCIubGFiZWwtaW4tY2FyZC10ZW1wbGF0ZVwiLFxuICAgICAgICAgICAgY2FyZEFwcGVuZGVkLnF1ZXJ5U2VsZWN0b3IoXCIuY29sdW1ucyAucGFyZW50LWRpdlwiKVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgbGFiZWxzID0gYXdhaXQgdG9vbHMuZ2V0TGFiZWxzKCk7XG4gICAgbGFiZWxzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGxhYmVsTW9kdWxlLm1ha2VMYWJlbEluRE9NKGVsZW1lbnQsIFwiI2xhYmVsVGVtcGxhdGVcIiwgY29udGFpbmVyKTtcbiAgICB9KTtcbiAgfSxcbiAgc2V0QmFzZVVybCgpIHtcbiAgICBjYXJkTW9kdWxlLnNldEJhc2VVcmwoYXBwLmJhc2VVcmwpO1xuICAgIGxpc3RNb2R1bGUuc2V0QmFzZVVybChhcHAuYmFzZVVybCk7XG4gICAgbGFiZWxNb2R1bGUuc2V0QmFzZVVybChhcHAuYmFzZVVybCk7XG4gICAgdG9vbHMuc2V0QmFzZVVybChhcHAuYmFzZVVybCk7XG4gIH0sXG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBhcHAuaW5pdCk7XG4iLCJjb25zdCBsYWJlbE1vZHVsZSA9IHJlcXVpcmUoXCIuL2xhYmVsXCIpO1xuY29uc3QgdG9vbHMgPSByZXF1aXJlKFwiLi90b29sc1wiKTtcbmNvbnN0IGNhcmRNb2R1bGUgPSB7XG4gIGJhc2VVcmw6IG51bGwsXG4gIHNldEJhc2VVcmwodXJsKSB7XG4gICAgY2FyZE1vZHVsZS5iYXNlVXJsID0gdXJsO1xuICB9LFxuICBhZGRMaXN0ZW5lclRvQWN0aW9ucygpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmlzLXB1bGxlZC1yaWdodFwiKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYXJkTW9kdWxlLnNob3dBZGRDYXJkTW9kYWwpO1xuICAgIH0pO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2xvc2VcIikuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdG9vbHMuaGlkZU1vZGFsKTtcbiAgICB9KTtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIjYWRkQ2FyZE1vZGFsIGZvcm1cIilcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGNhcmRNb2R1bGUuaGFuZGxlQWRkQ2FyZEZvcm0pO1xuICB9LFxuICBzaG93QWRkQ2FyZE1vZGFsKGV2ZW50KSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhZGRDYXJkTW9kYWxcIikuY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcblxuICAgIGNvbnN0IGVsTGlzdCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLnBhbmVsXCIpO1xuICAgIGNvbnN0IGxpc3RJZCA9IGVsTGlzdC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWxpc3QtaWRcIik7XG5cbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIjYWRkQ2FyZE1vZGFsXCIpXG4gICAgICAucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImxpc3RfaWRcIl0nKS52YWx1ZSA9IGxpc3RJZDtcbiAgfSxcblxuICBhc3luYyBoYW5kbGVBZGRDYXJkRm9ybShldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KTtcblxuICAgIC8vIGxldCByZXN1bHQgPSBhd2FpdCBmZXRjaChgJHtjYXJkTW9kdWxlLmJhc2VVcmx9L2NhcmRzYCwge1xuICAgIC8vICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAvLyAgIGhlYWRlcnM6IHtcbiAgICAvLyAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAvLyAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgLy8gICB9LFxuICAgIC8vICAgYm9keTogSlNPTi5zdHJpbmdpZnkodG9vbHMuZm9ybURhdGFUb09iamVjdChmb3JtRGF0YSkpLFxuICAgIC8vIH0pO1xuICAgIC8vIHJlc3VsdCA9IGF3YWl0IHJlc3VsdC5qc29uKCk7XG5cbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgYXhpb3Moe1xuICAgICAgbWV0aG9kOiBcInBvc3RcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICB9LFxuICAgICAgdXJsOiBgJHtjYXJkTW9kdWxlLmJhc2VVcmx9L2NhcmRzYCxcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRvb2xzLmZvcm1EYXRhVG9PYmplY3QoZm9ybURhdGEpKSxcbiAgICB9KTtcbiAgICByZXN1bHQgPSByZXN1bHQuZGF0YTtcblxuICAgIGlmIChyZXN1bHQuZXJyb3IgPT09IFwiRVJST1JcIikge1xuICAgICAgdG9vbHMuaGlkZU1vZGFsKCk7XG4gICAgICByZXR1cm4gYWxlcnQoXG4gICAgICAgIGAke3Jlc3VsdC5lcnJvcn1cXG5NZXNzYWdlOiAke3Jlc3VsdC5tZXNzYWdlfVxcblN0YWNrOiAke3Jlc3VsdC5zdGFja31cXG5Db2RlOiAke3Jlc3VsdC5jb2RlfWBcbiAgICAgICk7XG4gICAgfVxuICAgIGNhcmRNb2R1bGUubWFrZUNhcmRJbkRPTShyZXN1bHQpO1xuICB9LFxuICBhc3luYyBtYWtlQ2FyZEluRE9NKHBhcmFtKSB7XG4gICAgY29uc3QgbmV3Q2FyZCA9IGRvY3VtZW50LmltcG9ydE5vZGUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NhcmRUZW1wbGF0ZVwiKS5jb250ZW50LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgbmV3Q2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtbmFtZVwiKS50ZXh0Q29udGVudCA9IHBhcmFtLm5hbWU7XG5cbiAgICBuZXdDYXJkLnF1ZXJ5U2VsZWN0b3IoXCIuYm94XCIpLnN0eWxlLmJvcmRlckxlZnQgPSBcIjAuM3JlbSBzb2xpZFwiO1xuICAgIG5ld0NhcmQucXVlcnlTZWxlY3RvcihcIi5ib3hcIikuc3R5bGUuYm9yZGVyTGVmdENvbG9yID0gcGFyYW0uY29sb3I7XG4gICAgbmV3Q2FyZC5xdWVyeVNlbGVjdG9yKFwiLmJveFwiKS5kYXRhc2V0LmNhcmRJZCA9IGAke3BhcmFtLmlkfWA7XG4gICAgbmV3Q2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNvbHVtblwiKS5kYXRhc2V0LmNhcmRJZCA9IGAke3BhcmFtLmlkfWA7XG4gICAgbmV3Q2FyZC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiY2FyZC1pZFwiXScpLnZhbHVlID0gcGFyYW0uaWQ7XG4gICAgbmV3Q2FyZC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtuYW1lPVwiY29sb3JcIl0nKS52YWx1ZSA9IHBhcmFtLmNvbG9yO1xuXG4gICAgLy8/IE5BTUVcbiAgICBuZXdDYXJkXG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5lZGl0LWJ1dHRvblwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYXJkTW9kdWxlLnRvZ2dsZUVkaXRGb3JtKTtcblxuICAgIG5ld0NhcmRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtZm9ybS1uYW1lXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBjYXJkTW9kdWxlLmhhbmRsZUVkaXRDYXJkRm9ybSk7XG5cbiAgICAvLyBuZXdDYXJkXG4gICAgLy8gICAucXVlcnlTZWxlY3RvcignLmNhcmQtZm9ybS1uYW1lIGlucHV0W25hbWU9XCJuYW1lXCJdJylcbiAgICAvLyAgIC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBjYXJkTW9kdWxlLnRvZ2dsZUVkaXRGb3JtKTtcbiAgICAvLz8gTkFNRVxuXG4gICAgLy8/IENPTE9SXG4gICAgbmV3Q2FyZFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuY29sb3ItYnV0dG9uXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhcmRNb2R1bGUudG9nZ2xlQ29sb3JGb3JtKTtcblxuICAgIG5ld0NhcmRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtZm9ybS1jb2xvclwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgY2FyZE1vZHVsZS5oYW5kbGVFZGl0Q29sb3JGb3JtKTtcblxuICAgIC8vIG5ld0NhcmRcbiAgICAvLyAgIC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1mb3JtLWNvbG9yIGlucHV0W25hbWU9XCJjb2xvclwiXScpXG4gICAgLy8gICAuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgY2FyZE1vZHVsZS50b2dnbGVDb2xvckZvcm0pO1xuXG4gICAgLy8/IENPTE9SXG5cbiAgICAvLz8gTEFCRUxcbiAgICBuZXdDYXJkXG4gICAgICAucXVlcnlTZWxlY3RvcihcIi5sYWJlbC1idXR0b25cIilcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2FyZE1vZHVsZS50b2dnbGVMYWJlbEZvcm0pO1xuXG4gICAgbmV3Q2FyZFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1mb3JtLWxhYmVsXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBjYXJkTW9kdWxlLmhhbmRsZUVkaXRMYWJlbEZvcm0pO1xuXG4gICAgLy8/IExBQkVMXG5cbiAgICAvLz8gREVMRVRFXG4gICAgbmV3Q2FyZFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuZGVsZXRlLWJ1dHRvblwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjYXJkTW9kdWxlLmhhbmRsZURlbGV0ZUNhcmQpO1xuICAgIC8vPyBERUxFVEVcblxuICAgIGNvbnN0IHRoZUdvb2RMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgIGBbZGF0YS1saXN0LWlkPScke3BhcmFtLmxpc3RfaWR9J11gXG4gICAgKTtcbiAgICB0aGVHb29kTGlzdC5xdWVyeVNlbGVjdG9yKFwiLnBhbmVsLWJsb2NrXCIpLmFwcGVuZENoaWxkKG5ld0NhcmQpO1xuXG4gICAgLy8gLy8/IERSQUdcblxuICAgIC8vIGNvbnN0IGNhcmRDb250YWluZXIgPSB0aGVHb29kTGlzdC5xdWVyeVNlbGVjdG9yKFxuICAgIC8vICAgXCIucGFuZWwtYmxvY2suaXMtYmxvY2suaGFzLWJhY2tncm91bmQtbGlnaHRcIlxuICAgIC8vICk7XG4gICAgLy8gY29uc3Qgc29ydGFibGUgPSBTb3J0YWJsZS5jcmVhdGUoY2FyZENvbnRhaW5lcik7XG5cbiAgICAvLyAvLz8gRFJBR1xuXG4gICAgdG9vbHMuaGlkZU1vZGFsKCk7XG4gIH0sXG4gIHRvZ2dsZUVkaXRGb3JtOiAoZSkgPT4ge1xuICAgIGNvbnN0IGVsQ2FyZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuYm94XCIpO1xuICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtbmFtZVwiKS5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtaGlkZGVuXCIpO1xuICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtZm9ybS1uYW1lXCIpLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1oaWRkZW5cIik7XG4gICAgZWxDYXJkLnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvcm0tbmFtZSBpbnB1dFtuYW1lPVwibmFtZVwiXScpLmZvY3VzKCk7XG4gIH0sXG4gIGhhbmRsZUVkaXRDYXJkRm9ybTogYXN5bmMgKGUpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShlLnRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIlBBVENIXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICB1cmw6IGAke2NhcmRNb2R1bGUuYmFzZVVybH0vY2FyZHMvJHsrZm9ybURhdGEuZ2V0KFwiY2FyZC1pZFwiKX1gLFxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0b29scy5mb3JtRGF0YVRvT2JqZWN0KGZvcm1EYXRhKSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YTtcblxuICAgICAgY29uc3QgZWxDYXJkID0gZS50YXJnZXQuY2xvc2VzdChcIi5ib3hcIik7XG5cbiAgICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtbmFtZVwiKS50ZXh0Q29udGVudCA9IGRhdGEubmFtZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxuXG4gICAgY2FyZE1vZHVsZS50b2dnbGVFZGl0Rm9ybShlKTtcbiAgfSxcbiAgYXN5bmMgaGFuZGxlRGVsZXRlQ2FyZChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgcGFyZW50Q2FyZCA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLmJveFwiKTtcbiAgICBjb25zdCBpZCA9IHBhcmVudENhcmQuZGF0YXNldC5jYXJkSWQ7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgdXJsOiBgJHtjYXJkTW9kdWxlLmJhc2VVcmx9L2NhcmRzLyR7K2lkfWAsXG4gICAgICB9KTtcbiAgICAgIHBhcmVudENhcmQucmVtb3ZlKHBhcmVudENhcmQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgYWxlcnQoXCJJbXBvc3NpYmxlIGRlIHN1cHByaW1lciBsYSBjYXJ0ZSAhXCIpO1xuICAgIH1cbiAgfSxcbiAgdG9nZ2xlQ29sb3JGb3JtKGUpIHtcbiAgICBjb25zdCBlbENhcmQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLmJveFwiKTtcbiAgICBlbENhcmQucXVlcnlTZWxlY3RvcihcIi5jYXJkLW5hbWVcIikuY2xhc3NMaXN0LnRvZ2dsZShcImlzLWhpZGRlblwiKTtcbiAgICBlbENhcmQucXVlcnlTZWxlY3RvcihcIi5jYXJkLWZvcm0tY29sb3JcIikuY2xhc3NMaXN0LnRvZ2dsZShcImlzLWhpZGRlblwiKTtcbiAgICAvLyBlbENhcmQucXVlcnlTZWxlY3RvcignLmNhcmQtZm9ybS1jb2xvciBpbnB1dFtuYW1lPVwiY29sb3JcIl0nKS5mb2N1cygpO1xuICB9LFxuICBhc3luYyBoYW5kbGVFZGl0Q29sb3JGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgcGFyZW50Q2FyZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuYm94XCIpO1xuICAgIGNvbnN0IGlkID0gcGFyZW50Q2FyZC5kYXRhc2V0LmNhcmRJZDtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShlLnRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIlBBVENIXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICB1cmw6IGAke2NhcmRNb2R1bGUuYmFzZVVybH0vY2FyZHMvJHsraWR9YCxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkodG9vbHMuZm9ybURhdGFUb09iamVjdChmb3JtRGF0YSkpLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBkYXRhID0gcmVzLmRhdGE7XG4gICAgICBwYXJlbnRDYXJkLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IGRhdGEuY29sb3I7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cblxuICAgIGNhcmRNb2R1bGUudG9nZ2xlQ29sb3JGb3JtKGUpO1xuICB9LFxuICBhc3luYyB0b2dnbGVMYWJlbEZvcm0oZSkge1xuICAgIGNvbnN0IGVsQ2FyZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuYm94XCIpO1xuICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtbmFtZVwiKS5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtaGlkZGVuXCIpO1xuICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNhcmQtZm9ybS1sYWJlbFwiKS5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtaGlkZGVuXCIpO1xuICAgIGVsQ2FyZC5xdWVyeVNlbGVjdG9yKFwiI2xhYmVsLXNlbGVjdFwiKS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRvb2xzLmdldExhYmVscygpO1xuICAgICAgcmVzdWx0LmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5pbXBvcnROb2RlKFxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubGFiZWwtY2FyZC10ZW1wbGF0ZVwiKS5jb250ZW50LFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgZWxDYXJkLnF1ZXJ5U2VsZWN0b3IoXCIubGFiZWwtY29sb3JcIikudmFsdWUgPSBlbGVtZW50LmNvbG9yO1xuICAgICAgICBsYWJlbC5xdWVyeVNlbGVjdG9yKFwib3B0aW9uXCIpLnZhbHVlID0gZWxlbWVudC5pZDtcbiAgICAgICAgbGFiZWwucXVlcnlTZWxlY3RvcihcIm9wdGlvblwiKS50ZXh0Q29udGVudCA9IGVsZW1lbnQubmFtZTtcbiAgICAgICAgZWxDYXJkLnF1ZXJ5U2VsZWN0b3IoXCIjbGFiZWwtc2VsZWN0XCIpLmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG4gIH0sXG4gIGFzeW5jIGhhbmRsZUVkaXRMYWJlbEZvcm0oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBwYXJlbnRDYXJkID0gZS50YXJnZXQuY2xvc2VzdChcIi5ib3hcIik7XG4gICAgY29uc3QgaWQgPSBwYXJlbnRDYXJkLmRhdGFzZXQuY2FyZElkO1xuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGUudGFyZ2V0KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgYXhpb3Moe1xuICAgICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgdXJsOiBgJHtjYXJkTW9kdWxlLmJhc2VVcmx9L2NhcmRzLyR7K2lkfS9sYWJlbGAsXG4gICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHRvb2xzLmZvcm1EYXRhVG9PYmplY3QoZm9ybURhdGEpKSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGF0YSA9IHJlcy5kYXRhO1xuICAgICAgbGFiZWxNb2R1bGUubWFrZUxhYmVsSW5ET00oXG4gICAgICAgIGRhdGEsXG4gICAgICAgIFwiLmxhYmVsLWluLWNhcmQtdGVtcGxhdGVcIixcbiAgICAgICAgcGFyZW50Q2FyZC5xdWVyeVNlbGVjdG9yKFwiLmNvbHVtbnMgLnBhcmVudC1kaXZcIilcbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cblxuICAgIGNhcmRNb2R1bGUudG9nZ2xlTGFiZWxGb3JtKGUpO1xuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXJkTW9kdWxlO1xuIiwiY29uc3QgdG9vbHMgPSByZXF1aXJlKFwiLi90b29sc1wiKTtcbmNvbnN0IGxhYmVsTW9kdWxlID0ge1xuICBiYXNlVXJsOiBudWxsLFxuICBzZXRCYXNlVXJsKHVybCkge1xuICAgIGxhYmVsTW9kdWxlLmJhc2VVcmwgPSB1cmw7XG4gIH0sXG4gIGFkZExpc3RlbmVyVG9BY3Rpb25zKCkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihcIiNhZGRMYWJlbEJ1dHRvblwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsYWJlbE1vZHVsZS5zaG93QWRkTGFiZWxNb2RhbCk7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiI2FkZExhYmVsTW9kYWwgZm9ybVwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgbGFiZWxNb2R1bGUuaGFuZGxlQWRkTGFiZWxGb3JtKTtcbiAgfSxcbiAgc2hvd0FkZExhYmVsTW9kYWwoKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhZGRMYWJlbE1vZGFsXCIpLmNsYXNzTGlzdC5hZGQoXCJpcy1hY3RpdmVcIik7XG4gIH0sXG5cbiAgYXN5bmMgaGFuZGxlQWRkTGFiZWxGb3JtKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShldmVudC50YXJnZXQpO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBheGlvcyh7XG4gICAgICBtZXRob2Q6IFwicG9zdFwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgIH0sXG4gICAgICB1cmw6IGAke2xhYmVsTW9kdWxlLmJhc2VVcmx9L2xhYmVsc2AsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0b29scy5mb3JtRGF0YVRvT2JqZWN0KGZvcm1EYXRhKSksXG4gICAgfSk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmRhdGE7XG4gICAgaWYgKHJlc3VsdC5lcnJvciA9PT0gXCJFUlJPUlwiKSB7XG4gICAgICB0b29scy5oaWRlTW9kYWwoKTtcbiAgICAgIHJldHVybiBhbGVydChcbiAgICAgICAgYCR7cmVzdWx0LmVycm9yfVxcbk1lc3NhZ2U6ICR7cmVzdWx0Lm1lc3NhZ2V9XFxuU3RhY2s6ICR7cmVzdWx0LnN0YWNrfVxcbkNvZGU6ICR7cmVzdWx0LmNvZGV9YFxuICAgICAgKTtcbiAgICB9XG4gICAgbGFiZWxNb2R1bGUubWFrZUxhYmVsSW5ET00oXG4gICAgICByZXN1bHQsXG4gICAgICBcIiNsYWJlbFRlbXBsYXRlXCIsXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbHVtbnMubGFiZWxzXCIpXG4gICAgKTtcbiAgfSxcbiAgbWFrZUxhYmVsSW5ET00ocGFyYW0sIHRlbXBsYXRlLCBjb250YWluZXIpIHtcbiAgICBjb25zdCBuZXdMYWJlbCA9IGRvY3VtZW50LmltcG9ydE5vZGUoXG4gICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRlbXBsYXRlKS5jb250ZW50LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgbmV3TGFiZWwucXVlcnlTZWxlY3RvcihcIi50YWdcIikuZGF0YXNldC5sYWJlbElkID0gYCR7cGFyYW0uaWR9YDtcbiAgICBuZXdMYWJlbC5xdWVyeVNlbGVjdG9yKFwiLmxhYmVsLW5hbWVcIikudGV4dENvbnRlbnQgPSBwYXJhbS5uYW1lO1xuICAgIG5ld0xhYmVsLnF1ZXJ5U2VsZWN0b3IoXCIudGFnXCIpLnN0eWxlLmJvcmRlckxlZnQgPSBcIjAuM3JlbSBzb2xpZFwiO1xuICAgIG5ld0xhYmVsLnF1ZXJ5U2VsZWN0b3IoXCIudGFnXCIpLnN0eWxlLmJvcmRlckxlZnRDb2xvciA9IHBhcmFtLmNvbG9yO1xuXG4gICAgaWYgKHRlbXBsYXRlID09PSBcIiNsYWJlbFRlbXBsYXRlXCIpIHtcbiAgICAgIG5ld0xhYmVsXG4gICAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmRlbGV0ZVwiKVxuICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxhYmVsTW9kdWxlLmhhbmRsZURlbGV0ZSk7XG4gICAgfVxuICAgIGlmICh0ZW1wbGF0ZSA9PT0gXCIubGFiZWwtaW4tY2FyZC10ZW1wbGF0ZVwiKSB7XG4gICAgICBuZXdMYWJlbFxuICAgICAgICAucXVlcnlTZWxlY3RvcihcIi5jYXJkbGFiZWxkZWxldGVcIilcbiAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsYWJlbE1vZHVsZS5oYW5kbGVBc3NvY2lhdGlvbkRlbGV0ZSk7XG4gICAgfVxuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0xhYmVsKTtcblxuICAgIHRvb2xzLmhpZGVNb2RhbCgpO1xuICB9LFxuICBhc3luYyBoYW5kbGVEZWxldGUoZSkge1xuICAgIGNvbnN0IHBhcmVudExhYmVsID0gZS50YXJnZXQuY2xvc2VzdChcIi50YWdcIik7XG4gICAgY29uc3QgaWQgPSBwYXJlbnRMYWJlbC5kYXRhc2V0LmxhYmVsSWQ7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgdXJsOiBgJHtsYWJlbE1vZHVsZS5iYXNlVXJsfS9sYWJlbHMvJHsraWR9YCxcbiAgICAgIH0pO1xuICAgICAgcGFyZW50TGFiZWwucmVtb3ZlKHBhcmVudExhYmVsKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIGFsZXJ0KFwiSW1wb3NzaWJsZSBkZSBzdXBwcmltZXIgbGUgbGFiZWwgIVwiKTtcbiAgICB9XG4gIH0sXG4gIGFzeW5jIGhhbmRsZUFzc29jaWF0aW9uRGVsZXRlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgcGFyZW50TGFiZWwgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnRhZ1wiKTtcbiAgICBjb25zdCBsYWJlbElkID0gcGFyZW50TGFiZWwuZGF0YXNldC5sYWJlbElkO1xuICAgIGNvbnN0IHBhcmVudENhcmQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLmJveFwiKTtcbiAgICBjb25zdCBwYXJlbnRJZCA9IHBhcmVudENhcmQuZGF0YXNldC5jYXJkSWQ7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgdXJsOiBgJHtsYWJlbE1vZHVsZS5iYXNlVXJsfS9jYXJkcy8ke3BhcmVudElkfS9sYWJlbC8ke2xhYmVsSWR9YCxcbiAgICAgIH0pO1xuICAgICAgcGFyZW50TGFiZWwucmVtb3ZlKHBhcmVudExhYmVsKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIGFsZXJ0KFwiSW1wb3NzaWJsZSBkZSBzdXBwcmltZXIgbGUgbGFiZWwgIVwiKTtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxhYmVsTW9kdWxlO1xuIiwiY29uc3QgY2FyZE1vZHVsZSA9IHJlcXVpcmUoXCIuL2NhcmRcIik7XG5jb25zdCB0b29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzXCIpO1xuY29uc3QgbGlzdE1vZHVsZSA9IHtcbiAgYmFzZVVybDogbnVsbCxcbiAgc2V0QmFzZVVybCh1cmwpIHtcbiAgICBsaXN0TW9kdWxlLmJhc2VVcmwgPSB1cmw7XG4gIH0sXG4gIGFkZExpc3RlbmVyVG9BY3Rpb25zKCkge1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihcIiNhZGRMaXN0QnV0dG9uXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxpc3RNb2R1bGUuc2hvd0FkZExpc3RNb2RhbCk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5jbG9zZVwiKS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0b29scy5oaWRlTW9kYWwpO1xuICAgIH0pO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcihcIiNhZGRMaXN0TW9kYWwgZm9ybVwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgbGlzdE1vZHVsZS5oYW5kbGVBZGRMaXN0Rm9ybSk7XG4gIH0sXG4gIHNob3dBZGRMaXN0TW9kYWwoKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhZGRMaXN0TW9kYWxcIikuY2xhc3NMaXN0LmFkZChcImlzLWFjdGl2ZVwiKTtcbiAgfSxcbiAgYXN5bmMgaGFuZGxlQWRkTGlzdEZvcm0oZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKGV2ZW50LnRhcmdldCk7XG4gICAgLy8gbGV0IHJlc3VsdCA9IGF3YWl0IGZldGNoKGAke2FwcC5iYXNlVXJsfS9saXN0c2AsIHtcbiAgICAvLyAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgLy8gICBoZWFkZXJzOiB7XG4gICAgLy8gICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgLy8gICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIC8vICAgfSxcbiAgICAvLyAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHRvb2xzLmZvcm1EYXRhVG9PYmplY3QoZm9ybURhdGEpKSxcbiAgICAvLyB9KTtcbiAgICAvLyByZXN1bHQgPSBhd2FpdCByZXN1bHQuanNvbigpO1xuXG4gICAgbGV0IHJlc3VsdCA9IGF3YWl0IGF4aW9zKHtcbiAgICAgIG1ldGhvZDogXCJwb3N0XCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgfSxcbiAgICAgIHVybDogYCR7bGlzdE1vZHVsZS5iYXNlVXJsfS9saXN0c2AsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh0b29scy5mb3JtRGF0YVRvT2JqZWN0KGZvcm1EYXRhKSksXG4gICAgfSk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmRhdGE7XG4gICAgaWYgKHJlc3VsdC5lcnJvciA9PT0gXCJFUlJPUlwiKSB7XG4gICAgICB0b29scy5oaWRlTW9kYWwoKTtcbiAgICAgIHJldHVybiBhbGVydChcbiAgICAgICAgYCR7cmVzdWx0LmVycm9yfVxcbk1lc3NhZ2U6ICR7cmVzdWx0Lm1lc3NhZ2V9XFxuU3RhY2s6ICR7cmVzdWx0LnN0YWNrfVxcbkNvZGU6ICR7cmVzdWx0LmNvZGV9YFxuICAgICAgKTtcbiAgICB9XG4gICAgbGlzdE1vZHVsZS5tYWtlTGlzdEluRE9NKHJlc3VsdCk7XG4gIH0sXG4gIG1ha2VMaXN0SW5ET00ocGFyYW0pIHtcbiAgICBjb25zdCBuZXdMaXN0ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGVtcGxhdGVMaXN0XCIpLmNvbnRlbnQsXG4gICAgICB0cnVlXG4gICAgKTtcbiAgICBuZXdMaXN0LnF1ZXJ5U2VsZWN0b3IoXCJoMlwiKS50ZXh0Q29udGVudCA9IHBhcmFtLm5hbWU7XG5cbiAgICBuZXdMaXN0LnF1ZXJ5U2VsZWN0b3IoXCIuY29sdW1uXCIpLmRhdGFzZXQubGlzdElkID0gYCR7cGFyYW0uaWR9YDtcblxuICAgIG5ld0xpc3RcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmxpc3QtbmFtZVwiKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJkYmxjbGlja1wiLCBsaXN0TW9kdWxlLnRvZ2dsZUVkaXRGb3JtKTtcblxuICAgIG5ld0xpc3RcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmxpc3QtZm9ybS1uYW1lXCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBsaXN0TW9kdWxlLmhhbmRsZUVkaXRMaXN0Rm9ybSk7XG5cbiAgICBuZXdMaXN0XG4gICAgICAucXVlcnlTZWxlY3RvcignLmxpc3QtZm9ybS1uYW1lIGlucHV0W25hbWU9XCJuYW1lXCJdJylcbiAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBsaXN0TW9kdWxlLnRvZ2dsZUVkaXRGb3JtKTtcblxuICAgIG5ld0xpc3RcbiAgICAgIC5xdWVyeVNlbGVjdG9yKFwiLmRlbGV0ZS1saXN0XCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxpc3RNb2R1bGUuaGFuZGxlRGVsZXRlTGlzdCk7XG5cbiAgICBuZXdMaXN0LnF1ZXJ5U2VsZWN0b3IoYGZvcm0gaW5wdXRbbmFtZT0nbGlzdF9pZCddYCkudmFsdWUgPSBgJHtwYXJhbS5pZH1gO1xuXG4gICAgbmV3TGlzdFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuaXMtcHVsbGVkLXJpZ2h0XCIpXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNhcmRNb2R1bGUuc2hvd0FkZENhcmRNb2RhbCk7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoXCIuY2FyZC1saXN0c1wiKVxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY29sdW1uXCIpO1xuICAgIGNvbnN0IGxhc3RDaGlsZCA9IGNoaWxkcmVuW2NoaWxkcmVuLmxlbmd0aCAtIDFdO1xuICAgIGxhc3RDaGlsZC5iZWZvcmUobmV3TGlzdCk7XG5cbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jYXJkLWxpc3RzLmNvbHVtbnNcIik7XG4gICAgY29uc3Qgc29ydGFibGUgPSBTb3J0YWJsZS5jcmVhdGUobGlzdCk7XG5cbiAgICB0b29scy5oaWRlTW9kYWwoKTtcbiAgfSxcbiAgdG9nZ2xlRWRpdEZvcm0oZSkge1xuICAgIGNvbnN0IGVsTGlzdCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIucGFuZWxcIik7XG4gICAgZWxMaXN0LnF1ZXJ5U2VsZWN0b3IoXCIubGlzdC1uYW1lXCIpLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1oaWRkZW5cIik7XG4gICAgZWxMaXN0LnF1ZXJ5U2VsZWN0b3IoXCIubGlzdC1mb3JtLW5hbWVcIikuY2xhc3NMaXN0LnRvZ2dsZShcImlzLWhpZGRlblwiKTtcbiAgICBlbExpc3QucXVlcnlTZWxlY3RvcignLmxpc3QtZm9ybS1uYW1lIGlucHV0W25hbWU9XCJuYW1lXCJdJykuZm9jdXMoKTtcbiAgfSxcbiAgYXN5bmMgaGFuZGxlRWRpdExpc3RGb3JtKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShlLnRhcmdldCk7XG4gICAgY29uc3QgYm9keSA9IHRvb2xzLmZvcm1EYXRhVG9PYmplY3QoZm9ybURhdGEpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIlBBVENIXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICB1cmw6IGAke2xpc3RNb2R1bGUuYmFzZVVybH0vbGlzdHMvJHtib2R5Lmxpc3RfaWR9YCxcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSByZXMuZGF0YTtcbiAgICAgIGNvbnN0IGVsTGlzdCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIucGFuZWxcIik7XG4gICAgICBlbExpc3QucXVlcnlTZWxlY3RvcihcIi5saXN0LW5hbWVcIikudGV4dENvbnRlbnQgPSBkYXRhLm5hbWU7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICAgIGxpc3RNb2R1bGUudG9nZ2xlRWRpdEZvcm0oZSk7XG4gIH0sXG4gIGFzeW5jIGhhbmRsZURlbGV0ZUxpc3QoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IHBhcmVudExpc3QgPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5jb2x1bW4uaXMtb25lLXF1YXJ0ZXIucGFuZWxcIik7XG4gICAgY29uc3QgaWQgPSBwYXJlbnRMaXN0LmRhdGFzZXQubGlzdElkO1xuICAgIGF3YWl0IGF4aW9zKHtcbiAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICB9LFxuICAgICAgdXJsOiBgJHtsaXN0TW9kdWxlLmJhc2VVcmx9L2xpc3RzLyR7K2lkfWAsXG4gICAgfSk7XG4gICAgcGFyZW50TGlzdC5yZW1vdmUocGFyZW50TGlzdCk7XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RNb2R1bGU7XG4iLCJjb25zdCB0b29scyA9IHtcbiAgYmFzZVVybDogbnVsbCxcbiAgc2V0QmFzZVVybCh1cmwpIHtcbiAgICB0b29scy5iYXNlVXJsID0gdXJsO1xuICB9LFxuICBoaWRlTW9kYWwoKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1vZGFsLmlzLWFjdGl2ZVwiKVxuICAgICAgLmZvckVhY2goKGVsZW1lbnQpID0+IGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLWFjdGl2ZVwiKSk7XG4gIH0sXG5cbiAgZm9ybURhdGFUb09iamVjdChmb3JtRGF0YSkge1xuICAgIGxldCBvYmogPSB7fTtcbiAgICBmb3JtRGF0YS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiAob2JqW2tleV0gPSB2YWx1ZSkpO1xuXG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgYXN5bmMgZ2V0TGFiZWxzKCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBheGlvcy5nZXQoYCR7dG9vbHMuYmFzZVVybH0vbGFiZWxzYCk7XG4gICAgICByZXR1cm4gcmVzdWx0LmRhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvb2xzO1xuLy8gbnB4IGJyb3dzZXJpZnkgLWUgc3JjL2FwcC5qcyAtbyBhc3NldHMvanMvYnVuZGxlLmpzXG4iXX0=
