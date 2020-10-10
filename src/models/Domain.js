const domain = (sequelize, DataTypes) => {
	const Domain = sequelize.define('Domain', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		repository_url: {
			type: DataTypes.STRING,
		},
	});

	Domain.associate = (models) => {
		Domain.belongsTo(models.Project);
		Domain.hasMany(models.Bug);
		Domain.hasMany(models.Initiative);
	};
	return Domain;
};

// project_id: {
//     type: DataTypes.INTEGER,
//     references: {
//         model: Project,
//         key: 'id',
//     },
// },
export default domain;
