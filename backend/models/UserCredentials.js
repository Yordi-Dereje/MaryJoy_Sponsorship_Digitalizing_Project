const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCredentials = sequelize.define('UserCredentials', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'database_officer', 'coordinator', 'sponsor'),
    allowNull: false
  },
  // Foreign key references
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  sponsor_cluster_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  sponsor_specific_id: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  // Status fields
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_credentials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['phone_number']
    },
    {
      fields: ['role']
    },
    {
      fields: ['employee_id']
    },
    {
      fields: ['sponsor_cluster_id', 'sponsor_specific_id']
    }
  ]
});

// Validation to ensure either email or phone is provided
UserCredentials.addHook('beforeValidate', (user) => {
  if (!user.email && !user.phone_number) {
    throw new Error('Either email or phone number must be provided');
  }
});

// Validation to ensure proper foreign key relationships based on role
UserCredentials.addHook('beforeValidate', (user) => {
  if (user.role === 'admin' || user.role === 'database_officer' || user.role === 'coordinator') {
    if (!user.employee_id) {
      throw new Error('Employee ID is required for admin, database_officer, and coordinator roles');
    }
    if (user.sponsor_cluster_id || user.sponsor_specific_id) {
      throw new Error('Sponsor references should not be set for employee roles');
    }
  } else if (user.role === 'sponsor') {
    if (!user.sponsor_cluster_id || !user.sponsor_specific_id) {
      throw new Error('Sponsor cluster_id and specific_id are required for sponsor role');
    }
    if (user.employee_id) {
      throw new Error('Employee ID should not be set for sponsor role');
    }
  }
});

// Instance methods
UserCredentials.prototype.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.locked_until && this.locked_until < Date.now()) {
    return this.update({
      login_attempts: 1,
      locked_until: null
    });
  }
  
  const updates = { login_attempts: this.login_attempts + 1 };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.login_attempts + 1 >= 5 && !this.is_locked) {
    updates.locked_until = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  }
  
  return this.update(updates);
};

UserCredentials.prototype.resetLoginAttempts = function() {
  return this.update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  });
};

UserCredentials.prototype.is_locked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

// Instance methods for sponsor relationship
UserCredentials.prototype.getSponsor = function() {
  if (this.role !== 'sponsor' || !this.sponsor_cluster_id || !this.sponsor_specific_id) {
    return null;
  }
  
  const { Sponsor } = require('./index');
  return Sponsor.findOne({
    where: {
      cluster_id: this.sponsor_cluster_id,
      specific_id: this.sponsor_specific_id
    }
  });
};

// Static methods
UserCredentials.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { email: identifier },
        { phone_number: identifier }
      ]
    }
  });
};

UserCredentials.findByRole = function(role) {
  return this.findAll({
    where: { role: role }
  });
};

UserCredentials.findBySponsor = function(clusterId, specificId) {
  return this.findOne({
    where: {
      role: 'sponsor',
      sponsor_cluster_id: clusterId,
      sponsor_specific_id: specificId
    }
  });
};

module.exports = UserCredentials;
