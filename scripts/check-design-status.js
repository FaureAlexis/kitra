require('dotenv').config();

async function checkDesignStatus() {
  console.log('🔍 CHECKING DESIGN STATUS IN DATABASE');
  console.log('====================================');
  
  const designId = 'f57f1681-b8a2-4053-b6c9-550e81fa189f';
  console.log('Design ID:', designId);
  
  try {
    // Import the database client
    const { db } = require('../src/lib/database/client.ts');
    
    console.log('\n📋 Fetching design from database...');
    const { data: design, error } = await db.getAdminClient()
      .from('designs')
      .select('id, name, status, creator_address, votes, votes_for, votes_against')
      .eq('id', designId)
      .single();
    
    if (error) {
      console.error('❌ Database error:', error);
      return;
    }
    
    if (!design) {
      console.log('❌ Design not found in database');
      console.log('💡 Make sure the design ID is correct');
      return;
    }
    
    console.log('✅ Design found:');
    console.log('   ID:', design.id);
    console.log('   Name:', design.name);
    console.log('   Status:', design.status);
    console.log('   Creator:', design.creator_address);
    console.log('   Total votes:', design.votes || 0);
    console.log('   Votes for:', design.votes_for || 0);
    console.log('   Votes against:', design.votes_against || 0);
    
    // Check if status is 'candidate'
    if (design.status === 'candidate') {
      console.log('\n✅ Design is eligible for voting (status: candidate)');
    } else {
      console.log('\n⚠️ Design is NOT eligible for voting');
      console.log('   Current status:', design.status);
      console.log('   Need to change status to "candidate" to enable voting');
      
      // Offer to update status
      console.log('\n💡 SQL to make this design votable:');
      console.log(`UPDATE designs SET status = 'candidate' WHERE id = '${designId}';`);
    }
    
  } catch (error) {
    console.error('💥 Failed to check design:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Database is connected');
    console.log('   - Design exists in database');
    console.log('   - Database credentials are correct');
  }
}

checkDesignStatus(); 