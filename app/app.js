import express from "express";
import config from "./config";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import docs from "./docs/";
import { router } from "./router";
import { bodySanitizer } from "./middlewares/body-sanitizer";

const app = express();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(docs, { explorer: true }));
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodySanitizer);
app.use(router);

app.listen(config.port, () => {
	console.log(`Server is running on http://${config.host}:${config.port}`);
});
