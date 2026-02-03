import type { IUser } from '@fractal/shared';
import { getExp } from '@/utils/level';

interface ProfileCardProps {
  user: IUser;
}

export default function ProfileCard(props: ProfileCardProps) {
  return (
    <div class="flex justify-center w-full bg-[#0003] border border-white rounded-md lg:rounded-lg sm:p-4 md:p-5 lg:p-6 sm:gap-4 md:gap-5 lg:gap-6 select-none">
      <img
        src={props.user.avatar || 'assets/icons/profile.svg'}
        alt=""
        class="h-32 w-32 rounded-full border border-white shadow-sm"
      />
      <div class="flex flex-col w-full h-full justify-around items-center">
        <div class="w-full sm:text-lg md:text-xl lg:text-2xl">
          [Lv.{props.user.lvl}] {props.user.username}
        </div>
        <div class="w-full rounded-md bg-[#fff4]">
          <div
            class="text-neutral-900 rounded-md bg-[#fff6] text-center"
            style={{ width: `${(props.user.exp / getExp(props.user.lvl)) * 100}%` }}
          >
            {props.user.exp}/{getExp(props.user.lvl)}
          </div>
        </div>
      </div>
    </div>
  );
}
