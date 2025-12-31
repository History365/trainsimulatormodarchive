#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://www.trainsimarchive.org';

// Get all HTML files from mod directories
function getModPages() {
  const directories = [
    'trurail-simulations',
    'uts-creations',
    'cleartracks'
  ];
  
  const mods = [];
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html') && f !== 'index.html');
      files.forEach(file => {
        const slug = file.replace('.html', '');
        mods.push({
          url: `${BASE_URL}/${dir}/${slug}`,
          changefreq: 'monthly',
          priority: '0.8'
        });
      });
    }
  });
  
  return mods;
}

// Get all images from media folder
function getImages() {
  const mediaPath = path.join(__dirname, '..', 'media');
  const images = [];
  
  if (fs.existsSync(mediaPath)) {
    const files = fs.readdirSync(mediaPath);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        images.push({
          url: `${BASE_URL}/media/${file}`,
          title: file.replace(/~.*$/, '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        });
      }
    });
  }
  
  return images;
}

// Generate page sitemap
function generatePageSitemap() {
  const pages = [
    { url: BASE_URL, changefreq: 'weekly', priority: '1.0' },
    { url: `${BASE_URL}/trurail-simulations`, changefreq: 'weekly', priority: '0.9' },
    { url: `${BASE_URL}/uts-creations`, changefreq: 'weekly', priority: '0.9' },
    { url: `${BASE_URL}/cleartracks`, changefreq: 'weekly', priority: '0.9' },
    { url: `${BASE_URL}/files`, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/contributors`, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/support`, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/search`, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/terms`, changefreq: 'yearly', priority: '0.5' },
    { url: `${BASE_URL}/privacy`, changefreq: 'yearly', priority: '0.5' }
  ];
  
  const mods = getModPages();
  const allPages = [...pages, ...mods];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Generate image sitemap
function generateImageSitemap() {
  const images = getImages();
  const pages = [
    { url: BASE_URL, images: images },
    { url: `${BASE_URL}/trurail-simulations`, images: images.slice(0, 2) },
    { url: `${BASE_URL}/uts-creations`, images: images.slice(1, 3) },
    { url: `${BASE_URL}/cleartracks`, images: images.slice(2, 4) }
  ];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';
  
  pages.forEach(page => {
    if (page.images.length > 0) {
      xml += '  <url>\n';
      xml += `    <loc>${page.url}</loc>\n`;
      
      page.images.forEach(img => {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${img.url}</image:loc>\n`;
        xml += `      <image:title>${img.title}</image:title>\n`;
        xml += '    </image:image>\n';
      });
      
      xml += '  </url>\n\n';
    }
  });
  
  xml += '</urlset>';
  
  return xml;
}

// Write files
try {
  const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
  const imageSitemapPath = path.join(__dirname, '..', 'image-sitemap.xml');
  
  const pageSitemap = generatePageSitemap();
  const imageSitemap = generateImageSitemap();
  
  fs.writeFileSync(sitemapPath, pageSitemap);
  fs.writeFileSync(imageSitemapPath, imageSitemap);
  
  console.log('✓ sitemap.xml generated');
  console.log('✓ image-sitemap.xml generated');
} catch (error) {
  console.error('Error generating sitemaps:', error);
  process.exit(1);
}
