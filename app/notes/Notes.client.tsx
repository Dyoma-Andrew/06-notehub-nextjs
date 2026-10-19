'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';

import { createNote, fetchNotes } from '../../lib/api';
import type { CreateNoteRequest } from '../../lib/api';

import Modal from '../../components/Modal/Modal';
import NoteForm from '../../components/NoteForm/NoteForm';
import NoteList from '../../components/NoteList/NoteList';
import Pagination from '../../components/Pagination/Pagination';
import SearchBox from '../../components/SearchBox/SearchBox';

import css from './Notes.module.css';

const PER_PAGE = 12;

export default function NotesClient() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const closeModal = () => setIsModalOpen(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, 500);

  const { data, isPending, isError } = useQuery({
    queryKey: ['notes', page, PER_PAGE, search],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search,
      }),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      setIsModalOpen(false);
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleCreateNote = async (note: CreateNoteRequest) => {
    try {
      await createMutation.mutateAsync(note);
    } catch {}
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onSearch={handleSearch} />

        {data && data.totalPages > 1 && (
          <Pagination pageCount={data.totalPages} currentPage={page} onPageChange={setPage} />
        )}

        <button
          type="button"
          className={css.button}
          onClick={() => {
            createMutation.reset();
            setIsModalOpen(true);
          }}
        >
          Create note +
        </button>
      </header>

      {isPending && <p>Loading notes...</p>}

      {isError && <p role="alert">Failed to load notes. Please try again.</p>}

      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}

      {data && data.notes.length === 0 && <p>No notes found.</p>}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          {createMutation.isError && <p role="alert">Failed to create note. Please try again.</p>}
          <NoteForm
            onCancel={closeModal}
            onSubmit={handleCreateNote}
            isSubmitting={createMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
