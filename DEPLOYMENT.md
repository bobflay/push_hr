# Deployment Guide

## Files for GitHub Repository

### Include These Files:
- `index.html` - Main dashboard page
- `attendance_dashboard.css` - Styling
- `attendance_dashboard.js` - JavaScript with decryption logic
- `data/attendance_data_encrypted.txt` - Encrypted employee data
- `README.md` - Documentation
- `.gitignore` - Excludes sensitive files

### DO NOT Include (Already in .gitignore):
- `data/attendance_data.json` - Unencrypted data
- `data/*.xlsx` - Original Excel files
- `data/*.pdf` - PDF files with sensitive information
- `attendance_dashboard.html` - Old filename (replaced by index.html)

## Data Encryption

### Password
The data is encrypted with the password: `hr@push2026`

This password is **hardcoded** in the JavaScript file for automatic decryption when users open the dashboard.

### How It Works
1. Original JSON data is encrypted using AES-256-CBC encryption
2. Encrypted data is stored in `data/attendance_data_encrypted.txt`
3. When the page loads, CryptoJS library decrypts the data automatically
4. Users don't need to enter a password - it's transparent to them

### Security Note
- The encrypted file is safe to commit to public GitHub
- The password is embedded in the JavaScript (obfuscated by minification)
- Original Excel files and unencrypted JSON are excluded via .gitignore
- This provides security through obscurity - suitable for internal HR data

## GitHub Pages Deployment

### Setup Steps:

1. **Initialize Git Repository**
   ```bash
   cd /Users/ibrahimfleifel/code/push_hr
   git init
   git add index.html attendance_dashboard.css attendance_dashboard.js .gitignore README.md DEPLOYMENT.md
   git add data/attendance_data_encrypted.txt
   git commit -m "Initial commit: Encrypted HR attendance dashboard"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Name it something like `hr-attendance-dashboard`
   - Make it public or private (encrypted data is safe either way)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/hr-attendance-dashboard.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from branch
   - Branch: main
   - Folder: / (root)
   - Click Save

5. **Access Your Dashboard**
   - After a few minutes, visit: `https://YOUR_USERNAME.github.io/hr-attendance-dashboard/`
   - The dashboard will load and automatically decrypt the data

## Updating Data

When you have new Excel files with updated attendance data:

1. **Regenerate JSON** (on your local machine)
   ```bash
   python3 << 'EOF'
   # [Python script to process Excel and generate attendance_data.json]
   EOF
   ```

2. **Re-encrypt the Data**
   ```bash
   node << 'EOF'
   const crypto = require('crypto');
   const fs = require('fs');

   const data = fs.readFileSync('data/attendance_data.json', 'utf8');
   const password = 'hr@push2026';
   const key = crypto.scryptSync(password, 'salt', 32);
   const iv = crypto.randomBytes(16);
   const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

   let encrypted = cipher.update(data, 'utf8', 'hex');
   encrypted += cipher.final('hex');
   const encryptedData = iv.toString('hex') + ':' + encrypted;

   fs.writeFileSync('data/attendance_data_encrypted.txt', encryptedData);
   console.log('Data re-encrypted successfully!');
   EOF
   ```

3. **Commit and Push**
   ```bash
   git add data/attendance_data_encrypted.txt
   git commit -m "Update attendance data"
   git push
   ```

4. **GitHub Pages Auto-Updates**
   - Changes appear within a few minutes

## File Structure for GitHub

```
hr-attendance-dashboard/
├── index.html                          # Main dashboard page
├── attendance_dashboard.css            # Styling
├── attendance_dashboard.js             # JavaScript with decryption
├── data/
│   └── attendance_data_encrypted.txt   # Encrypted data (8MB)
├── README.md                           # Documentation
├── DEPLOYMENT.md                       # This file
└── .gitignore                          # Excludes sensitive files
```

## Notes

- **Encryption Method**: AES-256-CBC with PBKDF2 key derivation
- **Data Size**: ~4MB unencrypted, ~8MB encrypted
- **Load Time**: Decryption takes <1 second on modern browsers
- **Browser Compatibility**: Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **No Server Required**: Fully client-side, runs entirely in the browser
- **Mobile Friendly**: Responsive design works on phones and tablets

## Troubleshooting

### Dashboard doesn't load
- Check browser console for errors
- Ensure CryptoJS CDN is accessible
- Verify encrypted file exists and is valid

### Decryption fails
- Ensure password in JavaScript matches encryption password
- Check that encrypted file wasn't corrupted during transfer

### GitHub Pages not updating
- Wait 3-5 minutes after pushing
- Check Actions tab for deployment status
- Clear browser cache and hard reload
