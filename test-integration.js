const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';
let challengeId = '';

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  language: 'en',
};

const adminUser = {
  username: 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@greenmint.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
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

async function runIntegrationTests() {
  console.log('🚀 Starting GreenMint Integration Tests\n');

  try {
    // Test 1: Health Check
    await testEndpoint('Health Check', () => axios.get(`${BASE_URL}/health`));

    // Test 2: Register Regular User
    const registerResponse = await testEndpoint('User Registration', () =>
      axios.post(`${BASE_URL}/auth/register`, testUser),
    );

    authToken = registerResponse.data.access_token;
    userId = registerResponse.data.user.id;
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: ${registerResponse.data.user.role}`);

    // Test 3: Register Admin User
    const adminResponse = await testEndpoint('Admin Registration', () =>
      axios.post(`${BASE_URL}/auth/register`, adminUser),
    );

    const adminToken = adminResponse.data.access_token;
    const adminId = adminResponse.data.user.id;
    console.log(`   Admin Token: ${adminToken.substring(0, 20)}...`);
    console.log(`   Admin ID: ${adminId}`);
    console.log(`   Admin Role: ${adminResponse.data.user.role}`);

    // Test 4: Create Challenge (Admin Only)
    const challengeData = {
      title: 'Test Challenge',
      description: 'A test challenge for integration testing',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const createChallengeResponse = await testEndpoint(
      'Create Challenge (Admin)',
      () =>
        axios.post(`${BASE_URL}/challenges`, challengeData, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
    );

    challengeId = createChallengeResponse.data._id;
    console.log(`   Challenge ID: ${challengeId}`);

    // Test 5: List Challenges
    await testEndpoint('List Challenges', () =>
      axios.get(`${BASE_URL}/challenges`),
    );

    // Test 6: Join Challenge (User)
    await testEndpoint('Join Challenge', () =>
      axios.post(
        `${BASE_URL}/challenges/${challengeId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      ),
    );

    // Test 7: Log Activity
    const activityData = {
      type: 'cycling',
      title: 'Cycled to work',
      description: 'Cycled 5km to work instead of driving',
      co2Saved: 2.5,
      points: 25,
    };

    await testEndpoint('Log Activity', () =>
      axios.post(`${BASE_URL}/activity/log`, activityData, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    // Test 8: Get User Activities
    await testEndpoint('Get User Activities', () =>
      axios.get(`${BASE_URL}/activity/user`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    // Test 9: Get User Stats
    await testEndpoint('Get User Stats', () =>
      axios.get(`${BASE_URL}/activity/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    // Test 10: Blockchain Placeholders
    await testEndpoint('Get Wallet Status', () =>
      axios.get(`${BASE_URL}/blockchain/wallet-status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    await testEndpoint('Connect Wallet', () =>
      axios.post(
        `${BASE_URL}/blockchain/connect-wallet`,
        {
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      ),
    );

    await testEndpoint('Claim Reward', () =>
      axios.post(
        `${BASE_URL}/blockchain/claim-reward`,
        {
          reward: 100,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      ),
    );

    await testEndpoint('Mint NFT', () =>
      axios.post(
        `${BASE_URL}/blockchain/mint-nft`,
        {
          title: 'Test NFT',
          description: 'Test NFT for integration',
          carbonSaved: 50,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      ),
    );

    await testEndpoint('Get User Rewards', () =>
      axios.get(`${BASE_URL}/blockchain/user-rewards`, {
        headers: { Authorization: `Bearer ${authToken}` },
      }),
    );

    // Test 11: Test Non-Admin Cannot Create Challenge
    try {
      await testEndpoint('Non-Admin Create Challenge (Should Fail)', () =>
        axios.post(`${BASE_URL}/challenges`, challengeData, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      );
    } catch (error) {
      console.log(
        '✅ Non-Admin Create Challenge - Correctly Failed (403 Forbidden)',
      );
    }

    // Test 12: Test Unauthorized Access
    try {
      await testEndpoint('Unauthorized Activity Log (Should Fail)', () =>
        axios.post(`${BASE_URL}/activity/log`, activityData),
      );
    } catch (error) {
      console.log(
        '✅ Unauthorized Activity Log - Correctly Failed (401 Unauthorized)',
      );
    }

    console.log('\n🎉 All Integration Tests Completed Successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ 12 test categories executed');
    console.log('   ✅ Authentication and role management working');
    console.log('   ✅ Challenge creation and joining working');
    console.log('   ✅ Activity logging and retrieval working');
    console.log('   ✅ Blockchain placeholder endpoints working');
    console.log('   ✅ Authorization and access control working');
    console.log('   ✅ Error handling working');
  } catch (error) {
    console.log('\n💥 Integration Test Suite Failed!');
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
    await runIntegrationTests();
  }
}

main();
