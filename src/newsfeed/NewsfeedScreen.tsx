import { IfFeatureEnabled } from '@growthbook/growthbook-react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect } from 'react';
import Topbar from '~/topbar/Topbar';
import { View } from 'react-native';

import { InjectItem } from '../common/components/FeedList';
import type { AppStackParamList } from '../navigation/NavigationTypes';
import type UserStore from '../auth/UserStore';
import CheckLanguage from '../common/components/CheckLanguage';
import { withErrorBoundary } from '../common/components/ErrorBoundary';
import SocialCompassPrompt from '../common/components/social-compass/SocialCompassPrompt';
import InitialOnboardingButton from '../onboarding/v2/InitialOnboardingButton';
import PortraitContentBar from '../portrait/PortraitContentBar';
import NewsfeedHeader from './NewsfeedHeader';
import type NewsfeedStore from './NewsfeedStore';
import TopFeedHighlights from './TopFeedHighlights';
import ChannelRecommendationBody from '~/common/components/ChannelRecommendation/ChannelRecommendationBody';
import NewsfeedPlaceholder from './NewsfeedPlaceholder';
import SeeLatestPostsButton from './SeeLatestPostsButton';
import ChannelRecommendationHeader from '~/common/components/ChannelRecommendation/ChannelRecommendationHeader';
import { Screen } from '~/common/ui';
import { useLegacyStores } from '~/common/hooks/use-stores';
import ThemedStyles from '~/styles/ThemedStyles';
import FeedListSticky from '~/common/components/FeedListSticky';
import FeedListInvisibleHeader from '~/common/components/FeedListInvisibleHeader';
import { ChannelRecommendationProvider } from '~/common/components/ChannelRecommendation/ChannelRecommendationProvider';
import TopFeedHighlightsHeader from './TopFeedHighlightsHeader';
import TopInFeedNotice from '~/common/components/in-feed-notices/TopInFeedNotice';
import InlineInFeedNotice from '~/common/components/in-feed-notices/InlineInFeedNotice';
import VerifyUniquenessNotice from '~/common/components/in-feed-notices/notices/VerifyUniquenessNotice';

type NewsfeedScreenRouteProp = RouteProp<AppStackParamList, 'Newsfeed'>;
type NewsfeedScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'Newsfeed'
>;

const HIGHLIGHT_POSITION = 9;
const RECOMMENDATION_POSITION = 4;

const sticky = [
  RECOMMENDATION_POSITION,
  RECOMMENDATION_POSITION + 2,
  HIGHLIGHT_POSITION,
  HIGHLIGHT_POSITION + 2,
];

type NewsfeedScreenProps = {
  navigation: NewsfeedScreenNavigationProp;
  user: UserStore;
  newsfeed: NewsfeedStore<any>;
  route: NewsfeedScreenRouteProp;
};

/**
 * News Feed Screen
 */
const NewsfeedScreen = observer(({ navigation }: NewsfeedScreenProps) => {
  const { newsfeed } = useLegacyStores();
  const portraitBar = React.useRef<any>();

  const refreshNewsfeed = useCallback(() => {
    newsfeed.scrollToTop();
    newsfeed.latestFeedStore.refresh();
    newsfeed.topFeedStore.refresh();
  }, [newsfeed]);

  const onTabPress = useCallback(
    e => {
      if (navigation.isFocused()) {
        refreshNewsfeed();
        e && e.preventDefault();
      }
    },
    [navigation, refreshNewsfeed],
  );

  useEffect(() => {
    newsfeed.loadFeed();

    return navigation.getParent()?.addListener(
      //@ts-ignore
      'tabPress',
      onTabPress,
    );
  }, [navigation, newsfeed, onTabPress]);

  const refreshPortrait = useCallback(() => {
    if (portraitBar.current) {
      portraitBar.current.load();
    }
  }, [portraitBar]);

  /**
   * Injected items
   */
  if (!newsfeed.latestFeedStore.injectItems) {
    // common prepend components
    const prepend = new InjectItem(0, 'prepend', () => (
      <View>
        <SocialCompassPrompt />
        <CheckLanguage />
        <InitialOnboardingButton />
        <PortraitContentBar ref={portraitBar} />
        <TopInFeedNotice />
        <VerifyUniquenessNotice />
        <NewsfeedHeader
          feedType={newsfeed.feedType}
          onFeedTypeChange={newsfeed.changeFeedTypeChange}
        />
      </View>
    ));

    // latest feed injected components
    newsfeed.latestFeedStore.setInjectedItems([
      prepend,

      new InjectItem(RECOMMENDATION_POSITION, 'channel', ({ target }) => (
        <ChannelRecommendationHeader
          location="newsfeed"
          shadow={target === 'StickyHeader'}
        />
      )),
      new InjectItem(RECOMMENDATION_POSITION + 1, 'channel', () => (
        <ChannelRecommendationBody location="newsfeed" />
      )),
      new InjectItem(
        RECOMMENDATION_POSITION + 2,
        'end',
        FeedListInvisibleHeader,
      ),
      new InjectItem(7, 'ilNotice', () => <InlineInFeedNotice position={1} />),

      new InjectItem(HIGHLIGHT_POSITION, 'highlightheader', ({ target }) => (
        <TopFeedHighlightsHeader target={target} />
      )),
      new InjectItem(HIGHLIGHT_POSITION + 1, 'highlight', () => (
        <TopFeedHighlights
          onSeeTopFeedPress={() => {
            newsfeed.listRef?.scrollToTop(true);
            setTimeout(() => {
              newsfeed.changeFeedTypeChange('top', true);
            }, 500);
          }}
        />
      )),
      new InjectItem(HIGHLIGHT_POSITION + 2, 'end', FeedListInvisibleHeader),
    ]);

    // top feed injected components
    newsfeed.topFeedStore.setInjectedItems([prepend]);
  }

  const isLatest = newsfeed.feedType === 'latest';

  return (
    <Screen safe>
      <ChannelRecommendationProvider location="newsfeed">
        <View style={ThemedStyles.style.flexContainer}>
          <FeedListSticky
            stickyHeaderIndices={isLatest ? sticky : undefined}
            bottomComponent={
              isLatest ? (
                <IfFeatureEnabled feature="mob-4193-polling">
                  <SeeLatestPostsButton
                    onPress={refreshNewsfeed}
                    feedStore={newsfeed.latestFeedStore}
                  />
                </IfFeatureEnabled>
              ) : undefined
            }
            header={<Topbar noInsets navigation={navigation} />}
            ref={newsfeed.setListRef}
            feedStore={
              isLatest ? newsfeed.latestFeedStore : newsfeed.topFeedStore
            }
            navigation={navigation}
            afterRefresh={refreshPortrait}
            placeholder={NewsfeedPlaceholder}
          />
        </View>
      </ChannelRecommendationProvider>
    </Screen>
  );
});

export default withErrorBoundary(NewsfeedScreen);
