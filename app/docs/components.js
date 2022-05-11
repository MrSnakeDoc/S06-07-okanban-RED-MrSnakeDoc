module.exports = {
	components: {
		schemas: {
			List: {
				type: "object",
				required: ["name"],
				properties: {
					id: {
						type: "integer",
						description: "The auto-generated id of the list",
						example: "4",
					},
					name: {
						type: "string",
						description: "The name of your list.",
						example: "My list",
					},
					position: {
						type: "integer",
						description: "The position of the list relative to others lists",
						example: "7",
					},
					createdAt: {
						type: "string",
						format: "date",
						description: "The date of the record creation",
						example: "2021-11-21 15:01:20.938+00",
					},
					updatedAt: {
						type: "string",
						format: "date",
						description: "The date of the record update",
						example: "2021-11-21 17:01:20.938+00",
					},
				},
				example: {
					id: "4",
					name: "TODO Next Week",
					position: "7",
					createdAt: "2021-11-21 15:01:20.938+00",
					updatedAt: "2021-11-21 17:01:20.938+00",
				},
			},
			Card: {
				type: "object",
				properties: {
					id: {
						type: "integer",
						description: "The auto-generated id of the card",
					},
					name: {
						type: "string",
						description: "The title of your list.",
						required: true,
					},
					color: {
						type: "string",
						description: "Color of the card",
					},
					position: {
						type: "integer",
						description: "The position of the card relative to others cards",
					},
					list_id: {
						type: "integer",
						description: "The id of the list it belongs to",
					},
					createdAt: {
						type: "string",
						format: "date",
						description: "The date of the record creation",
					},
					updatedAt: {
						type: "string",
						format: "date",
						description: "The date of the record update",
					},
				},
				example: {
					id: "5",
					name: "Git push",
					color: "#00e663",
					list_id: "13",
					position: "2",
					createdAt: "2021-11-21 15:01:20.938+00",
					updatedAt: "2021-11-21 17:01:20.938+00",
				},
			},
			Label: {
				type: "object",
				properties: {
					id: {
						type: "integer",
						description: "The auto-generated id of the card",
					},
					name: {
						type: "string",
						description: "The title of your list.",
						required: true,
					},
					color: {
						type: "string",
						description: "Color of the card",
					},
					createdAt: {
						type: "string",
						format: "date",
						description: "The date of the record creation",
					},
					updatedAt: {
						type: "string",
						format: "date",
						description: "The date of the record update",
					},
				},
				example: {
					id: "5",
					name: "Git push",
					color: "#00e663",
					createdAt: "2021-11-21 15:01:20.938+00",
					updatedAt: "2021-11-21 17:01:20.938+00",
				},
			},
		},
	},
};
