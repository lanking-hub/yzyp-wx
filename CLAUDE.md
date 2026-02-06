# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program (yzyp-wx) for AI-powered fashion design, built with uni-app framework. The application allows users to describe clothing designs and generate AI-powered fashion images with various brand styles.

## Architecture

- **Framework**: uni-app with Vue 3
- **Target Platforms**: WeChat Mini Program (primary), with support for other mini-programs (Alipay, Baidu, Toutiao)
- **Backend**: API service running on `http://localhost:8080`
- **Authentication**: Token-based with automatic refresh handling

### Project Structure

```
├── pages/                    # Page components
│   ├── sheji/               # Design page - main feature for generating clothing designs
│   ├── shoucang/            # Collection page - saved designs
│   ├── wode/                # User profile page
│   └── history/             # History page - generation history
├── components/
│   └── CustomNavBar/        # Reusable navigation bar component
├── utils/
│   ├── request.js           # HTTP request utility with token management
│   └── auth.js              # Authentication utilities
├── static/                  # Static assets (icons, images)
└── prototype/               # Design prototypes/mockups
```

### Key Features

1. **AI Design Generation** (`pages/sheji/sheji.vue`):
   - Text-based design description input
   - Brand style selection (Ralph Lauren, House of CB, Lululemon, ZARA, COS)
   - Image generation via backend API
   - Save and collection functionality

2. **Authentication Flow**:
   - Token-based authentication with automatic refresh
   - Handles `A000100` error code for re-authentication
   - Tokens stored in local storage

## Development Commands

Since this is a uni-app project, development is typically done through HBuilderX IDE or uni-app CLI:

### Using HBuilderX
- Open project in HBuilderX
- Run → Run to Mini Program Simulator → WeChat Mini Program
- For development build: Run → Run to Browser or Run to Mini Program Simulator

### Using CLI (if configured)
```bash
# Development build
npm run dev:mp-weixin

# Production build
npm run build:mp-weixin

# Other platforms
npm run dev:mp-alipay
npm run dev:app-plus
```

## API Integration

### Backend Endpoints
- `POST http://localhost:8080/image/generate` - Generate clothing design images
- `POST http://localhost:8080/design-collection/{historyId}` - Collect/save designs

### Request Format
- All requests include `token` header for authentication
- Backend returns standard format with `code` field (`"0"` for success)
- Automatic token refresh handling in `utils/request.js`

## UI Components

### Custom Navigation Bar
- Fixed positioning with status bar accommodation
- Orange theme (`#FF7F50`) consistent across app
- Used in all main pages

### Color Scheme
- Primary: `#FF7F50` (coral orange)
- Background: `#FFF8F0` (light beige)
- White containers for content sections

## State Management

- Currently using component-level state management
- No global state management library (Vuex/Pinia) implemented
- Authentication state managed through `utils/auth.js`

## File Naming Conventions

- Pages: `pages/[feature]/[feature].vue`
- Components: `components/[ComponentName]/[ComponentName].vue`
- Icons: Organized in `/static/icons/` by category (actions, brands, tabBar)