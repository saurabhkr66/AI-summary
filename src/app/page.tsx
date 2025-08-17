'use client';
import { useState } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('Summarize in bullet points for executives');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    setTranscript(text);
  };

  const generate = async () => {
    setError(null); setOkMsg(null); setLoading(true);
    try {
      const r = await fetch('/api/summerize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, instruction }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to summarize');
      setSummary(data.summary);
      setOkMsg('Summary generated. You can edit it below.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async () => {
    setError(null); setOkMsg(null); setSending(true);
    try {
      const to = emails.split(',').map(s => s.trim()).filter(Boolean);
      const r = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: 'Meeting Summary', body: summary })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || 'Failed to send email');
      setOkMsg('Email sent successfully.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Meeting Notes Summarizer</h1>

        <section className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload .txt Transcript:</label>
          <input 
            type="file" 
            accept=".txt" 
            onChange={e => onFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </section>

        <section className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Or Paste Transcript:</label>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-lg  text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            placeholder="Paste meeting notes or call transcript here..."
          />
        </section>

        <section className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instruction/Prompt:</label>
          <input
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Highlight only action items with owners and due dates"
          />
        </section>

        <button 
          onClick={generate} 
          disabled={loading || !transcript}
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Generating…' : 'Generate Summary'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {okMsg && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{okMsg}</p>
          </div>
        )}

        <section className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Editable Summary (Markdown or plain text):</label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={14}
            className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            placeholder="Generated summary will appear here..."
          />
        </section>

        <section className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Emails (comma-separated):</label>
          <input
            value={emails}
            onChange={e => setEmails(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
            placeholder="alice@company.com, bob@company.com"
          />
          <button 
            onClick={sendEmail} 
            disabled={sending || !summary || !emails}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {sending ? 'Sending…' : 'Send via Email'}
          </button>
        </section>
      </div>
    </main>
  );
}
