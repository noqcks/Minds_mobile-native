import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import BottomSheet from '../bottom-sheet/BottomSheet';
import { observer, useLocalStore } from 'mobx-react';
import { Platform, StyleSheet, View } from 'react-native';
import BaseModel from '../../BaseModel';
import Activity from '../../../newsfeed/activity/Activity';
import UserModel from '../../../channel/UserModel';
import ActivityModel from '../../../newsfeed/ActivityModel';
import OffsetList from '../OffsetList';
import ThemedStyles, { useStyle } from '../../../styles/ThemedStyles';
import capitalize from '../../helpers/capitalize';
import i18n from '../../services/i18n.service';
import { BottomSheetButton } from '../bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ChannelListItem from '../ChannelListItem';
import Handle from '../bottom-sheet/Handle';
import ChannelListItemPlaceholder from '../ChannelListItemPlaceholder';
import ActivityPlaceHolder from '../../../newsfeed/ActivityPlaceHolder';
import MText from '../MText';
import { useNavigation } from '@react-navigation/core';
import FeedStore from '~/common/stores/FeedStore';
import FeedList from '../FeedList';

type Interactions =
  | 'upVotes'
  | 'downVotes'
  | 'reminds'
  | 'quotes'
  | 'channelSubscribers'
  | 'channelSubscriptions'
  | 'subscribers'
  | 'subscribersYouKnow';

type PropsType = {
  entity: BaseModel;
  modal?: boolean;
  withoutInsets?: boolean;
  snapPoints?: any;
  keepOpen?: boolean;
};

const _renderItemUser = navigation => (row: { item: any; index: number }) => (
  <ChannelListItem channel={row.item} navigation={navigation} />
);
const _renderItemActivity = navigation => (row: {
  item: any;
  index: number;
}) => (
  <Activity
    entity={row.item}
    hideTabs={true}
    hideRemind={true}
    navigation={navigation}
  />
);

const mapUser = data => data.map(d => UserModel.create(d.actor));
const mapSubscriber = data => data.map(d => UserModel.create(d));
const mapActivity = data =>
  data.map(d => {
    return ActivityModel.create(d);
  });

export interface InteractionsActionSheetHandles {
  show(interactions: Interactions): void;

  hide(): void;
}

const getTitle = (interaction: Interactions) => {
  switch (interaction) {
    case 'channelSubscribers':
      return i18n.t('subscribers');
    case 'channelSubscriptions':
      return i18n.t('subscriptions');
    default:
      return i18n.t(`interactions.${interaction}`, { count: 2 });
  }
};

/**
 * Interactions Action Sheet
 * @param props
 * @param ref
 */
const InteractionsBottomSheet: React.ForwardRefRenderFunction<
  InteractionsActionSheetHandles,
  PropsType
