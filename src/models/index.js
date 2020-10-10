import Sequelize from 'sequelize';
import User from './User';
import Bug from './Bug';
import Comment from './Comment';
import Domain from './Domain';
import Initiative from './Initiative';
import Project from './Project';
import Organization from './Organization';

const sequelize = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USER}`, `${process.env.DB_PASS}`, {
	host: `${process.env.DB_HOST}`,
	dialect: 'postgres',
	ssl: true,
	dialectOptions: {
		ssl: { requre: true, rejectUnauthorized: false },
	},
});
const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.models = {
// 	User: User(sequelize, Sequelize.DataTypes),
// 	Bug: Bug(sequelize, Sequelize.DataTypes),
// 	Comment: Comment(sequelize, Sequelize.DataTypes),
// 	Initiative: Initiative(sequelize, Sequelize.DataTypes),
// 	Project: Project(sequelize, Sequelize.DataTypes),
// 	Organization: Organization(sequelize, Sequelize.DataTypes),
// 	Domain: Domain(sequelize, Sequelize.DataTypes),
// };

db.User = User(sequelize, Sequelize.DataTypes);
db.Bug = Bug(sequelize, Sequelize.DataTypes);
db.Comment = Comment(sequelize, Sequelize.DataTypes);
db.Initiative = Initiative(sequelize, Sequelize.DataTypes);
db.Project = Project(sequelize, Sequelize.DataTypes);
db.Organization = Organization(sequelize, Sequelize.DataTypes);
db.Domain = Domain(sequelize, Sequelize.DataTypes);

export default db;
