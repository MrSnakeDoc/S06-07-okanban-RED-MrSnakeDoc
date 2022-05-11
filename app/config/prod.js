const prodConfig = {
	host: process.env.HOST || "localhost",
	port: process.env.PORT || 8080,
	pg_url: process.env.PG_URL,
};
module.exports = prodConfig;
