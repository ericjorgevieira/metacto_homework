import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { VoteType } from '../types';
import { useUser } from '../hooks/useUser';
import { vote as voteApi, removeVote, deleteFeature } from '../services/api';
import VoteButtons from '../components/VoteButtons';
import { styles } from './FeatureDetailScreen.styles';

type FeatureDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FeatureDetail'>;
type FeatureDetailScreenRouteProp = RouteProp<RootStackParamList, 'FeatureDetail'>;

interface Props {
  navigation: FeatureDetailScreenNavigationProp;
  route: FeatureDetailScreenRouteProp;
}

const FeatureDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { feature: initialFeature } = route.params;
  const [feature, setFeature] = useState(initialFeature);
  const { user } = useUser();

  const isOwner = user?.id === feature.user_id;

  const handleVote = async (voteType: VoteType) => {
    if (!user) return;

    try {
      if (feature.user_vote === voteType) {
        await removeVote(feature.id, user.id);
        setFeature({
          ...feature,
          likes: voteType === 'like' ? feature.likes - 1 : feature.likes,
          dislikes: voteType === 'dislike' ? feature.dislikes - 1 : feature.dislikes,
          user_vote: null,
        });
      } else {
        await voteApi(feature.id, user.id, voteType);
        setFeature({
          ...feature,
          likes:
            voteType === 'like'
              ? feature.likes + 1
              : feature.user_vote === 'like'
              ? feature.likes - 1
              : feature.likes,
          dislikes:
            voteType === 'dislike'
              ? feature.dislikes + 1
              : feature.user_vote === 'dislike'
              ? feature.dislikes - 1
              : feature.dislikes,
          user_vote: voteType,
        });
      }
    } catch (error) {
      Alert.alert('Error', `Failed to vote: ${(error as Error).message}`);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditFeature', { feature });
  };

  const handleDelete = () => {
    if (!user) return;

    Alert.alert(
      'Delete Feature',
      'Are you sure you want to delete this feature?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFeature(feature.id, user.id);
              Alert.alert('Success', 'Feature deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', `Failed to delete: ${(error as Error).message}`);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{feature.title}</Text>
          <Text style={styles.author}>by {feature.username}</Text>
        </View>

        <Text style={styles.description}>{feature.description}</Text>

        <View style={styles.voteSection}>
          <VoteButtons
            likes={feature.likes}
            dislikes={feature.dislikes}
            userVote={feature.user_vote}
            onVote={handleVote}
          />
          <Text style={styles.score}>Score: {feature.likes - feature.dislikes}</Text>
        </View>
      </View>

      {isOwner && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default FeatureDetailScreen;
