# 🧪 Smoke Tests - Recovery Validation

## Overview

This document outlines the smoke tests to validate that all recovery fixes are working correctly.

## Test Environment Setup

```bash
# Install dependencies
npm install

# Start local server
npm start

# Server should start on http://localhost:3000
```

## Desktop Tests

### 1. Health Check Endpoint
- **Test**: `GET /healthz`
- **Expected**: `{"ok": true, "timestamp": "...", "version": "v1.0.0-recovery"}`
- **Command**: `curl http://localhost:3000/healthz`
- **Status**: ⏳ Pending

### 2. No Console Errors on Load
- **Test**: Open browser console, load page
- **Expected**: No red error messages
- **Check**: Console should show "✅ Auth disabled - going straight to dashboard"
- **Status**: ⏳ Pending

### 3. GitHub Proxy API
- **Test**: `GET /api/git/posts`
- **Expected**: JSON response with posts array
- **Command**: `curl http://localhost:3000/api/git/posts`
- **Status**: ⏳ Pending

### 4. Mock Data Fallback
- **Test**: Disable GitHub token, reload page
- **Expected**: Posts still load from local posts.json
- **Check**: Console should show "🔄 Falling back to mock data..."
- **Status**: ⏳ Pending

### 5. Edit Modal Functionality
- **Test**: Click "Edit Post" button
- **Expected**: Modal opens with post data
- **Check**: Form fields populated, image displayed
- **Status**: ⏳ Pending

### 6. Modal Save & Close
- **Test**: Edit caption/hashtags, click Save
- **Expected**: Modal closes, toast shows "Post updated successfully!"
- **Check**: Page scroll restored, data saved to localStorage
- **Status**: ⏳ Pending

## Mobile Tests

### 7. Auth Hidden by Default
- **Test**: Load page on mobile viewport (≤768px)
- **Expected**: No auth screen, goes straight to dashboard
- **Check**: Console shows "✅ Auth disabled - going straight to dashboard"
- **Status**: ⏳ Pending

### 8. Large Header Panels Removed
- **Test**: Check mobile viewport
- **Expected**: Large "Posts | Brands | Complete" panels hidden
- **CSS**: `.big-panels, .header-panels, .auth-panels { display: none !important; }`
- **Status**: ⏳ Pending

### 9. Compact Mobile Header
- **Test**: Mobile viewport header height
- **Expected**: Header height ≤56px
- **CSS**: `header { height: 56px !important; }`
- **Status**: ⏳ Pending

### 10. Touch Target Sizing
- **Test**: Check button sizes on mobile
- **Expected**: All buttons ≥44×44px
- **CSS**: `.btn, .nav-item, .post-actions button { min-height: 44px; min-width: 44px; }`
- **Status**: ⏳ Pending

### 11. Modal Mobile Fit
- **Test**: Open edit modal on mobile
- **Expected**: Modal fits viewport, content scrollable
- **CSS**: `.modal-content { width: 95vw; max-height: 95vh; }`
- **Status**: ⏳ Pending

### 12. List Scrolling
- **Test**: Scroll through posts list on mobile
- **Expected**: Smooth scrolling, no fixed overlays blocking
- **Check**: Bottom nav doesn't interfere with content
- **Status**: ⏳ Pending

## API Tests

### 13. GitHub Token Configuration
- **Test**: Set GITHUB_TOKEN environment variable
- **Expected**: Posts fetched from GitHub API
- **Check**: Console shows "🌐 Fetching posts from GitHub proxy..."
- **Status**: ⏳ Pending

### 14. GitHub API Fallback
- **Test**: Remove GITHUB_TOKEN, trigger API error
- **Expected**: Falls back to mock data
- **Check**: Console shows "❌ GitHub proxy failed:" then "🔄 Falling back to mock data..."
- **Status**: ⏳ Pending

### 15. Error Handling
- **Test**: Simulate network failure
- **Expected**: User-friendly error message shown
- **Check**: Toast notification appears with helpful message
- **Status**: ⏳ Pending

## UI/UX Tests

### 16. Toast Notifications
- **Test**: Trigger various actions
- **Expected**: Toast messages appear and auto-hide
- **Check**: Success, error, and info toast styles
- **Status**: ⏳ Pending

### 17. Responsive Design
- **Test**: Resize browser window
- **Expected**: Layout adapts smoothly
- **Check**: No horizontal scrollbars, content fits
- **Status**: ⏳ Pending

### 18. Loading States
- **Test**: Slow network simulation
- **Expected**: Loading indicators shown
- **Check**: Loading spinner visible during API calls
- **Status**: ⏳ Pending

## Performance Tests

### 19. Page Load Speed
- **Test**: Measure initial page load
- **Expected**: <3 seconds to interactive
- **Tool**: Browser DevTools Performance tab
- **Status**: ⏳ Pending

### 20. Modal Open Speed
- **Test**: Click edit button, measure modal open time
- **Expected**: <500ms to fully visible
- **Tool**: Browser DevTools Performance tab
- **Status**: ⏳ Pending

## Browser Compatibility

### 21. Chrome Desktop
- **Test**: Latest Chrome version
- **Expected**: All functionality working
- **Status**: ⏳ Pending

### 22. Safari Mobile (iOS)
- **Test**: iOS Safari simulator
- **Expected**: Touch interactions working
- **Status**: ⏳ Pending

### 23. Chrome Mobile (Android)
- **Test**: Android Chrome emulation
- **Expected**: Touch interactions working
- **Status**: ⏳ Pending

## Railway Deployment Tests

### 24. Railway Health Check
- **Test**: Deploy to Railway, check `/healthz`
- **Expected**: Returns 200 OK
- **Status**: ⏳ Pending

### 25. Environment Variables
- **Test**: Set Railway environment variables
- **Expected**: App uses configured values
- **Status**: ⏳ Pending

### 26. Auto-deploy
- **Test**: Push to GitHub branch
- **Expected**: Railway auto-deploys
- **Status**: ⏳ Pending

## Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| Desktop | 6 | 0 | 0 | 6 |
| Mobile | 6 | 0 | 0 | 6 |
| API | 3 | 0 | 0 | 3 |
| UI/UX | 3 | 0 | 0 | 3 |
| Performance | 2 | 0 | 0 | 2 |
| Browser | 3 | 0 | 0 | 3 |
| Railway | 3 | 0 | 0 | 3 |
| **Total** | **26** | **0** | **0** | **26** |

## Running Tests

### Automated Testing
```bash
# Run all tests (when implemented)
npm test

# Run specific test categories
npm run test:desktop
npm run test:mobile
npm run test:api
```

### Manual Testing
1. Open browser DevTools
2. Test each scenario manually
3. Update status in this document
4. Note any failures or issues

## Failure Criteria

A test is considered **FAILED** if:
- Functionality doesn't work as expected
- Console shows errors
- UI is broken or unusable
- Performance is significantly degraded

## Success Criteria

All tests must **PASS** for the recovery to be considered successful:
- ✅ No critical bugs
- ✅ Mobile responsive design working
- ✅ Edit modal functioning properly
- ✅ GitHub API with fallback working
- ✅ Railway deployment successful

---

**Last Updated**: $(date)
**Tested By**: [Your Name]
**Recovery Version**: v1.0.0-recovery 