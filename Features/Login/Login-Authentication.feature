@login @smoke @authentication
Feature: Login & Authentication
  As any user (SRTA Operator, Tahseel Finance User, System Administrator)
  I want to securely authenticate to the Masar Central System
  So that I can access features appropriate to my role with proper authorization

  # Lessons learned from auth setup stabilization:
  # - Always use canonical secure entry URL: /masar/
  # - Authentication entry may be either Plaza Continue screen OR direct Identity form
  # - Assertions should focus on observable state, not one mandatory redirect path

  Background:
    Given I navigate to the login page
    And the authentication entry screen should be loaded
    And the login entry URL should use secure canonical format

  # ==================== POSITIVE SCENARIOS ====================
  @P1 @positive @smoke @critical @login
  Scenario: Successful login with valid SRTA Operator credentials redirects to Dashboard
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then I should be redirected to the dashboard
    And the dashboard URL should contain "landing"
    And the Angular sidebar sentinel should be visible
    And the dashboard h1 heading should contain text "Home"

  @P1 @positive @critical @login
  Scenario: Verify landing dashboard URL contains "/dashboard"
    When I log in successfully using valid credentials
    Then the current URL should contain "/dashboard"
    And the page h1 heading should contain text "Dashboard"

  @P2 @positive @login
  Scenario: User can logout and session is cleared
    Given I am logged in
    When I click the Logout button
    Then I should be redirected to the login page
    And the continue button should be visible on the Plaza login page

  # ==================== NEGATIVE SCENARIOS ====================
  @N1 @negative @validation @login
  Scenario: Submit button is disabled when username is empty
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username ""
    Then the submit button is not Enabled
    And I should remain on the identity server page

  @N2 @negative @validation @login
  Scenario: Submit button is disabled when password is empty
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password ""
    Then the submit button is not Enabled
    And I should remain on the identity server page

  @N3 @negative @security @login
  Scenario: Submitting a non-existent username shows identity server error
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username "nonexistent_user_xyz_99999"
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @N4 @negative @security @login
  Scenario: Submitting wrong password for valid username shows error
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password "wrong_password_xyz_123"
    And I submit the Sign In form
    Then the Sign In Button should be Disabled
    And I should remain on the identity server page

  @N5 @negative @security @login
  Scenario: Accessing protected dashboard without authentication redirects to login
    Given I am not authenticated
    When I navigate directly to "/dashboard"
    Then I should be redirected to the login page
    And the continue button should be visible on the Plaza login page

  @N6 @negative @security @login
  Scenario: SQL injection attempt in username field is rejected
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username "admin' OR '1'='1"
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @N7 @negative @security @login
  Scenario: XSS attempt in username field is sanitized
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username "<script>alert('xss')</script>"
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @N8 @negative @validation @login
  Scenario: Username with special characters is rejected if not allowed
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username "user@#$%^&*()"
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @N9 @negative @validation @login
  Scenario: Password with only spaces is rejected
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password "   "
    And I press ENTER key
    Then the Sign In Button should be Disabled
    And I should remain on the identity server page

  @N9 @negative @validation @login
  Scenario: Wrong Password is rejected
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password "As_Fawaz_123"
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @N10 @negative @performance @skip @login
  Scenario: Rapid consecutive login attempts trigger rate limiting
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password "wrong_password_xyz_123"
    And I submit the Sign In form
    Then the Sign In Button should be Disabled
    And I should remain on the identity server page
    When I immediately retry with correct password
    Then an identity server error or validation message should be displayed indicating rate limit

  # ==================== EDGE CASE SCENARIOS ====================
  @P3 @edge-case @login
  Scenario: Login with maximum allowed username length
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password from environment configuration
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @P3 @edge-case @login
  Scenario: Login with maximum allowed password length
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    And I enter the username from environment configuration
    And I submit the username form
    And the identity server UnifiedLogin page should be loaded
    And I enter the password "pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp"
    And I submit the Sign In form
    Then the Sign In Validation Message should be Displayed
    And I should remain on the identity server page

  @P3 @edge-case @login
  Scenario: Login page elements are accessible (WCAG compliance)
    When I click the continue button
    And the identity server VerifyUsername page should be loaded
    Then the username label should be visible
    And the password label should be visible
    And all form elements should have proper ARIA labels
    And the page should have sufficient color contrast

  # ==================== SESSION MANAGEMENT ====================
  @P2 @session @login
  Scenario: Session persists across browser refresh
    Given I am logged in
    When I refresh the browser page
    Then I should remain on the dashboard
    And the Angular sidebar sentinel should be visible

  @P2 @session @login
  Scenario: Multiple tabs share same session
    Given I am logged in
    When I open a new browser tab
    And I navigate to "/dashboard" in the new tab
    Then I should see the dashboard without requiring login
    And the Angular sidebar sentinel should be visible in the new tab

  @N11 @negative @session @skip @login
  Scenario: Session timeout redirects to login
    Given I am logged in
    When I remain inactive for 60 minutes
    Then I should be redirected to the login page
    And the continue button should be visible on the Plaza login page