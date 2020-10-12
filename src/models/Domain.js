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
		//Domain.belongsTo(models.Project, { foreignKey: 'project_id' });
		Domain.hasMany(models.Bug, { onDelete: 'CASCADE', foreignKey: { name: 'domain_id', allowNull: false } });
		Domain.hasMany(models.Initiative, { onDelete: 'CASCADE', foreignKey: 'domain_id' });
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
