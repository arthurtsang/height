# Requirement Examples

This file contains sample requirements demonstrating best practices for persona, context, and acceptance criteria.

---

## Example 1: User Authentication

### Requirement: User Login with Email and Password

**Persona:**
As a registered user of the application,
I need a secure way to access my account and personalized content.

**Context:**
In order to protect user data and provide personalized experiences,
the system must authenticate users before granting access to protected resources.
This is a foundational security requirement that enables all user-specific features.

**Acceptance Criteria:**

1. **Given** a user is on the login page
   **When** they enter valid email and password credentials
   **Then** they are redirected to their dashboard and a session is created

2. **Given** a user enters an invalid email format
   **When** they attempt to submit the login form
   **Then** an inline validation error appears indicating "Please enter a valid email address"

3. **Given** a user enters incorrect credentials
   **When** they submit the login form
   **Then** a generic error message displays "Invalid email or password" (without revealing which is incorrect)

4. **Given** a user fails login 5 times within 15 minutes
   **When** they attempt a 6th login
   **Then** their account is temporarily locked for 30 minutes and they receive a notification email

5. Passwords must be transmitted over HTTPS and never logged or displayed in plain text

6. Session tokens expire after 24 hours of inactivity

7. Login page is accessible via keyboard navigation and screen readers (WCAG 2.1 AA compliant)

---

## Example 2: E-commerce Feature

### Requirement: Shopping Cart Item Quantity Update

**Persona:**
As an online shopper,
I want to easily adjust product quantities in my cart so I can purchase the exact amount I need without removing and re-adding items.

**Context:**
In order to improve the checkout experience and reduce cart abandonment,
users need a quick way to modify quantities without navigating away from the cart page.
This feature directly impacts conversion rates and user satisfaction.

**Acceptance Criteria:**

1. **Given** a user has items in their shopping cart
   **When** they click the "+" button next to an item
   **Then** the quantity increases by 1 and the subtotal updates immediately

2. **Given** a user has items in their shopping cart
   **When** they click the "-" button next to an item with quantity > 1
   **Then** the quantity decreases by 1 and the subtotal updates immediately

3. **Given** an item has a quantity of 1
   **When** the user clicks the "-" button
   **Then** a confirmation modal appears asking "Remove this item from cart?"

4. **Given** a user manually enters a quantity in the input field
   **When** they enter a number between 1 and the available stock
   **Then** the quantity updates and the subtotal recalculates

5. **Given** a user enters a quantity exceeding available stock
   **When** they attempt to update
   **Then** an error message displays "Only [X] items available" and quantity resets to maximum available

6. **Given** a user enters invalid input (negative, zero, or non-numeric)
   **When** they attempt to update
   **Then** the input is rejected and quantity remains unchanged with error message "Please enter a valid quantity"

7. Cart updates persist across browser sessions (saved to user account or local storage)

8. All quantity updates complete within 500ms for optimal user experience

---

## Example 3: API Integration

### Requirement: Real-time Weather Data Integration

**Persona:**
As a mobile app user planning outdoor activities,
I need current weather information for my location so I can make informed decisions about my day.

**Context:**
In order to provide value-added features beyond basic scheduling,
the application must integrate with a third-party weather API to display real-time conditions.
This feature differentiates our app from competitors and increases daily active usage.

**Acceptance Criteria:**

1. **Given** a user opens the app with location permissions enabled
   **When** the home screen loads
   **Then** current weather data (temperature, conditions, humidity) displays within 2 seconds

2. **Given** the weather API is unavailable or returns an error
   **When** the app attempts to fetch weather data
   **Then** a cached version (if available) displays with a timestamp, or a friendly message "Weather data temporarily unavailable"

3. **Given** a user denies location permissions
   **When** they access the weather feature
   **Then** they are prompted to enter a city name manually or enable location services

4. Weather data refreshes automatically every 30 minutes when the app is in the foreground

5. **Given** the API rate limit is reached
   **When** additional requests are made
   **Then** the app uses cached data and displays "Weather data will refresh in [X] minutes"

6. All API calls include proper authentication headers and timeout after 5 seconds

7. Weather icons and descriptions are accessible with appropriate alt text for screen readers

8. API responses are validated against expected schema before displaying to prevent crashes

---

## Example 4: Admin Dashboard

### Requirement: User Management Bulk Actions

**Persona:**
As a system administrator managing hundreds of user accounts,
I need to perform actions on multiple users simultaneously to efficiently manage the platform without repetitive manual work.

**Context:**
In order to reduce administrative overhead and improve operational efficiency,
administrators require bulk operation capabilities for common user management tasks.
This feature is critical for scaling operations as the user base grows.

**Acceptance Criteria:**

1. **Given** an admin is viewing the user management table
   **When** they select multiple user checkboxes
   **Then** a bulk actions dropdown menu appears with options: "Activate", "Deactivate", "Delete", "Export"

2. **Given** an admin selects 50 users and chooses "Deactivate"
   **When** they confirm the action
   **Then** all selected users are deactivated and a success message shows "50 users deactivated successfully"

3. **Given** an admin attempts to delete users
   **When** they confirm the bulk delete action
   **Then** a final warning modal appears listing the number of users and requiring typed confirmation "DELETE"

4. **Given** a bulk operation fails for some users (e.g., due to permissions)
   **When** the operation completes
   **Then** a detailed report shows successful and failed operations with reasons for failures

5. Bulk operations are limited to 100 users per action to prevent system overload

6. **Given** a bulk operation is in progress
   **When** the admin navigates away
   **Then** a warning appears "Operation in progress. Are you sure you want to leave?"

7. All bulk actions are logged in the audit trail with timestamp, admin user, and affected accounts

8. Bulk operations complete within 30 seconds for up to 100 users

---

## Key Takeaways from Examples

- **Persona**: Clearly identifies the user and their motivation
- **Context**: Explains the business value and rationale
- **Acceptance Criteria**: Specific, testable, covering happy paths, edge cases, and non-functional requirements
- **Given-When-Then**: Used for behavioral scenarios to ensure clarity
- **Measurable**: Includes concrete numbers (timeouts, limits, quantities)
- **Complete**: Addresses security, performance, accessibility, and error handling