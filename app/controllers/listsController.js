const { List, Card, BaseError } = require("../models/");
export const listsController = {
	async getAllLists(req, res) {
		try {
			const lists = await List.findAll({
				include: [
					{
						association: "cards",
						include: ["labels"],
					},
				],
				order: [
					["id", "ASC"],
					["cards", "id", "ASC"],
				],
			});
			res.status(200).json(lists);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async createOneList(req, res) {
		try {
			if (!req.body.name || req.body.name === "") {
				throw new BaseError("Empty field", "Name cannot be empty", "400");
			}
			const newList = await List.create(req.body);
			res.json(newList);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async getOneList(req, res) {
		try {
			const list = await List.findByPk(+req.params.id, {
				include: [
					{
						association: "cards",
						include: ["labels"],
					},
				],
			});
			if (!list) {
				throw new BaseError(
					"NOT FOUND",
					`Can't find list with id ${req.params.id}`,
					"404"
				);
			}
			res.status(200).json(list);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async UpdateList(req, res) {
		try {
			const list = await List.findByPk(+req.params.id, {
				include: [
					{
						association: "cards",
						include: ["labels"],
					},
				],
			});
			if (!list) {
				throw new BaseError(
					"NOT FOUND",
					"404",
					`Can't find list with id ${+req.params.id}`
				);
			}
			await List.update(req.body, { where: { id: +req.params.id } });
			res.status(200).json(await List.findByPk(+req.params.id));
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
	async deleteList(req, res) {
		try {
			const list = await List.findByPk(+req.params.id, {
				include: [
					{
						association: "cards",
						include: ["labels"],
					},
				],
			});
			if (!list) {
				throw new BaseError(
					"NOT FOUND",
					"404",
					`Can't find list with id ${+req.params.id}`
				);
			}
			List.destroy({ where: { id: +req.params.id } });
			res.status(200).send("Delete Ok");
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async getCardsFromList(req, res) {
		try {
			const cards = await Card.findAll({
				where: {
					list_id: +req.params.id,
				},
				include: ["labels"],
			});
			if (!cards) {
				throw new BaseError(
					"NOT FOUND",
					"404",
					`This list doesn't contain any cards`
				);
			}
			res.status(200).json(cards);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
};
