const async = require('async');
const kafka = require('kafka-node');
const util = require('util');
const uuidv4 = require('uuid').v4;

const { KAFKA_HOST, SMS_NOTIFICATION_TOPIC, PUSH_NOTIFICATION_TOPIC } = require('./configurations');
const { isLimitPerMinuteExceeded } = require('./services/redis');
const { sendSMS } = require('./services/sms');
const { sendPushNotification } = require('./services/push-notification');

const { ConsumerGroup } = kafka;

const consumerOptions = {
	kafkaHost: KAFKA_HOST,
	groupId: 'ExampleTestGroup',
	sessionTimeout: 15000,
	protocol: ['roundrobin'],
	asyncPush: false,
	autoCommit: false,
	fromOffset: 'earliest',
};

const smsConsumerGroup = new ConsumerGroup({ ...consumerOptions, id: uuidv4() }, [SMS_NOTIFICATION_TOPIC]);
const commitSmsConsumerGroup = util.promisify(smsConsumerGroup.commit).bind(smsConsumerGroup);

const RESUME_INTERVAL = 500;
let isSmsConsumerGroupPaused = false;
const resumePausedSmsConsumerGroup = () => {
	if (isSmsConsumerGroupPaused) {
		console.log('resuming');
		smsConsumerGroup.resume();
		isSmsConsumerGroupPaused = false;
	}
};

setInterval(resumePausedSmsConsumerGroup, RESUME_INTERVAL);

const onError = console.log;
const onSMSMessage = async function(message) {
	try {
		const data = JSON.parse(message.value);
		const limitReached = await isLimitPerMinuteExceeded(message.topic);
		console.log(message);
		if (limitReached) {
			console.log('limitReached to', limitReached);
			if (isSmsConsumerGroupPaused) {
				return;
			}
			isSmsConsumerGroupPaused = true;
			smsConsumerGroup.pause();
			return;
		}
		await sendSMS(data.phoneNumber, data.message);
		await commitSmsConsumerGroup();
	} catch (err) {
		console.log(err);
	}
};
smsConsumerGroup.on('error', onError);
smsConsumerGroup.on('message', onSMSMessage);

const pushConsumerGroup = new ConsumerGroup({ ...consumerOptions, id: 'push1' }, [PUSH_NOTIFICATION_TOPIC]);
const commitPushConsumerGroup = util.promisify(pushConsumerGroup.commit).bind(pushConsumerGroup);

const onPushMessage = async function(message) {
	try {
		const data = JSON.parse(message.value);
		await sendPushNotification(data.fcmToken, data.message);
		await commitPushConsumerGroup();
	} catch (err) {
		console.log(err);
	}
};
pushConsumerGroup.on('error', onError);
pushConsumerGroup.on('message', onPushMessage);

process.once('SIGINT', function() {
	async.each([pushConsumerGroup, smsConsumerGroup], function(consumer, callback) {
		consumer.close(true, callback);
	});
});
