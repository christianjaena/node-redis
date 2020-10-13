const express = require('express');
const handleBars = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const redis = require('redis');
const port = process.env.PORT || 5000;

const app = express();
const client = redis.createClient();
client.on('connect', () => {
	console.log('Redis connected');
});

app.engine('handlebars', handleBars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res, next) => {
	res.render('searchusers');
});

app.get('/user/add', (req, res, next) => {
	res.render('adduser');
});

app.post('/user/search', (req, res, next) => {
	let id = req.body.id;

	client.hgetall(id, (err, obj) => {
		if (!obj) {
			res.render('searchusers', {
				error: 'User does not exists',
			});
		} else {
			obj.id = id;
			res.render('details', {
				user: obj,
			});
		}
	});
});

app.post('/user/add', (req, res, next) => {
	let id = req.body.id;
	let first_name = req.body.first_name;
	let last_name = req.body.last_name;
	let email = req.body.email;
	let phone = req.body.phone;

	client.hmset(
		id,
		[
			'first_name',
			first_name,
			'last_name',
			last_name,
			'email',
			email,
			'phone',
			phone,
		],
		(err, reply) => {
			if (err) {
				console.log(err);
			}
			console.log(reply);
			res.redirect('/');
		}
	);
});

app.delete('/user/delete/:id', (req, res, next) => {
	client.del(req.params.id);
	res.redirect('/');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
