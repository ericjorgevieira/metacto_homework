import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { styles } from './FeatureForm.styles';

interface FeatureFormProps {
  initialTitle?: string;
  initialDescription?: string;
  onSubmit: (title: string, description: string) => Promise<void>;
  submitLabel?: string;
}

const FeatureForm: React.FC<FeatureFormProps> = ({
  initialTitle = '',
  initialDescription = '',
  onSubmit,
  submitLabel = 'Submit'
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in both title and description');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim());
    } catch (error) {
      Alert.alert('Error', `Error submitting feature: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Feature Title"
        value={title}
        onChangeText={setTitle}
        editable={!loading}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Feature Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FeatureForm;
