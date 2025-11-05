/**
 * Netlify Serverless Function - Uploads Proxy
 * Proxy requests cho static files (images, videos) từ backend
 * Giải quyết vấn đề Mixed Content và ERR_CONNECTION_RESET
 */

const BACKEND_BASE_URL = process.env.VITE_BACKEND_BASE_URL || 'http://vehiclemarket.runasp.net';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Chỉ cho phép GET method cho static files
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract path từ event
    // Khi redirect từ /uploads/* đến /.netlify/functions/uploads/:splat
    // Netlify sẽ pass path sau /uploads/ vào :splat
    let uploadPath = '';
    
    // Sử dụng rawPath hoặc path
    let originalPath = event.rawPath || event.path;
    
    // rawPath sẽ là "/.netlify/functions/uploads/items/..." hoặc "/.netlify/functions/uploads"
    if (originalPath.startsWith('/.netlify/functions/uploads')) {
      // Remove function prefix
      const pathSegment = originalPath.replace('/.netlify/functions/uploads', '').replace(/^\/+|\/+$/g, '');
      uploadPath = pathSegment ? `/uploads/${pathSegment}` : '/uploads';
    } else if (originalPath.startsWith('/uploads')) {
      // Direct path từ /uploads/*
      uploadPath = originalPath;
    } else {
      // Fallback
      uploadPath = originalPath.startsWith('/') ? `/uploads${originalPath}` : `/uploads/${originalPath}`;
    }
    
    // Xây dựng URL backend
    const backendUrl = `${BACKEND_BASE_URL}${uploadPath}`;
    
    console.log('📸 Upload proxy:', {
      originalPath: event.path,
      uploadPath,
      backendUrl,
    });
    
    // Gửi request đến backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ Backend response error: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        headers,
        body: `Error loading resource: ${response.statusText}`,
      };
    }
    
    // Đọc response body dưới dạng array buffer để giữ nguyên binary data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Xác định content type từ response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Copy các headers quan trọng
    const responseHeaders = {
      ...headers,
      'Content-Type': contentType,
      'Cache-Control': response.headers.get('cache-control') || 'public, max-age=31536000, immutable',
    };
    
    // Copy các headers khác nếu có
    if (response.headers.get('content-length')) {
      responseHeaders['Content-Length'] = response.headers.get('content-length');
    }
    if (response.headers.get('etag')) {
      responseHeaders['ETag'] = response.headers.get('etag');
    }
    if (response.headers.get('last-modified')) {
      responseHeaders['Last-Modified'] = response.headers.get('last-modified');
    }
    
    console.log(`✅ Successfully proxied: ${uploadPath}`);
    
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('❌ Upload proxy error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message,
      }),
    };
  }
};

