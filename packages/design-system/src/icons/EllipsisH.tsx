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
        d="M14.8281 14.8281C15.1667 14.4896 15.5573 14.3203 16 14.3203C16.4427 14.3203 16.8333 14.4896 17.1719 14.8281C17.5104 15.1667 17.6797 15.5573 17.6797 16C17.6797 16.4427 17.5104 16.8333 17.1719 17.1719C16.8333 17.5104 16.4427 17.6797 16 17.6797C15.5573 17.6797 15.1667 17.5104 14.8281 17.1719C14.4896 16.8333 14.3203 16.4427 14.3203 16C14.3203 15.5573 14.4896 15.1667 14.8281 14.8281ZM19.8281 14.8281C20.1667 14.4896 20.5573 14.3203 21 14.3203C21.4427 14.3203 21.8333 14.4896 22.1719 14.8281C22.5104 15.1667 22.6797 15.5573 22.6797 16C22.6797 16.4427 22.5104 16.8333 22.1719 17.1719C21.8333 17.5104 21.4427 17.6797 21 17.6797C20.5573 17.6797 20.1667 17.5104 19.8281 17.1719C19.4896 16.8333 19.3203 16.4427 19.3203 16C19.3203 15.5573 19.4896 15.1667 19.8281 14.8281ZM9.82812 14.8281C10.1667 14.4896 10.5573 14.3203 11 14.3203C11.4427 14.3203 11.8333 14.4896 12.1719 14.8281C12.5104 15.1667 12.6797 15.5573 12.6797 16C12.6797 16.4427 12.5104 16.8333 12.1719 17.1719C11.8333 17.5104 11.4427 17.6797 11 17.6797C10.5573 17.6797 10.1667 17.5104 9.82812 17.1719C9.48958 16.8333 9.32031 16.4427 9.32031 16C9.32031 15.5573 9.48958 15.1667 9.82812 14.8281Z"
        fill={`${color}`}
      />
    </Svg>
  );
};

Icon.displayName = 'EllipsisH';

export const EllipsisH = memo<IconProps>(withTheme(Icon));
