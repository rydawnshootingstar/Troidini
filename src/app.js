import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import db from './models/index';
import bcrypt from 'bcrypt';
import initializePassport from './passport-config';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';
import cors from 'cors';
import SequelizeSession from 'express-session-sequelize';

import { v4 as uuidv4 } from 'uuid';

const SessionStore = SequelizeSession(session.Store);
const sequelizeSessionStore = new SessionStore({
	db: db.sequelize,
});

/*
	-----------------INIT SERVER-----------------
*/

const corsOptions = { origin: 'http://localhost:8080', optionsSuccessStatus: 200, credentials: true };
const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser(process.env.SECRET_KEY));
const server = http.createServer(app);
const io = socketIO(server);

initializePassport(passport, db);
app.use(
	session({
		secret: process.env.SECRET_KEY,
		resave: false,
		saveUninitialized: false,
		store: sequelizeSessionStore,
	})
);

// TODO: Probably going to be removing flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL); // update to match the domain you will make the request from
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

/* 
	-----------------DEV DB UTILS-----------------
*/
const resetDB = async (db) => {
	const result = await db.sequelize.sync({ force: true });
	console.log(result);
};

const authDB = async (db) => {
	const auth = await db.sequelize.authenticate();
	console.log('database connected');
};

/*
	-----------------API UTILS-----------------	
*/
const apiResponse = (success, message, error = null) => {
	return {
		success,
		message,
		error,
	};
};

const checkAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	res.status(401).send('not logged in');
};

const checkNotAuthenticated = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
};

const checkUserInOrganization = (req, res, next) => {
	if (!req.user.organization_id === req.params.id) {
		res.send('Users cannot access other organizations');
	}
	return next();
};

/*
	-----------------ROUTES-----------------
*/

app.get('/resume', checkAuthenticated, (req, res) => {
	const {
		id,
		avatar_url,
		username,
		email,
		active,
		online_status,
		type,
		settings,
		organization_id,
	} = req.user.dataValues;
	res.send({ id, avatar_url, username, email, active, online_status, type, settings, organization_id });
});

app.get('/', checkAuthenticated, (req, res) => {
	// console.log(req.user);
	res.send('you did it!');
});

app.get('/login', (req, res) => {
	res.send('you on da login screen');
});

app.get('/logout', async (req, res) => {
	if (req.user) {
		req.user.online_status = false;
		await req.user.save();
		await req.logOut();
		req.session.destroy(async () => {
			res.clearCookie('connect.sid');
			res.status(200).send('logged out');
		});

		// TODO: socket.io event to social window component >
		// social window component calls a redux action >
		// redux state causes rerender
	} else {
		return res.status(401).send('not logged in');
	}
});

app.get('/error', (req, res) => {
	res.send('error');
});

// TODO: Not sure if we'll be using server side redirects. Check the interaction with react router later
app.post(
	'/login',
	passport.authenticate('local', {
		//successRedirect: '/',
		//failureRedirect: '/login',
		//failureFlash: true,
	}),
	(req, res, next) => {
		const {
			id,
			avatar_url,
			username,
			email,
			active,
			online_status,
			type,
			settings,
			organization_id,
		} = req.user.dataValues;
		res.send({ id, avatar_url, username, email, active, online_status, type, settings, organization_id });
	}
);

app.post(
	'/organizations/create',
	/*checkAuthenticated,*/ async (req, res) => {
		try {
			const invite_code = uuidv4();
			// will probably produce a duplicate code after around 50,000 times, but who cares
			const admin_passcode = Math.random().toString(36).substring(7);
			const organizationData = { ...req.body, invite_code, admin_passcode };
			const newOrganization = await db.Organization.create(organizationData);
			res.send(newOrganization);
		} catch (err) {
			res.send(err);
		}
	}
);

// updates expect a body of { changes : { "key": "value" } }

app.patch('/organizations/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const organization = await db.Organization.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			organization[key] = value;
		}
		await organization.save();
		res.send(apiResponse(true, 'Organization successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this organization', err.message));
	}
});

app.delete('/organizations/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Organization.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Organization successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this organization', err.message));
	}
});

app.post('/organizations/verify/invite', async (req, res) => {
	try {
		const targetOrganization = await db.Organization.findOne({
			where: {
				invite_code: req.body.organization_code,
			},
		});
		res.send({ organization_id: targetOrganization.id });
	} catch (err) {
		res.status(404).send(apiResponse(false, 'Incorrect organization code', err.message));
	}
});

app.post('/users/check', async (req, res) => {
	try {
		const user = await db.User.findOne({
			where: {
				email: req.body.email,
			},
		});

		if (user) {
			res.status(409).send(`Email is already taken`);
		}
		res.status(200).send(`Email is not taken`);
	} catch (err) {
		res.send(` There was a problem looking up this user: ${err.message}`);
	}
});

app.post(
	'/users/create',
	/*checkAuthenticated,*/ async (req, res) => {
		console.log(req.body);
		try {
			const unhashedPassword = req.body.password;
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const newUser = await db.User.create(req.body);
			res.status(200).send({ email: req.body.email, password: unhashedPassword });
		} catch (err) {
			res.status(409).send(` There was a problem creating this user: ${err.errors[0].message}`);
		}
	}
);

// TODO: sequelize will not allow you to modify the id (pk) of an instance, but it will allow you to change a foreign key.
// either mitigate this by picking off specific values you want to be able to change, or find another way to make them

app.patch('/users/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const user = await db.User.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			user[key] = value;
		}
		await user.save();
		res.send(apiResponse(true, 'User successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this user', err.message));
	}
});

