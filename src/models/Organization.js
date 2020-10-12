const organization = (sequelize, DataTypes) => {
	const Organization = sequelize.define('Organization', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
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
		//Organization.belongsTo(models.User, { as: 'creator', foreignKey: 'creator_id' });
		Organization.hasMany(models.User, {
			as: 'users',
			foreignKey: { name: 'organization_id', allowNull: false },
			onDelete: 'CASCADE',
		});
		Organization.hasMany(models.Project, {
			onDelete: 'CASCADE',
			foreignKey: { name: 'organization_id', allowNull: false },
		});
	};

	return Organization;
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
