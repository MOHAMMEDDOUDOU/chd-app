#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 بدء تشغيل Express Server...');

// تشغيل Express Server
const server = spawn('node', ['zr-express-server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('❌ خطأ في تشغيل Server:', error);
});

server.on('close', (code) => {
  console.log(`🔴 Server توقف مع الكود: ${code}`);
});

// إيقاف Server عند إيقاف العملية الرئيسية
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف Server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 إيقاف Server...');
  server.kill('SIGTERM');
  process.exit(0);
});
