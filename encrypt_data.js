#!/usr/bin/env node

/**
 * Data Encryption Script
 *
 * This script encrypts the attendance_data.json file for secure deployment.
 * Run this script whenever you update the attendance data.
 *
 * Usage: node encrypt_data.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const PASSWORD = 'hr@push2026';
const INPUT_FILE = path.join(__dirname, 'data', 'attendance_data.json');
const OUTPUT_FILE = path.join(__dirname, 'data', 'attendance_data_encrypted.txt');

console.log('🔒 HR Attendance Data Encryption Tool');
console.log('=====================================\n');

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Error: Input file not found:', INPUT_FILE);
    console.error('Please make sure attendance_data.json exists in the data folder.');
    process.exit(1);
}

try {
    // Read the JSON data
    console.log('📖 Reading data from:', INPUT_FILE);
    const data = fs.readFileSync(INPUT_FILE, 'utf8');
    const dataSize = (data.length / 1024).toFixed(2);
    console.log(`   File size: ${dataSize} KB`);

    // Validate JSON
    try {
        const jsonData = JSON.parse(data);
        console.log(`   Employees: ${jsonData.length}`);
    } catch (e) {
        throw new Error('Invalid JSON format');
    }

    // Create encryption key from password
    console.log('\n🔐 Encrypting data...');
    const key = crypto.scryptSync(PASSWORD, 'salt', 32);
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    // Encrypt
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine iv + encrypted data
    const encryptedData = iv.toString('hex') + ':' + encrypted;
    const encryptedSize = (encryptedData.length / 1024).toFixed(2);

    // Save encrypted data
    fs.writeFileSync(OUTPUT_FILE, encryptedData);

    console.log('✅ Data encrypted successfully!');
    console.log(`   Output file: ${OUTPUT_FILE}`);
    console.log(`   Encrypted size: ${encryptedSize} KB`);
    console.log(`   Compression ratio: ${((encryptedData.length / data.length) * 100).toFixed(1)}%`);

    console.log('\n📝 Next steps:');
    console.log('   1. git add data/attendance_data_encrypted.txt');
    console.log('   2. git commit -m "Update attendance data"');
    console.log('   3. git push');
    console.log('\n✨ Done!');

} catch (error) {
    console.error('\n❌ Encryption failed:', error.message);
    process.exit(1);
}
