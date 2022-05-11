import { sequelize } from "../database";
import { DataTypes, Model } from "sequelize";

class Label extends Model {}

Label.init(
	{
		name: DataTypes.TEXT,
		color: DataTypes.TEXT,
	},
	{
		sequelize,
		tableName: "label",
	}
);

module.exports = Label;
