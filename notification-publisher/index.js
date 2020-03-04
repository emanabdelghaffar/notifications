require('dotenv').config();

const Koa = require('koa');
const morgan = require('koa-morgan');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const { PORT } = require('./configurations');
const { createNotifications } = require('./controllers');

const app = new Koa();

const router = new Router();
router.post('/notifications', createNotifications);

const server = app
	.use(morgan('tiny'))
	.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods())
	.listen(PORT);

app.on('error', err => {
	console.log(`server error ${err}`);
});

module.exports = {
	server,
};
