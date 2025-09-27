# Gingin  

**gingin** is an AI assistant built for *Toko Gangan*.  

---

## 🚀 Features  

- Conversational AI assistant tailored for Toko Gangan  
- Uses a cookbook of prompts / intents (via `cookbook.json`)  
- Deployable on Cloudflare Workers (via Wrangler)  
- Configurable via `config.js`, `metadata.json`, etc.  
- Extensible — you can add new prompts, integrations, or logic  

---


- **src/cloudworkersystemprompt.js** — core logic for system-level prompt handling  
- **src/config.js** — configuration values and environment variables  
- **src/index.tsx** — main entry point / handler  
- **src/metadata.json** — metadata about the assistant, version, etc.  
- **cookbook.json** — list of prompt templates / intents / “recipes”  
- **wrangler.toml / wrangler.jsonc** — configuration for Cloudflare Workers deploy  
- **package.json** — npm dependencies and scripts  

---

## 🧩 Getting Started  

### Prerequisites  

- Node.js (>=14 or as required)  
- Wrangler CLI (for Cloudflare Workers)  
- Access / credentials for your Cloudflare account (Account ID, etc.)  

### Installation  

```bash
git clone https://github.com/0xdfkoikoi/gingin.git
cd gingin
npm install

Configuration

Edit config.js — fill in necessary keys, secrets, endpoints

Update metadata.json if you want to change name, version, description

Extend or modify cookbook.json to define the prompts / intents for your assistant

Local Development

You can test locally (if supported) or via Wrangler “preview”:

wrangler dev

