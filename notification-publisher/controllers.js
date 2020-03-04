const { publishSMSs, publishPushNotifications } = require('./kafka/publishers');

const createNotifications = async ctx => {
	const notification = ctx.request.body;
	if (!notification.type || !['sms', 'push-notification'].includes(notification.type)) {
		ctx.res.statusCode = 400;
		return;
	}

	if (notification.type === 'sms') {
		await publishSMSs(notification.data);
	} else if (notification.type === 'push-notification') {
		await publishPushNotifications(notification.data);
	}

	ctx.res.statusCode = 200;
};

module.exports = { createNotifications };
