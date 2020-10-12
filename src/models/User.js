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
			type: DataTypes.ENUM(['Admin', 'Developer', 'Support']),
			allowNull: false,
		},
	});

	User.associate = (models) => {
		User.hasMany(models.Comment, {
			as: 'Author',
			onDelete: 'CASCADE',
			foreignKey: { name: 'user_id', allowNull: false },
		});
		User.hasMany(models.Bug, { as: 'Creator', foreignKey: { name: 'user_id', allowNull: false } });
		User.belongsTo(models.Organization, {
			as: 'organization',
			foreignKey: { name: 'organization_id', allowNull: false },
		});
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
