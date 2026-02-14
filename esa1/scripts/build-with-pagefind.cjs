/* This is a script to build the site with Pagefind */

const { execSync } = require('child_process');
const { existsSync } = require('fs');

// Detect the platform
function detectPlatform() {
  if (process.env.VERCEL) return 'vercel';
  if (process.env.CF_PAGES) return 'cloudflare';
  if (process.env.EDGEONE) return 'edgeone';
  if (process.env.NETLIFY) return 'netlify';
  if (process.env.GITHUB_ACTIONS) return 'github';
  if (existsSync('.vercel')) return 'vercel';
  return 'default';
}

// Get Pagefind output directory
function getPagefindOutputDir(platform) {
  return platform === 'vercel' ? '.vercel/output/static' : 'dist';
}

// Main function
function main() {
  const platform = detectPlatform();
  const outputDir = getPagefindOutputDir(platform);

  console.log(`🚀 Platform: ${platform} | Output: ${outputDir}`);

  try {
    console.log('🔨 Building...');
    execSync('npx astro build', { stdio: 'inherit' });

    if (!existsSync(outputDir)) {
      console.error(`❌ Output directory not found: ${outputDir}`);
      process.exit(1);
    }

    console.log('🔍 Generating search index...');
    execSync(`npx pagefind --site ${outputDir}`, { stdio: 'inherit' });

    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();
