const initiative = (sequelize, DataTypes) => {
	const Initiative = sequelize.define('Initiative', {
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
		status: {
			type: DataTypes.ENUM(['New', 'In Progress', 'Complete']),
			allowNull: false,
			defaultValue: 'New',
		},
		purpose: {
			type: DataTypes.STRING,
		},
		impact_score: {
			type: DataTypes.INTEGER,
		},
	});

	Initiative.associate = (models) => {
		Initiative.belongsTo(models.User, { as: 'Creator', foreignKey: { name: 'user_id', allowNull: false } });
		// Initiative.hasMany(models.Bug, {
		// 	foreignKey: { type: DataTypes.ARRAY(DataTypes.INTEGER), name: 'initiative_ids' },
		// });
		Initiative.belongsToMany(models.Bug, { through: 'Initiatives_With_Bugs' });
	};
	return Initiative;
};

// project_id: {
//     type: DataTypes.INTEGER,
//     references: {
//         model: Project,
//         key: 'id',
//     },
// },

export default initiative;
