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
        d="M15.8438 15.1016C16.4167 15.2578 16.8854 15.4141 17.25 15.5703C17.6406 15.7266 18.0443 15.9479 18.4609 16.2344C18.8776 16.4948 19.1901 16.8333 19.3984 17.25C19.6328 17.6667 19.75 18.1615 19.75 18.7344C19.75 19.5417 19.4766 20.2057 18.9297 20.7266C18.4089 21.2214 17.7057 21.5469 16.8203 21.7031V23.5H14.3203V21.7031C13.4609 21.5208 12.7448 21.1562 12.1719 20.6094C11.625 20.0625 11.3255 19.3594 11.2734 18.5H13.1094C13.2135 19.6719 14.0339 20.2578 15.5703 20.2578C16.3776 20.2578 16.9505 20.1146 17.2891 19.8281C17.6536 19.5156 17.8359 19.1641 17.8359 18.7734C17.8359 17.8359 17.0026 17.1589 15.3359 16.7422C12.7318 16.1432 11.4297 14.9974 11.4297 13.3047C11.4297 12.5495 11.7031 11.9115 12.25 11.3906C12.7969 10.8438 13.487 10.4792 14.3203 10.2969V8.5H16.8203V10.3359C17.6797 10.5443 18.3307 10.9349 18.7734 11.5078C19.2422 12.0807 19.4896 12.7448 19.5156 13.5H17.6797C17.6276 12.3281 16.9245 11.7422 15.5703 11.7422C14.8932 11.7422 14.3464 11.8854 13.9297 12.1719C13.5391 12.4583 13.3438 12.8359 13.3438 13.3047C13.3438 14.0599 14.1771 14.6589 15.8438 15.1016Z"
        fill={`${color}`}
      />
    </Svg>
  );
};

Icon.displayName = 'Tip';

export const Tip = memo<IconProps>(withTheme(Icon));
