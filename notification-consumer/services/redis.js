const { promisify } = require('util');
const redis = require('redis');
const { MAX_SMS_COUNT_PER_MINT, REDIS_URL } = require('../configurations');

const client = redis.createClient(REDIS_URL);

client.on('error', function(error) {
	console.error('redis error', error);
});

const llenAsync = promisify(client.llen).bind(client);
const existsAsync = promisify(client.exists).bind(client);
const rpushxAsync = promisify(client.rpushx).bind(client);
const setAsync = promisify(client.set).bind(client);
/*
Source: https://redis.io/commands/incr
FUNCTION LIMIT_API_CALL(ip)
current = LLEN(ip)
IF current > 10 THEN
    ERROR "too many requests per second"
ELSE
    IF EXISTS(ip) == FALSE
        MULTI
            RPUSH(ip,ip)
            EXPIRE(ip,1)
        EXEC
    ELSE
        RPUSHX(ip,ip)
    END
    PERFORM_API_CALL()
END 
*/
const isLimitPerMinuteExceeded = async topic => {
	const len = await llenAsync(topic);
	console.log(len);
	if (len > MAX_SMS_COUNT_PER_MINT) {
		return true;
	}
	const topicExists = await existsAsync(topic);
	if (!topicExists) {
		const importMulti = client.multi();
		importMulti.rpush(topic, topic);
		importMulti.expire(topic, 60);

		importMulti.exec((err, results) => {
			if (err) {
				throw err;
			} else {
				console.log(results);
			}
		});
	} else {
		await rpushxAsync(topic, topic);
	}
	return false;
};

const updateTopicOffset = (topic, offset) => setAsync(`offset-${topic}`, offset);

const shutdown = () => {
	client.end(true);
};

module.exports = {
	updateTopicOffset,
	isLimitPerMinuteExceeded,
	shutdown,
};
