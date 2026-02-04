#!/usr/bin/env node

/**
 * Data Decryption Script
 *
 * This script decrypts the attendance_data_encrypted.txt file back to JSON.
 * Use this when you need to view or modify the unencrypted data.
 *
 * Usage: node decrypt_data.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const PASSWORD = 'hr@push2026';
const INPUT_FILE = path.join(__dirname, 'data', 'attendance_data_encrypted.txt');
const OUTPUT_FILE = path.join(__dirname, 'data', 'attendance_data_decrypted.json');

console.log('🔓 HR Attendance Data Decryption Tool');
console.log('=====================================\n');

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Error: Input file not found:', INPUT_FILE);
    process.exit(1);
}

try {
    // Read the encrypted data
    console.log('📖 Reading encrypted data from:', INPUT_FILE);
    const encryptedData = fs.readFileSync(INPUT_FILE, 'utf8');
    const encryptedSize = (encryptedData.length / 1024).toFixed(2);
    console.log(`   Encrypted size: ${encryptedSize} KB`);

    // Split IV and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');

    // Create decryption key from password using PBKDF2 (matches encryption)
    console.log('\n🔐 Decrypting data...');
    const key = crypto.pbkdf2Sync(PASSWORD, 'salt', 1000, 32, 'sha1');

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // Decrypt
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    // Validate JSON
    try {
        const jsonData = JSON.parse(decrypted);
        console.log(`   Employees: ${jsonData.length}`);
    } catch (e) {
        throw new Error('Decrypted data is not valid JSON');
    }

    const decryptedSize = (decrypted.length / 1024).toFixed(2);

    // Save decrypted data
    fs.writeFileSync(OUTPUT_FILE, decrypted);

    console.log('✅ Data decrypted successfully!');
    console.log(`   Output file: ${OUTPUT_FILE}`);
    console.log(`   Decrypted size: ${decryptedSize} KB`);

    console.log('\n⚠️  Important:');
    console.log('   The decrypted file contains sensitive employee data.');
    console.log('   Keep it secure and do NOT commit it to Git.');
    console.log('   It is already in .gitignore for your protection.');

    console.log('\n✨ Done!');

} catch (error) {
    console.error('\n❌ Decryption failed:', error.message);
    process.exit(1);
}
