/**
 * Code Generator Utility
 * Generates code snippets for API endpoints in multiple programming languages
 */

export interface CodeExample {
  language: string;
  label: string;
  icon: string;
  iconColor: string;
  installCommand?: string;
  code: string;
}

export interface EndpointExample {
  endpoint: string;
  method: string;
  description: string;
  examples: CodeExample[];
}

const API_BASE_URL = process.env.API_URL || 'https://api.screenshot-api.com';

/**
 * Generate code examples for the Screenshot endpoint
 */
export function generateScreenshotExamples(): EndpointExample {
  return {
    endpoint: '/api/v1/screenshots',
    method: 'POST',
    description: 'Capture a screenshot of any website',
    examples: [
      {
        language: 'javascript',
        label: 'Node.js',
        icon: 'fab fa-node-js',
        iconColor: '#68a063',
        installCommand: 'npm install axios',
        code: `const axios = require('axios');

async function captureScreenshot() {
  try {
    const response = await axios.post('${API_BASE_URL}/api/v1/screenshots', {
      url: 'https://example.com',
      width: 1920,
      height: 1080,
      format: 'png',
      fullPage: false
    }, {
      headers: {
        'X-API-Key': 'your_api_key_here',
        'Content-Type': 'application/json'
      }
    });

    console.log('Screenshot URL:', response.data.data.result.url);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

captureScreenshot();`,
      },
      {
        language: 'javascript',
        label: 'Fetch API',
        icon: 'fab fa-js',
        iconColor: '#f7df1e',
        code: `// Browser or Node.js 18+
async function captureScreenshot() {
  const response = await fetch('${API_BASE_URL}/api/v1/screenshots', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your_api_key_here',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://example.com',
      width: 1920,
      height: 1080,
      format: 'png',
      fullPage: false
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Request failed');
  }

  console.log('Screenshot URL:', data.data.result.url);
  return data;
}

captureScreenshot();`,
      },
      {
        language: 'python',
        label: 'Python',
        icon: 'fab fa-python',
        iconColor: '#3776ab',
        installCommand: 'pip install requests',
        code: `import requests

def capture_screenshot():
    url = "${API_BASE_URL}/api/v1/screenshots"

    headers = {
        "X-API-Key": "your_api_key_here",
        "Content-Type": "application/json"
    }

    payload = {
        "url": "https://example.com",
        "width": 1920,
        "height": 1080,
        "format": "png",
        "fullPage": False
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"Screenshot URL: {data['data']['result']['url']}")
        return data
    else:
        print(f"Error: {response.json()}")
        return None

capture_screenshot()`,
      },
      {
        language: 'php',
        label: 'PHP',
        icon: 'fab fa-php',
        iconColor: '#777bb4',
        installCommand: 'composer require guzzlehttp/guzzle',
        code: `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

$client = new Client();

try {
    $response = $client->post('${API_BASE_URL}/api/v1/screenshots', [
        'headers' => [
            'X-API-Key' => 'your_api_key_here',
            'Content-Type' => 'application/json'
        ],
        'json' => [
            'url' => 'https://example.com',
            'width' => 1920,
            'height' => 1080,
            'format' => 'png',
            'fullPage' => false
        ]
    ]);

    $data = json_decode($response->getBody(), true);
    echo "Screenshot URL: " . $data['data']['result']['url'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}`,
      },
      {
        language: 'curl',
        label: 'cURL',
        icon: 'fas fa-terminal',
        iconColor: '#073551',
        code: `curl -X POST "${API_BASE_URL}/api/v1/screenshots" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080,
    "format": "png",
    "fullPage": false
  }'`,
      },
      {
        language: 'ruby',
        label: 'Ruby',
        icon: 'fas fa-gem',
        iconColor: '#cc342d',
        installCommand: 'gem install httparty',
        code: `require 'httparty'
require 'json'

response = HTTParty.post(
  '${API_BASE_URL}/api/v1/screenshots',
  headers: {
    'X-API-Key' => 'your_api_key_here',
    'Content-Type' => 'application/json'
  },
  body: {
    url: 'https://example.com',
    width: 1920,
    height: 1080,
    format: 'png',
    fullPage: false
  }.to_json
)

if response.success?
  data = JSON.parse(response.body)
  puts "Screenshot URL: #{data['data']['result']['url']}"
else
  puts "Error: #{response.body}"
end`,
      },
      {
        language: 'go',
        label: 'Go',
        icon: 'fas fa-code',
        iconColor: '#00add8',
        code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type ScreenshotRequest struct {
    URL      string \`json:"url"\`
    Width    int    \`json:"width"\`
    Height   int    \`json:"height"\`
    Format   string \`json:"format"\`
    FullPage bool   \`json:"fullPage"\`
}

func main() {
    payload := ScreenshotRequest{
        URL:      "https://example.com",
        Width:    1920,
        Height:   1080,
        Format:   "png",
        FullPage: false,
    }

    jsonData, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", "${API_BASE_URL}/api/v1/screenshots", bytes.NewBuffer(jsonData))
    req.Header.Set("X-API-Key", "your_api_key_here")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,
      },
      {
        language: 'java',
        label: 'Java',
        icon: 'fab fa-java',
        iconColor: '#ed8b00',
        code: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ScreenshotAPI {
    public static void main(String[] args) throws Exception {
        String json = """
            {
                "url": "https://example.com",
                "width": 1920,
                "height": 1080,
                "format": "png",
                "fullPage": false
            }
            """;

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${API_BASE_URL}/api/v1/screenshots"))
            .header("X-API-Key", "your_api_key_here")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );

        System.out.println("Response: " + response.body());
    }
}`,
      },
      {
        language: 'csharp',
        label: 'C#',
        icon: 'fas fa-code',
        iconColor: '#512bd4',
        code: `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();

        var payload = new
        {
            url = "https://example.com",
            width = 1920,
            height = 1080,
            format = "png",
            fullPage = false
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        client.DefaultRequestHeaders.Add("X-API-Key", "your_api_key_here");

        var response = await client.PostAsync(
            "${API_BASE_URL}/api/v1/screenshots",
            content
        );

        var result = await response.Content.ReadAsStringAsync();
        Console.WriteLine($"Response: {result}");
    }
}`,
      },
      {
        language: 'httpie',
        label: 'HTTPie',
        icon: 'fas fa-terminal',
        iconColor: '#73dc8c',
        installCommand: 'pip install httpie',
        code: `http POST ${API_BASE_URL}/api/v1/screenshots \\
  X-API-Key:your_api_key_here \\
  url=https://example.com \\
  width:=1920 \\
  height:=1080 \\
  format=png \\
  fullPage:=false`,
      },
    ],
  };
}

/**
 * Generate code examples for Authentication (Register)
 */
export function generateRegisterExamples(): EndpointExample {
  return {
    endpoint: '/api/v1/auth/register',
    method: 'POST',
    description: 'Register a new user account',
    examples: [
      {
        language: 'javascript',
        label: 'Node.js',
        icon: 'fab fa-node-js',
        iconColor: '#68a063',
        code: `const axios = require('axios');

async function register() {
  const response = await axios.post('${API_BASE_URL}/api/v1/auth/register', {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  });

  console.log('User created:', response.data);
  console.log('Access Token:', response.data.data.tokens.accessToken);
}

register();`,
      },
      {
        language: 'python',
        label: 'Python',
        icon: 'fab fa-python',
        iconColor: '#3776ab',
        code: `import requests

response = requests.post(
    "${API_BASE_URL}/api/v1/auth/register",
    json={
        "name": "John Doe",
        "email": "john@example.com",
        "password": "securePassword123"
    }
)

data = response.json()
print(f"Access Token: {data['data']['tokens']['accessToken']}")`,
      },
      {
        language: 'curl',
        label: 'cURL',
        icon: 'fas fa-terminal',
        iconColor: '#073551',
        code: `curl -X POST "${API_BASE_URL}/api/v1/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'`,
      },
    ],
  };
}

/**
 * Generate code examples for Creating API Key
 */
export function generateApiKeyExamples(): EndpointExample {
  return {
    endpoint: '/api/v1/auth/api-keys',
    method: 'POST',
    description: 'Create a new API key for programmatic access',
    examples: [
      {
        language: 'javascript',
        label: 'Node.js',
        icon: 'fab fa-node-js',
        iconColor: '#68a063',
        code: `const axios = require('axios');

async function createApiKey() {
  const response = await axios.post('${API_BASE_URL}/api/v1/auth/api-keys', {
    name: 'Production API Key',
    permissions: ['screenshots:create', 'screenshots:read'],
    ipWhitelist: ['192.168.1.1'],
    domainWhitelist: ['https://myapp.com']
  }, {
    headers: {
      'Authorization': 'Bearer your_jwt_token'
    }
  });

  // Save this key securely - it won't be shown again!
  console.log('API Key:', response.data.data.key);
}

createApiKey();`,
      },
      {
        language: 'python',
        label: 'Python',
        icon: 'fab fa-python',
        iconColor: '#3776ab',
        code: `import requests

response = requests.post(
    "${API_BASE_URL}/api/v1/auth/api-keys",
    headers={"Authorization": "Bearer your_jwt_token"},
    json={
        "name": "Production API Key",
        "permissions": ["screenshots:create", "screenshots:read"],
        "ipWhitelist": ["192.168.1.1"],
        "domainWhitelist": ["https://myapp.com"]
    }
)

data = response.json()
# Save this key securely - it won't be shown again!
print(f"API Key: {data['data']['key']}")`,
      },
      {
        language: 'curl',
        label: 'cURL',
        icon: 'fas fa-terminal',
        iconColor: '#073551',
        code: `curl -X POST "${API_BASE_URL}/api/v1/auth/api-keys" \\
  -H "Authorization: Bearer your_jwt_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production API Key",
    "permissions": ["screenshots:create", "screenshots:read"],
    "ipWhitelist": ["192.168.1.1"],
    "domainWhitelist": ["https://myapp.com"]
  }'`,
      },
    ],
  };
}

/**
 * Generate code examples for List Screenshots
 */
export function generateListScreenshotsExamples(): EndpointExample {
  return {
    endpoint: '/api/v1/screenshots',
    method: 'GET',
    description: 'List all screenshots with pagination',
    examples: [
      {
        language: 'javascript',
        label: 'Node.js',
        icon: 'fab fa-node-js',
        iconColor: '#68a063',
        code: `const axios = require('axios');

async function listScreenshots() {
  const response = await axios.get('${API_BASE_URL}/api/v1/screenshots', {
    headers: {
      'X-API-Key': 'your_api_key_here'
    },
    params: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  });

  console.log('Total:', response.data.data.pagination.total);
  console.log('Screenshots:', response.data.data.screenshots);
}

listScreenshots();`,
      },
      {
        language: 'python',
        label: 'Python',
        icon: 'fab fa-python',
        iconColor: '#3776ab',
        code: `import requests

response = requests.get(
    "${API_BASE_URL}/api/v1/screenshots",
    headers={"X-API-Key": "your_api_key_here"},
    params={
        "page": 1,
        "limit": 10,
        "sortBy": "createdAt",
        "sortOrder": "desc"
    }
)

data = response.json()
print(f"Total: {data['data']['pagination']['total']}")
for screenshot in data['data']['screenshots']:
    print(f"- {screenshot['id']}: {screenshot['options']['url']}")`,
      },
      {
        language: 'curl',
        label: 'cURL',
        icon: 'fas fa-terminal',
        iconColor: '#073551',
        code: `curl -X GET "${API_BASE_URL}/api/v1/screenshots?page=1&limit=10" \\
  -H "X-API-Key: your_api_key_here"`,
      },
    ],
  };
}

/**
 * Generate code examples for Analytics
 */
export function generateAnalyticsExamples(): EndpointExample {
  return {
    endpoint: '/api/v1/analytics/overview',
    method: 'GET',
    description: 'Get usage analytics and statistics',
    examples: [
      {
        language: 'javascript',
        label: 'Node.js',
        icon: 'fab fa-node-js',
        iconColor: '#68a063',
        code: `const axios = require('axios');

async function getAnalytics() {
  const response = await axios.get('${API_BASE_URL}/api/v1/analytics/overview', {
    headers: {
      'X-API-Key': 'your_api_key_here'
    },
    params: {
      period: '30d'  // 7d, 30d, 90d
    }
  });

  const { totalScreenshots, successRate, avgDuration } = response.data.data;
  console.log(\`Total: \${totalScreenshots}, Success: \${successRate}%\`);
}

getAnalytics();`,
      },
      {
        language: 'python',
        label: 'Python',
        icon: 'fab fa-python',
        iconColor: '#3776ab',
        code: `import requests

response = requests.get(
    "${API_BASE_URL}/api/v1/analytics/overview",
    headers={"X-API-Key": "your_api_key_here"},
    params={"period": "30d"}
)

data = response.json()['data']
print(f"Total: {data['totalScreenshots']}")
print(f"Success Rate: {data['successRate']}%")`,
      },
      {
        language: 'curl',
        label: 'cURL',
        icon: 'fas fa-terminal',
        iconColor: '#073551',
        code: `curl -X GET "${API_BASE_URL}/api/v1/analytics/overview?period=30d" \\
  -H "X-API-Key: your_api_key_here"`,
      },
    ],
  };
}

/**
 * Get all endpoint examples
 */
export function getAllExamples(): EndpointExample[] {
  return [
    generateScreenshotExamples(),
    generateRegisterExamples(),
    generateApiKeyExamples(),
    generateListScreenshotsExamples(),
    generateAnalyticsExamples(),
  ];
}

/**
 * Get examples for a specific language
 */
export function getExamplesByLanguage(language: string): EndpointExample[] {
  return getAllExamples().map((endpoint) => ({
    ...endpoint,
    examples: endpoint.examples.filter((ex) => ex.language === language),
  }));
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): {
  language: string;
  label: string;
  icon: string;
  iconColor: string;
}[] {
  return [
    { language: 'curl', label: 'cURL', icon: 'fas fa-terminal', iconColor: '#073551' },
    { language: 'javascript', label: 'Node.js', icon: 'fab fa-node-js', iconColor: '#68a063' },
    { language: 'python', label: 'Python', icon: 'fab fa-python', iconColor: '#3776ab' },
    { language: 'php', label: 'PHP', icon: 'fab fa-php', iconColor: '#777bb4' },
    { language: 'ruby', label: 'Ruby', icon: 'fas fa-gem', iconColor: '#cc342d' },
    { language: 'go', label: 'Go', icon: 'fas fa-code', iconColor: '#00add8' },
    { language: 'java', label: 'Java', icon: 'fab fa-java', iconColor: '#ed8b00' },
    { language: 'csharp', label: 'C#', icon: 'fas fa-code', iconColor: '#512bd4' },
    { language: 'httpie', label: 'HTTPie', icon: 'fas fa-terminal', iconColor: '#73dc8c' },
  ];
}
