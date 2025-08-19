#!/usr/bin/env node

// Test script to verify the scraper behavior matches GitHub project
const https = require('https');

const SUPABASE_URL = 'https://qfqmbwnqzarngmcmzfan.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testDiscoverPosts() {
  const data = JSON.stringify({
    url: 'https://opportunitydesk.org/category/scholarships/',
    maxPosts: 3,
    strategy: 'auto-detect'
  });

  const options = {
    hostname: 'qfqmbwnqzarngmcmzfan.supabase.co',
    port: 443,
    path: '/functions/v1/discover-posts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testFetchContent(url) {
  const data = JSON.stringify({ url });

  const options = {
    hostname: 'qfqmbwnqzarngmcmzfan.supabase.co',
    port: 443,
    path: '/functions/v1/fetch-post-content',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔍 Testing post discovery...');
    const discoverResult = await testDiscoverPosts();
    console.log('Discovery result:', JSON.stringify(discoverResult, null, 2));

    if (discoverResult.success && discoverResult.posts && discoverResult.posts.length > 0) {
      console.log('\n📄 Testing content fetching for first post...');
      const firstPost = discoverResult.posts[0];
      const contentResult = await testFetchContent(firstPost);
      
      console.log('Content result (truncated):', {
        success: contentResult.success,
        title: contentResult.title,
        contentLength: contentResult.contentText ? contentResult.contentText.length : 0,
        hasHtml: !!contentResult.contentHtml,
        author: contentResult.author,
        publishedAt: contentResult.publishedAt,
        contentPreview: contentResult.contentText ? contentResult.contentText.substring(0, 200) + '...' : 'No content'
      });

      // Show what would be stored in details column
      const fullDetails = `
# ${contentResult.title || 'Opportunity'}

**Source:** ${firstPost}
**Author:** ${contentResult.author || 'Unknown'}
**Published:** ${contentResult.publishedAt || 'Unknown'}
${contentResult.tags ? `**Tags:** ${contentResult.tags.join(', ')}` : ''}

## Full Content

${contentResult.contentText || ''}

## Original HTML

${contentResult.contentHtml || ''}
      `.trim();

      console.log('\n📝 Details column content preview (first 1000 chars):');
      console.log(fullDetails.substring(0, 1000) + '...');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();
