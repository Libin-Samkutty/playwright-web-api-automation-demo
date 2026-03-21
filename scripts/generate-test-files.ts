import fs from 'fs';
import path from 'path';

const fixturesDir = path.resolve(__dirname, '..', 'src', 'fixtures', 'files');

if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Generate large file (2MB) for oversized upload tests
const largeFilePath = path.join(fixturesDir, 'large-file.txt');
if (!fs.existsSync(largeFilePath)) {
  const sizeInBytes = 2 * 1024 * 1024; // 2MB
  const chunk = 'A'.repeat(1024) + '\n';
  const stream = fs.createWriteStream(largeFilePath);
  let written = 0;
  while (written < sizeInBytes) {
    stream.write(chunk);
    written += chunk.length;
  }
  stream.end();
  console.log(`Generated large-file.txt (${sizeInBytes} bytes)`);
}

// Ensure valid-file.txt exists
const validFilePath = path.join(fixturesDir, 'valid-file.txt');
if (!fs.existsSync(validFilePath)) {
  fs.writeFileSync(
    validFilePath,
    'This is a valid test file for upload testing.\n'.repeat(10),
  );
  console.log('Generated valid-file.txt');
}

// Create .auth directory
const authDir = path.resolve(__dirname, '..', '.auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
  console.log('Created .auth directory');
}

console.log('Test file generation complete.');