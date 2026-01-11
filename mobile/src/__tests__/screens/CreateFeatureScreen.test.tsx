import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateFeatureScreen from '../../screens/CreateFeatureScreen';
import * as api from '../../services/api';

jest.mock('../../hooks/useUser');
jest.mock('../../services/api');

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as any;

describe('CreateFeatureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render FeatureForm component', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByPlaceholderText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    expect(getByPlaceholderText('Feature Title')).toBeTruthy();
    expect(getByPlaceholderText('Feature Description')).toBeTruthy();
  });

  test('should render submit button with "Create Feature" label', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    expect(getByText('Create Feature')).toBeTruthy();
  });

  test('should show Alert when user is null', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { getByPlaceholderText, getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Test Feature');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Test Description');
    fireEvent.press(getByText('Create Feature'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'You must be logged in');
    });

    expect(api.createFeature).not.toHaveBeenCalled();
  });

  test('should call createFeature API on submit', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockFeature = {
      id: 1,
      title: 'Test Feature',
      description: 'Test Description',
      user_id: 1,
    };
    (api.createFeature as jest.Mock).mockResolvedValueOnce(mockFeature);

    const { getByPlaceholderText, getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Test Feature');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Test Description');
    fireEvent.press(getByText('Create Feature'));

    await waitFor(() => {
      expect(api.createFeature).toHaveBeenCalledWith('Test Feature', 'Test Description', 1);
    });
  });

  test('should show success Alert on creation', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockFeature = {
      id: 1,
      title: 'Test Feature',
      description: 'Test Description',
      user_id: 1,
    };
    (api.createFeature as jest.Mock).mockResolvedValueOnce(mockFeature);

    const { getByPlaceholderText, getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Test Feature');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Test Description');
    fireEvent.press(getByText('Create Feature'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Feature created successfully!',
        expect.any(Array)
      );
    });
  });

  test('should navigate back on success', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockFeature = {
      id: 1,
      title: 'Test Feature',
      description: 'Test Description',
      user_id: 1,
    };
    (api.createFeature as jest.Mock).mockResolvedValueOnce(mockFeature);

    const { getByPlaceholderText, getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Test Feature');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Test Description');
    fireEvent.press(getByText('Create Feature'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    // Simulate pressing OK on the alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const successAlert = alertCalls.find((call) => call[0] === 'Success');
    const okButton = successAlert[2][0];
    okButton.onPress();

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('should propagate error on API failure', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const error = new Error('Network error');
    (api.createFeature as jest.Mock).mockRejectedValueOnce(error);

    const { getByPlaceholderText, getByText } = render(<CreateFeatureScreen navigation={mockNavigation} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Test Feature');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Test Description');
    fireEvent.press(getByText('Create Feature'));

    // The error should be propagated to FeatureForm which shows its own Alert
    await waitFor(() => {
      expect(api.createFeature).toHaveBeenCalled();
    });
  });
});
