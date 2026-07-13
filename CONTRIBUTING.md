# Contributing to KasirQu

Thank you for your interest in contributing to KasirQu! This document outlines the process and guidelines for contributing to this open-source point of sale system.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

1. Check the [issue tracker](https://github.com/januarsyah901/kasirqu/issues) to see if the bug has already been reported
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Environment details (OS, PHP version, browser)
   - Screenshots or logs if applicable

### Suggesting Features

1. Search existing issues for similar feature requests
2. Open a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach (optional)

### Pull Requests

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/kasirqu.git
   cd kasirqu
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Set Up Development Environment**
   ```bash
   # Install dependencies
   docker compose up -d
   docker compose exec php-fpm composer install
   cd frontend && npm install
   
   # Run migrations
   docker compose exec php-fpm php artisan migrate
   
   # Seed test data
   docker compose exec php-fpm php artisan db:seed
   ```

4. **Make Your Changes**
   - Follow the coding standards (see below)
   - Write tests for new features
   - Update documentation if needed

5. **Run Tests**
   ```bash
   # Backend tests
   docker compose exec php-fpm php artisan test
   
   # Frontend tests
   cd frontend && npm run test -- --run
   
   # Code style check
   docker compose exec php-fpm vendor/bin/php-cs-fixer fix --dry-run
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add payment method validation"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` code style changes (formatting)
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a pull request on GitHub with:
   - Description of changes
   - Related issue numbers (e.g., "Closes #123")
   - Screenshots for UI changes
   - Test results

## Development Guidelines

### Backend (Laravel)

- **PHP Version:** 8.2+
- **Framework:** Laravel 10
- **Code Style:** PSR-12
- **Testing:** Pest/PHPUnit

**File Structure:**
```
backend/
├── app/
│   ├── Http/Controllers/Api/V1/  # API controllers
│   ├── Models/                    # Eloquent models
│   ├── Services/                  # Business logic
│   └── Http/Requests/             # Form validation
├── database/
│   ├── migrations/                # Database migrations
│   └── seeders/                   # Test data seeders
├── routes/
│   └── api.php                    # API routes
└── tests/
    ├── Feature/                   # Integration tests
    └── Unit/                      # Unit tests
```

**Best Practices:**
- Use type declarations for all method parameters and returns
- Inject dependencies via constructor
- Keep controllers thin, business logic in services
- Use FormRequest classes for validation
- Write descriptive test names: `test_user_can_create_sale_with_valid_data()`

**Running PHP CS Fixer:**
```bash
docker compose exec php-fpm vendor/bin/php-cs-fixer fix
```

### Frontend (React + Vite)

- **Node Version:** 24+
- **Framework:** React 18
- **Styling:** TailwindCSS 3
- **Testing:** Vitest + Testing Library

**File Structure:**
```
frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── api/                 # API client
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   └── assets/              # Images, branding
├── tests/
│   └── components/          # Component tests
└── cypress/
    └── e2e/                 # End-to-end tests
```

**Best Practices:**
- Use functional components with hooks
- PropTypes or TypeScript for type checking
- Accessibility: use semantic HTML, ARIA labels, keyboard navigation
- Responsive design (mobile-first)
- Dark mode support via Tailwind's `dark:` classes

**Running Linter:**
```bash
cd frontend
npm run lint
npm run lint:fix
```

### Database Migrations

- **Never modify existing migrations** — create new ones to alter tables
- Use descriptive names: `2026_07_13_create_sales_table.php`
- Include both `up()` and `down()` methods
- Test rollback: `php artisan migrate:rollback`

### API Endpoints

- **Versioning:** `/api/v1/*`
- **Authentication:** Laravel Sanctum (Bearer token)
- **Response Format:**
  ```json
  {
    "data": { ... },
    "message": "Success",
    "meta": { "page": 1, "total": 100 }
  }
  ```
- **Error Format:**
  ```json
  {
    "error": "Validation failed",
    "errors": { "email": ["The email field is required."] }
  }
  ```

### Localization

When adding new language keys:
1. Add the key to `app/Language/en/` with English text
2. Add the same key to all other language folders with empty string `''` (CodeIgniter falls back to English)
3. Community translations welcome via pull requests

## Review Process

1. **Automated Checks:** CI pipeline runs tests and linters
2. **Code Review:** Maintainer reviews code quality, logic, and tests
3. **Feedback:** Address requested changes
4. **Merge:** Once approved, maintainer merges the PR

**Review Timeline:**
- Initial response: 3-5 business days
- Complex features may require multiple review rounds

## Getting Help

- **Documentation:** [README.md](README.md)
- **Discussions:** [GitHub Discussions](https://github.com/januarsyah901/kasirqu/discussions)
- **Issues:** [Issue Tracker](https://github.com/januarsyah901/kasirqu/issues)

## Recognition

Contributors are recognized in:
- Release notes for significant features
- GitHub contributors page
- Optional credit in application footer

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see [LICENSE](LICENSE)).

---

Thank you for contributing to KasirQu! 🎉
