# 🌍 Environment System

REST Test 2.0 now includes a robust environment system that lets you define variables to reuse in your requests. This is especially useful for managing different contexts like development, staging, and production.

## 🚀 How to Use

### 1. Accessing the Environment Manager

In the application's top bar, you'll find:

- **Environment Selector**: A dropdown showing the current active environment
- **Manage Button**: Click to open the full management modal

### 2. Creating an Environment

1. Click the "Manage Environments" button in the selector
2. In the modal, click "New Environment"
3. Enter a descriptive name (e.g., "Development", "Production")
4. Optionally add a description
5. Click "Save"

### 3. Adding Variables

For each environment, you can define variables:

1. Select the desired environment
2. In the "Variables" section, click "New Variable"
3. Define:
   - **Name**: The variable name (e.g., `baseUrl`, `apiKey`)
   - **Value**: The corresponding value
   - **Description**: An optional description
   - **Secret**: Mark if it's sensitive (will be masked in the UI)

### 4. Using Variables in Requests

Variables use the syntax `{{variableName}}`. They can be used in:

- **URL**: `{{baseUrl}}/api/users`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Parameters**: Key or value in form parameters
- **Body**: Anywhere in the request body
- **Authentication**: Tokens, usernames, passwords, etc.

## 📝 Practical Examples

### Development Environment

```
Name: Development
Description: Local development server

Variables:
- baseUrl: http://localhost:3000
- apiKey: dev-api-key-123
- authToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Production Environment

```
Name: Production
Description: Production server

Variables:
- baseUrl: https://api.mycompany.com
- apiKey: prod-api-key-xyz
- authToken: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Usage Examples in Requests

**Request URL:**

```
{{baseUrl}}/api/v1/users
```

**Authorization Header:**

```
Authorization: Bearer {{authToken}}
```

**JSON Body:**

```json
{
  "apiKey": "{{apiKey}}",
  "environment": "{{env}}",
  "data": {
    "userId": "{{userId}}"
  }
}
```

## 🔄 Advanced Features

### Environment Duplication

- Useful for creating variations of an existing environment
- Keeps all variables, allowing targeted edits

### Import and Export

- **Export Environment**: Downloads a JSON file with the settings
- **Export All**: Downloads all environments in a single file
- **Import**: Loads environments from previously exported JSON files

### Secret Variables

- Variables marked as "secret" have their values masked in the UI
- Useful for tokens, passwords, and other sensitive info
- Values are used normally in requests

### Global Environment

- A special environment that's always active
- Its variables are resolved even when another environment is selected
- Useful for settings that apply to all contexts

## 🔧 Variable Resolution

Variable resolution follows this priority order:

1. **Active Environment**: Variables from the selected environment have highest priority
2. **Global Environment**: Used as fallback if the variable doesn't exist in the active environment
3. **Original Text**: If the variable isn't found, the text `{{variable}}` remains unchanged

## 💡 Tips and Best Practices

### Variable Naming

- Use descriptive names: `baseUrl` instead of `url`
- Keep consistency across environments
- Use camelCase for readability

### Organization

- Create environments for each context (dev, test, staging, prod)
- Use clear descriptions to document the purpose
- Keep the number of variables manageable

### Security

- Mark sensitive info as "secret"
- Don't share environment files with real tokens
- Use specific variables for sensitive data

### Efficient Workflow

1. Set up all environments before creating requests
2. Use the quick selector to switch contexts
3. Test your requests in different environments
4. Export settings for backup and sharing

## 🔍 Troubleshooting

### Variable Not Being Replaced

- Check if the name is correct (case-sensitive)
- Confirm the correct environment is active
- Make sure the variable exists in the selected environment

### Special Characters

- Variables with spaces or special characters should use simple names
- Prefer `apiKey` over `api key` or `api-key`

### Performance

- The system resolves variables in real time
- No practical limit to the number of variables
- Environments are persisted in the browser's localStorage

---

The environment system makes REST Test 2.0 an even more powerful tool for API development and testing, enabling a smooth experience when working with multiple contexts and configurations.
