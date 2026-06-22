Feature: Credit Card Summary By Merchant
  As a merchant relationship manager, I need a summary of credit card activity per merchant,
  so that I can compute settlement fees and share with merchants.

  Background:
    Given the user is logged in as "Finance Admin"
    And merchants "MCC-111" and "MCC-222" are set up with their respective entities

  @positive @e2e
  Scenario: Summary per merchant after multiple transactions
    Given the following credit card transactions:
      | Merchant | Amount | Fee % |
      | MCC-111  | 1000   | 2.5%  |
      | MCC-111  | 2000   | 2.5%  |
      | MCC-222  | 500    | 3.0%  |
    When the user runs the "Credit Card Summary By Merchant" report
    Then the report shows:
      | Merchant | Total Volume | Total Fees |
      | MCC-111  | 3000.00      | 75.00      |
      | MCC-222  | 500.00       | 15.00      |

  @negative @rbac
  Scenario: Merchant user sees only their own summary
    Given the user is logged in as "MCC-111 Manager"
    When the user runs the summary report
    Then only MCC-111 data is displayed
