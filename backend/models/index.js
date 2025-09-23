const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

// Import already-initialized models
const Address = require('./Address');
const BankInformation = require('./BankInformation');
const Beneficiary = require('./Beneficiary');
const Employee = require('./Employee')(sequelize, DataTypes);
const Guardian = require('./Guardian');
const Payment = require('./Payment');
const PhoneNumber = require('./PhoneNumber');
const Sponsor = require('./Sponsor');
const Sponsorship = require('./Sponsorship');
const UserCredentials = require('./UserCredentials');

// Define associations in the correct order

// Add this to your models/index.js temporarily
console.log('Employee type:', typeof Employee);
console.log('Employee is function:', typeof Employee === 'function');
console.log('Employee is object:', typeof Employee === 'object');

// 1. First, set up associations that DON'T depend on other models
Address.hasMany(Sponsor, { foreignKey: 'address_id', as: 'sponsors' });
Address.hasMany(Guardian, { foreignKey: 'address_id', as: 'guardians' });
Address.hasMany(Beneficiary, { foreignKey: 'address_id', as: 'beneficiaries' });

// 2. Employee associations (simple ones)
Employee.hasMany(Sponsor, { foreignKey: 'created_by', as: 'createdSponsors' });
Employee.hasMany(Payment, { foreignKey: 'confirmed_by', as: 'confirmedPayments' });

// 3. Guardian associations
Guardian.hasMany(Beneficiary, { foreignKey: 'guardian_id', as: 'beneficiaries' });
Guardian.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Guardian.hasMany(PhoneNumber, { foreignKey: 'guardian_id', as: 'phoneNumbers' });
Guardian.hasMany(BankInformation, { foreignKey: 'guardian_id', as: 'bankInformation' });

// 4. Beneficiary associations
Beneficiary.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });
Beneficiary.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Beneficiary.hasMany(Sponsorship, { foreignKey: 'beneficiary_id', as: 'sponsorships' });
Beneficiary.hasMany(PhoneNumber, { foreignKey: 'beneficiary_id', as: 'phoneNumbers' });
Beneficiary.hasMany(BankInformation, { foreignKey: 'beneficiary_id', as: 'bankInformation' });

// 5. PhoneNumber associations
PhoneNumber.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
PhoneNumber.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });

// Sponsor ↔ BankInformation association
Sponsor.hasMany(BankInformation, {
  foreignKey: 'sponsor_specific_id',
  sourceKey: 'specific_id',
  as: 'bankInformation',
  constraints: false
});


// 6. BankInformation associations
BankInformation.belongsTo(Beneficiary, { foreignKey: 'beneficiary_id', as: 'beneficiary' });
BankInformation.belongsTo(Guardian, { foreignKey: 'guardian_id', as: 'guardian' });

// 7. Sponsor associations - MOVE THESE AFTER ALL OTHER MODELS ARE DEFINED
Sponsor.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });
Sponsor.belongsTo(Employee, { foreignKey: 'created_by', as: 'creator' });
Sponsor.hasMany(Payment, { 
  foreignKey: 'sponsor_specific_id',
  sourceKey: 'specific_id',
  as: 'payments',
  constraints: false
});

// 8. Payment associations
Payment.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor',
  constraints: false
});
Payment.belongsTo(Employee, { foreignKey: 'confirmed_by', as: 'confirmedBy' });

// 9. Sponsorship associations
Sponsorship.belongsTo(Beneficiary, { 
  foreignKey: 'beneficiary_id',
  as: 'beneficiary'
});

// 10. BankInformation sponsor association (moved to end)
BankInformation.belongsTo(Sponsor, { 
  foreignKey: 'sponsor_specific_id',
  targetKey: 'specific_id',
  as: 'sponsor',
  constraints: false
});

// 11. UserCredentials associations
UserCredentials.belongsTo(Employee, { 
  foreignKey: 'employee_id', 
  as: 'employee',
  constraints: false
});

// Note: Composite key associations are handled manually in UserCredentials model
// We'll use custom methods instead of Sequelize associations for sponsor relationships

// Reverse associations
Employee.hasOne(UserCredentials, { 
  foreignKey: 'employee_id', 
  as: 'credentials'
});

// Sponsor association is handled manually due to composite key limitations

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
  Sponsorship,
  UserCredentials
};
