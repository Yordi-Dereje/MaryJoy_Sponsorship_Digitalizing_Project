const bcrypt = require('bcrypt');
const { UserCredentials, Employee, sequelize } = require('./models');

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication system...');
    
    // Check if user exists
    const user = await UserCredentials.findByEmailOrPhone('db.officer@maryjoy.org');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      employee_id: user.employee_id
    });
    
    // Check if employee exists
    if (user.employee_id) {
      const employee = await Employee.findByPk(user.employee_id);
      if (employee) {
        console.log('✅ Employee found:', {
          id: employee.id,
          full_name: employee.full_name,
          email: employee.email,
          role: employee.role
        });
      } else {
        console.log('❌ Employee not found for ID:', user.employee_id);
      }
    }
    
    // Test password verification
    const testPassword = 'dbofficer123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
    console.log('🔐 Password verification:', isValidPassword);
    
    // Check if account is locked
    console.log('🔒 Account locked:', user.is_locked());
    console.log('🔒 Login attempts:', user.login_attempts);
    console.log('🔒 Locked until:', user.locked_until);
    
    // Check if account is active
    console.log('✅ Account active:', user.is_active);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await sequelize.close();
  }
}

debugAuth();
