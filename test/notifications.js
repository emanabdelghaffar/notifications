const chai = require('chai');
const chaiHttp = require('chai-http');
const { server } = require('../notification-publisher/index');

const { expect } = chai;
chai.use(chaiHttp);

describe('publishing notifications endpoint', () => {
	after(() => {
		server.close();
	});
	it('should publish sms notifications', done => {
		const body = {
			type: 'sms',
			data: [...Array(100).keys()].map(i => ({
				phoneNumber: `0100000${i}`,
				message: `messagenumber${i}`,
			})),
		};
		chai
			.request(server)
			.post('/notifications')
			.set('content-type', 'application/json')
			.send(body)
			.end((err, res) => {
				expect(res).to.have.status(200);
				done();
			});
	});
	it('should publish push notifications', done => {
		const body = {
			type: 'push-notification',
			data: [...Array(100).keys()].map(i => ({
				phoneNumber: `0100000${i}`,
				message: `messagenumber${i}`,
			})),
		};
		chai
			.request(server)
			.post('/notifications')
			.set('content-type', 'application/json')
			.send(body)
			.end((err, res) => {
				expect(res).to.have.status(200);
				done();
			});
	});
});
