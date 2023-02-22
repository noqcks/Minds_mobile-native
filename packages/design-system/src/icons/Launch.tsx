/* eslint-disable react/react-in-jsx-scope */
import { memo } from 'react';
import { IconProps } from '../IconProps';
import { Svg, Path } from 'react-native-svg';
import { withTheme } from '../config/withTheme';

const Icon = (props: IconProps) => {
  const { color = 'black', size = 32, ...otherProps } = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={`${color}`}
      {...otherProps}>
      <Path
        d="M17.6797 8.5H23.5V14.3203H21.8203V11.3516L13.6562 19.5156L12.4844 18.3438L20.6484 10.1797H17.6797V8.5ZM21.8203 21.8203V16H23.5V21.8203C23.5 22.263 23.3307 22.6536 22.9922 22.9922C22.6536 23.3307 22.263 23.5 21.8203 23.5H10.1797C9.71094 23.5 9.30729 23.3438 8.96875 23.0312C8.65625 22.6927 8.5 22.2891 8.5 21.8203V10.1797C8.5 9.71094 8.65625 9.32031 8.96875 9.00781C9.30729 8.66927 9.71094 8.5 10.1797 8.5H16V10.1797H10.1797V21.8203H21.8203Z"
        fill={`${color}`}
      />
    </Svg>
  );
};

Icon.displayName = 'Launch';

export const Launch = memo<IconProps>(withTheme(Icon));
