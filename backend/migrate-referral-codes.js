const fs = require('fs');
const path = require('path');

// Read the database
function readDB() {
  const dbPath = path.join(__dirname, 'database.json');
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

// Write to the database
function writeDB(db) {
  const dbPath = path.join(__dirname, 'database.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Add prefixes to existing referral codes
function migrateReferralCodes() {
  const db = readDB();
  let updatedCount = 0;

  console.log('Starting referral code migration...');
  console.log(`Found ${db.users.length} users in database`);

  for (const user of db.users) {
    if (user.referralCode && !user.referralCode.includes('-')) {
      // This is a legacy code without prefix, add the appropriate prefix
      const prefix = user.accountType === 'student' ? '-s' : '-a';
      const oldCode = user.referralCode;
      user.referralCode = user.referralCode + prefix;
      
      console.log(`Updated ${user.accountType} ${user.firstName} ${user.lastName}: ${oldCode} → ${user.referralCode}`);
      updatedCount++;
    } else if (user.referralCode) {
      console.log(`Skipped ${user.accountType} ${user.firstName} ${user.lastName}: ${user.referralCode} (already has prefix)`);
    } else {
      console.log(`Skipped ${user.firstName} ${user.lastName}: no referral code`);
    }
  }

  if (updatedCount > 0) {
    writeDB(db);
    console.log(`\n✅ Migration completed! Updated ${updatedCount} referral codes.`);
  } else {
    console.log('\n✅ No referral codes needed updating.');
  }
}

// Run the migration
try {
  migrateReferralCodes();
} catch (error) {
  console.error('❌ Migration failed:', error);
}