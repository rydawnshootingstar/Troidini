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
		purpose: {
			type: DataTypes.STRING,
		},
		impact_score: {
			type: DataTypes.INTEGER,
		},
	});

	Initiative.associate = (models) => {
		Initiative.belongsTo(models.User, { as: 'Creator', foreignKey: 'user_id' });
		Initiative.hasMany(models.Bug, { foreignKey: 'initiative_id' });
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
