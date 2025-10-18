import { getGreeting, getPersonalizedGreeting } from '../../utils/greeting';

// Mock Date to test different times
const mockDate = (hour: number) => {
  const originalDate = Date;
  global.Date = class extends originalDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super();
        this.setHours(hour);
      } else {
        super(...args);
      }
    }
    static now() {
      return new Date().setHours(hour);
    }
  } as any;
};

describe('Greeting Utils', () => {
  afterEach(() => {
    // Restore original Date
    global.Date = Date;
  });

  test('getGreeting returns correct greeting for morning', () => {
    mockDate(9); // 9 AM
    expect(getGreeting()).toBe('Good morning');
  });

  test('getGreeting returns correct greeting for afternoon', () => {
    mockDate(14); // 2 PM
    expect(getGreeting()).toBe('Good afternoon');
  });

  test('getGreeting returns correct greeting for evening', () => {
    mockDate(20); // 8 PM
    expect(getGreeting()).toBe('Good evening');
  });

  test('getPersonalizedGreeting includes user name', () => {
    mockDate(10); // 10 AM
    expect(getPersonalizedGreeting('John')).toBe('Good morning, John!');
  });

  test('getPersonalizedGreeting handles undefined name', () => {
    mockDate(15); // 3 PM
    expect(getPersonalizedGreeting()).toBe('Good afternoon, User!');
  });
});
