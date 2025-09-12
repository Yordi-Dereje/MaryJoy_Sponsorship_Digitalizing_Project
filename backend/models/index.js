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

// Sponsor associations - Use specific_id as foreign key
/**
Sponsor.hasMany(Sponsorship, { 
  foreignKey: 'sponsor_specific_id',
  sourceKey: 'specific_id',
  as: 'sponsorships',
  constraints: false
});
*/
Sponsor.hasMany(Payment, { 
  foreignKey: 'sponsor_specific_id',
  sourceKey: 'specific_id',
  as: 'payments',
  constraints: false
});
Sponsor.hasMany(BankInformation, { 
  foreignKey: 'sponsor_specific_id',
  sourceKey: 'specific_id',
  as: 'bankInformation',
  constraints: false
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

// Sponsorship associations - Use specific_id as foreign key
/**Sponsorship.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor',
  constraints: false,
  scope: {
    sponsor_cluster_id: Sequelize.col('Sponsorship.sponsor_cluster_id')
  }
});
*/

Sponsorship.belongsTo(Beneficiary, { 
  foreignKey: 'beneficiary_id',
  as: 'beneficiary'
});

// Payment associations - Use specific_id as foreign key
Payment.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor',
  constraints: false
});
Payment.belongsTo(Employee, { foreignKey: 'confirmed_by', as: 'confirmedBy' });

// PhoneNumber associations
PhoneNumber.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
PhoneNumber.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });

// BankInformation associations - Use specific_id as foreign key
BankInformation.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor',
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
