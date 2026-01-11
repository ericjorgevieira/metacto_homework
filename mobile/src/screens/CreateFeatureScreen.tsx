import React from 'react';
import { View, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../hooks/useUser';
import { createFeature } from '../services/api';
import FeatureForm from '../components/FeatureForm';
import { styles } from './CreateFeatureScreen.styles';

type CreateFeatureScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateFeature'>;

interface Props {
  navigation: CreateFeatureScreenNavigationProp;
}

const CreateFeatureScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useUser();

  const handleSubmit = async (title: string, description: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      await createFeature(title, description, user.id);
      Alert.alert('Success', 'Feature created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <FeatureForm onSubmit={handleSubmit} submitLabel="Create Feature" />
    </View>
  );
};

export default CreateFeatureScreen;
