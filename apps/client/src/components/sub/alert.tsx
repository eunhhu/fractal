import { For } from 'solid-js';
import type { IMessage } from '@fractal/shared';
import Msgbox from './msgbox';

interface AlertsProps {
  messages: IMessage[];
}

export default function Alerts(props: AlertsProps) {
  return (
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none select-none flex flex-col justify-end items-end sm:gap-0.5 gap-1 lg:gap-1.5 sm:p-0.5 p-1 lg:p-1.5">
      <For each={props.messages}>{(message) => <Msgbox message={message} color="#39FA" maxTime={3000} easeTime={500} />}</For>
    </div>
  );
}
