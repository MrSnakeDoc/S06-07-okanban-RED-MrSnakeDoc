const Card = require("./card");
const List = require("./list");
const Label = require("./label");
const BaseError = require("./error");

List.hasMany(Card, {
	foreignKey: "list_id",
	as: "cards",
});

Card.belongsTo(List, {
	foreignKey: "list_id",
	as: "list",
});

Card.belongsToMany(Label, {
	foreignKey: "card_id",
	otherKey: "label_id",
	as: "labels",
	through: "card_has_label",
	timestamps: false,
});

Label.belongsToMany(Card, {
	foreignKey: "label_id",
	otherKey: "card_id",
	as: "cards",
	through: "card_has_label",
	timestamps: false,
});

const index = {
	List,
	Card,
	Label,
	BaseError,
};

module.exports = index;
