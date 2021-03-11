import React from 'react';
import ThemedStyles from '../../../../styles/ThemedStyles';
import { Reward } from './TokensRewards';
import { format } from '../MindsTokens';
import { Container, Info, Row, Title } from '../AccordionContent';
import { View } from 'react-native';
import TimeMultiplier from './multipliers/TimeMultiplier';
import { SummaryLabel } from './LiquiditySummary';

type PropsType = {
  reward: Reward;
};

const HoldingSummary = ({ reward }: PropsType) => {
  const theme = ThemedStyles.style;

  return (
    <>
      <Container>
        <SummaryLabel>
          <Title>OnChain Tokens</Title>
        </SummaryLabel>
        <Row>
          <Info>{format(reward.score, false)} </Info>
          <Title style={theme.marginLeft3x}>tokens</Title>
        </Row>
      </Container>
      <Container>
        <SummaryLabel>
          <Title>Time multiplier</Title>
        </SummaryLabel>
        <Row>
          <TimeMultiplier multiplier={reward.multiplier} />
        </Row>
      </Container>
    </>
  );
};

export default HoldingSummary;
