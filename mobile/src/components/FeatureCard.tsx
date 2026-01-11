import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feature, VoteType } from '../types';
import VoteButtons from './VoteButtons';
import { styles } from './FeatureCard.styles';

interface FeatureCardProps {
  feature: Feature;
  onPress: () => void;
  onVote: (voteType: VoteType) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onPress, onVote }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{feature.title}</Text>
        <Text style={styles.author}>by {feature.username}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {feature.description}
      </Text>

      <View style={styles.footer}>
        <VoteButtons
          likes={feature.likes}
          dislikes={feature.dislikes}
          userVote={feature.user_vote}
          onVote={onVote}
        />
        <Text style={styles.score}>
          Score: {feature.likes - feature.dislikes}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FeatureCard;
