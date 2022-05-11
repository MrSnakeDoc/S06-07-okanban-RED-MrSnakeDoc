const devConfig = {
	host: process.env.HOST || "localhost",
	port: process.env.PORT || 5000,
	pg_url: process.env.PG_URL,
};
module.exports = devConfig;
