// Dialog and Alert Test Helper Utilities
// Comprehensive testing utilities for dialog and alert components

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: string;
  category: 'rendering' | 'interaction' | 'accessibility' | 'edge-case';
}

export interface DialogTestConfig {
  title: string;
  description?: string;
  hasCloseButton?: boolean;
  hasOverlay?: boolean;
  isModal?: boolean;
}

export interface AlertDialogTestConfig {
  title: string;
  description?: string;
  actionText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export interface AlertTestConfig {
  variant: 'default' | 'destructive';
  title?: string;
  description?: string;
  hasIcon?: boolean;
}

// Accessibility testing utilities
export const checkAriaAttributes = (element: HTMLElement, expectedRole: string): TestResult => {
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');

  if (role !== expectedRole) {
    return {
      testName: 'ARIA Role Check',
      passed: false,
      message: `Expected role="${expectedRole}", got role="${role}"`,
      category: 'accessibility'
    };
  }

  if (!ariaLabel && !ariaLabelledBy) {
    return {
      testName: 'ARIA Labeling',
      passed: false,
      message: 'Element missing aria-label or aria-labelledby',
      category: 'accessibility'
    };
  }

  return {
    testName: 'ARIA Attributes',
    passed: true,
    message: 'ARIA attributes are properly set',
    category: 'accessibility'
  };
};

export const checkFocusManagement = (dialogElement: HTMLElement): TestResult[] => {
  const results: TestResult[] = [];

  // Check if dialog is focusable
  const focusableElements = dialogElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) {
    results.push({
      testName: 'Focusable Elements',
      passed: false,
      message: 'Dialog contains no focusable elements',
      category: 'accessibility'
    });
  } else {
    results.push({
      testName: 'Focusable Elements',
      passed: true,
      message: `Dialog contains ${focusableElements.length} focusable elements`,
      category: 'accessibility'
    });
  }

  // Check initial focus
  const activeElement = document.activeElement;
  const isFocusInDialog = dialogElement.contains(activeElement);

  results.push({
    testName: 'Initial Focus',
    passed: isFocusInDialog,
    message: isFocusInDialog ? 'Focus is within dialog' : 'Focus is not within dialog',
    category: 'accessibility'
  });

  return results;
};

export const checkKeyboardNavigation = (element: HTMLElement): TestResult => {
  const tabIndex = element.getAttribute('tabindex');
  const isFocusable = tabIndex !== '-1' && tabIndex !== null;

  return {
    testName: 'Keyboard Navigation',
    passed: isFocusable,
    message: isFocusable ? 'Element is keyboard accessible' : 'Element is not keyboard accessible',
    category: 'accessibility'
  };
};

// Dialog rendering tests
export const testDialogRendering = (dialogElement: HTMLElement, config: DialogTestConfig): TestResult[] => {
  const results: TestResult[] = [];

  // Check dialog structure
  const dialogContent = dialogElement.querySelector('[role="dialog"]');
  if (!dialogContent) {
    results.push({
      testName: 'Dialog Structure',
      passed: false,
      message: 'Dialog element not found',
      category: 'rendering'
    });
    return results;
  }

  results.push({
    testName: 'Dialog Structure',
    passed: true,
    message: 'Dialog element found',
    category: 'rendering'
  });

  // Check title
  const titleElement = dialogElement.querySelector('[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3, [role="dialog"] h4, [role="dialog"] h5, [role="dialog"] h6');
  if (titleElement && titleElement.textContent?.includes(config.title)) {
    results.push({
      testName: 'Dialog Title',
      passed: true,
      message: 'Dialog title is present and correct',
      category: 'rendering'
    });
  } else {
    results.push({
      testName: 'Dialog Title',
      passed: false,
      message: 'Dialog title is missing or incorrect',
      category: 'rendering'
    });
  }

  // Check close button
  if (config.hasCloseButton) {
    const closeButton = dialogElement.querySelector('button[aria-label="Close"], button[aria-label="close"]');
    if (closeButton) {
      results.push({
        testName: 'Close Button',
        passed: true,
        message: 'Close button is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Close Button',
        passed: false,
        message: 'Close button is missing',
        category: 'rendering'
      });
    }
  }

  // Check overlay
  if (config.hasOverlay) {
    const overlay = dialogElement.querySelector('[data-state="open"]');
    if (overlay) {
      results.push({
        testName: 'Dialog Overlay',
        passed: true,
        message: 'Dialog overlay is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Dialog Overlay',
        passed: false,
        message: 'Dialog overlay is missing',
        category: 'rendering'
      });
    }
  }

  return results;
};

