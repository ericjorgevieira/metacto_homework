import { Feature } from './index';

export type RootStackParamList = {
  Username: undefined;
  FeatureList: undefined;
  FeatureDetail: { feature: Feature };
  CreateFeature: undefined;
  EditFeature: { feature: Feature };
};
