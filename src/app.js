import express from 'express';
import db from './models/index';
import project from './models/Project';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());

// drops and recreates all tables
const resetDB = async (db) => {
	const result = await db.sequelize.sync({ force: true });
	console.log(result);
};

// tests connection to db
const authDB = async (db) => {
	const auth = await db.sequelize.authenticate();
	console.log('database connected');
};

app.post('/organizations/create', async (req, res) => {
	const newOrganization = await db.Organization.create(req.body);
	res.send(newOrganization);
});

app.post('/users/create', async (req, res) => {
	console.log(req.body);
	const newUser = await db.User.create(req.body);
	res.send(newUser);
});

app.post('/projects/create', async (req, res) => {
	const newProject = await db.Project.create(req.body);
	res.send(newProject);
});

app.post('/domains/create', async (req, res) => {
	const newDomain = await db.Domain.create(req.body);
	res.send(newDomain);
});

app.post('/bugs/create', async (req, res) => {
	const newBug = await db.Bug.create(req.body);
	res.send(newBug);
});

app.post('/comments/create', async (req, res) => {
	const newComment = await db.Comment.create(req.body);
	res.send(newComment);
});

app.post('/initiatives/create', async (req, res) => {
	const newInitiative = await db.Initiative.create(req.body);
	res.send(newInitiative);
});

app.get('/organization/:id', async (req, res) => {
	const targetOrganization = await db.Organization.findAll({
		where: {
			id: req.params.id,
		},
	});

	res.send(targetOrganization);
});

app.listen(process.env.PORT || 4000, () => {
	console.log(`server is started on ${process.env.PORT || '4000'}`);
	resetDB(db);
	//authDB(db);
});
