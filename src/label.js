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
