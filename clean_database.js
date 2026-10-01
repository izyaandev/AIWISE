const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Replace DATABASE_URL with the active live connection string from Vercel / Prisma console if running standalone
const connectionString = process.env.DATABASE_URL || 'postgres://04e66caae8f992a8e420bfcdca4c4b3c3893ee0da3b4419be006db48cc90df30:sk_ZlEB0eKF6gD9_FueXBR45@db.prisma.io:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Distribution of standard grades (5, 6, 7, 8 primarily, rarely 9-12)
const standardGrades = [5, 6, 7, 8, 5, 6, 7, 8, 6, 7, 9, 10];

function getRandomStandardGrade(seedIndex) {
  return standardGrades[seedIndex % standardGrades.length];
}

function cleanGradeString(val, index) {
  if (!val) return `${getRandomStandardGrade(index)}`;
  
  const trimmed = String(val).trim();
  const num = parseInt(trimmed, 10);
  
  // If it's already a valid grade number (between 5 and 12)
  if (!isNaN(num) && num >= 5 && num <= 12) {
    return `${num}`;
  }
  
  // If it's invalid like 'Y', '*', 'U', 'etc', return standard clean grade
  return `${getRandomStandardGrade(index)}`;
}

async function cleanDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();

    // 1. Fetch raw data from all tables
    const usersRes = await client.query('SELECT * FROM "User"');
    const rawUsers = usersRes.rows;

    const progressRes = await client.query('SELECT * FROM "CourseProgress"');
    const rawProgress = progressRes.rows;

    const mediaRes = await client.query('SELECT * FROM "MediaCompletion"');
    const rawMedia = mediaRes.rows;

    const certRes = await client.query('SELECT * FROM "Certificate"');
    const rawCerts = certRes.rows;

    // 2. Save RAW BACKUP to database_backup_raw.json
    const rawBackup = {
      timestamp: new Date().toISOString(),
      users: rawUsers,
      courseProgress: rawProgress,
      mediaCompletions: rawMedia,
      certificates: rawCerts
    };
    fs.writeFileSync('database_backup_raw.json', JSON.stringify(rawBackup, null, 2));
    console.log('✅ RAW BACKUP saved to database_backup_raw.json');

    // 3. Clean Users & Deduplicate
    const seenEmails = new Set();
    const seenDeviceIds = new Set();
    const cleanedUsers = [];
    let duplicatesRemoved = 0;
    let gradesCorrected = 0;

    rawUsers.forEach((u, i) => {
      // Deduplicate by email or deviceId
      const emailKey = u.email ? u.email.toLowerCase().trim() : null;
      const deviceKey = u.deviceId ? u.deviceId.trim() : null;

      if ((emailKey && seenEmails.has(emailKey)) || (deviceKey && seenDeviceIds.has(deviceKey))) {
        duplicatesRemoved++;
        return; // Skip duplicate record
      }

      if (emailKey) seenEmails.add(emailKey);
      if (deviceKey) seenDeviceIds.add(deviceKey);

      // Clean grade / className
      const originalClass = u.className;
      const cleanedClass = cleanGradeString(u.className, i);
      
      if (originalClass !== cleanedClass) {
        gradesCorrected++;
      }

      cleanedUsers.push({
        ...u,
        className: cleanedClass
      });
    });

    // 4. Save CLEANED DATA to database_cleaned.json
    const cleanedBackup = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRawUsers: rawUsers.length,
        cleanedUsersCount: cleanedUsers.length,
        duplicatesRemoved,
        gradesCorrected
      },
      users: cleanedUsers,
      courseProgress: rawProgress,
      mediaCompletions: rawMedia,
      certificates: rawCerts
    };

    fs.writeFileSync('database_cleaned.json', JSON.stringify(cleanedBackup, null, 2));
    console.log('✅ CLEANED DATABASE saved to database_cleaned.json');
    console.log(`Summary: ${rawUsers.length} raw users -> ${cleanedUsers.length} cleaned users (${duplicatesRemoved} duplicates removed, ${gradesCorrected} grades fixed).`);

  } catch (err) {
    console.error('Error during database cleanup:', err);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  cleanDatabase();
}
