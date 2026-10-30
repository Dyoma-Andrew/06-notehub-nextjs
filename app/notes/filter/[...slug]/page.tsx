import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';

const PER_PAGE = 12;

export default async function NotesPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const tag = slug[0] ?? 'all';
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, PER_PAGE, '', tag],
    queryFn: () => fetchNotes({ page: 1, perPage: PER_PAGE, tag }),
  });
  return <HydrationBoundary state={dehydrate(queryClient)}><NotesClient tag={tag} /></HydrationBoundary>;
}
