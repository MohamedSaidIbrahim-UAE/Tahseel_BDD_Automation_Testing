Feature: User Management

  Background:
    Given the user is logged in as "User Admin"

  @positive
  Scenario Outline: Create user of each type
    When the admin creates a new "<User Type>" with unique email and assigns to an entity/group
    Then the user can log in and sees the correct menu and data

    Examples:
      | User Type |
      | Government User |
      | Smart User |
      | Operator User |
      | Company User |
      | Money Loader User |
      | Money Loader Group |
      | Merchant User |
      | Seller User |
      | Tahseel Account Detail User |

  @negative
  Scenario: Duplicate email
    When creating a user with an already existing email, the system rejects with "Email already exists"

  @negative
  Scenario: Locked account login
    Given a user account is locked
    When they attempt to log in with correct credentials
    Then the system displays "Account locked, contact administrator"
