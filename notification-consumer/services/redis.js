const { promisify } = require('util');
const redis = require('redis');
const { MAX_SMS_COUNT_PER_MINT, REDIS_URL } = require('../configurations');

const client = redis.createClient(REDIS_URL);

client.on('error', function(error) {
	console.error('redis error', error);
});

const incrAsync = promisify(client.incr).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const getAsync = promisify(client.get).bind(client);

const incLimitPerMinuteExceeded = async topic => {
	const currentMint = Math.floor(new Date().getTime() / (60 * 1000));
	const count = await incrAsync(`${topic}-${currentMint}`);
	await expireAsync(topic, 60);
	return count >= MAX_SMS_COUNT_PER_MINT;
};

const isLimitPerMinuteExceeded = async topic => {
	const currentMint = Math.floor(new Date().getTime() / (60 * 1000));
	const count = await getAsync(`${topic}-${currentMint}`);
	return count >= MAX_SMS_COUNT_PER_MINT;
};

const shutdown = () => {
	client.end(true);
};

module.exports = {
	incLimitPerMinuteExceeded,
	isLimitPerMinuteExceeded,
	shutdown,
};
