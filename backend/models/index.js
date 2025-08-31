const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

// Import models
const Address = require('./Address');
const BankInformation = require('./BankInformation');
const Beneficiary = require('./Beneficiary');
const Employee = require('./Employee');
const Guardian = require('./Guardian');
const Payment = require('./Payment');
const PhoneNumber = require('./PhoneNumber');
const Sponsor = require('./Sponsor');
const Sponsorship = require('./Sponsorship');

// Define associations

// Address associations
Address.hasMany(Sponsor, { foreignKey: 'address_id', as: 'sponsors' });
Address.hasMany(Guardian, { foreignKey: 'address_id', as: 'guardians' });
Address.hasMany(Beneficiary, { foreignKey: 'address_id', as: 'beneficiaries' });

// Sponsor associations (composite key)
Sponsor.hasMany(Sponsorship, { 
  foreignKey: ['sponsor_cluster_id', 'sponsor_specific_id'],
  as: 'sponsorships'
});
Sponsor.hasMany(Payment, { 
  foreignKey: ['sponsor_cluster_id', 'sponsor_specific_id'],
  as: 'payments'
});
Sponsor.hasMany(PhoneNumber, { 
  foreignKey: ['sponsor_cluster_id', 'sponsor_specific_id'],
  as: 'phoneNumbers'
});
Sponsor.hasMany(BankInformation, { 
  foreignKey: ['sponsor_cluster_id', 'sponsor_specific_id'],
  as: 'bankInformation'
});
Sponsor.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Sponsor.belongsTo(Employee, { foreignKey: 'created_by', as: 'creator' });

// Beneficiary associations
Beneficiary.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });
Beneficiary.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Beneficiary.hasMany(Sponsorship, { foreignKey: 'beneficiary_id', as: 'sponsorships' });
Beneficiary.hasMany(PhoneNumber, { foreignKey: 'beneficiary_id', as: 'phoneNumbers' });
Beneficiary.hasMany(BankInformation, { foreignKey: 'beneficiary_id', as: 'bankInformation' });

// Guardian associations
Guardian.hasMany(Beneficiary, { foreignKey: 'guardian_id', as: 'beneficiaries' });
Guardian.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Guardian.hasMany(PhoneNumber, { foreignKey: 'guardian_id', as: 'phoneNumbers' });
Guardian.hasMany(BankInformation, { foreignKey: 'guardian_id', as: 'bankInformation' });

// Employee associations
Employee.hasMany(Sponsor, { foreignKey: 'created_by', as: 'createdSponsors' });
Employee.hasMany(Payment, { foreignKey: 'confirmed_by', as: 'confirmedPayments' });

// Sponsorship associations - FIXED: Use sourceKey for composite keys
Sponsorship.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_cluster_id',
  targetKey: 'cluster_id',
  as: 'sponsor',
  constraints: false // Disable constraints for composite key
});
Sponsorship.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor_specific',
  constraints: false // Disable constraints for composite key
});
Sponsorship.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });

// Payment associations - FIXED: Use sourceKey for composite keys
Payment.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_cluster_id',
  targetKey: 'cluster_id',
  as: 'sponsor',
  constraints: false
});
Payment.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor_specific',
  constraints: false
});
Payment.belongsTo(Employee, { foreignKey: 'confirmed_by', as: 'confirmedBy' });

// PhoneNumber associations - FIXED: Use sourceKey for composite keys
PhoneNumber.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_cluster_id',
  targetKey: 'cluster_id',
  as: 'sponsor',
  constraints: false
});
PhoneNumber.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor_specific',
  constraints: false
});
PhoneNumber.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
PhoneNumber.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });

// BankInformation associations - FIXED: Use sourceKey for composite keys
BankInformation.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_cluster_id',
  targetKey: 'cluster_id',
  as: 'sponsor',
  constraints: false
});
BankInformation.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor_specific',
  constraints: false
});
BankInformation.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
BankInformation.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });

module.exports = {
  sequelize,
  Sequelize,
  Address,
  BankInformation,
  Beneficiary,
  Employee,
  Guardian,
  Payment,
  PhoneNumber,
  Sponsor,
  Sponsorship
};
