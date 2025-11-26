# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

### 🚨 **Important Security Notice**
If you discover a security vulnerability in this project, **DO NOT** create a public GitHub issue.

### 📧 **How to Report Security Issues**
1. **Email**: Send details to `govindjsg19@gmail.com`
2. **Subject**: `[SECURITY] BookStore Vulnerability Report`
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### 🔒 **Security Response Process**
1. **Acknowledgment**: You'll receive confirmation within 24 hours
2. **Investigation**: Security team investigates the issue
3. **Fix Development**: Patch is developed and tested
4. **Release**: Fixed version is released
5. **Disclosure**: Public disclosure after fix is available

### ⏰ **Timeline**
- **Critical vulnerabilities**: Fixed within 24-48 hours
- **High severity**: Fixed within 1 week
- **Medium severity**: Fixed within 2 weeks
- **Low severity**: Fixed within 1 month

## Security Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (USER, ADMIN, PUBLISHER)
- OAuth2 integration with Google
- Password encryption with BCrypt

### 🛡️ **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- HTTPS enforcement in production

### 🔒 **API Security**
- Rate limiting
- Request validation
- Secure headers
- CORS configuration
- API key management

### 🗄️ **Database Security**
- Parameterized queries
- Connection encryption
- Access control
- Audit logging

## Best Practices for Contributors

### ✅ **Do's**
- Report security issues privately
- Follow secure coding practices
- Use environment variables for secrets
- Validate all inputs
- Sanitize outputs

### ❌ **Don'ts**
- Don't commit sensitive data
- Don't hardcode credentials
- Don't bypass security checks
- Don't ignore security warnings
- Don't create public security issues

## Security Updates

### 🔄 **Regular Updates**
- Dependencies updated monthly
- Security patches applied immediately
- Regular security audits
- Penetration testing

### 📋 **Security Checklist**
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Output sanitization applied
- [ ] Authentication required
- [ ] Authorization enforced
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Rate limiting configured

## Contact Information

- **Security Team**: govindjsg19@gmail.com
- **Repository Owner**: GovindS2025
- **Emergency Contact**: +44-7776818170

---

**Thank you for helping keep BookStore secure!** 🛡️
