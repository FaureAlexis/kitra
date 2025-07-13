require('dotenv').config();

async function testVoting() {
  console.log('🧪 TESTING SIMPLIFIED VOTING SYSTEM');
  console.log('==================================');
  
  // Test data
  const testData = {
    designId: 'test-design-123',
    voterAddress: '0x6b0dFdD17Dc0ECA9f4802e2589F653e90F405B6C', // Your deployer address
    support: true,
    reason: 'I love this design!'
  };
  
  console.log('📋 Test data:', testData);
  
  try {
    // Test 1: Cast a vote
    console.log('\n🗳️ Test 1: Casting vote...');
    const voteResponse = await fetch('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const voteData = await voteResponse.json();
    console.log('Vote response:', {
      status: voteResponse.status,
      success: voteData.success,
      error: voteData.error,
      weight: voteData.weight
    });
    
    if (voteData.success) {
      console.log('✅ Vote cast successfully!');
    } else {
      console.log('❌ Vote failed:', voteData.error);
    }
    
    // Test 2: Check vote status
    console.log('\n🔍 Test 2: Checking vote status...');
    const statusResponse = await fetch(
      `http://localhost:3000/api/vote?designId=${testData.designId}&voterAddress=${testData.voterAddress}`
    );
    
    const statusData = await statusResponse.json();
    console.log('Status response:', {
      status: statusResponse.status,
      success: statusData.success,
      hasVoted: statusData.hasVoted,
      design: statusData.design
    });
    
    // Test 3: Try to vote again (should fail)
    console.log('\n🚫 Test 3: Trying to vote again (should fail)...');
    const duplicateResponse = await fetch('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const duplicateData = await duplicateResponse.json();
    console.log('Duplicate vote response:', {
      status: duplicateResponse.status,
      success: duplicateData.success,
      error: duplicateData.error
    });
    
    if (!duplicateData.success && duplicateData.error.includes('already voted')) {
      console.log('✅ Duplicate vote prevention works!');
    } else {
      console.log('❌ Duplicate vote prevention failed');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Next.js dev server is running (npm run dev)');
    console.log('   - Database is connected');
    console.log('   - BasicVoting token is deployed');
  }
}

console.log('🚀 Starting voting tests...');
console.log('💡 Note: This tests the API directly, bypassing UI');
console.log('');

testVoting(); 