// Using built-in fetch (available in Node.js 18+)
// If you're using an older version, install node-fetch: npm install node-fetch

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing UniConnect API Connection...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server health check failed');
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the backend server first.');
    console.log('   Run: cd backend && npm run dev');
    return;
  }

  try {
    // Test projects endpoint (should return 401 without auth)
    console.log('\n2. Testing projects endpoint...');
    const projectsResponse = await fetch(`${API_BASE_URL}/projects`);
    if (projectsResponse.status === 401) {
      console.log('✅ Projects endpoint is working (authentication required)');
    } else {
      console.log('⚠️  Projects endpoint returned unexpected status:', projectsResponse.status);
    }
  } catch (error) {
    console.log('❌ Projects endpoint test failed:', error.message);
  }

  try {
    // Test users endpoint (should return 401 without auth)
    console.log('\n3. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    if (usersResponse.status === 401) {
      console.log('✅ Users endpoint is working (authentication required)');
    } else {
      console.log('⚠️  Users endpoint returned unexpected status:', usersResponse.status);
    }
  } catch (error) {
    console.log('❌ Users endpoint test failed:', error.message);
  }

  console.log('\n🎉 Connection test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Start the frontend: cd frontend && npm start');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. Register a new account or use demo credentials');
  console.log('   - Student: john@university.edu / password123');
  console.log('   - Admin: admin@uniconnect.com / password123');
}

testConnection(); 