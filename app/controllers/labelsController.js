const { List, Card, Label, BaseError } = require("../models/");

export const labelsController = {
	async getAllLabels(req, res) {
		try {
			const labels = await Label.findAll({
				include: [
					{
						association: "cards",
						include: [
							{
								association: "list",
							},
						],
					},
				],
				order: [["id", "ASC"]],
			});
			res.status(200).json(labels);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async createOneLabel(req, res) {
		try {
			if (!req.body.name) {
				throw new BaseError("Empty field", "Name cannot be empty", "400");
			}
			const [label, created] = await Label.findOrCreate({
				where: { name: req.body.name },
				defaults: req.body,
			});
			!created
				? res.status(400).send("Not Created due to entry already exists")
				: res.status(200).send(label);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async getOneLabel(req, res) {
		try {
			const label = await Label.findByPk(+req.params.id, {
				include: [
					{
						association: "cards",
						include: [
							{
								association: "list",
							},
						],
					},
				],
			});
			res.status(200).json(label);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async UpdateLabel(req, res) {
		try {
			await Label.update(req.body, { where: { id: +req.params.id } });
			res.status(200).send("Update Ok");
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
	async deleteLabel(req, res) {
		try {
			await Label.destroy({ where: { id: +req.params.id } });
			res.status(200).send("Delete Ok");
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
};
