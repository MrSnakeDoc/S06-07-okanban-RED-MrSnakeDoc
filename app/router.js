import express from "express";
import { mainController } from "./controllers/mainController";
import { listsController } from "./controllers/listsController";
import { cardsController } from "./controllers/cardsController";
import { labelsController } from "./controllers/labelsController";

export const router = express.Router();

router
	.use(express.static("./app/public"))
	.use("/favicon.ico", function (req, res) {
		res.status(204);
		res.end();
	});

router.get("/", mainController.homePage);

//* LISTS
router
	.get("/lists", listsController.getAllLists)
	.post("/lists", listsController.createOneList)
	.get("/lists/:id", listsController.getOneList)
	.patch("/lists/:id", listsController.UpdateList)
	.delete("/lists/:id", listsController.deleteList)
	.get("/lists/:id/cards", listsController.getCardsFromList);
//* CARDS
router
	.get("/cards", cardsController.getAllCards)
	.post("/cards", cardsController.createOneCard)
	.get("/cards/:id", cardsController.getOneCard)
	.patch("/cards/:id", cardsController.UpdateCard)
	.delete("/cards/:id", cardsController.deleteCard);

//* CARDS ASSOCIATION AND DISSOCIATION WITH LABEL
router
	.post("/cards/:card_id/label", cardsController.cardGetTag)
	.delete("/cards/:card_id/label/:label_id", cardsController.cardRemoveTag);

//* LABELS
router
	.get("/labels", labelsController.getAllLabels)
	.post("/labels", labelsController.createOneLabel)
	.get("/labels/:id", labelsController.getOneLabel)
	.patch("/labels/:id", labelsController.UpdateLabel)
	.delete("/labels/:id", labelsController.deleteLabel);

// router.get("/error", mainController.errorPage);
