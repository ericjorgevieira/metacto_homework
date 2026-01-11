import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './src/context/UserContext';
import { useUser } from './src/hooks/useUser';
import { RootStackParamList } from './src/types/navigation';
import UsernameScreen from './src/screens/UsernameScreen';
import FeatureListScreen from './src/screens/FeatureListScreen';
import FeatureDetailScreen from './src/screens/FeatureDetailScreen';
import CreateFeatureScreen from './src/screens/CreateFeatureScreen';
import EditFeatureScreen from './src/screens/EditFeatureScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Username"
            component={UsernameScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="FeatureList"
              component={FeatureListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FeatureDetail"
              component={FeatureDetailScreen}
              options={{ title: 'Feature Details' }}
            />
            <Stack.Screen
              name="CreateFeature"
              component={CreateFeatureScreen}
              options={{ title: 'New Feature' }}
            />
            <Stack.Screen
              name="EditFeature"
              component={EditFeatureScreen}
              options={{ title: 'Edit Feature' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
