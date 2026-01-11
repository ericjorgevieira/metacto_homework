import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { VoteType } from '../types';
import { styles } from './VoteButtons.styles';

interface VoteButtonsProps {
  likes: number;
  dislikes: number;
  userVote: VoteType | null;
  onVote: (voteType: VoteType) => void;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ likes, dislikes, userVote, onVote }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.likeButton,
          userVote === 'like' && styles.activeButton
        ]}
        onPress={() => onVote('like')}
      >
        <Text style={styles.buttonText}>👍 {likes}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.dislikeButton,
          userVote === 'dislike' && styles.activeButton
        ]}
        onPress={() => onVote('dislike')}
      >
        <Text style={styles.buttonText}>👎 {dislikes}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VoteButtons;
