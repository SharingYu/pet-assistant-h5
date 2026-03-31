
## 🌐 公网部署信息

### 访问地址
- **HTTPS**: https://www.sharingyai.com
- **HTTP**: http://www.sharingyai.com（自动跳转到HTTPS）

### SSL证书
- Let's Encrypt 免费证书
- 有效期: 2026-03-31 至 2026-06-29
- 自动续期: 每天凌晨3点检查

### Nginx配置
- 配置文件: `/etc/nginx/sites-available/pet-assistant`
- 反向代理: `/api/` → `http://127.0.0.1:3000`
- SSL/TLS: TLSv1.2 + TLSv1.3

### 域名
- www.sharingyai.com
- DNS: 解析到 111.229.34.152
