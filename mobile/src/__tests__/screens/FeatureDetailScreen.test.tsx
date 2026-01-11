import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FeatureDetailScreen from '../../screens/FeatureDetailScreen';
import * as api from '../../services/api';
import { Feature } from '../../types';

jest.mock('../../hooks/useUser');
jest.mock('../../services/api');

jest.spyOn(Alert, 'alert');

const mockFeature: Feature = {
  id: 1,
  title: 'Test Feature',
  description: 'Test description for the feature',
  username: 'testuser',
  user_id: 1,
  likes: 10,
  dislikes: 3,
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

describe('FeatureDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render feature title', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Test Feature')).toBeTruthy();
  });

  test('should render feature description', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Test description for the feature')).toBeTruthy();
  });

  test('should render author name', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('by testuser')).toBeTruthy();
  });

  test('should render vote buttons with correct counts', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('👍 10')).toBeTruthy();
    expect(getByText('👎 3')).toBeTruthy();
  });

  test('should display score correctly', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Score: 7')).toBeTruthy();
  });

  test('should show edit and delete buttons for feature owner', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(getByText('Edit')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  test('should hide edit and delete buttons for non-owner', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const { queryByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    expect(queryByText('Edit')).toBeNull();
    expect(queryByText('Delete')).toBeNull();
  });

  test('should update local state on vote', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    (api.vote as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('👍 10'));

    await waitFor(() => {
      expect(api.vote).toHaveBeenCalledWith(1, 2, 'like');
    });

    // After voting, likes should increase
    await waitFor(() => {
      expect(getByText('👍 11')).toBeTruthy();
      expect(getByText('Score: 8')).toBeTruthy();
    });
  });

  test('should remove vote when same vote type clicked', async () => {
    const featureWithLike: Feature = {
      ...mockFeature,
      user_vote: 'like',
    };

    const routeWithLike = {
      params: { feature: featureWithLike },
    } as any;

    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    (api.removeVote as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={routeWithLike} />
    );

    fireEvent.press(getByText('👍 10'));

    await waitFor(() => {
      expect(api.removeVote).toHaveBeenCalledWith(1, 2);
    });

    // After removing vote, likes should decrease
    await waitFor(() => {
      expect(getByText('👍 9')).toBeTruthy();
      expect(getByText('Score: 6')).toBeTruthy();
    });
  });

  test('should change vote from like to dislike', async () => {
    const featureWithLike: Feature = {
      ...mockFeature,
      user_vote: 'like',
    };

    const routeWithLike = {
      params: { feature: featureWithLike },
    } as any;

    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    (api.vote as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={routeWithLike} />
    );

    fireEvent.press(getByText('👎 3'));

    await waitFor(() => {
      expect(api.vote).toHaveBeenCalledWith(1, 2, 'dislike');
    });

    // After changing vote, likes should decrease and dislikes increase
    await waitFor(() => {
      expect(getByText('👍 9')).toBeTruthy();
      expect(getByText('👎 4')).toBeTruthy();
      expect(getByText('Score: 5')).toBeTruthy();
    });
  });

  test('should navigate to EditFeature on edit button press', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('Edit'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditFeature', {
      feature: mockFeature,
    });
  });

  test('should show delete confirmation dialog', () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('Delete'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Feature',
      'Are you sure you want to delete this feature?',
      expect.any(Array)
    );
  });

  test('should call deleteFeature API on confirm', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    (api.deleteFeature as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('Delete'));

    // Simulate pressing Delete on the alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const deleteAlert = alertCalls.find((call) => call[0] === 'Delete Feature');
    const deleteButton = deleteAlert[2][1];
    await deleteButton.onPress();

    await waitFor(() => {
      expect(api.deleteFeature).toHaveBeenCalledWith(1, 1);
    });
  });

  test('should navigate back after delete', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    (api.deleteFeature as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('Delete'));

    // Simulate pressing Delete on the confirmation alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const deleteAlert = alertCalls.find((call) => call[0] === 'Delete Feature');
    const deleteButton = deleteAlert[2][1];
    await deleteButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Feature deleted successfully',
        expect.any(Array)
      );
    });

    // Simulate pressing OK on the success alert
    const successAlert = (Alert.alert as jest.Mock).mock.calls.find(
      (call) => call[0] === 'Success'
    );
    const okButton = successAlert[2][0];
    okButton.onPress();

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('should show Alert on vote error', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 2, username: 'otheruser' },
    });

    const error = new Error('Vote error');
    (api.vote as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('👍 10'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to vote: Vote error');
    });
  });

  test('should show Alert on delete error', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: { id: 1, username: 'testuser' },
    });

    const error = new Error('Delete error');
    (api.deleteFeature as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('Delete'));

    // Simulate pressing Delete on the alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const deleteAlert = alertCalls.find((call) => call[0] === 'Delete Feature');
    const deleteButton = deleteAlert[2][1];
    await deleteButton.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to delete: Delete error');
    });
  });

  test('should not vote when user is null', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { getByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={mockRoute} />
    );

    fireEvent.press(getByText('👍 10'));

    expect(api.vote).not.toHaveBeenCalled();
  });

  test('should not delete when user is null', async () => {
    const featureOwned: Feature = {
      ...mockFeature,
      user_id: 1,
    };

    const routeOwned = {
      params: { feature: featureOwned },
    } as any;

    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    const { queryByText } = render(
      <FeatureDetailScreen navigation={mockNavigation} route={routeOwned} />
    );

    // Edit/Delete buttons should not be shown when user is null (not owner)
    expect(queryByText('Delete')).toBeNull();
  });
});
