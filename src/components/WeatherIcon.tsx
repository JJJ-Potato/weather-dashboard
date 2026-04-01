import Image from 'next/image';
import { getWeatherIcon } from '@/lib/weather-utils';

interface Props {
  sky: number;
  pty: number;
  size?: number;
}

export default function WeatherIcon({ sky, pty, size = 40 }: Props) {
  const { src, alt } = getWeatherIcon(sky, pty);
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="mx-auto"
    />
  );
}
