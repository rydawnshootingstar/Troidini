const comment = (sequelize, DataTypes) => {
	const Comment = sequelize.define('Comment', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		content: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
	});

	Comment.associate = (models) => {
		Comment.belongsTo(models.User, { as: 'Author', foreignKey: 'user_id' });
		Comment.belongsTo(models.Bug, { foreignKey: 'bug_id' });
	};
	return Comment;
};

// bug_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//         model: Bug,
//         key: 'id',
//     },
// },
// author_id: {
//     type: DataTypes.INTEGER,
//     references: {
//         model: User,
//         key: 'id',
//     },
// },

export default comment;
