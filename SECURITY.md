# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in KasirQu, please email the maintainers at **security@kasirqu.local** (replace with actual contact). Do not open public GitHub issues for security vulnerabilities.

We aim to respond within 48 hours and provide a fix within 14 days for critical vulnerabilities.

## Security Measures Implemented

### Application Security

1. **Authentication & Authorization**
   - Laravel Sanctum for stateless API token authentication
   - CSRF protection enabled for all state-changing requests
   - Password hashing using bcrypt (cost factor 12)
   - Rate limiting on login endpoints (5 attempts per minute)

2. **Input Validation & Sanitization**
   - All API inputs validated using Laravel FormRequest classes
   - SQL injection prevention via Eloquent ORM parameterized queries
   - XSS protection through automatic output escaping in Blade templates
   - File upload validation (type, size, MIME checks)

3. **Session Security**
   - HTTP-only cookies for session tokens
   - Secure flag enabled in production (HTTPS only)
   - Session timeout after 2 hours of inactivity
   - Redis-backed session store for scalability

4. **API Security**
   - Bearer token authentication (Sanctum)
   - CORS configured to allow only trusted origins
   - API versioning (`/api/v1/`) to maintain backward compatibility
   - Request size limits (10MB max payload)

### Infrastructure Security

1. **HTTP Headers** (configured in `nginx/default.conf`)
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   Referrer-Policy: strict-origin-when-cross-origin
   ```

2. **Docker Security**
   - Non-root user for PHP-FPM container
   - Read-only filesystem where possible
   - Minimal base images (Alpine Linux)
   - Regular vulnerability scanning via Trivy in CI pipeline

3. **Database Security**
   - MySQL 8.0 with strong password requirements
   - Database credentials via environment variables only
   - Separate database users for app vs migrations
   - Automated backups with encryption at rest

### Environment Configuration

**Never commit `.env` files.** Use `.env.example` as a template.

Required security configurations in `.env`:

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... # Generate with: php artisan key:generate

# Database - Use strong passwords
DB_PASSWORD=<randomly-generated-32-char-string>

# Session - Use secure driver
SESSION_DRIVER=redis
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true

# CORS - Restrict to your frontend domain
SANCTUM_STATEFUL_DOMAINS=app.kasirqu.com
SESSION_DOMAIN=.kasirqu.com

# Rate limiting
THROTTLE_LOGIN=5,1  # 5 attempts per minute
```

### Dependency Management

- Composer dependencies pinned to specific versions
- `composer audit` runs in CI to detect known vulnerabilities
- npm dependencies audited via `npm audit` in CI
- Automated dependency updates via Dependabot (see `.github/dependabot.yml`)

### Logging & Monitoring

- Failed authentication attempts logged with IP address
- Error logs sanitized (no sensitive data in stack traces)
- Audit trail for financial transactions (sales, refunds)
- Log rotation configured (7 days retention)

## Security Checklist for Deployment

- [ ] Generate new `APP_KEY` in production
- [ ] Use HTTPS/TLS certificates (Let's Encrypt recommended)
- [ ] Configure firewall to allow only ports 80, 443
- [ ] Enable HSTS preloading
- [ ] Set `APP_DEBUG=false` and `APP_ENV=production`
- [ ] Use strong database passwords (32+ characters)
- [ ] Configure Redis password authentication
- [ ] Enable automated backups (database + uploaded files)
- [ ] Set up log monitoring (Sentry, Papertrail, or similar)
- [ ] Configure rate limiting on nginx level
- [ ] Review and restrict CORS domains
- [ ] Enable fail2ban or similar intrusion prevention
- [ ] Schedule regular security audits

## Third-Party Security Tools

Optional tools for enhanced security:

1. **OWASP ZAP** - Automated penetration testing
   ```bash
   docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
   ```

2. **Snyk** - Dependency vulnerability scanning
   ```bash
   npm install -g snyk
   snyk test
   ```

3. **SonarQube** - Static code analysis
   ```bash
   docker run -d --name sonarqube -p 9000:9000 sonarqube:community
   ```

## Compliance

- GDPR: User data export/deletion endpoints available
- PCI-DSS: Payment processing via third-party gateway (no card storage)
- Data retention: Configurable in admin panel (default 7 years for financial records)

## Security Updates

Subscribe to security advisories:
- Laravel: https://github.com/laravel/framework/security/advisories
- PHP: https://www.php.net/security/
- Node.js: https://nodejs.org/en/security/

---

Last updated: 2026-07-13
