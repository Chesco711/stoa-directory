export type Visibility = 'public' | 'community';
export type ProjectStatus = 'active' | 'shipped' | 'wip';

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url?: string;
  type: string;
  tags: string[];
  visibility: Visibility;
  status: ProjectStatus;
  thumbnail?: string;
  seekingFeedback: boolean;
}

export interface Member {
  id: string;
  slug: string;
  name: string;
  avatar?: string;
  bio: string;
  location?: string;
  social: SocialLinks;
  tags: string[];
  visibility: Visibility;
  projects: Project[];
}
