# MediFlow - Medical Practice Management System

A comprehensive medical practice management system built with React and Vite. MediFlow provides healthcare professionals with tools to manage patients, appointments, billing, and medical records efficiently.

## 🏥 Features

### Core Functionality

- **Patient Management**: Complete patient profiles with medical history, allergies, medications, and emergency contacts
- **Appointment Scheduling**: Calendar-based appointment management with doctor assignments
- **Medical Records**: Digital medical records with encounter tracking and documentation
- **Billing Management**: Insurance processing, payment tracking, and financial reporting
- **User Management**: Role-based access control for doctors, nurses, administrators, and staff
- **Organization Management**: Multi-organization support for healthcare networks

### Advanced Features

- **Specialty Consultations**: Dynamic forms for different medical specialties
- **Lab Orders & Results**: Laboratory test ordering and result management
- **Prescription Management**: Digital prescription creation and tracking
- **Telemedicine**: Virtual consultation capabilities
- **Vaccination Tracking**: Immunization records and scheduling
- **Surgery Management**: Surgical procedure planning and documentation
- **Discharge Summaries**: Automated discharge documentation
- **Referral System**: Patient referral management between providers
- **Document Templates**: Customizable medical document templates
- **Clinical Calculators**: Built-in medical calculators and tools

### Technical Features

- **Responsive Design**: Mobile-first design with tablet and desktop optimization
- **Dark Mode**: Complete theme support with system preference detection
- **Real-time Updates**: Live data synchronization across all users
- **Offline Support**: Progressive Web App capabilities
- **Accessibility**: WCAG 2.1 AA compliant interface
- **Security**: HIPAA-compliant data handling and encryption

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/mediflow.git
   cd mediflow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Configuration

Create a `.env` file with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.mediflow.com

# Development Settings
VITE_USE_MOCK_DATA=true

# Optional: Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

## 🧪 Testing

MediFlow includes comprehensive testing infrastructure:

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration and user workflows
- **E2E Tests**: Full application testing with Playwright
- **Mock Service Worker**: API mocking for consistent testing

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 + Vite
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v7
- **Testing**: Vitest + Playwright + Testing Library
- **API**: RESTful API
- **Deployment**: Docker + Nginx

### Project Structure

```text
src/
├── api/                 # API configuration and client
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Radix)
│   ├── patients/       # Patient management components
│   ├── appointments/   # Appointment components
│   ├── billing/       # Billing components
│   └── ...
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
├── tests/              # Test files
│   ├── components/     # Component tests
│   ├── integration/    # Integration tests
│   ├── e2e/           # End-to-end tests
│   └── mocks/         # Mock data and handlers
└── utils/              # Helper utilities
```

### Data Flow

1. **Authentication**: JWT-based authentication
2. **API Calls**: TanStack Query manages server state and caching
3. **Form Handling**: React Hook Form with Zod validation
4. **UI Updates**: React state management with context providers
5. **Real-time**: WebSocket connections for live updates

## 🚢 Deployment

### Docker Deployment

1. **Build the application**

   ```bash
   docker build -t mediflow .
   ```

2. **Run with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Production deployment**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Build for production**

   ```bash
   npm run build
   ```

2. **Deploy dist/ folder to your web server**

3. **Configure Nginx** (see `nginx.conf`)

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://api.mediflow.com
VITE_USE_MOCK_DATA=false
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests

### Code Style

- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting (configured via ESLint)
- **Conventional Commits**: Standardized commit messages

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed development setup
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [API Integration](docs/API_INTEGRATION.md) - API integration guide
- [Architecture Overview](docs/ARCHITECTURE.md) - System architecture details
- [Multi-Agent Development](docs/MULTI_AGENT.md) - Parallel development workflows

## 🔒 Security

MediFlow implements comprehensive security measures:

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: All data encrypted in transit and at rest
- **HIPAA Compliance**: Healthcare data protection standards
- **Security Headers**: CSP, HSTS, and other security headers
- **Input Validation**: Comprehensive input sanitization
- **Audit Logging**: Complete audit trail for all actions

## 🆘 Support

### Getting Help

- **Documentation**: Check the docs/ folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact support at [support@mediflow.com](mailto:support@mediflow.com)

### Troubleshooting

- **Common Issues**: See [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- **Performance**: Check [Performance Guide](docs/PERFORMANCE.md)
- **Debugging**: Enable debug mode with `VITE_ENABLE_DEBUG_MODE=true`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Backend**: RESTful API services
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Team**: Frontend framework
- **Vite Team**: Build tool and dev server

---

**MediFlow** - Streamlining healthcare management for the modern world.
