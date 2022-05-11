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
