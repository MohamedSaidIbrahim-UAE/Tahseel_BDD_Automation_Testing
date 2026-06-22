Feature: Tahseel Card Requests

  Background:
    Given the user is logged in as "Card Services Officer"

  @positive
  Scenario: Submit a new card request
    When the user fills all mandatory fields (applicant name, entity, card type)
    Then the request is created and appears in the "Pending" list
    And after approval, a card is issued

  @negative
  Scenario: Missing mandatory field
    When the user submits without selecting an entity
    Then validation error "Entity is required" is shown
