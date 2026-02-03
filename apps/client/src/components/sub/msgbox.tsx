import { createSignal, onCleanup, Show } from 'solid-js';
import type { IMessage } from '@fractal/shared';
import { easeInQuad, getTimeline } from '@/utils/ease';

interface MsgboxProps {
  message: IMessage;
  color: string;
  maxTime: number;
  easeTime: number;
}

export default function Msgbox(props: MsgboxProps) {
  const [time, setTime] = createSignal(Date.now() - props.message.time);

  const interval = setInterval(() => {
    setTime(Date.now() - props.message.time);
  }, 1000 / 60);

  onCleanup(() => clearInterval(interval));

  const timeline = () => easeInQuad(getTimeline(time(), props.easeTime, props.easeTime, props.maxTime));

  return (
    <Show when={time() <= props.maxTime}>
      <div
        class="bg-neutral-900 bg-opacity-80 text-neutral-100 text-sm lg:text-base p-1 lg:p-2 rounded-md lg:rounded-lg border border-white"
        style={{
          'box-shadow': `0 0 10px ${props.color}, inset 0 0 10px ${props.color}`,
          'text-shadow': `0 0 10px ${props.color}, inset 0 0 10px ${props.color}`,
          transform: `translateX(calc(${timeline() * 100}% + ${timeline() * 0.5}rem))`,
        }}
      >
        {props.message.message}
      </div>
    </Show>
  );
}