app.delete('/users/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.User.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'User successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this user', err.message));
	}
});

app.post('/projects/create', checkAuthenticated, async (req, res) => {
	try {
		const newProject = await db.Project.create({ ...req.body, organization_id: req.user.organization_id });
		res.send(newProject);
	} catch (err) {
		res.status(404).send(err);
	}
});

app.get('/projects', checkAuthenticated, async (req, res) => {
	try {
		console.log(req.user);
		const targetOrganization = await db.Organization.findByPk(req.user.organization_id);
		const projects = await targetOrganization.getProjects();
		res.send({ projects });
	} catch (err) {
		res.send(apiResponse(false, 'Could not get projects for this organization', err.message));
	}
});

app.patch('/projects/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const project = await db.Project.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			project[key] = value;
		}
		await project.save();
		res.send(apiResponse(true, 'Project successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this project', err.message));
	}
});

app.delete('/projects/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Project.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Project successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this project', err.message));
	}
});

app.post('/domains/create', checkAuthenticated, async (req, res) => {
	try {
		const newDomain = await db.Domain.create({ ...req.body });
		res.send(newDomain);
	} catch (err) {
		res.status(404).send(err);
	}
});

app.patch('/domains/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const domain = await db.Domain.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			domain[key] = value;
		}
		await domain.save();
		res.send(apiResponse(true, 'Domain successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this domain', err.message));
	}
});

app.delete('/domains/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Domain.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Domain successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this domain', err.message));
	}
});

app.post('/bugs/create', checkAuthenticated, async (req, res) => {
	try {
		const newBug = await db.Bug.create(req.body);
		res.send(newBug);
	} catch (err) {
		res.send(err);
	}
});

app.patch('/bugs/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const bug = await db.Bug.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			bug[key] = value;
		}
		await bug.save();
		res.send(apiResponse(true, 'Bug successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this bug', err.message));
	}
});

app.delete('/bugs/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Bug.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Bug successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this bug', err.message));
	}
});

app.post('/comments/create', checkAuthenticated, async (req, res) => {
	try {
		const newComment = await db.Comment.create(req.body);
		res.send(newComment);
	} catch (err) {
		res.send(err);
	}
});

app.patch('/comments/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const comment = await db.Comment.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			comment[key] = value;
		}
		await comment.save();
		res.send(apiResponse(true, 'Comment successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this comment', err.message));
	}
});

app.delete('/comments/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Comment.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Comment successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this comment', err.message));
	}
});

app.post('/initiatives/create', checkAuthenticated, async (req, res) => {
	try {
		const newInitiative = await db.Initiative.create(req.body);
		res.send(newInitiative);
	} catch (err) {
		res.send(err);
	}
});

app.patch('/initiatives/update/:id', checkAuthenticated, async (req, res) => {
	try {
		const initiative = await db.Initiative.findByPk(req.params.id);
		for (const [key, value] of Object.entries(req.body.changes)) {
			initiative[key] = value;
		}
		await initiative.save();
		res.send(apiResponse(true, 'Initiative successfully updated'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not update this initiative', err.message));
	}
});

app.patch('/initiatives/addbugs/:id', checkAuthenticated, async (req, res) => {
	try {
		const initiative = await db.Initiative.findByPk(req.params.id);

		req.body.bugs.forEach(async (bugId) => {
			await initiative.addBugs(bugId);
		});

		res.send(apiResponse(true, 'Bugs successfully added to Initiative'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not add bugs to this initiative', err.message));
	}
});

app.patch('/initiatives/removebugs/:id', checkAuthenticated, async (req, res) => {
	try {
		const initiative = await db.Initiative.findByPk(req.params.id);

		req.body.bugs.forEach(async (bugId) => {
			await initiative.removeBugs(bugId);
		});

		res.send(apiResponse(true, 'Bugs successfully removed from Initiative'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not remove bugs from this initiative', err.message));
	}
});

app.delete('/initiatives/delete/:id', checkAuthenticated, async (req, res) => {
	try {
		await db.Initiative.destroy({
			where: {
				id: req.params.id,
			},
		});
		res.send(apiResponse(true, 'Initiative successfully deleted'));
	} catch (err) {
		res.send(apiResponse(false, 'Could not delete this initiative', err.message));
	}
});

// app.get('/organization/:id', checkAuthenticated, async (req, res) => {
// 	try {
// 		const targetOrganization = await db.Organization.findByPk(req.params.id);
// 		const users = await targetOrganization.getUsers();
// 		const projects = await targetOrganization.getProjects();
// 		const domains = await projects[0].getDomains();
// 		const initiatives = await domains[0].getInitiatives();

// 		res.send({ user: req.user, targetOrganization, users, projects, domains, initiatives });
// 	} catch (err) {
// 		res.send(err);
// 	}
// });

app.get('/organization/:id', checkAuthenticated, async (req, res) => {
	try {
		const targetOrganization = await db.Organization.findByPk(req.params.id);
		const users = await targetOrganization.getUsers();
		// const projects = await targetOrganization.getProjects();
		// const domains = await projects[0].getDomains();
		// const initiatives = await domains[0].getInitiatives();
		res.send({ users: users.dataValues, org: targetOrganization.dataValues });
		//res.send({ user: req.user, targetOrganization, users, projects, domains, initiatives });
	} catch (err) {
		res.send(err);
	}
});

/*
	-----------------START SERVER-----------------
*/

server.listen(process.env.PORT || 4000, () => {
	console.log(`server is started on ${process.env.PORT || '4000'}`);
	//resetDB(db);
	//authDB(db);
});
