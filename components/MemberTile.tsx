import Link from 'next/link';
import { Member } from '@/lib/types';
import ProjectCard from './ProjectCard';

interface Props {
  member: Member;
}

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
      {initials}
    </div>
  );
}

export default function MemberTile({ member }: Props) {
  const visibleProjects = member.projects
    .filter((p) => p.visibility === 'public')
    .slice(0, 3);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar name={member.name} avatar={member.avatar} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/members/${member.slug}`}
            className="font-semibold text-zinc-900 hover:underline"
          >
            {member.name}
          </Link>
          {member.location && (
            <p className="text-xs text-zinc-400">{member.location}</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-600 line-clamp-2">{member.bio}</p>

      {member.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {member.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {visibleProjects.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-3">
        {member.social.website && (
          <a
            href={member.social.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-700"
          >
            Website
          </a>
        )}
        {member.social.twitter && (
          <a
            href={`https://twitter.com/${member.social.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-700"
          >
            Twitter
          </a>
        )}
        {member.social.linkedin && (
          <a
            href={`https://linkedin.com/in/${member.social.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-700"
          >
            LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
