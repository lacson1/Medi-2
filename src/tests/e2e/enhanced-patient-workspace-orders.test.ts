import { test, expect } from '@playwright/test';

test.describe('Enhanced Patient Workspace Orders Tab - Button Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the enhanced patient workspace orders tab
    await page.goto('http://localhost:5173/enhanced-patient-workspace/patient-1?tab=orders');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for the orders tab to be visible
    await page.waitForSelector('[data-testid="orders-tab"], .tabs-content, [role="tabpanel"]', { timeout: 10000 });
  });

  test('Test Prescription Action Buttons', async ({ page }) => {
    // Look for prescription cards and their action buttons
    const prescriptionCards = await page.locator('[data-testid="prescription-card"], .prescription-item, .medication-card').all();
    
    if (prescriptionCards.length > 0) {
      // Test Print Button
      const printButton = await page.locator('button[title="Print Prescription"], button:has-text("Print"), button:has([data-testid="printer-icon"])').first();
      if (await printButton.isVisible()) {
        await printButton.click();
        // Check if print dialog or modal opens
        await expect(page.locator('dialog, .print-modal, .printable-form')).toBeVisible({ timeout: 5000 });
        // Close any opened modal
        await page.keyboard.press('Escape');
      }

      // Test Send to Pharmacy Button
      const sendButton = await page.locator('button[title="Send to Pharmacy"], button:has-text("Send"), button:has([data-testid="send-icon"])').first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        // Check for any confirmation or modal
        await page.waitForTimeout(1000);
      }

      // Test Edit Button
      const editButton = await page.locator('button[title="Edit Prescription"], button:has-text("Edit"), button:has([data-testid="edit-icon"])').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        // Check if edit form or modal opens
        await expect(page.locator('dialog, .edit-modal, .prescription-form')).toBeVisible({ timeout: 5000 });
        // Close any opened modal
        await page.keyboard.press('Escape');
      }
    }
  });

  test('Test Lab Order Action Buttons', async ({ page }) => {
    // Look for lab order cards and their action buttons
    const labOrderCards = await page.locator('[data-testid="lab-order-card"], .lab-order-item, .test-card').all();
    
    if (labOrderCards.length > 0) {
      // Test Edit Button
      const editButton = await page.locator('button[title="Edit Lab Order"], button:has-text("Edit"), button:has([data-testid="edit-icon"])').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        // Check if edit form opens
        await expect(page.locator('dialog, .edit-modal, .lab-form')).toBeVisible({ timeout: 5000 });
        await page.keyboard.press('Escape');
      }

      // Test Print Button
      const printButton = await page.locator('button[title="Print Lab Order"], button:has-text("Print"), button:has([data-testid="printer-icon"])').first();
      if (await printButton.isVisible()) {
        await printButton.click();
        // Check if print dialog opens
        await expect(page.locator('dialog, .print-modal, .printable-form')).toBeVisible({ timeout: 5000 });
        await page.keyboard.press('Escape');
      }

      // Test Download Button
      const downloadButton = await page.locator('button[title="Download Results"], button:has-text("Download"), button:has([data-testid="download-icon"])').first();
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
        // Check for download or file opening
        await page.waitForTimeout(1000);
      }
    }
  });

  test('Test Workspace Navigation Buttons', async ({ page }) => {
    // Test tab navigation buttons
    const tabButtons = await page.locator('[role="tab"], .tabs-trigger, .tab-button').all();
    
    for (const tabButton of tabButtons) {
      const tabText = await tabButton.textContent();
      if (tabText && !tabText.includes('Orders')) {
        await tabButton.click();
        await page.waitForTimeout(1000);
        // Verify tab content changes
        await expect(page.locator('.tabs-content, [role="tabpanel"]')).toBeVisible();
      }
    }

    // Return to orders tab
    await page.locator('button:has-text("Orders"), [role="tab"]:has-text("Orders")').click();
    await page.waitForTimeout(1000);
  });

  test('Test Quick Action Buttons', async ({ page }) => {
    // Test Quick Actions toggle button
    const quickActionsButton = await page.locator('button:has-text("Quick Actions"), button:has([data-testid="quick-actions"])').first();
    if (await quickActionsButton.isVisible()) {
      await quickActionsButton.click();
      await page.waitForTimeout(1000);
      
      // Test individual quick action buttons
      const quickActionButtons = await page.locator('.quick-action, [data-testid*="action"]').all();
      for (const actionButton of quickActionButtons) {
        await actionButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Test Star/Favorite buttons
    const starButtons = await page.locator('button:has([data-testid="star-icon"]), button:has([data-testid="favorite-icon"])').all();
    for (const starButton of starButtons) {
      await starButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Test Patient Summary Action Buttons', async ({ page }) => {
    // Test Star button in patient summary
    const patientStarButton = await page.locator('.patient-summary button:has([data-testid="star-icon"]), .patient-card button:has([data-testid="star-icon"])').first();
    if (await patientStarButton.isVisible()) {
      await patientStarButton.click();
      await page.waitForTimeout(500);
    }

    // Test any edit buttons in patient summary
    const editButtons = await page.locator('.patient-summary button:has-text("Edit"), .patient-card button:has-text("Edit")').all();
    for (const editButton of editButtons) {
      await editButton.click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
    }
  });

  test('Test Add New Buttons', async ({ page }) => {
    // Test Add New Prescription button
    const addPrescriptionButton = await page.locator('button:has-text("Add Prescription"), button:has-text("New Prescription"), button:has-text("Add New")').first();
    if (await addPrescriptionButton.isVisible()) {
      await addPrescriptionButton.click();
      await expect(page.locator('dialog, .add-modal, .prescription-form')).toBeVisible({ timeout: 5000 });
      await page.keyboard.press('Escape');
    }

    // Test Add New Lab Order button
    const addLabButton = await page.locator('button:has-text("Add Lab Order"), button:has-text("New Lab Order"), button:has-text("Order Lab")').first();
    if (await addLabButton.isVisible()) {
      await addLabButton.click();
      await expect(page.locator('dialog, .add-modal, .lab-form')).toBeVisible({ timeout: 5000 });
      await page.keyboard.press('Escape');
    }
  });

  test('Test View Toggle Buttons', async ({ page }) => {
    // Test view toggle buttons (if any)
    const viewToggleButtons = await page.locator('button:has-text("View"), button:has-text("Toggle"), button:has-text("Show")').all();
    for (const toggleButton of viewToggleButtons) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Test Status Filter Buttons', async ({ page }) => {
    // Test status filter buttons
    const statusButtons = await page.locator('button:has-text("Active"), button:has-text("Completed"), button:has-text("Pending")').all();
    for (const statusButton of statusButtons) {
      await statusButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Test Search and Filter Buttons', async ({ page }) => {
    // Test search functionality
    const searchInput = await page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      await searchInput.clear();
    }

    // Test filter buttons
    const filterButtons = await page.locator('button:has-text("Filter"), button:has-text("Sort")').all();
    for (const filterButton of filterButtons) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('Test All Interactive Elements', async ({ page }) => {
    // Get all clickable elements
    const clickableElements = await page.locator('button, [role="button"], [onclick], .clickable').all();
    
    console.log(`Found ${clickableElements.length} clickable elements`);
    
    for (let i = 0; i < Math.min(clickableElements.length, 20); i++) {
      const element = clickableElements[i];
      try {
        const isVisible = await element.isVisible();
        const isEnabled = await element.isEnabled();
        
        if (isVisible && isEnabled) {
          const text = await element.textContent();
          console.log(`Testing element ${i + 1}: ${text || 'No text'}`);
          
          await element.click();
          await page.waitForTimeout(200);
          
          // Check for any opened modals and close them
          const modal = await page.locator('dialog, .modal, .popup').first();
          if (await modal.isVisible()) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
          }
        }
      } catch (error) {
        console.log(`Error testing element ${i + 1}: ${error.message}`);
      }
    }
  });
});
