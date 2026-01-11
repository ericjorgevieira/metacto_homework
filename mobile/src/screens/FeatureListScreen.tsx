import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Feature, VoteType } from '../types';
import { useUser } from '../hooks/useUser';
import { getFeatures, vote as voteApi, removeVote } from '../services/api';
import FeatureCard from '../components/FeatureCard';
import { styles } from './FeatureListScreen.styles';

type FeatureListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FeatureList'>;

interface Props {
  navigation: FeatureListScreenNavigationProp;
}

const FeatureListScreen: React.FC<Props> = ({ navigation }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useUser();

  const fetchFeatures = async () => {
    if (!user) return;

    try {
      const data = await getFeatures(user.id);
      setFeatures(data);
    } catch (error) {
      Alert.alert('Error', `Failed to fetch features: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeatures();
    }, [user])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeatures();
  };

  const handleVote = async (featureId: number, voteType: VoteType, currentVote: VoteType | null) => {
    if (!user) return;

    try {
      if (currentVote === voteType) {
        await removeVote(featureId, user.id);
      } else {
        await voteApi(featureId, user.id, voteType);
      }
      fetchFeatures();
    } catch (error) {
      Alert.alert('Error', `Failed to vote: ${(error as Error).message}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Username');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Feature Voting</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={features}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FeatureCard
            feature={item}
            onPress={() => navigation.navigate('FeatureDetail', { feature: item })}
            onVote={(voteType) => handleVote(item.id, voteType, item.user_vote)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No features yet.{'\n'}Be the first to suggest one!
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateFeature')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FeatureListScreen;
