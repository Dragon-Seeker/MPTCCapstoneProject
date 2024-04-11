import React from 'react';
import { render, screen } from '@testing-library/react';
import {GameLogin} from './App';

test('renders learn react link', () => {
  render(<GameLogin />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
