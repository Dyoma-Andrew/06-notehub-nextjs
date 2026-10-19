import css from './page.module.css';
import { fetchNoteById } from '../../../lib/api';

type Props = {
  params: Promise<{ id: string }>;
};

const NoteDetails = async ({ params }: Props) => {
  const { id } = await params;
  console.log('note id:', id);
  const note = await fetchNoteById(id);
  return (
    <div>
      <h1>Note Details</h1>
      <li className={css.listItem} key={note.id}>
        <h2 className={css.title}>{note.title}</h2>
        <p className={css.content}>{note.content}</p>
        <div className={css.footer}>
          <span className={css.tag}>{note.tag}</span>
          <span className={css.date}>Created At: {note.createdAt}</span>
          <span className={css.date}>Updated At: {note.updatedAt}</span>
        </div>
      </li>
    </div>
  );
};

export default NoteDetails;
