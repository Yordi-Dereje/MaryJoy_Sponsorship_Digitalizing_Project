const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints...');
  console.log('=====================================');

  try {
    // Test login endpoint
    console.log('🔄 Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@maryjoy.org',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('   User:', loginData.user.fullName);
      console.log('   Role:', loginData.user.role);
      
      // Test token verification
      console.log('🔄 Testing token verification...');
      const verifyResponse = await fetch(`${BASE_URL}/verify`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Token verification successful');
        console.log('   Verified user:', verifyData.user.fullName);
      } else {
        console.log('❌ Token verification failed:', verifyData.error);
      }

      // Test protected endpoint (this would need to be implemented)
      console.log('🔄 Testing protected endpoint access...');
      const protectedResponse = await fetch('http://localhost:5000/api/health', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      if (protectedResponse.ok) {
        console.log('✅ Protected endpoint access successful');
      } else {
        console.log('ℹ️  Protected endpoint test skipped (endpoint may not exist)');
      }

    } else {
      console.log('❌ Login failed:', loginData.error);
    }

    // Test invalid login
    console.log('🔄 Testing invalid login...');
    const invalidLoginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'admin@maryjoy.org',
        password: 'wrongpassword'
      })
    });

    const invalidLoginData = await invalidLoginResponse.json();
    
    if (!invalidLoginResponse.ok) {
      console.log('✅ Invalid login correctly rejected:', invalidLoginData.error);
    } else {
      console.log('❌ Invalid login should have been rejected');
    }

    console.log('\n🎉 Authentication endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on port 5000');
    console.log('   Run: npm start (in backend directory)');
  }
}

// Run tests if called directly
if (require.main === module) {
  testAuthEndpoints();
}

module.exports = testAuthEndpoints;
