# Bizly

[![Tests](https://github.com/abderrahimghazali/bizly/actions/workflows/test.yml/badge.svg)](https://github.com/abderrahimghazali/bizly/actions/workflows/test.yml)

A modern, professional business management platform built with Next.js and Laravel.

## 🚀 Overview

Bizly is a comprehensive business management solution designed to streamline your workflow and enhance productivity. Built with modern technologies for a seamless user experience.

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Zustand** - State management
- **Inter Font** - Professional typography

### Backend
- **Laravel 12** - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **DDEV** - Local development environment

## ✨ Current Features

- ✅ **User Authentication** - Secure login/register system
- ✅ **Protected Dashboard** - Role-based access control
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Professional UI** - Clean, minimalistic interface
- ✅ **Real-time State Management** - Seamless user experience

## 🔮 Upcoming Updates

### Phase 1 - Core Business Features
- 📊 **CRM System** - Customer relationship management
- 📅 **Calendar Integration** - Schedule and appointment management
- 📁 **File Management** - Document storage and organization
- 👥 **Contact Management** - Advanced contact organization
- 🏢 **Company Profiles** - Business entity management

### Phase 2 - Advanced Features
- 📈 **Analytics Dashboard** - Business insights and reporting
- 🔔 **Notifications** - Real-time alerts and updates
- 🔍 **Advanced Search** - Global search across all data
- 📱 **Mobile App** - Native iOS and Android applications
- 🔗 **API Integration** - Third-party service connections

### Phase 3 - Enterprise Features
- 👥 **Team Management** - User roles and permissions
- 🔄 **Workflow Automation** - Business process automation
- 📊 **Custom Reports** - Tailored business reporting
- 🌐 **Multi-tenant Support** - Enterprise-grade architecture
- 🔒 **Advanced Security** - Enhanced security features

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PHP 8.2+
- DDEV
- Composer

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bizly
   ```

2. **Start the backend**
   ```bash
   cd backend
   ddev start
   ddev artisan migrate
   ```

3. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: https://bizly-backend.ddev.site

### Test Credentials
- Email: `john@example.com`
- Password: `password123`

## 📁 Project Structure

```
bizly/
├── backend/          # Laravel API
│   ├── app/
│   ├── routes/
│   └── database/
├── frontend/         # Next.js Application
│   ├── app/
│   ├── components/
│   └── lib/
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Bizly** - *Streamlining business management, one feature at a time.*