> = (props: PropsType, ref) => {
  // =====================| STATES & VARIABLES |=====================>
  const bottomSheetRef = React.useRef<any>(null);
  const insets = useSafeAreaInsets();
  const bottomInsets = props.withoutInsets ? 0 : insets.bottom;
  // whether the bottomsheet contents should be kept. defaults to true
  const keepOpen = typeof props.keepOpen === 'boolean' ? props.keepOpen : true;
  const navigation = useNavigation();
  const footerStyle = useStyle(styles.cancelContainer, {
    paddingBottom: bottomInsets + Platform.select({ default: 0, android: 20 }),
    paddingTop: bottomInsets * 1.5,
  });
  const footerGradientColors = useMemo(
    () => [
      ThemedStyles.getColor('PrimaryBackground') + '00',
      ThemedStyles.getColor('PrimaryBackground'),
    ],
    [ThemedStyles.theme],
  );
  const entity = props.entity;
  const offsetListRef = useRef<any>();
  const store = useLocalStore(() => ({
    feedStore: new FeedStore(),
    visible: false,
    interaction: 'upVotes' as Interactions,
    offset: '' as any,
    setVisibility(visible: boolean) {
      this.visible = visible;
    },
    show() {
      bottomSheetRef.current?.expand();
      store.visible = true;
    },
    hide() {
      bottomSheetRef.current?.close();
      /**
       * we don't turn visibility off, because then
       * the offsetlist will be unmounted and the data,
       * will be reset. we want to keep the data
       **/
      if (!keepOpen) {
        store.visible = false;
      }
    },
    setInteraction(interaction: Interactions) {
      store.interaction = interaction;
      this.feedStore
        .setEndpoint(`api/v3/subscriptions/graph/${entity.guid}/subscriptions`)
        .setLimit(12)
        .clear()
        .fetch();
    },
    get endpoint() {
      return (
        {
          upVotes: `api/v3/votes/list/${entity.guid}`,
          downVotes: `api/v3/votes/list/${entity.guid}`,
          subscribers: `api/v3/subscriptions/graph/${entity.guid}/subscribers`,
          channelSubscribers: `api/v1/subscribe/subscribers/${entity.guid}`,
          channelSubscriptions: `api/v3/subscriptions/graph/${entity.guid}/subscriptions`,
          subscribersYouKnow:
            'api/v3/subscriptions/relational/also-subscribe-to',
          default: 'api/v3/newsfeed',
        }[store.interaction] || 'api/v3/newsfeed'
      );
    },
    get opts() {
      const opts: any = {
        limit: 24,
      };

      switch (store.interaction) {
        case 'reminds':
          opts.remind_guid = entity.guid;
          opts.hide_reminds = false;
          break;
        case 'quotes':
          opts.quote_guid = entity.guid;
          break;
        case 'channelSubscriptions':
        case 'channelSubscribers':
          break;
        case 'subscribersYouKnow':
          opts.guid = entity.guid;
          break;
        default:
          opts.direction = store.interaction === 'upVotes' ? 'up' : 'down';
          break;
      }

      return opts;
    },
    get offsetField() {
      return (
        {
          subscribers: 'from_timestamp',
          channelSubscribers: undefined,
          channelSubscriptions: undefined,
          subscribersYouKnow: 'offset',
        }[store.interaction] || 'next-page'
      );
    },
    setOffset(offset: any) {
      this.offset = offset;
    },
  }));
  const isVote =
    store.interaction === 'upVotes' || store.interaction === 'downVotes';
  const isChannels =
    store.interaction === 'subscribers' ||
    store.interaction === 'channelSubscriptions' ||
    store.interaction === 'channelSubscribers' ||
    store.interaction === 'subscribersYouKnow';
  let dataField = isVote ? 'votes' : 'entities';
  if (
    store.interaction === 'channelSubscribers' ||
    store.interaction === 'subscribersYouKnow'
  ) {
    dataField = 'users';
  }
  const placeholderCount = useMemo(() => {
    const LIMIT = 24;

    switch (store.interaction) {
      case 'upVotes':
        return Math.min(entity['thumbs:up:count'], LIMIT);
      case 'downVotes':
        return Math.min(entity['thumbs:down:count'], LIMIT);
      case 'reminds':
        // @ts-ignore
        return entity.reminds ? Math.min(entity.reminds, LIMIT) : undefined;
      case 'quotes':
        // @ts-ignore
        return entity.quotes ? Math.min(entity.quotes, LIMIT) : undefined;
      default:
        return 24;
    }
  }, [entity, store.interaction]);

  // =====================| METHODS |=====================>
  React.useImperativeHandle(ref, () => ({
    show: (interaction: Interactions) => {
      store.setInteraction(interaction);
      /**
       * if the list was already visible, refresh its existing data,
       * other wise just show the list
       **/
      if (store.visible) {
        // refresh the offset list
        offsetListRef.current?.refreshList();
      }
      store.show();
    },
    hide: () => {
      store.hide();
    },
  }));

  const close = React.useCallback(() => bottomSheetRef.current?.close(), [
    bottomSheetRef,
  ]);

  const onBottomSheetVisibilityChange = useCallback(
    (visible: number) => {
      const shouldShow = visible >= 0;

      if (keepOpen && shouldShow) {
        store.setVisibility(shouldShow);
      } else {
        store.setVisibility(shouldShow);
      }
    },
    [keepOpen],
  );

  // =====================| RENDERS |=====================>
  const Header = useCallback(
    () => (
      <Handle>
        <View style={styles.navbarContainer}>
          <MText style={styles.titleStyle}>
            {store.visible ? capitalize(getTitle(store.interaction)) : ''}
          </MText>
        </View>
      </Handle>
    ),
    [store.interaction, store.visible],
  );

  const footer = (
    <View style={footerStyle} pointerEvents={'box-none'}>
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={footerGradientColors}
        pointerEvents={'none'}
      />
      <BottomSheetButton text={i18n.t('cancel')} onPress={close} />
    </View>
  );

  const renderPlaceholder = useCallback(() => {
    if (isVote || isChannels) {
      return <ChannelListItemPlaceholder />;
    }

    return <ActivityPlaceHolder />;
  }, [isVote, isChannels]);

  const renderItemUser = useMemo(() => _renderItemUser(navigation), [
    navigation,
  ]);
  const renderItemActivity = useMemo(() => _renderItemActivity(navigation), [
    navigation,
  ]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleComponent={Header}
      onChange={onBottomSheetVisibilityChange}
      snapPoints={props.snapPoints}>
      <View style={styles.container}>
        {store.visible && (
          <>
            {store.interaction !== 'channelSubscriptions' ? (
              <OffsetList
                ref={offsetListRef}
                fetchEndpoint={store.endpoint}
                endpointData={dataField}
                params={store.opts}
                placeholderCount={placeholderCount}
                renderPlaceholder={renderPlaceholder}
                // focusHook={useFocusEffect}
                map={
                  isVote ? mapUser : isChannels ? mapSubscriber : mapActivity
                }
                renderItem={
                  isVote || isChannels ? renderItemUser : renderItemActivity
                }
                offsetPagination={store.interaction === 'subscribersYouKnow'}
                offsetField={store.offsetField}
                contentContainerStyle={styles.contentContainerStyle}
              />
            ) : (
              <FeedList
                name="InteractionsBottomSheet"
                estimatedItemSize={50}
                feedStore={store.feedStore}
                navigation={navigation}
                renderActivity={renderItemUser}
              />
            )}
            {footer}
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = ThemedStyles.create({
  container: ['bgPrimaryBackground', 'flexContainer'],
  navbarContainer: ['padding2x', 'alignCenter', 'bgPrimaryBackground'],
  titleStyle: ['fontXL', 'marginLeft2x', 'marginBottom', 'bold'],
  cancelContainer: ['positionAbsoluteBottom', 'paddingHorizontal2x'],
  contentContainerStyle: { paddingBottom: 200 },
});
export default observer(forwardRef(InteractionsBottomSheet));
