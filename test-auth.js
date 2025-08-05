// Test script to verify registration API
const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Registration Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Registration Error:', error);
  }
};

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const data = await response.json();
    console.log('Login Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Login Error:', error);
  }
};

// Run tests
console.log('Testing Registration...');
testRegistration();

setTimeout(() => {
  console.log('\\nTesting Login...');
  testLogin();
}, 2000);
