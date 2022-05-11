import { sequelize } from "../database";
import { DataTypes, Model } from "sequelize";

class List extends Model {}

List.init(
	{
		name: DataTypes.TEXT,
		position: DataTypes.INTEGER,
	},
	{
		sequelize,
		tableName: "list",
	}
);

module.exports = List;
