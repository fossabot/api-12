const RateLimiter = require('../../../structures/RateLimiter');

class CheckGET {
	constructor(controller, settings) {
		this.path = '/check';
		this.router = controller.router;
		this.database = controller.database;
		this.authorize = controller.authorize;
		this.settings = settings;

		// 10/10 limit
		this.rateLimiter = new RateLimiter({ max: 10 });

		this.router.post(
			this.path,
			this.rateLimiter.limit.bind(this.rateLimiter),
			this.run.bind(this)
		);
	}

	async run(req, res) {
		const user = await this.database.User.findOne({ where: { userID: req.params.id } }) || await this.database.User.create({ userID: req.params.id });

		if (user.patron) return res.status(200).send({ message: `${req.params.id} is a patron.` })

		return res.status(403).send({ message: `${req.params.id} is not a patron.` })
	}
}


module.exports = CheckGET;
