const sendPushNotification = async (fcmToken, message) => {
	console.log(`sending push notification ...${fcmToken} ${message}`);
};

module.exports = {
	sendPushNotification,
};
