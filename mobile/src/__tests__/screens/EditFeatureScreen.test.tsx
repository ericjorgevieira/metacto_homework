import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EditFeatureScreen from '../../screens/EditFeatureScreen';
import * as api from '../../services/api';
import { Feature } from '../../types';

jest.mock('../../hooks/useUser');
jest.mock('../../services/api');

jest.spyOn(Alert, 'alert');

const mockFeature: Feature = {
  id: 1,
  title: 'Original Title',
  description: 'Original Description',
  username: 'testuser',
  user_id: 1,
  likes: 5,
  dislikes: 2,
  user_vote: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as any;

const mockRoute = {
  params: {
    feature: mockFeature,
  },
} as any;

describe('EditFeatureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render FeatureForm with initial values', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByPlaceholderText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    const titleInput = getByPlaceholderText('Feature Title');
    const descriptionInput = getByPlaceholderText('Feature Description');

    expect(titleInput.props.value).toBe('Original Title');
    expect(descriptionInput.props.value).toBe('Original Description');
  });

  test('should render submit button with "Update Feature" label', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Update Feature')).toBeTruthy();
  });

  test('should show Alert when user is null', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { getByPlaceholderText, getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Updated Description');
    fireEvent.press(getByText('Update Feature'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'You must be logged in');
    });

    expect(api.updateFeature).not.toHaveBeenCalled();
  });

  test('should call updateFeature API on submit', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockUpdatedFeature = {
      ...mockFeature,
      title: 'Updated Title',
      description: 'Updated Description',
    };
    (api.updateFeature as jest.Mock).mockResolvedValueOnce(mockUpdatedFeature);

    const { getByPlaceholderText, getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Updated Description');
    fireEvent.press(getByText('Update Feature'));

    await waitFor(() => {
      expect(api.updateFeature).toHaveBeenCalledWith(1, 'Updated Title', 'Updated Description', 1);
    });
  });

  test('should show success Alert on update', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockUpdatedFeature = {
      ...mockFeature,
      title: 'Updated Title',
      description: 'Updated Description',
    };
    (api.updateFeature as jest.Mock).mockResolvedValueOnce(mockUpdatedFeature);

    const { getByPlaceholderText, getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Updated Description');
    fireEvent.press(getByText('Update Feature'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Feature updated successfully!',
        expect.any(Array)
      );
    });
  });

  test('should navigate back on success', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const mockUpdatedFeature = {
      ...mockFeature,
      title: 'Updated Title',
      description: 'Updated Description',
    };
    (api.updateFeature as jest.Mock).mockResolvedValueOnce(mockUpdatedFeature);

    const { getByPlaceholderText, getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Updated Description');
    fireEvent.press(getByText('Update Feature'));

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
    (api.updateFeature as jest.Mock).mockRejectedValueOnce(error);

    const { getByPlaceholderText, getByText } = render(
      <EditFeatureScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Updated Description');
    fireEvent.press(getByText('Update Feature'));

    // The error should be propagated to FeatureForm which shows its own Alert
    await waitFor(() => {
      expect(api.updateFeature).toHaveBeenCalled();
    });
  });
});
