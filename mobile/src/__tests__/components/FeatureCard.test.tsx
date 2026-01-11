import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FeatureCard from '../../components/FeatureCard';
import { Feature } from '../../types';

describe('FeatureCard Component', () => {
  const mockOnPress = jest.fn();
  const mockOnVote = jest.fn();

  const mockFeature: Feature = {
    id: 1,
    title: 'Test Feature',
    description: 'Test description for the feature',
    username: 'testuser',
    likes: 5,
    dislikes: 2,
    user_vote: null,
    user_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render feature title', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('Test Feature')).toBeTruthy();
  });

  test('should render feature description', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('Test description for the feature')).toBeTruthy();
  });

  test('should render author name', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('by testuser')).toBeTruthy();
  });

  test('should display correct vote counts', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('👍 5')).toBeTruthy();
    expect(getByText('👎 2')).toBeTruthy();
  });

  test('should calculate and display score correctly', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('Score: 3')).toBeTruthy();
  });

  test('should call onPress when card is tapped', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    fireEvent.press(getByText('Test Feature'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('should pass onVote to VoteButtons', () => {
    const { getByText } = render(
      <FeatureCard feature={mockFeature} onPress={mockOnPress} onVote={mockOnVote} />
    );

    fireEvent.press(getByText('👍 5'));

    expect(mockOnVote).toHaveBeenCalledWith('like');
  });

  test('should handle negative score', () => {
    const featureWithNegativeScore: Feature = {
      ...mockFeature,
      likes: 2,
      dislikes: 5,
    };

    const { getByText } = render(
      <FeatureCard feature={featureWithNegativeScore} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('Score: -3')).toBeTruthy();
  });

  test('should handle zero score', () => {
    const featureWithZeroScore: Feature = {
      ...mockFeature,
      likes: 0,
      dislikes: 0,
    };

    const { getByText } = render(
      <FeatureCard feature={featureWithZeroScore} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('Score: 0')).toBeTruthy();
  });

  test('should render with active like vote', () => {
    const featureWithLike: Feature = {
      ...mockFeature,
      user_vote: 'like',
    };

    const { getByText } = render(
      <FeatureCard feature={featureWithLike} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('👍 5')).toBeTruthy();
  });

  test('should render with active dislike vote', () => {
    const featureWithDislike: Feature = {
      ...mockFeature,
      user_vote: 'dislike',
    };

    const { getByText } = render(
      <FeatureCard feature={featureWithDislike} onPress={mockOnPress} onVote={mockOnVote} />
    );

    expect(getByText('👎 2')).toBeTruthy();
  });

  test('should truncate long description to 2 lines', () => {
    const featureWithLongDescription: Feature = {
      ...mockFeature,
      description: 'This is a very long description that should be truncated to only two lines when rendered in the feature card component because we set numberOfLines={2} on the Text component',
    };

    const { getByText } = render(
      <FeatureCard feature={featureWithLongDescription} onPress={mockOnPress} onVote={mockOnVote} />
    );

    const descriptionElement = getByText(featureWithLongDescription.description);
    expect(descriptionElement.props.numberOfLines).toBe(2);
  });
});
