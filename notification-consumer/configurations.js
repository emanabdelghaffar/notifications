module.exports = {
	MAX_SMS_COUNT_PER_MINT: process.env.MAX_SMS_COUNT_PER_MINT || 5,
	KAFKA_HOST: process.env.KAFKA_HOST,
	REDIS_URL: process.env.REDIS_URL,
	SMS_NOTIFICATION_TOPIC: 'sms',
	PUSH_NOTIFICATION_TOPIC: 'pushnotifications',
	PORT: 80,
};