// AlertDialog rendering tests
export const testAlertDialogRendering = (alertDialogElement: HTMLElement, config: AlertDialogTestConfig): TestResult[] => {
  const results: TestResult[] = [];

  // Check alert dialog structure
  const alertDialogContent = alertDialogElement.querySelector('[role="alertdialog"]');
  if (!alertDialogContent) {
    results.push({
      testName: 'AlertDialog Structure',
      passed: false,
      message: 'AlertDialog element not found',
      category: 'rendering'
    });
    return results;
  }

  results.push({
    testName: 'AlertDialog Structure',
    passed: true,
    message: 'AlertDialog element found',
    category: 'rendering'
  });

  // Check action button
  if (config.actionText) {
    const actionButton = alertDialogElement.querySelector(`button:has-text("${config.actionText}")`);
    if (actionButton) {
      results.push({
        testName: 'Action Button',
        passed: true,
        message: 'Action button is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Action Button',
        passed: false,
        message: 'Action button is missing',
        category: 'rendering'
      });
    }
  }

  // Check cancel button
  if (config.cancelText) {
    const cancelButton = alertDialogElement.querySelector(`button:has-text("${config.cancelText}")`);
    if (cancelButton) {
      results.push({
        testName: 'Cancel Button',
        passed: true,
        message: 'Cancel button is present',
        category: 'rendering'
      });
    } else {
      results.push({
        testName: 'Cancel Button',
        passed: false,
        message: 'Cancel button is missing',
        category: 'rendering'
      });
    }
  }

  return results;
};

// Alert rendering tests
export const testAlertRendering = (alertElement: HTMLElement, config: AlertTestConfig): TestResult[] => {
  const results: TestResult[] = [];

  // Check alert structure
  const alertRole = alertElement.getAttribute('role');
  if (alertRole !== 'alert') {
    results.push({
      testName: 'Alert Structure',
      passed: false,
      message: `Expected role="alert", got role="${alertRole}"`,
      category: 'rendering'
    });
    return results;
  }

  results.push({
    testName: 'Alert Structure',
    passed: true,
    message: 'Alert element has correct role',
    category: 'rendering'
  });

  // Check variant styling
  const hasDestructiveClass = alertElement.classList.contains('border-destructive') ||
    alertElement.classList.contains('text-destructive');

  if (config.variant === 'destructive' && hasDestructiveClass) {
    results.push({
      testName: 'Destructive Variant',
      passed: true,
      message: 'Destructive variant styling applied',
      category: 'rendering'
    });
  } else if (config.variant === 'default' && !hasDestructiveClass) {
    results.push({
      testName: 'Default Variant',
      passed: true,
      message: 'Default variant styling applied',
      category: 'rendering'
    });
  } else {
    results.push({
      testName: 'Variant Styling',
      passed: false,
      message: `Expected ${config.variant} variant styling`,
      category: 'rendering'
    });
  }

  return results;
};

// Interaction testing utilities
export const simulateKeyPress = (element: HTMLElement, key: string): void => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  element.dispatchEvent(event);
};

export const simulateClick = (element: HTMLElement): void => {
  const event = new MouseEvent('click', { bubbles: true });
  element.dispatchEvent(event);
};

export const waitForElement = (selector: string, timeout = 1000): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

// Test execution utilities
export const runTestSuite = async (testSuite: () => Promise<TestResult[]>): Promise<TestResult[]> => {
  try {
    return await testSuite();
  } catch (error) {
    return [{
      testName: 'Test Suite Execution',
      passed: false,
      message: `Test suite failed: ${String(error)}`,
      category: 'edge-case'
    }];
  }
};

export const calculateTestStats = (results: TestResult[]) => {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = { passed: 0, total: 0 };
    }
    const category = acc[result.category];
    if (category) {
      category.total++;
      if (result.passed) {
        category.passed++;
      }
    }
    return acc;
  }, {} as Record<string, { passed: number; total: number }>);

  return {
    total,
    passed,
    failed,
    passRate: total > 0 ? (passed / total) * 100 : 0,
    byCategory
  };
};

// Export all utilities
export default {
  checkAriaAttributes,
  checkFocusManagement,
  checkKeyboardNavigation,
  testDialogRendering,
  testAlertDialogRendering,
  testAlertRendering,
  simulateKeyPress,
  simulateClick,
  waitForElement,
  runTestSuite,
  calculateTestStats
};

