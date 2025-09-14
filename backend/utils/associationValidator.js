const { Sponsor, Guardian, Beneficiary, Address, Employee, PhoneNumber, BankInformation, Sponsorship, Payment } = require('../models');

/**
 * Validates that model associations are correctly defined
 * This helps catch issues like trying to access guardian_id on Sponsor
 */
class AssociationValidator {
  static validateSponsorAssociations() {
    const errors = [];
    
    // Check that Sponsor doesn't have guardian_id
    const sponsorAttributes = Object.keys(Sponsor.rawAttributes);
    if (sponsorAttributes.includes('guardian_id')) {
      errors.push('Sponsor model should not have guardian_id attribute');
    }
    
    // Check that Sponsor has correct associations
    const sponsorAssociations = Object.keys(Sponsor.associations);
    const expectedAssociations = ['address', 'creator', 'payments', 'bankInformation'];
    
    expectedAssociations.forEach(association => {
      if (!sponsorAssociations.includes(association)) {
        errors.push(`Sponsor model missing expected association: ${association}`);
      }
    });
    
    // Check that Sponsor doesn't have guardian association
    if (sponsorAssociations.includes('guardian')) {
      errors.push('Sponsor model should not have guardian association');
    }
    
    return errors;
  }
  
  static validateBeneficiaryAssociations() {
    const errors = [];
    
    // Check that Beneficiary has guardian_id
    const beneficiaryAttributes = Object.keys(Beneficiary.rawAttributes);
    if (!beneficiaryAttributes.includes('guardian_id')) {
      errors.push('Beneficiary model should have guardian_id attribute');
    }
    
    // Check that Beneficiary has guardian association
    const beneficiaryAssociations = Object.keys(Beneficiary.associations);
    if (!beneficiaryAssociations.includes('guardian')) {
      errors.push('Beneficiary model missing guardian association');
    }
    
    return errors;
  }
  
  static validateGuardianAssociations() {
    const errors = [];
    
    // Check that Guardian has beneficiaries association
    const guardianAssociations = Object.keys(Guardian.associations);
    if (!guardianAssociations.includes('beneficiaries')) {
      errors.push('Guardian model missing beneficiaries association');
    }
    
    return errors;
  }
  
  static validateAllAssociations() {
    const allErrors = [];
    
    allErrors.push(...this.validateSponsorAssociations());
    allErrors.push(...this.validateBeneficiaryAssociations());
    allErrors.push(...this.validateGuardianAssociations());
    
    return allErrors;
  }
  
  static logValidationResults() {
    const errors = this.validateAllAssociations();
    
    if (errors.length === 0) {
      console.log('✅ All model associations are correctly defined');
    } else {
      console.error('❌ Model association validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
    }
    
    return errors;
  }
}

module.exports = AssociationValidator;
