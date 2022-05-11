import { sequelize } from "../database";
import { DataTypes, Model } from "sequelize";

class Card extends Model {}

Card.init(
	{
		name: DataTypes.TEXT,
		color: DataTypes.TEXT,
		position: DataTypes.INTEGER,
		list_id: DataTypes.INTEGER,
	},
	{
		sequelize,
		tableName: "card",
	}
);

module.exports = Card;
