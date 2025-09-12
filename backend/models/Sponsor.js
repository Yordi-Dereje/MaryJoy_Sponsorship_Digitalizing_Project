const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CompositeKeyHandler = require('../utils/compositeKeyHandler');

const Sponsor = sequelize.define('Sponsor', {
  cluster_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  specific_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('individual', 'organization'),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true
  },
  starting_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  agreed_monthly_payment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  emergency_contact_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending_review', 'under_review'),
    allowNull: false
  },
  is_diaspora: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  address_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  consent_document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'sponsors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Custom method for composite key operations
Sponsor.prototype.getFullSponsorships = function() {
  const { Sponsorship, Beneficiary } = require('./index');
  return Sponsorship.findAll({
    where: CompositeKeyHandler.buildSponsorWhere(this.cluster_id, this.specific_id),
    include: [{
      model: Beneficiary,
      as: 'beneficiary'
    }]
  });
};

Sponsor.prototype.getFullPayments = function() {
  const { Payment } = require('./index');
  return Payment.findAll({
    where: CompositeKeyHandler.buildSponsorWhere(this.cluster_id, this.specific_id)
  });
};

Sponsor.prototype.getBankInformation = function() {
  const { BankInformation } = require('./index');
  return BankInformation.findAll({
    where: CompositeKeyHandler.buildSponsorWhere(this.cluster_id, this.specific_id)
  });
};

// Static method to find by composite key
Sponsor.findByCompositeKey = function(clusterId, specificId) {
  return this.findOne({
    where: { cluster_id: clusterId, specific_id: specificId },
    include: ['address', 'creator']
  });
};

// Static method to get all data for a sponsor
Sponsor.getCompleteSponsorData = function(clusterId, specificId) {
  const { Sponsorship, Payment, BankInformation, Beneficiary } = require('./index');
  
  return this.findByCompositeKey(clusterId, specificId)
    .then(sponsor => {
      if (!sponsor) return null;
      
      return Promise.all([
        sponsor.getFullSponsorships(),
        sponsor.getFullPayments(),
        sponsor.getBankInformation()
      ]).then(([sponsorships, payments, bankInfo]) => {
        return {
          sponsor,
          sponsorships,
          payments,
          bankInformation: bankInfo
        };
      });
    });
};

module.exports = Sponsor;
