# GhoSty OwO Multi Manager V2

## ⚠️ Disclaimer   

**This Script Is For Educational Purposes Only. The Author Is _NOT_ Responsible For Any Loss And Is _NOT_ Promoting Any Illegal Automation.**  

A sophisticated Node.js-based Discord bot system that manages Workers for OWO cash transactions with comprehensive balance tracking.

## 🚀 Features  

- 💰 **Multi-Token Management** - Control multiple OwO Workers from a single interface
- 📊 **Balance Tracking System** - Comprehensive user balance management
- 🔄 **Real-time Stock Monitoring** - Check available cowoncy across all tokens
- 🔒 **Secure Transaction System** - Owner-protected commands and balance verification
- 📱 **Interactive UI** - Paginated embeds with navigation buttons
- 🛡️ **Security Features** - Strict permission checks and transaction confirmations

## 📖 Installation & Usage  

### 1️⃣ Setup  

- Install Node.js (v16 or higher recommended)
- Clone this repository
- `tokens.txt` file with your account tokens (one per line)
- Update `GhoStyMainConfig` in the code with your specific details:

```javascript
  const GhoStyMainConfig = {
      mainToken: 'Main Manager Bot Token Here',
      cashChannelId: 'Commands Channel Id Here For Worker Tokens',
      ownerId: 'Owner Access Discord Account Id',
      owoBotId: '408785106942164992' // Do not change this
  };
```

### 2️⃣ Running the Bot  

```bash
npm install discord.js@14.11.0 discord.js-selfbot-v13
```

```bash
node index.js
```

### 3️⃣ Available Commands  

| Command | Description | Permissions |
|---------|-------------|-------------|
| `!balance` | Check your current cowoncy balance | All Users |
| `!stock` | Check current cowoncy stock across all tokens | All Users |
| `!sendcash {token - optional} @user {amount}` | Send cowoncy from specified/divided token | All Users |
| `!addbalance @user {amount}` | Add balance to user | Owner Only |
| `!removebalance @user {amount}` | Remove balance from user | Owner Only |
| `!listbalance` | View all user balances (paginated) | Owner Only |
| `!help` | Display comprehensive command reference | All Users |

## 🎨 Command Examples  

```ini
!sendcash 3 @GhoSty 50000
(Sends 50k from 3rd token to GhoSty)

!stock
(Shows all token balances)

!addbalance @User 100000
(Adds 100k to User)
```

## 👤 Author  

- **GhoSty (Async Development)**  
- **Discord:** [@ghostyjija](https://discord.com/users/ghostyjija)  
- **Support Server:** [Join Here](https://discord.gg/SyMJymrV8x)  

## 🤝 Contributing  

Contributions, issue reports, and feature suggestions are welcome! Feel free to join our Discord community for discussions and support.

## ⚠️ Important Notices  

- **🚫 Re-Selling or Redistributing this code will result in a ban.**
- **⚠️ Use this project responsibly. The author is not responsible for any misuse or violations of Discord's Terms of Service.**

> **Note:** This system is designed for educational purposes only. Please comply with Discord's Terms of Service when using any automation tools.


