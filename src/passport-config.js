import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const initialize = (passport, db) => {
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'email',
			},
			async (email, password, done) => {
				try {
					const user = await db.User.findOne({
						where: {
							email: email,
						},
					});

					if (!user) {
						return done(null, false, { message: 'User not found. Check email or password' });
					}

					const passwordMatches = await bcrypt.compare(password, user.password);

					if (!passwordMatches) {
						return done(null, false, { message: 'User not found. Check email or password' });
					}

					user.online_status = true;
					await user.save();

					return done(null, user);
				} catch (err) {
					return done(null, false, { message: err.message });
				}
			}
		)
	);

	passport.serializeUser((user, done) => {
		return done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		const user = await db.User.findByPk(id);
		return done(null, user);
	});
};

export default initialize;
