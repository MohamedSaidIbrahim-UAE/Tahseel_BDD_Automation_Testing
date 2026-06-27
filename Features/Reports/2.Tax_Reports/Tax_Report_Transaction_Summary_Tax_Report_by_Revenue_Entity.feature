Feature: Tax Report – Transaction Summary Tax Report by Revenue Entity
  As a revenue department head, I need an aggregated VAT summary per entity,
  so that I can monitor tax contributions from each revenue stream.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has a 5% VAT rate

  @positive @e2e
  Scenario: Aggregated VAT summary per entity over a month
    Given the following transactions are posted across June 2026:
      | Entity    | Number of Txns | Total Base Amount | Taxable? |
      | Civil Aviation  | 50             | 50,000            | Yes      |
      | Entity-B  | 30             | 30,000            | No       |
    When the user generates the "Transaction Summary Tax Report - Revenue" for the month of June 2026
    Then the report shows:
      | Entity    | Total Base Amount | Total VAT | Taxable Count |
      | Civil Aviation  | 50,000.00         | 2,500.00  | 50             |
      | Entity-B  | 30,000.00         | 0.00      | 0              |
    And the grand total VAT is 2,500.00 AED

  @positive @e2e
  Scenario: Compare summary with detail report totals
    When the user generates both the summary and detail reports for the same entity and period
    Then the total VAT in the summary exactly matches the sum of VAT in the detail report

  @negative
  Scenario: Summary with an entity that changed tax status mid-period
    Given "Entity-C" was tax-exempt until 2026-06-15, and taxable from 2026-06-16
    And transactions exist on both sides of the change
    When the summary report is run for the full month
    Then the report correctly separates the exempt and taxable periods or shows a mixed status with correct tax amounts

  @negative @rbac
  Scenario: Unauthorised role cannot see the revenue summary
    Given the user is logged in as "Merchant User"
    When the user attempts to open the "Transaction Summary Tax Report - Revenue"
    Then the system returns an "Access Denied" message
