import express from 'express';
import db from './models/index';

// db.sequelize.authenticate()
// 	.then(() => {
// 		console.log('database connected');
// 	})
// 	.catch((err) => console.error(err));

const app = express();

db.sequelize.sync({ force: true }).then((result) => {
	console.log(result);
	app.listen(process.env.PORT || 4000, () => {
		console.log(`server is started on ${process.env.PORT || '4000'}`);
	});
});
