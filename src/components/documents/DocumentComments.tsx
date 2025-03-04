import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Send } from 'lucide-react';

interface DocumentCommentsProps {
  documentId: string;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({ documentId }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_comments')
        .select(`
          *,
          user:user_profiles(first_name, last_name)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('document_comments')
        .insert([{
          document_id: documentId,
          comment: newComment.trim(),
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card rounded-lg shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-foreground">
                    {comment.user.first_name} {comment.user.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground">{comment.comment}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentComments;
