import express from 'express';
import db from './models/index';
import bcrypt from 'bcrypt';
import initializePassport from './passport-config';
import passport from 'passport';
import flash from 'express-flash';
import session from 'express-session';

const app = express();
app.use(express.json());

initializePassport(passport, db);
app.use(
	session({
		secret: process.env.SECRET_KEY,
		resave: false,
		saveUninitialized: false,
	})
);

// TODO: Probably going to be removing this
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// drops and recreates all tables
const resetDB = async (db) => {
	const result = await db.sequelize.sync({ force: true });
	console.log(result);
};

app.get('/', (req, res) => {
	console.log(req.user);
	res.send('you did it!');
});

app.get('/login', (req, res) => {
	res.send('you on da login screen');
});

app.post('/logout', async (req, res) => {
	if (req.user) {
		req.user.online_status = false;
		await req.user.save();
		req.logOut();
		return res.redirect('/');

		// TODO: socket.io event to social window component >
		// social window component calls a redux action >
		// redux state causes rerender
	} else {
		// TODO: protect this route so anything that doesn't have a logged in req.user is ignored
		return res.send('not logged in');
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
		res.send(req.user);
	}
);

// tests connection to db
const authDB = async (db) => {
	const auth = await db.sequelize.authenticate();
	console.log('database connected');
};

app.post('/organizations/create', async (req, res) => {
	try {
		const newOrganization = await db.Organization.create(req.body);
		res.send(newOrganization);
	} catch (err) {
		res.send(err);
	}
});

app.post('/users/create', async (req, res) => {
	console.log(req.body);
	try {
		req.body.password = await bcrypt.hash(req.body.password, 10);
		const newUser = await db.User.create(req.body);
		res.send(newUser);
	} catch (err) {
		res.send(` There was a problem creating this user: ${err.errors[0].message}`);
	}
});

app.post('/projects/create', async (req, res) => {
	try {
		const newProject = await db.Project.create(req.body);
		res.send(newProject);
	} catch (err) {
		res.send(err);
	}
});

app.post('/domains/create', async (req, res) => {
	try {
		const newDomain = await db.Domain.create(req.body);
		res.send(newDomain);
	} catch (err) {
		res.send(err);
	}
});

app.post('/bugs/create', async (req, res) => {
	try {
		const newBug = await db.Bug.create(req.body);
		res.send(newBug);
	} catch (err) {
		res.send(err);
	}
});

app.post('/comments/create', async (req, res) => {
	try {
		const newComment = await db.Comment.create(req.body);
		res.send(newComment);
	} catch (err) {
		res.send(err);
	}
});

app.post('/initiatives/create', async (req, res) => {
	try {
		const newInitiative = await db.Initiative.create(req.body);
		res.send(newInitiative);
	} catch (err) {
		res.send(err);
	}
});

app.get('/organization/:id', async (req, res) => {
	try {
		const targetOrganization = await db.Organization.findByPk(req.params.id);
		const users = await targetOrganization.getUsers();
		const projects = await targetOrganization.getProjects();
		const domains = await projects[0].getDomains();

		res.send({ targetOrganization, users, projects, domains });
	} catch (err) {
		res.send(err);
	}
});

app.listen(process.env.PORT || 4000, () => {
	console.log(`server is started on ${process.env.PORT || '4000'}`);
	//resetDB(db);
	//authDB(db);
});
