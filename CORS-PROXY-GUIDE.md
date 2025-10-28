# CORS Proxy System - REST Test 2.0

## 🚀 Complete Solution for CORS Issues

REST Test 2.0 includes a comprehensive system to solve CORS problems during API development and testing.

## 🎯 How to Use

### 1. Automatic CORS Detection

- The app automatically detects URLs that may have CORS issues
- Displays visual warnings when needed
- Suggests proxy configuration

### 2. Proxy Configuration

#### Accessing Settings

- Click the settings icon (⚙️) in the app header
- Or click "Configure" in the CORS warning that appears automatically

#### Available Options

**1. Local Proxy (Vite) - RECOMMENDED**

- ✅ Local proxy configured in Vite
- ✅ Best performance
- ✅ No rate limiting
- ✅ Ideal for development

**2. CORS Anywhere**

- ⚠️ Public proxy with limitations
- ⚠️ Requires demo activation
- ⚠️ Rate limiting applied

**3. AllOrigins**

- ✅ Free public proxy
- ⚠️ Data may be logged
- ✅ No activation required

**4. Custom Proxy**

- ✅ Set up your own proxy server
- ✅ Full privacy control
- ✅ No limitations

### 3. Importing the Postman Collection

To test with the attached collection:

1. **Import the Collection**:
   - Click the external link icon in the sidebar
   - Go to the "Import" tab
   - Select the file `New Collection.postman_collection.json`
   - The app will automatically detect the Postman format

2. **Configure the Proxy**:
   - As ANATEL URLs will have CORS issues, configure a proxy
   - Recommended: Use "Local Proxy (Vite)" for best performance

3. **Test Requests**:
   - Select an imported request
   - Execute and see results without CORS errors

## 🔧 Advanced Configuration

### Vite Local Proxy

The `vite.config.ts` file is already set up with proxies for:

- `/api/anatel/*` → `https://sistemas.anatel.gov.br/*`
- `/api/cors-proxy/*` → For other URLs via CORS Anywhere

### Automatically Supported URLs

- `sistemas.anatel.gov.br` → Automatically routed via `/api/anatel`
- Other URLs → Via generic proxy configuration

## 📋 Usage Examples

### Example 1: ANATEL URL

```
Original URL: https://sistemas.anatel.gov.br/areaarea/N_ConsultaLocalidade/Tela.asp
With Local Proxy: /api/anatel/areaarea/N_ConsultaLocalidade/Tela.asp
```

### Example 2: External API

```
Original URL: https://api.example.com/data
With AllOrigins: https://api.allorigins.win/get?url=https%3A//api.example.com/data
```

## 🛡️ Security and Privacy

### Local Proxy (Recommended)

- ✅ Data stays in your development environment
- ✅ No external logging
- ✅ Maximum privacy

### Public Proxies

- ⚠️ Data may be logged by services
- ⚠️ Use only for development
- ⚠️ Do not send sensitive data

## 🚀 In Production

### To Solve CORS Definitively:

1. **Configure CORS on the Server**: Add appropriate CORS headers to the API
2. **Backend Proxy**: Implement a proxy on your backend server
3. **Same-Origin**: Host frontend and backend on the same domain

### Required CORS Headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🐛 Troubleshooting

### Error: "blocked by CORS policy"

1. Check if the proxy is enabled
2. Test different proxy options
3. Use the "Test" button to check functionality

### Proxy Not Working

1. Test connectivity with the "Test" button
2. Check if the URL is formatted correctly
3. For CORS Anywhere, activate the demo at: https://cors-anywhere.herokuapp.com/corsdemo

### Performance Issues

1. Always use Local Proxy (Vite) when possible
2. Avoid public proxies for high request volume
3. Set up a custom proxy if needed

## 📚 Useful Links

- [CORS Anywhere Demo](https://cors-anywhere.herokuapp.com/corsdemo)
- [AllOrigins Docs](https://allorigins.win/)
- [Vite Proxy Docs](https://vitejs.dev/config/server-options.html#server-proxy)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
