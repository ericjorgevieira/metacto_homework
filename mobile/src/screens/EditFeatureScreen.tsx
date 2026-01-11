import React from 'react';
import { View, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useUser } from '../hooks/useUser';
import { updateFeature } from '../services/api';
import FeatureForm from '../components/FeatureForm';
import { styles } from './EditFeatureScreen.styles';

type EditFeatureScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditFeature'>;
type EditFeatureScreenRouteProp = RouteProp<RootStackParamList, 'EditFeature'>;

interface Props {
  navigation: EditFeatureScreenNavigationProp;
  route: EditFeatureScreenRouteProp;
}

const EditFeatureScreen: React.FC<Props> = ({ navigation, route }) => {
  const { feature } = route.params;
  const { user } = useUser();

  const handleSubmit = async (title: string, description: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      await updateFeature(feature.id, title, description, user.id);
      Alert.alert('Success', 'Feature updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <FeatureForm
        initialTitle={feature.title}
        initialDescription={feature.description}
        onSubmit={handleSubmit}
        submitLabel="Update Feature"
      />
    </View>
  );
};

export default EditFeatureScreen;
