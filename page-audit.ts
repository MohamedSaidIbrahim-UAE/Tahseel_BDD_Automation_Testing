import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

interface PageAuditResult {
  [pageTitle: string]: {
    url: string;
    labels: string[];
    hasAddNewButton: boolean;
    hasExportButton: boolean;
    hasColumnChooserButton: boolean;
    hasSearchInput: boolean;
    timestamp: string;
    errorMessage?: string;
  };
}

// Extract all URLs from sidemenu.log
const menuItems = [
  { title: 'FORMS', url: 'https://staging.tahseel.gov.ae/ManagePortal/forms' },
  { title: 'Cancelled Refund Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/refund/cancelled-requests' },
  { title: 'Home', url: 'https://staging.tahseel.gov.ae/ManagePortal/dashboard' },
  { title: 'Transactions Analysis', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/1' },
  { title: 'Transactions Details', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/2' },
  { title: 'Fee-free transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/3' },
  { title: 'Entity Services Analysis', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/4' },
  { title: 'Merchant Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/5' },
  { title: 'Transactions Map', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/6' },
  { title: 'Tahseel Accounts', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/7' },
  { title: 'Tahseel Cards', url: 'https://staging.tahseel.gov.ae/ManagePortal/business-intelligence/dashborad/8' },
  { title: 'Credit Card Transactions Inquiry', url: 'https://staging.tahseel.gov.ae/ManagePortal/help-desk/credit-card-inquiry' },
  { title: 'Refund Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/refund/cancel-transaction' },
  { title: 'Tickets Delivery', url: 'https://staging.tahseel.gov.ae/ManagePortal/tickets/tickets-delivery' },
  { title: 'Daily deposit for Business Service Centers', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposite-settlement/tasheel' },
  { title: 'Manage Safari Booking Dates', url: 'https://staging.tahseel.gov.ae/ManagePortal/tickets/safari-booking-dates' },
  { title: 'Departments', url: 'https://staging.tahseel.gov.ae/ManagePortal/hierarchy/department' },
  { title: 'Service Rules', url: 'https://staging.tahseel.gov.ae/ManagePortal/hierarchy/service-rules' },
  { title: 'Workflows', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/workflow' },
  { title: 'Issue Workflow Management', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/issueworkflow' },
  { title: 'Refund Approval Workflow', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/refundworkflow' },
  { title: 'Transaction Payment Approval Workflow', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/transaction-payment-approval-workflow' },
  { title: 'Manage Adjustment Registration Workflow', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/adjustment-registeration-workflow' },
  { title: 'Pre-Authorized Transaction Workflow', url: 'https://staging.tahseel.gov.ae/ManagePortal/workflowManag/pre-authorized-transactions-workflow' },
  { title: 'Tahseel Card Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/tahseelcard' },
  { title: 'New Deduct Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/deduct-requests' },
  { title: 'View Deduct Pending Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/pending-deduct-requests-list' },
  { title: 'View All Deduct Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/all-deduct-requests-list' },
  { title: 'New Load Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/load-requests' },
  { title: 'View Load Pending Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/pending-load-requests-list' },
  { title: 'View All Load Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/all-load-requests-list' },
  { title: 'Deposits Refund', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/depositRefund' },
  { title: 'Deposit Refund Requests Inquiry', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/deposit-requests' },
  { title: 'Pending Deposit Refund Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/deposit-pending-requests' },
  { title: 'Deposits Retain', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/depositRetain' },
  { title: 'Deposit Retain Requests Inquiry', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/retain-requests' },
  { title: 'Pending Deposit Retain Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/deposits/retain-pending-requests' },
  { title: 'Refunds', url: 'https://staging.tahseel.gov.ae/ManagePortal/refund' },
  { title: 'Stuck Refund Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/refund/bank-nonexisting-refundrequests' },
  { title: 'Settings', url: 'https://staging.tahseel.gov.ae/ManagePortal/feature' },
  { title: 'Security Scopes', url: 'https://staging.tahseel.gov.ae/ManagePortal/scope' },
  { title: 'Users Roles', url: 'https://staging.tahseel.gov.ae/ManagePortal/role' },
  { title: 'Smart Receipt Details', url: 'https://staging.tahseel.gov.ae/ManagePortal/smart-receipt/inquiry' },
  { title: 'Mashreq Bank Merchants', url: 'https://staging.tahseel.gov.ae/ManagePortal/bank-merchants/mashreq-bank-merchants' },
  { title: 'Inquire Topup Transaction', url: 'https://staging.tahseel.gov.ae/ManagePortal/top-up/inquiry' },
  { title: 'Inquire Deduct Transaction', url: 'https://staging.tahseel.gov.ae/ManagePortal/deduct/inquiry' },
  { title: 'MPOS Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/help-desk/mpos-inquiry' },
  { title: 'Transactions Upgrade', url: 'https://staging.tahseel.gov.ae/ManagePortal/transactions/transactions-eligible-for-upgrade' },
  { title: 'Transactions Sent By Payment Link', url: 'https://staging.tahseel.gov.ae/ManagePortal/transactions/payment-link-transaction' },
  { title: 'Tahseel Account Details', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/user-inquiry' },
  { title: 'Government User', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/gov-users' },
  { title: 'Smart User', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/smart-users' },
  { title: 'Operator User', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/operator-users' },
  { title: 'Company User', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/company-users' },
  { title: 'Money Loader User', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/money-loader-users' },
  { title: 'Money Loader Users Groups', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/money-loader-users-groups' },
  { title: 'Money Loader Groups', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/money-loader-groups' },
  { title: 'Merchant Users', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/merchant-users/departments-list' },
  { title: 'Seller Users', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/seller-users' },
  { title: 'Inquire Electronic Receipt', url: 'https://staging.tahseel.gov.ae/ManagePortal/packaging-fund-management/voucher-inquire' },
  { title: 'Topup Clients', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/topup-clients' },
  { title: 'Topup Clients Stations', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/topup-clients-stations' },
  { title: 'Topup Clients Stations Locations', url: 'https://staging.tahseel.gov.ae/ManagePortal/system-users/topup-stations-locations' },
  { title: 'IBAN Registration Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/iban-registeration/request-register-iban-details' },
  { title: 'IBAN Registration Pending Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/iban-registeration/iban-registeration-pending-requests' },
  { title: 'IBAN Registration Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/iban-registeration/iban-registeration-requests' },
  { title: 'Adjustment Registration Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/adjustment-registeration/request-register-adjustment' },
  { title: 'Adjustment Registration Pending Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/adjustment-registeration/adjustment-registeration-pending-requests' },
  { title: 'Adjustment Registration Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/adjustment-registeration/adjustment-registeration-requests' },
  { title: 'Cheques', url: 'https://staging.tahseel.gov.ae/ManagePortal/cheques/cheques' },
  { title: 'Merge Cheques', url: 'https://staging.tahseel.gov.ae/ManagePortal/cheques/merge' },
  { title: 'Cheques Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/cheques/transactions' },
  { title: 'Companies Accounts Management', url: 'https://staging.tahseel.gov.ae/ManagePortal/corporate/companyprofile' },
  { title: 'Individual Account', url: 'https://staging.tahseel.gov.ae/ManagePortal/corporate/Addindividualaccount' },
  { title: 'Mashreq Bank Settlement', url: 'https://staging.tahseel.gov.ae/ManagePortal/settlement/mashreq-bank' },
  { title: 'Create Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/transactioncancel/add' },
  { title: 'My Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/transactioncancel/action' },
  { title: 'Inquire', url: 'https://staging.tahseel.gov.ae/ManagePortal/transactioncancel/inquire' },
  { title: 'Add Visit', url: 'https://staging.tahseel.gov.ae/ManagePortal/Communications/add-visit' },
  { title: 'Pending Issues', url: 'https://staging.tahseel.gov.ae/ManagePortal/Communications/waiting-action' },
  { title: 'Inquire Issue', url: 'https://staging.tahseel.gov.ae/ManagePortal/Communications/inquire-issues' },
  { title: 'Issue Categories', url: 'https://staging.tahseel.gov.ae/ManagePortal/issue/issue-category-management' },
  { title: 'Issue Attachments', url: 'https://staging.tahseel.gov.ae/ManagePortal/issue/issue-attachment-management' },
  { title: 'Exhibitions and events', url: 'https://staging.tahseel.gov.ae/ManagePortal/exhibition/exhibitions' },
  { title: 'Publishing Houses', url: 'https://staging.tahseel.gov.ae/ManagePortal/exhibition/publishing-house' },
  { title: 'Device Delivery To Publishers', url: 'https://staging.tahseel.gov.ae/ManagePortal/exhibition/device-delivery' },
  { title: 'Book Publisher Devices', url: 'https://staging.tahseel.gov.ae/ManagePortal/exhibition/device-handover' },
  { title: 'Seller Types', url: 'https://staging.tahseel.gov.ae/ManagePortal/sellers/types' },
  { title: 'Sellers', url: 'https://staging.tahseel.gov.ae/ManagePortal/sellers/seller' },
  { title: 'Transaction Payment Request Create', url: 'https://staging.tahseel.gov.ae/ManagePortal/transaction-payment-request/add' },
  { title: 'Transaction Payment Request Pending', url: 'https://staging.tahseel.gov.ae/ManagePortal/transaction-payment-request/action' },
  { title: 'Transaction Payment Request Inquire', url: 'https://staging.tahseel.gov.ae/ManagePortal/transaction-payment-request/inquire' },
  { title: 'Create Seller Refund Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/seller-deposite/create' },
  { title: 'Seller Refund Requests', url: 'https://staging.tahseel.gov.ae/ManagePortal/seller-deposite/action' },
  { title: 'Inquire Seller Refund Request', url: 'https://staging.tahseel.gov.ae/ManagePortal/seller-deposite/inquire' },
  { title: 'Bank Devices', url: 'https://staging.tahseel.gov.ae/ManagePortal/bank-devices/bank-devices' },
  { title: 'Book Publisher Pending Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/pre-auth-transaction/action' },
  { title: 'Book Publisher Inquire Transactions', url: 'https://staging.tahseel.gov.ae/ManagePortal/pre-auth-transaction/inquire' },
];

async function auditPages(): Promise<void> {
  const results: PageAuditResult = {};
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch();

    for (const item of menuItems) {
      try {
        console.log(`Auditing: ${item.title} - ${item.url}`);
        const page = await browser.newPage();

        await page.goto(item.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for any animations

        // Extract labels
        const labels = await page.evaluate(() => {
          const labelElements = document.querySelectorAll('div[class*="label"]');
          return Array.from(labelElements)
            .map(el => el.textContent?.trim())
            .filter((text): text is string => !!text && text.length > 0);
        });

        // Check for Add New button
        const hasAddNewButton = await page.locator('button:has-text("Add New")').count() > 0;

        // Check for Export button
        const hasExportButton = await page.locator('[title="Export"]').count() > 0;

        // Check for Column Chooser button
        const hasColumnChooserButton = await page.locator('[title="Column Chooser"]').count() > 0;

        // Check for Search input
        const hasSearchInput = await page.locator('input[aria-label*="Search"]').count() > 0;

        results[item.title] = {
          url: item.url,
          labels: [...new Set(labels)], // Remove duplicates
          hasAddNewButton,
          hasExportButton,
          hasColumnChooserButton,
          hasSearchInput,
          timestamp: new Date().toISOString(),
        };

        await page.close();
      } catch (error) {
        results[item.title] = {
          url: item.url,
          labels: [],
          hasAddNewButton: false,
          hasExportButton: false,
          hasColumnChooserButton: false,
          hasSearchInput: false,
          timestamp: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        };
        console.error(`Error auditing ${item.title}:`, error);
      }
    }

    // Save results to JSON file
    const outputPath = 'page-audit-results.json';
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nAudit complete! Results saved to ${outputPath}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

auditPages().catch(console.error);
