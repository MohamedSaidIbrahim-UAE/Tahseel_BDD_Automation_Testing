@login @smoke @authentication
Feature: Login & Authentication
  As any user
  I want to securely authenticate to the application
  So that I can access features appropriate to my role

  Background:
    Given I navigate to the login page
    And the login page is fully loaded
  # ==================== POSITIVE SCENARIOS ====================

  @P1 @positive @smoke @critical @login
  Scenario: Successful login with valid credentials redirects to Dashboard
    When I login with valid credentials
    Then I should be redirected to the dashboard
    And the dashboard URL should contain "/dashboard"
    And the main heading should display "Dashboard"

  @P2 @positive @login
  Scenario: User can logout and session is cleared
    Given I am logged in
    When I click the Logout button
    Then I should be redirected to the login page
  # ==================== NEGATIVE SCENARIOS ====================

  @N1 @negative @validation @login
  Scenario: Login fails with empty username
    Given I navigate to the login page
    When I leave the username empty and submit
    And I submit the login form
    Then I should remain on the login page

  @N2 @negative @validation @login
  Scenario: Login fails with empty password
    Given I navigate to the login page
    When I enter a valid username but leave the password empty
    And I submit the login form
    Then I should remain on the login page

  @N3 @negative @security @login
  Scenario: Invalid credentials show error message
    Given I navigate to the login page
    When I attempt to login with invalid credentials
    Then an error message should be displayed
    And I should remain on the login page

  @N4 @negative @security @login
  Scenario: Accessing protected dashboard without authentication redirects to login
    Given I am not authenticated
    When I navigate directly to "/dashboard"
    Then I should be redirected to the login page

  @N5 @negative @security @login
  Scenario: SQL injection attempt in username is rejected
    Given I navigate to the login page
    When I enter the username "' OR '1'='1"
    And I enter a valid password
    And I submit the login form
    Then an error message should be displayed

  @N6 @negative @security @login
  Scenario: XSS attempt is sanitised
    Given I navigate to the login page
    When I enter the username "<script>alert('xss')</script>"
    And I enter a valid password
    And I submit the login form
    Then an error message should be displayed
  # ==================== SESSION MANAGEMENT ====================

  @P3 @session @login
  Scenario: Session persists across page refresh
    Given I am logged in
    When I refresh the browser page
    Then I should remain on the dashboard

  @P4 @session @login
  Scenario: New tab reuses existing session
    Given I am logged in
    When I open a new browser tab
    And I navigate to "/dashboard" in the new tab
    Then I should see the dashboard without logging in again

  @N7 @negative @session @login
  Scenario: Expired session redirects to login
    Given I have an expired authentication token
    When I attempt to access the dashboard
    Then I should be redirected to the login page
