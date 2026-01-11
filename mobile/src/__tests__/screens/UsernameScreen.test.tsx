import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UsernameScreen from '../../screens/UsernameScreen';
import * as api from '../../services/api';

// Mock the hooks and services
jest.mock('../../hooks/useUser');
jest.mock('../../services/api');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as any;

const mockSaveUser = jest.fn();

describe('UsernameScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      saveUser: mockSaveUser,
    });
  });

  test('should render welcome message', () => {
    const { getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    expect(getByText('Welcome!')).toBeTruthy();
    expect(getByText('Enter your username to get started')).toBeTruthy();
  });

  test('should render username input', () => {
    const { getByPlaceholderText } = render(<UsernameScreen navigation={mockNavigation} />);

    expect(getByPlaceholderText('Username')).toBeTruthy();
  });

  test('should render continue button', () => {
    const { getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    expect(getByText('Continue')).toBeTruthy();
  });

  test('should update username when typing', () => {
    const { getByPlaceholderText } = render(<UsernameScreen navigation={mockNavigation} />);

    const input = getByPlaceholderText('Username');
    fireEvent.changeText(input, 'testuser');

    expect(input.props.value).toBe('testuser');
  });

  test('should show Alert when username is empty', () => {
    const { getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.press(getByText('Continue'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a username');
    expect(api.createOrGetUser).not.toHaveBeenCalled();
  });

  test('should call createOrGetUser API on submit', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    (api.createOrGetUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(api.createOrGetUser).toHaveBeenCalledWith('testuser');
    });
  });

  test('should save user to context on success', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    (api.createOrGetUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockSaveUser).toHaveBeenCalledWith(mockUser);
    });
  });

  test('should navigate to FeatureList on success', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    (api.createOrGetUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith('FeatureList');
    });
  });

  test('should show Alert on API error', async () => {
    const error = new Error('Network error');
    (api.createOrGetUser as jest.Mock).mockRejectedValueOnce(error);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create user: Network error');
    });
  });

  test('should show loading indicator during submission', async () => {
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    (api.createOrGetUser as jest.Mock).mockReturnValueOnce(createPromise);

    const { getByPlaceholderText, getByText, queryByText, UNSAFE_root } = render(
      <UsernameScreen navigation={mockNavigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(queryByText('Continue')).toBeNull();
      const activityIndicator = UNSAFE_root.findByType(require('react-native').ActivityIndicator);
      expect(activityIndicator).toBeTruthy();
    });

    resolveCreate!({ id: 1, username: 'testuser' });
  });

  test('should disable input during loading', async () => {
    let resolveCreate: (value: any) => void;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    (api.createOrGetUser as jest.Mock).mockReturnValueOnce(createPromise);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    const input = getByPlaceholderText('Username');
    fireEvent.changeText(input, 'testuser');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(input.props.editable).toBe(false);
    });

    resolveCreate!({ id: 1, username: 'testuser' });
  });

  test('should trim whitespace from username', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    (api.createOrGetUser as jest.Mock).mockResolvedValueOnce(mockUser);

    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), '  testuser  ');
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(api.createOrGetUser).toHaveBeenCalledWith('testuser');
    });
  });

  test('should show Alert when username is only whitespace', () => {
    const { getByPlaceholderText, getByText } = render(<UsernameScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Username'), '   ');
    fireEvent.press(getByText('Continue'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a username');
    expect(api.createOrGetUser).not.toHaveBeenCalled();
  });
});
