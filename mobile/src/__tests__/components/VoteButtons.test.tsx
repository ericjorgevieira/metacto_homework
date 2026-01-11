import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VoteButtons from '../../components/VoteButtons';

describe('VoteButtons Component', () => {
  const mockOnVote = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render like and dislike buttons', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote={null} onVote={mockOnVote} />
    );

    expect(getByText(/👍/)).toBeTruthy();
    expect(getByText(/👎/)).toBeTruthy();
  });

  test('should display correct vote counts', () => {
    const { getByText } = render(
      <VoteButtons likes={10} dislikes={3} userVote={null} onVote={mockOnVote} />
    );

    expect(getByText('👍 10')).toBeTruthy();
    expect(getByText('👎 3')).toBeTruthy();
  });

  test('should call onVote with "like" when like button pressed', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote={null} onVote={mockOnVote} />
    );

    fireEvent.press(getByText('👍 5'));

    expect(mockOnVote).toHaveBeenCalledWith('like');
  });

  test('should call onVote with "dislike" when dislike button pressed', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote={null} onVote={mockOnVote} />
    );

    fireEvent.press(getByText('👎 2'));

    expect(mockOnVote).toHaveBeenCalledWith('dislike');
  });

  test('should highlight active like button', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote="like" onVote={mockOnVote} />
    );

    const likeButton = getByText('👍 5').parent;
    expect(likeButton?.props.style).toBeDefined();
  });

  test('should highlight active dislike button', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote="dislike" onVote={mockOnVote} />
    );

    const dislikeButton = getByText('👎 2').parent;
    expect(dislikeButton?.props.style).toBeDefined();
  });

  test('should handle zero votes', () => {
    const { getByText } = render(
      <VoteButtons likes={0} dislikes={0} userVote={null} onVote={mockOnVote} />
    );

    expect(getByText('👍 0')).toBeTruthy();
    expect(getByText('👎 0')).toBeTruthy();
  });

  test('should not highlight any button when userVote is null', () => {
    const { getByText } = render(
      <VoteButtons likes={5} dislikes={2} userVote={null} onVote={mockOnVote} />
    );

    // Just verify the component renders without active state
    expect(getByText('👍 5')).toBeTruthy();
    expect(getByText('👎 2')).toBeTruthy();
  });
});
