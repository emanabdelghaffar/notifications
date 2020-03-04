const kafka = require('kafka-node');
const { promisify } = require('util');

const { KAFKA_HOST, SMS_NOTIFICATION_TOPIC, PUSH_NOTIFICATION_TOPIC } = require('../configurations');

const client = new kafka.KafkaClient({ kafkaHost: KAFKA_HOST });

const { HighLevelProducer } = kafka;

const smsProducer = new HighLevelProducer(client);

const producerPromise = new Promise(resolve => {
	smsProducer.on('ready', function() {
		resolve();
	});
});

const onError = err => {
	console.log('Producer err:', err);
};
smsProducer.on('error', onError);
const sendAsync = promisify(smsProducer.send).bind(smsProducer);
const publishSMSs = messages =>
	producerPromise.then(() => sendAsync([{ topic: SMS_NOTIFICATION_TOPIC, messages: messages.map(JSON.stringify) }]));

const pushNotificationProducer = new HighLevelProducer(client);

const pushProducerPromise = new Promise(resolve => {
	pushNotificationProducer.on('ready', function() {
		resolve();
	});
});

pushNotificationProducer.on('error', onError);
const sendPushNotificationAsync = promisify(pushNotificationProducer.send).bind(pushNotificationProducer);
const publishPushNotifications = messages =>
	pushProducerPromise.then(() =>
		sendPushNotificationAsync([{ topic: PUSH_NOTIFICATION_TOPIC, messages: messages.map(JSON.stringify) }])
	);

module.exports = {
	publishSMSs,
	publishPushNotifications,
};
