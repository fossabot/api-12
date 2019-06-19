const Sequelize = require('sequelize');

const user = {
	userID: {
		primaryKey: true,
		type: Sequelize.BIGINT()
	},
	patron: {
		type: Sequelize.BOOLEAN(),
		defaultValue: false
	}
}

class Database {
	constructor(settings) {
		this.db = new Sequelize(`postgres://${settings.user}:${settings.pass}@localhost/${settings.db}`, { logging: false })

		this.User = this.db.define('user', user)
		this.db.authenticate()
			.then(() => console.info(`[DB]: Connection to database has been established successfully.`))
			.then(() => console.info(`[DB]: Synchronizing database...`))
			.then(() => this.db.sync()
				.then(() => console.info(`[DB]: Done Synchronizing database!`))
				.catch(error => console.error(`[DB]: Error synchronizing the database: \n${error}`))
			)
			.catch(error => {
				console.error(`[DB]: Unable to connect to the database: \n${error}`);
			});
	}
}

module.exports = Database;
