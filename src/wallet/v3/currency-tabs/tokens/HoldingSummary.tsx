import React from 'react';
import ThemedStyles from '../../../../styles/ThemedStyles';
import { Reward } from './TokensRewards';
import { format } from '../MindsTokens';
import { Container, Info, Row, Title } from '../AccordionContent';
import { View } from 'react-native';
import TimeMultiplier from './multipliers/TimeMultiplier';

type PropsType = {
  reward: Reward;
};

const HoldingSummary = ({ reward }: PropsType) => {
  const theme = ThemedStyles.style;

  const progressBar = [
    { flex: 1, width: `${(reward.multiplier / 3) * 100}%` },
    theme.backgroundLink,
  ];

  return (
    <>
      <Container>
        <Row>
          <Title>OnChain Tokens</Title>
        </Row>
        <Row>
          <Info>{format(reward.score, false)} </Info>
          <Title style={theme.marginLeft3x}>tokens</Title>
        </Row>
      </Container>
      <Container>
        <Row>
          <Title>Time multiplier</Title>
        </Row>
        <Row>
          <TimeMultiplier multiplier={reward.multiplier} />
        </Row>
      </Container>
    </>
  );
};

export default HoldingSummary;
