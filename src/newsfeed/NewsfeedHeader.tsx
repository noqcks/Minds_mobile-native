import React, { ReactNode, useCallback, useRef } from 'react';
import { View } from 'react-native';
import {
  BottomSheetButton,
  BottomSheetModal,
} from '~/common/components/bottom-sheet';
import i18nService from '~/common/services/i18n.service';
import { Column, H3, H4, IconButtonNext } from '~/common/ui';
import ThemedStyles from '~/styles/ThemedStyles';
import { NewsfeedType } from './NewsfeedStore';
import { styles as headerStyles } from '~/topbar/Topbar';

interface NewsfeedHeaderProps {
  title?: string;
  feedType?: string;
  onFeedTypeChange?: (feedType: NewsfeedType) => void;
  withoutIcon?: any;
  small?: boolean;
  shadow?: boolean;
  endIcon?: ReactNode;
}

const NewsfeedHeader = ({
  title,
  feedType,
  onFeedTypeChange,
  small,
  shadow,
  endIcon,
}: NewsfeedHeaderProps) => {
  const bottomSheetRef = useRef<any>(undefined);
  const withoutIcon = !onFeedTypeChange;

  const onCancel = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const onTop = useCallback(() => {
    onFeedTypeChange?.('top');
    setTimeout(onCancel);
  }, [onCancel, onFeedTypeChange]);

  const onLatest = useCallback(() => {
    onFeedTypeChange?.('latest');
    setTimeout(onCancel);
  }, [onCancel, onFeedTypeChange]);

  const onPresentModal = useCallback(
    () => bottomSheetRef.current?.present(),
    [],
  );

  let feedTitle = title;
  let sheetTitle;
  let sheetDesc;
  let sheetActionTitle;
  let onSheetAction;

  switch (feedType) {
    case 'top':
      feedTitle = i18nService.t('newsfeed.topPosts');
      sheetTitle = i18nService.t('newsfeed.topTitle');
      sheetDesc = i18nService.t('newsfeed.topDesc');
      sheetActionTitle = i18nService.t('newsfeed.latestAction');
      onSheetAction = onLatest;
      break;
    case 'latest':
      feedTitle = i18nService.t('newsfeed.latestPosts');
      sheetTitle = i18nService.t('newsfeed.latestTitle');
      sheetDesc = i18nService.t('newsfeed.latestDesc');
      sheetActionTitle = i18nService.t('newsfeed.topAction');
      onSheetAction = onTop;
      break;
  }

  const Typo = small ? H4 : H3;

  const style = shadow
    ? [
        headerStyles.shadow,
        small ? containerSmallStyle : containerStyle,
        { borderBottomWidth: 0 },
      ]
    : small
    ? containerSmallStyle
    : containerStyle;

  return (
    <View style={style}>
      <Typo>{feedTitle}</Typo>

      {endIcon
        ? endIcon
        : !withoutIcon && (
            <IconButtonNext
              name="tune"
              color={feedType === 'top' ? 'Link' : 'Icon'}
              onPress={onPresentModal}
            />
          )}

      <BottomSheetModal
        title={sheetTitle}
        detail={sheetDesc}
        ref={bottomSheetRef}>
        <Column vertical="L">
          <BottomSheetButton
            action
            text={sheetActionTitle}
            onPress={onSheetAction}
          />
          <BottomSheetButton
            text={i18nService.t('cancel')}
            onPress={onCancel}
          />
        </Column>
      </BottomSheetModal>
    </View>
  );
};

const containerStyle = ThemedStyles.combine(
  {
    paddingVertical: 16,
  },
  'paddingHorizontal4x',
  'bgPrimaryBackground',
  'borderBottom1x',
  'rowJustifySpaceBetween',
  'bcolorTertiaryBackground',
);
const containerSmallStyle = ThemedStyles.combine(
  {
    paddingVertical: 12,
  },
  'paddingHorizontal4x',
  'bgPrimaryBackground',
  'borderBottom1x',
  'rowJustifySpaceBetween',
  'bcolorTertiaryBackground',
);

export default NewsfeedHeader;
