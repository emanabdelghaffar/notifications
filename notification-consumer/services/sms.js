const sendSMS = (phoneNumber, message) =>
	new Promise(resolve => {
		setTimeout(() => {
			console.log(`sending sms ...${phoneNumber} ${message}`);
			resolve(`sending notification ...${phoneNumber} ${message}`);
		}, 100);
	});

module.exports = {
	sendSMS,
};
