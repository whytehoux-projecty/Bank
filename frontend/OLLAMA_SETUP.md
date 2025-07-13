# Ollama Setup Guide for Aurum Vault

## 🚀 Quick Setup

### 1. Install Ollama

#### macOS

```bash
brew install ollama
```

#### Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Windows

Download and install from [https://ollama.ai/download](https://ollama.ai/download)

### 2. Start Ollama Service

```bash
ollama serve
```

### 3. Pull AI Model

```bash
# Recommended model for banking assistant
ollama pull llama3.2:latest

# Alternative models
ollama pull mistral:latest
ollama pull codellama:latest
```

### 4. Verify Installation

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test model
ollama run llama3.2:latest "Hello, I'm testing the AI assistant"
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local` file:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

### Advanced Configuration

#### Custom Model Settings

```bash
# Create a custom model for banking
cat > banking-assistant.modelfile << EOF
FROM llama3.2:latest

TEMPLATE """{{ if .System }}<|start_header_id|>system<|end_header_id|>

{{ .System }}<|eot_id|>{{ end }}{{ if .Prompt }}<|start_header_id|>user<|end_header_id|>

{{ .Prompt }}<|eot_id|>{{ end }}<|start_header_id|>assistant<|end_header_id|>

{{ .Response }}<|eot_id|>"""

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER max_tokens 1000

SYSTEM """You are Nova, a sophisticated AI banking assistant for Aurum Vault, a luxury private banking institution. You provide professional, knowledgeable, and personalized financial guidance while maintaining the highest standards of discretion and confidentiality."""
EOF

# Build the custom model
ollama create aurum-banking -f banking-assistant.modelfile
```

#### Using Custom Model

Update your `.env.local`:

```env
OLLAMA_MODEL=aurum-banking
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Ollama Not Running

```bash
# Check if process is running
ps aux | grep ollama

# Start service manually
ollama serve
```

#### 2. Model Not Found

```bash
# List available models
ollama list

# Pull missing model
ollama pull llama3.2:latest
```

#### 3. Connection Refused

- Ensure Ollama is running on port 11434
- Check firewall settings
- Verify OLLAMA_BASE_URL in environment

#### 4. Slow Response Times

- Use smaller models (e.g., `llama3.2:1b`)
- Adjust temperature and max_tokens
- Consider GPU acceleration

### Performance Optimization

#### GPU Acceleration

Ollama automatically uses GPU if available:

- NVIDIA GPUs: CUDA support
- Apple Silicon: Metal support
- AMD GPUs: ROCm support

#### Memory Management

```bash
# Set memory limit (GB)
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=1
```

## 📖 API Usage

### Basic Chat

```javascript
import { callOllamaApi } from './services/ollamaService';

const response = await callOllamaApi(
  "What's my account balance?",
  [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ]
);
```

### Health Check

```javascript
import { checkOllamaHealth } from './services/ollamaService';

const isHealthy = await checkOllamaHealth();
if (!isHealthy) {
  console.error('Ollama service is not available');
}
```

## 🔒 Security Considerations

- Ollama runs locally, ensuring data privacy
- No data sent to external APIs
- Models stored on local machine
- Full control over AI processing

## 📚 Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Model Library](https://ollama.ai/library)
- [JavaScript Client](https://github.com/ollama/ollama-js)
- [API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)
