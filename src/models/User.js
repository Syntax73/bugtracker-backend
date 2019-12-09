const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fix virtual field
class User extends Model {
  static init(sequelize) {
    super.init(
      {
        avatar: DataTypes.STRING,
        avatar_url: DataTypes.VIRTUAL,
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('developer', 'test_lead', 'project_lead', 'admin'),
      },
      { sequelize }
    );

    super.addHook('beforeCreate', async user => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    });
  }

  static associate(models) {
    this.belongsToMany(models.Project, {
      foreignKey: 'user_id',
      through: 'project_users',
      as: 'projects',
    });
    this.hasMany(models.Bug, { foreignKey: 'user_id', as: 'bugs' });
    this.hasMany(models.BugAssigned, { foreignKey: 'user_id', as: 'assigned' });
  }

  async checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  generateToken() {
    return jwt.sign(
      { id: this.id, email: this.email, role: this.role },
      process.env.APP_KEY,
      { expiresIn: '2 days' }
    );
  }
}

module.exports = User;
