const user = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		online_status: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		active: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		type: {
			type: DataTypes.ENUM('Admin, Developer, Support'),
			allowNull: false,
		},
	});

	User.associate = (models) => {
		User.hasMany(models.Comment, { as: 'Author', onDelete: 'CASCADE', foreignKey: 'user_id' });
		User.hasMany(models.Bug, { as: 'Creator', foreignKey: 'user_id' });
		User.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
	};

	return User;
};

/*
	organization_id: {
		type: DataTypes.INTEGER,
		references: {
			model: Organization,
			key: 'id',
		},
	},

*/
export default user;
