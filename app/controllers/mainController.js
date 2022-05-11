export const mainController = {
	async homePage(req, res) {
		try {
			res.send();
		} catch (err) {
			res.redirect("/error");
		}
	},

	errorPage(req, res) {
		res.render("error");
	},
};
