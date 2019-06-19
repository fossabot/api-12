const RateLimiter = require('../../../structures/RateLimiter');
const crypto = require('crypto');

class PatronPOST {
	constructor(controller, settings) {
		this.path = '/patron';
		this.router = controller.router;
		this.database = controller.database;
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
		if (!req.headers['x-patreon-signature'] && !req.headers['x-patreon-event']) return res.status(403).send({ message: 'You need to provide a valid EVENT and a valid SIGNATURE.' });
		let hash = crypto.createHmac('md5', this.settings.patreon.secret).update(req.body).digest('hex');
		if (req.headers['x-patreon-signature'] !== hash) return res.status(403).send({ message: 'Patreon signature didn\'t match.' });

		req.body = JSON.parse(req.body);
		const user = req.body.included.find(inc => inc.type === 'user');
		if (!user.attributes.social_connections || !user.attributes.social_connections.discord || !user.attributes.social_connections.discord.user_id) return res.status(403).send({ message: 'Need more info on user' });

		const id = user.attributes.social_connections.discord.user_id;
		const member = await this.database.User.findOne({ where: { userID: id } }) || await this.database.User.create({ userID: id });

		switch (req.headers['x-patreon-event']) {
			case 'members:pledge:create':
				member.patron = true;
				await member.save();
				console.log(`Added ${id} to the patron database.`)
				break;
			case 'members:pledge:delete':
				member.patron = false;
				await member.save();
				console.log(`Removed ${id} from the patron database.`)
				break;
			default:
				console.log('Patreon event is unknown')
		}

		return res.sendStatus(200);
	}
}


module.exports = PatronPOST;
