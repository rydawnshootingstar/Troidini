const organization = (sequelize, DataTypes) => {
	const Organization = sequelize.define('Organization', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		logo_url: {
			type: DataTypes.STRING,
		},
		has_custom_theme: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		custom_theme: {
			type: DataTypes.JSONB,
		},
	});

	Organization.associate = (models) => {
		//Organization.belongsTo();
		Organization.hasMany(models.User, { as: 'users', foreignKey: 'OrganizationId', onDelete: 'CASCADE' });
		Organization.hasMany(models.Project, { onDelete: 'CASCADE' });
	};

	return organization;
};

// owner_id: {
// 	type: DataTypes.INTEGER,
// 	allowNull: false,
// 	references: {
// 		model: User,
// 		key: 'id',
// 	},
// },

export default organization;
