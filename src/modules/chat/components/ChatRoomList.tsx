import { FlashList, FlashListProps } from '@shopify/flash-list';
import React from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import CenteredLoading from '~/common/components/CenteredLoading';
import { IS_IOS } from '~/config/Config';
import ThemedStyles from '~/styles/ThemedStyles';

type Props = {
  renderItem: FlashListProps<any>['renderItem'];
  refreshing: boolean;
  onEndReached: FlashListProps<any>['onEndReached'];
  isLoading: boolean;
  onRefresh: () => void;
  Empty: any;
  data: any;
  ListHeaderComponent?: FlashListProps<any>['ListHeaderComponent'];
};

export default function ChatRoomList({
  renderItem,
  refreshing,
  onEndReached,
  isLoading,
  onRefresh,
  Empty,
  data,
  ListHeaderComponent,
}: Props) {
  return (
    <FlashList
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={IS_IOS ? 0 : 80}
          tintColor={ThemedStyles.getColor('Link')}
          colors={[ThemedStyles.getColor('Link')]}
        />
      }
      estimatedItemSize={68}
      ListEmptyComponent={isLoading ? <CenteredLoading /> : <Empty />}
      onEndReached={onEndReached}
      keyExtractor={keyExtractor}
      data={data}
    />
  );
}

const keyExtractor = item => item.node.id;
