const project = (sequelize, DataTypes) => {
	const Project = sequelize.define('Project', {
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
	});

	Project.associate = (models) => {
		Project.hasMany(models.Domain, { onDelete: 'CASCADE' });
		Project.belongsTo(models.Organization);
	};
	return Project;
};

// organization_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//         model: Organization,
//         key: 'id',
//     },
// },

export default project;
