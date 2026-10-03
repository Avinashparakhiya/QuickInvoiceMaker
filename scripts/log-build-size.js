const fs = require('fs');
const path = require('path');

const targetType = (process.argv[2] || 'apk').toLowerCase();

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i]}`;
}

const dirMap = {
  apk: {
    name: 'Release APK',
    dir: 'android/app/build/outputs/apk/release',
    ext: '.apk',
  },
  aab: {
    name: 'Release AAB (Bundle)',
    dir: 'android/app/build/outputs/bundle/release',
    ext: '.aab',
  },
  debug: {
    name: 'Debug APK',
    dir: 'android/app/build/outputs/apk/debug',
    ext: '.apk',
  },
};

const config = dirMap[targetType] || dirMap.apk;
const targetDir = path.resolve(__dirname, '..', config.dir);

console.log('\n' + '='.repeat(55));
if (fs.existsSync(targetDir)) {
  const files = fs.readdirSync(targetDir)
    .filter((f) => f.endsWith(config.ext))
    .map((f) => {
      const fullPath = path.join(targetDir, f);
      const stats = fs.statSync(fullPath);
      return { file: f, fullPath, stats };
    });

  if (files.length > 0) {
    console.log(`🚀 Build Artifact(s) Created Successfully:`);
    files.forEach((item, index) => {
      const formattedSize = formatBytes(item.stats.size);
      const bytesLocale = item.stats.size.toLocaleString();
      if (files.length > 1) {
        console.log(`\n  [${index + 1}/${files.length}] ${item.file}`);
      }
      console.log(`📦 Type:       ${config.name}`);
      console.log(`📁 File:       ${item.file}`);
      console.log(`📊 File Size:  ${formattedSize} (${bytesLocale} bytes)`);
      console.log(`📍 Path:       ${item.fullPath}`);
      console.log(`🕒 Modified:   ${item.stats.mtime.toLocaleString()}`);
    });
  } else {
    console.log(`⚠️  Warning: No ${config.ext} files found in:`);
    console.log(`   ${targetDir}`);
  }
} else {
  console.log(`⚠️  Warning: Directory not found at:`);
  console.log(`   ${targetDir}`);
}
console.log('='.repeat(55) + '\n');
