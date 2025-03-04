import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, Users, History, MessageSquare, Share2, Download } from 'lucide-react';
import DocumentCollaborators from '../../components/documents/DocumentCollaborators';

const DocumentDetails = () => {
  const { id } = useParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'collaborators' | 'history' | 'comments'>('details');

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_submissions')
        .select(`
          *,
          template:document_templates(*),
          category:document_categories(*),
          submitted_by:user_profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setDocument(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    // Implement sharing functionality
    console.log('Share document:', document.id);
  };

  const handleDownload = () => {
    // Implement download functionality
    console.log('Download document:', document.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!document) {
    return <div className="text-muted-foreground p-4">Document not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{document.template.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted by {document.submitted_by.first_name} {document.submitted_by.last_name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'details'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Details
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'collaborators'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Collaborators
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4 inline-block mr-2" />
          History
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'comments'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline-block mr-2" />
          Comments
        </button>
      </div>

      <div className="pt-4">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Document Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Template</dt>
                    <dd className="text-sm font-medium">{document.template.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Category</dt>
                    <dd className="text-sm font-medium">{document.category.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd className="text-sm font-medium capitalize">{document.status}</dd>
                  </div>
                  {document.due_date && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Due Date</dt>
                      <dd className="text-sm font-medium">
                        {new Date(document.due_date).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Submission Data</h3>
                <div className="bg-secondary/20 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(document.submission_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collaborators' && (
          <DocumentCollaborators documentId={document.id} />
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Version History</h3>
            {/* Add version history component */}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Comments</h3>
            {/* Add comments component */}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;
