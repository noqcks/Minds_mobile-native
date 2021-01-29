import { observer, useLocalStore } from 'mobx-react';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import CenteredLoading from '../../../common/components/CenteredLoading';
import DatePicker from '../../../common/components/DatePicker';
import ThemedStyles from '../../../styles/ThemedStyles';
import { WalletStoreType } from '../../v2/createWalletStore';
import MindsScores from './MindsScores';
import Payout from './Payout';

type PropsType = {
  walletStore: WalletStoreType;
};

export type Reward = {
  user_guid: string;
  date: string;
  date_iso8601: string;
  date_unixts: number;
  reward_type: 'engagement' | 'holding' | 'liquidity';
  score: string;
  share_pct: number;
  multiplier: number;
  token_amount: string;
  tokenomics_version: number;
  alltime_summary: {
    score: string;
    token_amount: string;
  };
};

type RewardsType = {
  date: string;
  date_iso8601: string;
  date_unixts: number;
  engagement: Reward;
  holding: Reward;
  liquidity: Reward;
  total: { daily: string; alltime: string };
  user_guid: string;
  eth: string;
  minds: string;
};

type PricesType = {
  eth: string;
  minds: string;
};

const createLocalStore = ({ walletStore }) => ({
  selectedDate: new Date(),
  rewards: {} as RewardsType,
  prices: {} as PricesType,
  loading: true,
  get isToday() {
    return this.selectedDate.toDateString() === new Date().toDateString();
  },
  setLoading(loading) {
    this.loading = loading;
  },
  onConfirm(date: Date) {
    this.selectedDate = date;
  },
  setRewards(
    response:
      | false
      | {
          rewards: RewardsType;
          prices: PricesType;
        },
  ) {
    if (response) {
      this.rewards = response.rewards;
      this.prices = response.prices;
    }
  },
  setPrices(prices: PricesType) {
    this.prices = prices;
  },
  async loadRewards(date: Date) {
    this.setLoading(true);
    const response = await walletStore.loadRewards(date);
    this.setRewards(response);
    this.setLoading(false);
  },
});

export type TokensEarningsStore = ReturnType<typeof createLocalStore>;

const TokensEarnings = observer(({ walletStore }: PropsType) => {
  const theme = ThemedStyles.style;
  const localStore = useLocalStore(createLocalStore, { walletStore });
  useEffect(() => {
    localStore.loadRewards(localStore.selectedDate);
  }, [localStore, localStore.selectedDate, walletStore]);

  if (localStore.loading) {
    return <CenteredLoading />;
  }

  console.log(localStore.rewards);

  return (
    <View style={theme.paddingTop5x}>
      <DatePicker
        onConfirm={localStore.onConfirm}
        maximumDate={new Date()}
        date={localStore.selectedDate}
      />
      <Payout
        minds={localStore.rewards.total.daily}
        mindsPrice={localStore.prices.minds}
        isToday={localStore.isToday}
      />
      <MindsScores store={localStore} />
    </View>
  );
});

export default TokensEarnings;
