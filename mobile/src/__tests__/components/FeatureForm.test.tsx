import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import FeatureForm from '../../components/FeatureForm';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('FeatureForm Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render title and description inputs', () => {
    const { getByPlaceholderText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    expect(getByPlaceholderText('Feature Title')).toBeTruthy();
    expect(getByPlaceholderText('Feature Description')).toBeTruthy();
  });

  test('should render submit button with default label', () => {
    const { getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    expect(getByText('Submit')).toBeTruthy();
  });

  test('should render submit button with custom label', () => {
    const { getByText } = render(<FeatureForm onSubmit={mockOnSubmit} submitLabel="Update Feature" />);

    expect(getByText('Update Feature')).toBeTruthy();
  });

  test('should update title when typing', () => {
    const { getByPlaceholderText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    const titleInput = getByPlaceholderText('Feature Title');
    fireEvent.changeText(titleInput, 'New Feature');

    expect(titleInput.props.value).toBe('New Feature');
  });

  test('should update description when typing', () => {
    const { getByPlaceholderText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    const descriptionInput = getByPlaceholderText('Feature Description');
    fireEvent.changeText(descriptionInput, 'New Description');

    expect(descriptionInput.props.value).toBe('New Description');
  });

  test('should call onSubmit with trimmed values', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), '  Test Feature  ');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), '  Test Description  ');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test Feature', 'Test Description');
    });
  });

  test('should show Alert when title is empty', () => {
    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Description');
    fireEvent.press(getByText('Submit'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in both title and description');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show Alert when description is empty', () => {
    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Title');
    fireEvent.press(getByText('Submit'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in both title and description');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show Alert when both fields are empty', () => {
    const { getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.press(getByText('Submit'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in both title and description');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should show loading indicator during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValueOnce(submitPromise);

    const { getByPlaceholderText, getByText, queryByText, UNSAFE_root } = render(
      <FeatureForm onSubmit={mockOnSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Description');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      // Submit text should be replaced by ActivityIndicator
      expect(queryByText('Submit')).toBeNull();
      // ActivityIndicator should be present
      const activityIndicator = UNSAFE_root.findByType(require('react-native').ActivityIndicator);
      expect(activityIndicator).toBeTruthy();
    });

    resolveSubmit!();
  });

  test('should disable inputs during loading', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValueOnce(submitPromise);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    const titleInput = getByPlaceholderText('Feature Title');
    const descriptionInput = getByPlaceholderText('Feature Description');

    fireEvent.changeText(titleInput, 'Title');
    fireEvent.changeText(descriptionInput, 'Description');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(titleInput.props.editable).toBe(false);
      expect(descriptionInput.props.editable).toBe(false);
    });

    resolveSubmit!();
  });

  test('should show Alert on submission error', async () => {
    const error = new Error('Network error');
    mockOnSubmit.mockRejectedValueOnce(error);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Description');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Error submitting feature: Network error');
    });
  });

  test('should pre-fill form with initial values', () => {
    const { getByPlaceholderText } = render(
      <FeatureForm
        onSubmit={mockOnSubmit}
        initialTitle="Existing Title"
        initialDescription="Existing Description"
      />
    );

    const titleInput = getByPlaceholderText('Feature Title');
    const descriptionInput = getByPlaceholderText('Feature Description');

    expect(titleInput.props.value).toBe('Existing Title');
    expect(descriptionInput.props.value).toBe('Existing Description');
  });

  test('should trim whitespace from title', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), '   ');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), 'Description');
    fireEvent.press(getByText('Submit'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in both title and description');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should trim whitespace from description', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    fireEvent.changeText(getByPlaceholderText('Feature Title'), 'Title');
    fireEvent.changeText(getByPlaceholderText('Feature Description'), '   ');
    fireEvent.press(getByText('Submit'));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in both title and description');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('should enable inputs after submission completes', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByText } = render(<FeatureForm onSubmit={mockOnSubmit} />);

    const titleInput = getByPlaceholderText('Feature Title');
    const descriptionInput = getByPlaceholderText('Feature Description');

    fireEvent.changeText(titleInput, 'Title');
    fireEvent.changeText(descriptionInput, 'Description');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(titleInput.props.editable).toBe(true);
      expect(descriptionInput.props.editable).toBe(true);
    });
  });
});
