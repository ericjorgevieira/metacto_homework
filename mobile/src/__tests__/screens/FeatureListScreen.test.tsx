import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FeatureListScreen from '../../screens/FeatureListScreen';
import * as api from '../../services/api';
import { Feature } from '../../types';

jest.mock('../../hooks/useUser');
jest.mock('../../services/api');

jest.spyOn(Alert, 'alert');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
} as any;

const mockFeatures: Feature[] = [
  {
    id: 1,
    title: 'Feature 1',
    description: 'Description 1',
    username: 'user1',
    user_id: 1,
    likes: 10,
    dislikes: 2,
    user_vote: 'like',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 2,
    title: 'Feature 2',
    description: 'Description 2',
    username: 'user2',
    user_id: 2,
    likes: 5,
    dislikes: 1,
    user_vote: null,
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
];

const mockUser = { id: 1, username: 'testuser' };
const mockLogout = jest.fn();

describe('FeatureListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  test('should render loading indicator initially', () => {
    (api.getFeatures as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { UNSAFE_root } = render(<FeatureListScreen navigation={mockNavigation} />);

    const activityIndicator = UNSAFE_root.findByType(require('react-native').ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  test('should fetch features on mount', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(api.getFeatures).toHaveBeenCalledWith(mockUser.id);
    });
  });

  test('should render header with username', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature Voting')).toBeTruthy();
      expect(getByText('Welcome, testuser')).toBeTruthy();
    });
  });

  test('should render logout button', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });
  });

  test('should display list of features', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature 1')).toBeTruthy();
      expect(getByText('Feature 2')).toBeTruthy();
    });
  });

  test('should show empty state when no features', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce([]);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText(/No features yet/)).toBeTruthy();
      expect(getByText(/Be the first to suggest one!/)).toBeTruthy();
    });
  });

  test('should navigate to FeatureDetail on card press', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Feature 1'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('FeatureDetail', {
      feature: mockFeatures[0],
    });
  });

  test('should call vote API on vote button press', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValue(mockFeatures);
    (api.vote as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature 2')).toBeTruthy();
    });

    // Feature 2 has no user_vote, so clicking like should vote
    const likeButton = getByText('👍 5');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(api.vote).toHaveBeenCalledWith(2, mockUser.id, 'like');
    });
  });

  test('should remove vote when same vote type clicked', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValue(mockFeatures);
    (api.removeVote as jest.Mock).mockResolvedValueOnce({});

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature 1')).toBeTruthy();
    });

    // Feature 1 has user_vote='like', so clicking like again should remove vote
    const likeButton = getByText('👍 10');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(api.removeVote).toHaveBeenCalledWith(1, mockUser.id);
    });
  });

  test('should refresh list on pull-to-refresh', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValue(mockFeatures);

    const { UNSAFE_root } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(api.getFeatures).toHaveBeenCalledTimes(1);
    });

    // Find FlatList and trigger refresh
    const flatList = UNSAFE_root.findByType(require('react-native').FlatList);
    fireEvent(flatList, 'refresh');

    await waitFor(() => {
      expect(api.getFeatures).toHaveBeenCalledTimes(2);
    });
  });

  test('should render FAB for creating feature', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('+')).toBeTruthy();
    });
  });

  test('should navigate to CreateFeature on FAB press', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('+')).toBeTruthy();
    });

    fireEvent.press(getByText('+'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('CreateFeature');
  });

  test('should show logout confirmation dialog', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });

    fireEvent.press(getByText('Logout'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Logout',
      'Are you sure you want to logout?',
      expect.any(Array)
    );
  });

  test('should call logout and navigate to Username on confirm', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValueOnce(mockFeatures);
    mockLogout.mockResolvedValueOnce(undefined);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Logout')).toBeTruthy();
    });

    fireEvent.press(getByText('Logout'));

    // Simulate pressing Logout on the alert
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const logoutAlert = alertCalls.find((call) => call[0] === 'Logout');
    const logoutButton = logoutAlert[2][1];
    await logoutButton.onPress();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigation.replace).toHaveBeenCalledWith('Username');
  });

  test('should show Alert on fetch error', async () => {
    const error = new Error('Network error');
    (api.getFeatures as jest.Mock).mockRejectedValueOnce(error);

    render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to fetch features: Network error');
    });
  });

  test('should show Alert on vote error', async () => {
    (api.getFeatures as jest.Mock).mockResolvedValue(mockFeatures);
    const error = new Error('Vote error');
    (api.vote as jest.Mock).mockRejectedValueOnce(error);

    const { getByText } = render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText('Feature 2')).toBeTruthy();
    });

    const likeButton = getByText('👍 5');
    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to vote: Vote error');
    });
  });

  test('should not fetch features when user is null', async () => {
    (require('../../hooks/useUser').useUser as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(<FeatureListScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(api.getFeatures).not.toHaveBeenCalled();
    });
  });
});
