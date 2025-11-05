/**
 * Netlify Serverless Function - API Proxy
 * Proxy requests từ frontend HTTPS đến backend HTTP
 * Giải quyết vấn đề Mixed Content và ERR_CONNECTION_RESET
 */

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://vehiclemarket.runasp.net/api';

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Chỉ cho phép các methods cần thiết
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract path từ event
    // Khi redirect từ /api/* đến /.netlify/functions/api/:splat
    // Netlify sẽ pass path sau /api/ vào :splat
    let apiPath = '';
    
    // Sử dụng rawPath hoặc path
    let originalPath = event.rawPath || event.path;
    
    // rawPath sẽ là "/.netlify/functions/api/Auth/me" hoặc "/.netlify/functions/api"
    if (originalPath.startsWith('/.netlify/functions/api')) {
      // Remove function prefix
      const pathAfterFunction = originalPath.replace('/.netlify/functions/api', '');
      apiPath = pathAfterFunction.replace(/^\/+|\/+$/g, '');
    } else if (originalPath.startsWith('/api')) {
      // Direct path từ /api/*
      apiPath = originalPath.replace('/api', '').replace(/^\/+|\/+$/g, '');
    } else {
      // Fallback
      apiPath = originalPath.replace(/^\/+|\/+$/g, '');
    }
    
    // Log để debug
    console.log('🔍 Request info:', {
      path: event.path,
      httpMethod: event.httpMethod,
      extractedPath: apiPath,
      queryStringParameters: event.queryStringParameters,
    });
    
    console.log('📍 Extracted path:', apiPath);
    
    // Xây dựng URL backend
    const backendUrl = apiPath ? `${BACKEND_URL}/${apiPath}` : BACKEND_URL;
    
    console.log('🔗 Backend URL:', backendUrl);
    
    // Xử lý query string
    const queryParams = event.queryStringParameters || {};
    const queryString = Object.keys(queryParams)
      .filter(key => queryParams[key] !== undefined && queryParams[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join('&');
    
    const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    // Chuẩn bị request headers
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || 'application/json';
    const isMultipart = contentType.includes('multipart/form-data');
    
    // Log để debug
    console.log('🔍 Request details:', {
      method: event.httpMethod,
      contentType: contentType,
      isMultipart: isMultipart,
      hasBody: !!event.body,
      bodyType: typeof event.body,
      isBase64Encoded: event.isBase64Encoded,
      bodyLength: event.body ? (typeof event.body === 'string' ? event.body.length : 'not string') : 0
    });
    
    const requestHeaders = {};
    
    // QUAN TRỌNG: Với multipart/form-data, giữ nguyên Content-Type với boundary
    // Axios đã set Content-Type với boundary, cần forward đúng
    if (isMultipart) {
      // Giữ nguyên Content-Type với boundary từ original request
      requestHeaders['Content-Type'] = contentType;
      console.log('📦 Multipart request detected, Content-Type:', contentType);
      console.log('📦 Content-Type includes boundary:', contentType.includes('boundary'));
    } else {
      requestHeaders['Content-Type'] = contentType;
    }

    // Copy Authorization header nếu có
    if (event.headers.authorization || event.headers.Authorization) {
      requestHeaders.Authorization = event.headers.authorization || event.headers.Authorization;
    }

    // Copy các headers khác nếu cần
    if (event.headers['x-user-id'] || event.headers['X-User-ID']) {
      requestHeaders['X-User-ID'] = event.headers['x-user-id'] || event.headers['X-User-ID'];
    }

    // Parse body nếu có
    let requestBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      if (event.body) {
        try {
          if (isMultipart) {
            // QUAN TRỌNG: Netlify Functions LUÔN encode multipart body thành base64
            // Theo tài liệu Netlify, multipart requests sẽ có isBase64Encoded = true
            // Cần decode base64 về Buffer để forward đến backend
            // Backend expect raw multipart body với binary data
            if (event.isBase64Encoded) {
              // Body là base64 string - decode về Buffer
              requestBody = Buffer.from(event.body, 'base64');
              console.log('📦 Multipart body decoded from base64, size:', requestBody.length, 'bytes');
            } else if (typeof event.body === 'string') {
              // Body là string nhưng không có isBase64Encoded flag
              // Có thể Netlify đã decode sẵn, hoặc là raw string
              // Thử decode base64 trước, nếu fail thì dùng binary
              try {
                // Thử decode base64
                const decoded = Buffer.from(event.body, 'base64');
                // Kiểm tra xem có phải base64 hợp lệ không (sẽ có kích thước hợp lý)
                if (decoded.length > 0 && decoded.length < event.body.length * 2) {
                  requestBody = decoded;
                  console.log('📦 Multipart body decoded from base64 (auto-detect), size:', requestBody.length, 'bytes');
                } else {
                  // Không phải base64, dùng binary
                  requestBody = Buffer.from(event.body, 'binary');
                  console.log('📦 Multipart body as Buffer from string (binary), size:', requestBody.length, 'bytes');
                }
              } catch (e) {
                // Không decode được base64, dùng binary
                requestBody = Buffer.from(event.body, 'binary');
                console.log('📦 Multipart body as Buffer from string (binary fallback), size:', requestBody.length, 'bytes');
              }
            } else {
              // Body là object - Netlify đã parse (không nên xảy ra với multipart)
              console.error('⚠️ Multipart body is object - cannot forward multipart data');
              console.error('Body type:', typeof event.body);
              throw new Error('Multipart body was parsed as object - cannot forward to backend');
            }
          } else {
            // Với JSON, parse như bình thường
            requestBody = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
          }
        } catch (e) {
          console.error('Error parsing body:', e);
          console.error('Body type:', typeof event.body);
          console.error('isBase64Encoded:', event.isBase64Encoded);
          console.error('Content-Type:', contentType);
        }
      }
    }

    // Chuẩn bị request options
    const fetchOptions = {
      method: event.httpMethod,
      headers: requestHeaders,
    };

    // Thêm body nếu có
    if (requestBody) {
      // Với multipart, requestBody là Buffer - fetch sẽ xử lý đúng
      // Với JSON, requestBody là string - fetch sẽ xử lý đúng
      fetchOptions.body = requestBody;
      
      // Log để debug
      if (isMultipart) {
        console.log('📦 Forwarding multipart body:', {
          type: requestBody instanceof Buffer ? 'Buffer' : typeof requestBody,
          size: requestBody instanceof Buffer ? requestBody.length : requestBody.length,
          contentType: contentType
        });
      }
    }

    // Log để debug (có thể xóa sau)
    console.log(`🔄 Proxying: ${event.httpMethod} ${fullUrl}`);
    
    // Gửi request đến backend
    const response = await fetch(fullUrl, fetchOptions);
    
    // Log response status
    console.log(`✅ Backend response: ${response.status} ${response.statusText}`);

    // Đọc response dựa trên content-type
    const responseContentType = response.headers.get('content-type') || '';
    
    let responseBody;
    if (responseContentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    // Copy response headers (trừ một số headers không nên copy)
    const responseHeaders = { ...headers };
    const headersToSkip = ['content-encoding', 'transfer-encoding', 'connection'];
    response.headers.forEach((value, key) => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
    };

  } catch (error) {
    console.error('❌ Proxy error:', error);
    console.error('Error stack:', error.stack);
    
    // Trả về error response rõ ràng
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message,
        details: {
          path: event.path,
          method: event.httpMethod,
        }
      }),
    };
  }
};

