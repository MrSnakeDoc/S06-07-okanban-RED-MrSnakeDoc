module.exports = {
	paths: {
		//? LISTS
		"/lists": {
			get: {
				tags: ["Lists CRUD operations"],
				description:
					"Retrieve a list of all lists with all cards and labels associated",
				summary: "Return a list of all lists",
				parameters: [],
				responses: {
					200: {
						description: "Lists were obtained",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/List",
									},
								},
							},
						},
					},
				},
			},
			post: {
				tags: ["Lists CRUD operations"],
				description: "Return the created list",
				summary: "Return the list newly created",
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/List",
								required: ["name"],
							},
						},
					},
				},
				responses: {
					200: {
						description: "List was created",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/List",
									},
								},
							},
						},
					},
					400: {
						description: "Name Cannot be empty",
					},
				},
			},
		},
		"/lists/{id}": {
			get: {
				tags: ["Lists CRUD operations"],
				description: "Return a list by id",
				summary: "Return the list by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "List with id was found",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/List",
									},
								},
							},
						},
					},
					404: {
						description: "The list could not be found",
					},
				},
			},
			patch: {
				tags: ["Lists CRUD operations"],
				description: "Modify a list by id",
				summary: "Returns the list modified by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/List",
							},
						},
					},
				},
				responses: {
					200: {
						description: "List with id was modified",
						content: {
							"application/json": {
								schema: {
									type: "object",
									items: {
										$ref: "#/components/schemas/List",
									},
								},
							},
						},
					},
					404: {
						description: "The list could not be found",
					},
				},
			},
			delete: {
				tags: ["Lists CRUD operations"],
				description:
					"Delete the list by id and returns a status code 200 if successful",
				summary: "Delete a list by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "List was successfully deleted",
					},
					404: {
						description: "The list could not be found",
					},
				},
			},
		},
		"/lists/{id}/cards": {
			get: {
				tags: ["Lists CRUD operations"],
				description: "get all cards from a list with the list id",
				summary: "return all cards from a list",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 11,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "Cards were retrieved",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
					404: {
						description: "The list could not be found",
					},
				},
			},
		},
		//? LISTS
		//
		//
		//? CARDS
		"/Cards": {
			get: {
				tags: ["Cards CRUD operations"],
				description:
					"Retrieve a list of all cards with all list associated and labels associated",
				summary: "Returns a list of all cards",
				responses: {
					200: {
						description: "Cards were obtained",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
				},
			},
			post: {
				tags: ["Cards CRUD operations"],
				description: "Return the created card",
				summary: "Returns the card newly created",
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/Card",
								required: ["name"],
							},
						},
					},
				},
				responses: {
					200: {
						description: "card was created",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
					400: {
						description: "Name Cannot be empty",
					},
				},
			},
		},
		"/Cards/{id}": {
			get: {
				tags: ["Cards CRUD operations"],
				description: "Return a card by id",
				summary: "Return the card by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "Card with id was found",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
					404: {
						description: "The card could not be found",
					},
				},
			},
			patch: {
				tags: ["Cards CRUD operations"],
				description: "Modify a card by id",
				summary: "Returns the card modified by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/Card",
							},
						},
					},
				},
				responses: {
					200: {
						description: "Card was successfully modified",
						content: {
							"application/json": {
								schema: {
									type: "object",
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
					404: {
						description: "The card could not be found",
					},
				},
			},
			delete: {
				tags: ["Cards CRUD operations"],
				description:
					"Delete the card by id and returns a status code 200 if successful",
				summary: "Delete a card by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 30,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "card was successfully deleted",
					},
					404: {
						description: "The card could not be found",
					},
				},
			},
		},
		//? CARDS
		//
		//
		//? LABELS
		"/Labels": {
			get: {
				tags: ["Labels CRUD operations"],
				description: "Retrieve a list of all labels with all cards associated",
				summary: "Returns a list of all labels",
				responses: {
					200: {
						description: "labels were obtained",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/label",
									},
								},
							},
						},
					},
				},
			},
			post: {
				tags: ["Labels CRUD operations"],
				description: "Return the created label",
				summary: "Return the label newly created",
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/Label",
								required: ["name"],
							},
						},
					},
				},
				responses: {
					200: {
						description: "label was created",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/Label",
									},
								},
							},
						},
					},
					400: {
						description: "Name Cannot be empty",
					},
				},
			},
		},
		"/labels/{id}": {
			get: {
				tags: ["Labels CRUD operations"],
				description: "Return a label by id",
				summary: "Return the label by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "The label was found",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/Card",
									},
								},
							},
						},
					},
					404: {
						description: "The label could not be found",
					},
				},
			},
			patch: {
				tags: ["Labels CRUD operations"],
				description: "Modify a label by id",
				summary: "Return the label modified by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 17,
						},
						required: true,
						description: "id",
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								$ref: "#/components/schemas/Label",
							},
						},
					},
				},
				responses: {
					200: {
						description: "The label was successfully modified",
						content: {
							"application/json": {
								schema: {
									type: "object",
									items: {
										$ref: "#/components/schemas/Label",
									},
								},
							},
						},
					},
					404: {
						description: "The label could not be found",
					},
				},
			},
			delete: {
				tags: ["Labels CRUD operations"],
				description:
					"Delete the label by id and returns a status code 200 if successful",
				summary: "Delete a label by id",
				parameters: [
					{
						in: "path",
						name: "id",
						schema: {
							type: "integer",
							example: 30,
						},
						required: true,
						description: "id",
					},
				],
				responses: {
					200: {
						description: "The label was successfully deleted",
					},
					404: {
						description: "The label could not be found",
					},
				},
			},
		},
		//? LABELS
		//
		//
		//? ASSOCIATION
		"/cards/{card_id}/label": {
			post: {
				tags: ["Associations Cards With Labels"],
				description: "Associate a label with a card",
				summary: "Associate a label with a card",
				parameters: [
					{
						in: "path",
						name: "card_id",
						schema: {
							type: "integer",
							example: 30,
						},
						required: true,
						description: "card_id",
					},
				],
				requestBody: {
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									id: {
										type: "integer",
										example: 42,
									},
								},
							},
						},
					},
				},
				responses: {
					200: {
						description:
							"The label was successfully successfully associated with the card",
						content: {
							"application/json": {
								schema: {
									items: {
										$ref: "#/components/schemas/Label",
									},
								},
							},
						},
					},
				},
			},
		},
		"/cards/{card_id}/label/{label_id}": {
			delete: {
				tags: ["Associations Cards With Labels"],
				description: "Dissociate a from a card",
				summary: "Dissociate a label from a card",
				parameters: [
					{
						in: "path",
						name: "card_id",
						schema: {
							type: "integer",
							example: 30,
						},
						required: true,
						description: "card_id",
					},
					{
						in: "path",
						name: "label_id",
						schema: {
							type: "integer",
							example: 30,
						},
						required: true,
						description: "label_id",
					},
				],
				responses: {
					200: {
						description: "The label was successfully dissociated form card",
					},
				},
			},
		},
	},
};
