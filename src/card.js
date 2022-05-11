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
