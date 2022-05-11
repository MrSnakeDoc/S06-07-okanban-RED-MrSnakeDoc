import config from "./config";

const { Sequelize } = require("sequelize");

export const sequelize = new Sequelize(config.pg_url, {
	define: {
		underscored: true,
		createdAt: "createdAt",
		updatedAt: "updatedAt",
	},
	dialect: "postgres",
	logging: false,
});
