import { Member } from '@/lib/types';
import MemberTile from './MemberTile';

interface Props {
  members: Member[];
}

export default function MemberGrid({ members }: Props) {
  if (members.length === 0) {
    return (
      <p className="py-24 text-center text-zinc-400">No members to display.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <MemberTile key={member.id} member={member} />
      ))}
    </div>
  );
}
