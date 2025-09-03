/**
 * End-to-End test for complete user story journey
 * Tests: Story selection → Reading → Quiz completion → Family altar sharing
 */

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Complete Story Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Login as elementary age user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email"]', 'parent1@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');
    
    // Switch to child account
    await page.click('[data-testid="switch-to-child"]');
    await page.click('[data-testid="child-noah-elementary"]');
    
    // Verify we're logged in as the child
    await expect(page.locator('[data-testid="current-user-name"]')).toContainText('Noah');
    await expect(page.locator('[data-testid="age-tier-indicator"]')).toContainText('Elementary');
  });

  test('should complete full story journey for elementary age user', async ({ page }) => {
    // Step 1: Browse and select a story
    await page.goto('/stories');
    await expect(page.locator('[data-testid="stories-page-title"]')).toBeVisible();
    
    // Verify age-appropriate content is shown
    await expect(page.locator('[data-testid="story-noah-ark"]')).toBeVisible();
    await expect(page.locator('[data-testid="story-david-goliath"]')).toBeVisible();
    
    // Click on Noah's Ark story
    await page.click('[data-testid="story-noah-ark"]');
    
    // Step 2: Read the story
    await expect(page.locator('[data-testid="story-title"]')).toContainText('Noah and the Great Flood');
    await expect(page.locator('[data-testid="age-tier-label"]')).toContainText('Elementary');
    
    // Verify story content is age-appropriate
    const storyContent = page.locator('[data-testid="story-content"]');
    await expect(storyContent).toBeVisible();
    await expect(storyContent).toContainText('righteous');
    await expect(storyContent).toContainText('covenant');
    
    // Navigate through story pages
    await page.click('[data-testid="next-page"]');
    await page.click('[data-testid="next-page"]');
    await page.click('[data-testid="next-page"]');
    
    // Verify scripture references are shown
    await expect(page.locator('[data-testid="scripture-reference"]')).toContainText('Genesis');
    await expect(page.locator('[data-testid="translation-attribution"]')).toContainText('ESV');
    
    // Complete reading
    await page.click('[data-testid="finish-reading"]');
    
    // Step 3: Take the quiz
    await expect(page.locator('[data-testid="quiz-introduction"]')).toBeVisible();
    await page.click('[data-testid="start-quiz"]');
    
    // Answer first question
    await expect(page.locator('[data-testid="quiz-question-1"]')).toContainText('Why did God choose Noah?');
    await page.click('[data-testid="answer-righteous-walked-with-god"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Verify correct answer feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toContainText('Correct!');
    await expect(page.locator('[data-testid="explanation"]')).toContainText('righteous and had a relationship with God');
    
    // Continue to next question
    await page.click('[data-testid="next-question"]');
    
    // Answer second question
    await expect(page.locator('[data-testid="quiz-question-2"]')).toBeVisible();
    await page.fill('[data-testid="fill-blank-1"]', 'forty');
    await page.fill('[data-testid="fill-blank-2"]', 'forty');
    await page.click('[data-testid="submit-answer"]');
    
    // Continue to final question
    await page.click('[data-testid="next-question"]');
    
    // Answer third question about covenant
    await page.click('[data-testid="answer-rainbow"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Complete quiz
    await page.click('[data-testid="finish-quiz"]');
    
    // Verify quiz completion
    await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="quiz-score"]')).toContainText('3/3');
    await expect(page.locator('[data-testid="completion-badge"]')).toBeVisible();
    
    // Step 4: Share with family altar
    await page.click('[data-testid="share-with-family"]');
    
    // Family altar sharing modal
    await expect(page.locator('[data-testid="family-sharing-modal"]')).toBeVisible();
    
    // Add a prayer or reflection
    await page.fill('[data-testid="sharing-reflection"]', 'I learned that God keeps His promises, just like He did with Noah!');
    await page.click('[data-testid="share-reflection"]');
    
    // Verify sharing success
    await expect(page.locator('[data-testid="sharing-success"]')).toContainText('Shared with your family!');
    await page.click('[data-testid="close-modal"]');
    
    // Step 5: Navigate to family altar to verify sharing
    await page.goto('/family-altar');
    
    // Verify shared content appears
    await expect(page.locator('[data-testid="recent-sharing"]')).toContainText('Noah completed: Noah and the Great Flood');
    await expect(page.locator('[data-testid="shared-reflection"]')).toContainText('God keeps His promises');
    
    // Verify progress tracking
    await page.goto('/progress');
    await expect(page.locator('[data-testid="stories-completed"]')).toContainText('29'); // Previous 28 + 1 new
    await expect(page.locator('[data-testid="recent-badge"]')).toContainText('Bible Scholar'); // New badge earned
  });

  test('should maintain theological accuracy throughout journey', async ({ page }) => {
    // Navigate to David and Goliath story
    await page.goto('/stories/david-goliath');
    
    // Verify theological accuracy markers
    await expect(page.locator('[data-testid="theology-verified"]')).toBeVisible();
    await expect(page.locator('[data-testid="scripture-accuracy"]')).toContainText('✓ Scripture Verified');
    
    // Check scripture attribution
    const scriptureRef = page.locator('[data-testid="scripture-reference-1"]');
    await expect(scriptureRef).toContainText('1 Samuel 17:45');
    await expect(scriptureRef).toContainText('ESV');
    
    // Verify doctrinal soundness indicators
    await expect(page.locator('[data-testid="doctrinal-status"]')).toContainText('Orthodox');
    
    // Complete story and check quiz theological accuracy
    await page.click('[data-testid="finish-reading"]');
    await page.click('[data-testid="start-quiz"]');
    
    // Verify theology-focused quiz questions
    await expect(page.locator('[data-testid="quiz-question-1"]')).toContainText('trusted in God');
    
    // Check that wrong answers include theological explanations
    await page.click('[data-testid="answer-wrong"]');
    await page.click('[data-testid="submit-answer"]');
    
    await expect(page.locator('[data-testid="theological-explanation"]')).toContainText('David\'s victory came from trusting in God\'s power');
  });

  test('should enforce content safety throughout journey', async ({ page }) => {
    // Navigate to story that has been filtered for elementary age
    await page.goto('/stories/david-goliath');
    
    // Verify violence is appropriately presented
    const content = page.locator('[data-testid="story-content"]');
    await expect(content).not.toContainText('blood');
    await expect(content).not.toContainText('cut off');
    await expect(content).toContainText('defeated'); // Age-appropriate language
    
    // Verify safety indicators
    await expect(page.locator('[data-testid="content-safety-level"]')).toContainText('Elementary Safe');
    await expect(page.locator('[data-testid="violence-rating"]')).toContainText('Minimal');
    
    // Test family sharing safety
    await page.click('[data-testid="finish-reading"]');
    await page.click('[data-testid="skip-quiz"]'); // Skip to sharing
    await page.click('[data-testid="share-with-family"]');
    
    // Try to share inappropriate content
    await page.fill('[data-testid="sharing-reflection"]', 'I hate Goliath and wish he would die!');
    await page.click('[data-testid="share-reflection"]');
    
    // Verify content is blocked
    await expect(page.locator('[data-testid="moderation-warning"]')).toContainText('inappropriate language');
    await expect(page.locator('[data-testid="alternative-suggestion"]')).toBeVisible();
    
    // Use suggested alternative
    await page.click('[data-testid="use-suggestion"]');
    await expect(page.locator('[data-testid="sharing-reflection"]')).toContainText('felt concerned about Goliath\'s actions');
  });

  test('should be fully accessible throughout journey', async ({ page }) => {
    // Inject axe for accessibility testing
    await injectAxe(page);
    
    // Test stories page accessibility
    await page.goto('/stories');
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Test story reading page accessibility
    await page.click('[data-testid="story-noah-ark"]');
    await checkA11y(page);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Should navigate to next page
    
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    
    // Test quiz accessibility
    await page.click('[data-testid="finish-reading"]');
    await page.click('[data-testid="start-quiz"]');
    await checkA11y(page);
    
    // Test screen reader announcements
    const announcement = page.locator('[aria-live="polite"]');
    await page.click('[data-testid="answer-righteous-walked-with-god"]');
    await page.click('[data-testid="submit-answer"]');
    
    await expect(announcement).toContainText('Correct answer');
    
    // Test family altar accessibility
    await page.goto('/family-altar');
    await checkA11y(page);
    
    // Verify ARIA labels and roles
    await expect(page.locator('[data-testid="family-prayers"]')).toHaveAttribute('role', 'region');
    await expect(page.locator('[data-testid="family-prayers"]')).toHaveAttribute('aria-label', 'Family prayers and reflections');
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/stories/*', route => route.abort());
    
    await page.goto('/stories/noah-ark');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Unable to load story');
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Test retry functionality
    await page.unroute('**/api/stories/*');
    await page.click('[data-testid="retry-button"]');
    
    await expect(page.locator('[data-testid="story-content"]')).toBeVisible();
    
    // Test quiz submission error
    await page.route('**/api/quiz/submit', route => route.abort());
    
    await page.click('[data-testid="finish-reading"]');
    await page.click('[data-testid="start-quiz"]');
    await page.click('[data-testid="answer-righteous-walked-with-god"]');
    await page.click('[data-testid="submit-answer"]');
    
    // Should show error and allow retry
    await expect(page.locator('[data-testid="submission-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-submission"]')).toBeVisible();
  });
});