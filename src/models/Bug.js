const bug = (sequelize, DataTypes) => {
	const Bug = sequelize.define('Bug', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		tags: {
			type: DataTypes.JSONB,
		},
		priority: {
			type: DataTypes.STRING,
		},
		current_behavior: {
			type: DataTypes.STRING,
		},
		intended_behavior: {
			type: DataTypes.STRING,
		},
		image_urls: {
			type: DataTypes.JSONB,
		},
		steps_to_reproduce: {
			type: DataTypes.JSONB,
		},
		status: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'new',
		},
	});

	Bug.associate = (models) => {
		Bug.belongsTo(models.Domain);
		Bug.belongsToMany(models.Initiative, { through: 'Initiatives_With_Bugs' });
		//Bug.belongsTo(models.User, { as: 'Creator' });
	};
	return Bug;
};

// domain_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//         model: Domain,
//         key: 'id',
//     },
// },
// initiative_ids: {
//     type: DataTypes.ARRAY(DataTypes.INTEGER),
//     references: {
//         model: Initiative,
//         key: 'id',
//     },
// },

export default bug;
