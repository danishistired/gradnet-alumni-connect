const fs = require('fs');
const path = require('path');

// Function to generate a referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Read the database
const dbPath = path.join(__dirname, 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Migrating existing users...');

// Track generated referral codes to ensure uniqueness
const existingCodes = new Set();

// Collect existing referral codes
db.users.forEach(user => {
  if (user.referralCode) {
    existingCodes.add(user.referralCode);
  }
});

// Function to generate unique referral code
function generateUniqueReferralCode() {
  let code;
  do {
    code = generateReferralCode();
  } while (existingCodes.has(code));
  existingCodes.add(code);
  return code;
}

let updatedCount = 0;

// Update each user with missing fields
db.users.forEach(user => {
  let updated = false;

  // Add creditPoints if missing
  if (user.creditPoints === undefined) {
    user.creditPoints = user.accountType === 'student' ? 10 : 0;
    updated = true;
  }

  // Add freeInterviews if missing
  if (user.freeInterviews === undefined) {
    user.freeInterviews = user.accountType === 'student' ? 1 : 0;
    updated = true;
  }

  // Add referralCode if missing
  if (!user.referralCode) {
    user.referralCode = generateUniqueReferralCode();
    updated = true;
  }

  // Add referredBy if missing
  if (user.referredBy === undefined) {
    user.referredBy = null;
    updated = true;
  }

  // Add referralCount if missing
  if (user.referralCount === undefined) {
    user.referralCount = 0;
    updated = true;
  }

  // Add subscription if missing (students only)
  if (user.subscription === undefined && user.accountType === 'student') {
    user.subscription = {
      plan: 'basic',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: null
    };
    updated = true;
  }

  if (updated) {
    updatedCount++;
    console.log(`Updated user: ${user.firstName} ${user.lastName} (${user.email})`);
  }
});

// Write back to database
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`Migration complete! Updated ${updatedCount} users.`);

// Print some statistics
const students = db.users.filter(u => u.accountType === 'student').length;
const alumni = db.users.filter(u => u.accountType === 'alumni').length;
const totalReferralCodes = db.users.filter(u => u.referralCode).length;

console.log(`\nStatistics:`);
console.log(`- Total users: ${db.users.length}`);
console.log(`- Students: ${students}`);
console.log(`- Alumni: ${alumni}`);
console.log(`- Users with referral codes: ${totalReferralCodes}`);