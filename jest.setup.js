import '@testing-library/jest-dom/extend-expect'
import 'jest-canvas-mock';

jest.mock('react-chartjs-2', () => ({
    Pie: () => null
  }));