const { List, Card, Label, BaseError } = require("../models/");
export const cardsController = {
	async getAllCards(req, res) {
		try {
			const cards = await Card.findAll({
				include: ["list", "labels"],
			});
			res.status(200).send(cards);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async createOneCard(req, res) {
		try {
			if (!req.body.name) {
				throw new BaseError("Empty field", "Name cannot be empty", "400");
			}
			const [card, created] = await Card.findOrCreate({
				where: { name: req.body.name },
				defaults: req.body,
			});
			!created
				? res.status(400).send("Not Created due to entry already exists")
				: res.status(200).json(card);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async getOneCard(req, res) {
		try {
			const card = await Card.findByPk(+req.params.id, {
				include: ["list", "labels"],
			});
			res.status(200).json(card);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},

	async UpdateCard(req, res) {
		try {
			await Card.update(req.body, { where: { id: +req.params.id } });
			res.status(200).send(await Card.findByPk(+req.params.id));
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
	async deleteCard(req, res) {
		try {
			await Card.destroy({ where: { id: +req.params.id } });
			res.status(200).send("Delete Ok");
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
	async cardGetTag(req, res) {
		try {
			const card = await Card.findByPk(+req.params.card_id);
			if (!card) {
				throw new BaseError("NOT FOUND", "Card not found", "404");
			}
			const label = await Label.findByPk(+req.body.id);
			if (!label) {
				throw new BaseError("LABEL NOT FOUND", "Label not found", "404");
			}
			await card.addLabel(label);
			res.status(200).send(
				await Card.findByPk(+req.params.card_id, {
					include: ["labels"],
				})
			);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
	async cardRemoveTag(req, res) {
		try {
			const card = await Card.findByPk(+req.params.card_id);
			if (!card) {
				throw new BaseError("NOT FOUND", "Card not found", "404");
			}
			const label = await Label.findByPk(+req.params.label_id);
			if (!label) {
				throw new BaseError("LABEL NOT FOUND", "Label not found", "404");
			}
			await card.removeLabel(label);
			res.status(200).send(
				await Card.findByPk(+req.params.card_id, {
					include: ["labels"],
				})
			);
		} catch (err) {
			res.json(new BaseError(err.message, err.stack, err.code));
		}
	},
};
