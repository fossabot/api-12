const fs = require('fs');
let express = require('express');

class APIv1 {
	constructor(settings, database) {
		this.database = database;
		this.router = express.Router();
		this.routes = {};
		this.path = '/api/v1';
		this.settings = settings

		fs.readdir(`${__dirname}/routes/`, (error, files) => {
			if (error)
				throw error;

			for (const file of files) {
				if (!file.endsWith('js'))
					continue;

				let route = new (require(`${__dirname}/routes/${file}`))(this, settings);
				this.routes[route.path] = route;
			}
		});
	}

	async authorize(req, res, next) {
		if (!req.headers.authorization) return res.status(400).send({ message: 'Authentication required' });

		return next();
	}
}

module.exports = APIv1;
