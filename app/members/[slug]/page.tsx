import { supabase } from '@/lib/supabase';
import MemberDetailClient from '@/components/MemberDetailClient';

export async function generateStaticParams() {
  const { data } = await supabase.from('members').select('slug');
  return (data ?? []).map((m: { slug: string }) => ({ slug: m.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MemberPage({ params }: Props) {
  const { slug } = await params;
  return <MemberDetailClient slug={slug} />;
}
