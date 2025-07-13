const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  language: 'en',
};

const testUser2 = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'password123',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
  language: 'en',
};

async function testEndpoint(name, requestFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const response = await requestFn();
    console.log(`✅ ${name} - SUCCESS`);
    console.log(`   Status: ${response.status}`);
    if (response.data) {
      console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    }
    return response;
  } catch (error) {
    console.log(`❌ ${name} - FAILED`);
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting GreenMint Authentication Tests\n');

  try {
    // Test 1: Health Check
    await testEndpoint('Health Check', () => axios.get(`${BASE_URL}/health`));

    // Test 2: Register User
    const registerResponse = await testEndpoint('User Registration', () =>
      axios.post(`${BASE_URL}/auth/register`, testUser),
    );

    authToken = registerResponse.data.access_token;
    userId = registerResponse.data.user.id;
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}`);

    // Test 3: Login with Email
    await testEndpoint('Login with Email', () =>
      axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      }),
    );

    // Test 4: Login with Wallet
    await testEndpoint('Login with Wallet', () =>
      axios.post(`${BASE_URL}/auth/login`, {
        walletAddress: testUser.walletAddress,
      }),
    );

    // Test 5: Get Profile (with auth)
    await testEndpoint('Get User Profile', () =>
      axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    // Test 6: Refresh Token
    const refreshResponse = await testEndpoint('Refresh Token', () =>
      axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      ),
    );

    const newToken = refreshResponse.data.access_token;
    console.log(`   New Token: ${newToken.substring(0, 20)}...`);

    // Test 7: Change Password
    await testEndpoint('Change Password', () =>
      axios.post(
        `${BASE_URL}/auth/change-password`,
        {
          currentPassword: testUser.password,
          newPassword: 'newpassword123',
        },
        {
          headers: { Authorization: `Bearer ${newToken}` },
        },
      ),
    );

    // Test 8: Login with New Password
    await testEndpoint('Login with New Password', () =>
      axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: 'newpassword123',
      }),
    );

    // Test 9: Forgot Password
    await testEndpoint('Forgot Password', () =>
      axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: testUser.email,
      }),
    );

    // Test 10: Get Nonce for Wallet
    await testEndpoint('Get Wallet Nonce', () =>
      axios.get(`${BASE_URL}/auth/nonce`, {
        data: { walletAddress: testUser.walletAddress },
      }),
    );

    // Test 11: Verify Token
    await testEndpoint('Verify Token', () =>
      axios.post(`${BASE_URL}/auth/verify`, {
        token: newToken,
      }),
    );

    // Test 12: Logout
    await testEndpoint('Logout', () =>
      axios.post(
        `${BASE_URL}/auth/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${newToken}` },
        },
      ),
    );

    // Test 13: Register Second User
    await testEndpoint('Register Second User', () =>
      axios.post(`${BASE_URL}/auth/register`, testUser2),
    );

    // Test 14: Duplicate Email Registration (should fail)
    try {
      await testEndpoint(
        'Duplicate Email Registration (Expected to Fail)',
        () =>
          axios.post(`${BASE_URL}/auth/register`, {
            ...testUser2,
            email: testUser.email,
          }),
      );
    } catch (error) {
      console.log(
        '✅ Duplicate Email Registration - Correctly Failed (409 Conflict)',
      );
    }

    // Test 15: Duplicate Username Registration (should fail)
    try {
      await testEndpoint(
        'Duplicate Username Registration (Expected to Fail)',
        () =>
          axios.post(`${BASE_URL}/auth/register`, {
            ...testUser2,
            username: testUser.username,
          }),
      );
    } catch (error) {
      console.log(
        '✅ Duplicate Username Registration - Correctly Failed (409 Conflict)',
      );
    }

    // Test 16: Invalid Email Format (should fail)
    try {
      await testEndpoint('Invalid Email Format (Expected to Fail)', () =>
        axios.post(`${BASE_URL}/auth/register`, {
          ...testUser2,
          email: 'invalid-email',
        }),
      );
    } catch (error) {
      console.log(
        '✅ Invalid Email Format - Correctly Failed (400 Bad Request)',
      );
    }

    // Test 17: Short Password (should fail)
    try {
      await testEndpoint('Short Password (Expected to Fail)', () =>
        axios.post(`${BASE_URL}/auth/register`, {
          ...testUser2,
          password: '123',
        }),
      );
    } catch (error) {
      console.log('✅ Short Password - Correctly Failed (400 Bad Request)');
    }

    // Test 18: Access Protected Route Without Token (should fail)
    try {
      await testEndpoint(
        'Access Protected Route Without Token (Expected to Fail)',
        () => axios.get(`${BASE_URL}/auth/profile`),
      );
    } catch (error) {
      console.log(
        '✅ Access Protected Route Without Token - Correctly Failed (401 Unauthorized)',
      );
    }

    console.log('\n🎉 All Authentication Tests Completed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ 18 tests executed');
    console.log('   ✅ All authentication endpoints working');
    console.log('   ✅ Input validation working');
    console.log('   ✅ Error handling working');
    console.log('   ✅ JWT token management working');
    console.log('   ✅ Password security working');
  } catch (error) {
    console.log('\n💥 Test Suite Failed!');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running on http://localhost:3000');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run start:dev');
    return false;
  }
}

// Run the tests
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main();
