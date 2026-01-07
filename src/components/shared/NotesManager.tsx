"use client";

import { FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export interface Note {
    id: string;
    content: string;
    date: string;
    author: string;
}

interface NotesManagerProps {
    notes: Note[];
    onNotesChange: (notes: Note[]) => void;
}

export function NotesManager({ notes, onNotesChange }: NotesManagerProps) {
    const [noteContent, setNoteContent] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    const addNote = () => {
        if (!noteContent.trim()) return;
        if (editingNoteId) {
            onNotesChange(notes.map(n => n.id === editingNoteId ? { ...n, content: noteContent } : n));
            setEditingNoteId(null);
        } else {
            const newNote = {
                id: Math.random().toString(36).substr(2, 9),
                content: noteContent,
                date: new Date().toLocaleDateString(),
                author: "You" // Placeholder
            };
            onNotesChange([newNote, ...notes]);
        }
        setNoteContent("");
    };

    const deleteNote = (id: string) => onNotesChange(notes.filter(n => n.id !== id));

    const startEditingNote = (note: Note) => {
        setEditingNoteId(note.id);
        setNoteContent(note.content);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-sm font-medium text-foreground">Company Notes</h3>
                        <p className="text-xs text-muted-foreground">Internal memos, updates, and key information.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your note here..."
                        className="w-full h-32 p-4 border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={addNote}
                            disabled={!noteContent.trim()}
                            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingNoteId ? 'Update Note' : 'Add Note'}
                        </button>
                    </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3 mt-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                            <FileText size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notes added yet.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-gray-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">{note.author}</span>
                                        <span>•</span>
                                        <span>{note.date}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEditingNote(note)} className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-600 transition-colors">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
