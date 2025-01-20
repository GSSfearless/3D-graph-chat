import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

const NotePanel = ({ nodeId, nodeName }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    // 从localStorage加载笔记
    const loadNotes = () => {
      const savedNotes = localStorage.getItem(`notes-${nodeId}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    };
    loadNotes();
  }, [nodeId]);

  const saveNote = () => {
    if (!currentNote.trim()) return;

    const newNotes = isEditing
      ? notes.map(note =>
          note.id === editingNoteId
            ? { ...note, content: currentNote, updatedAt: new Date().toISOString() }
            : note
        )
      : [
          ...notes,
          {
            id: Date.now(),
            content: currentNote,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

    setNotes(newNotes);
    localStorage.setItem(`notes-${nodeId}`, JSON.stringify(newNotes));
    setCurrentNote('');
    setIsEditing(false);
    setEditingNoteId(null);
  };

  const editNote = (note) => {
    setCurrentNote(note.content);
    setIsEditing(true);
    setEditingNoteId(note.id);
  };

  const deleteNote = (noteId) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    localStorage.setItem(`notes-${nodeId}`, JSON.stringify(newNotes));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">📝 {nodeName} 的笔记</h3>
      
      <div className="mb-4">
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="w-full p-2 border rounded-lg resize-none"
          rows="4"
          placeholder="写下你的想法..."
        />
        <button
          onClick={saveNote}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          {isEditing ? '更新' : '保存'}
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="border rounded-lg p-3">
            <div className="whitespace-pre-wrap mb-2">{note.content}</div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                {new Date(note.updatedAt).toLocaleString('zh-CN')}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => editNote(note)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotePanel; 