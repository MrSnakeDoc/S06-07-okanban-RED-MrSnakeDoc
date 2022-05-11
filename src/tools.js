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
