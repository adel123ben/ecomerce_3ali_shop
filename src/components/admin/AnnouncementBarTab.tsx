import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface AnnouncementBar {
  id: string;
  text: string;
  is_active: boolean;
}

export const AnnouncementBarTab: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementBar | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcement_bar')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') {
      toast.error('Erreur lors du chargement de l\'annonce');
      setLoading(false);
      return;
    }
    if (data) {
      setAnnouncement(data);
      setText(data.text);
      setIsActive(data.is_active);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (!text.trim()) {
      toast.error('Le texte de l\'annonce ne peut pas être vide');
      setSaving(false);
      return;
    }
    let error;
    if (announcement) {
      // Update
      ({ error } = await supabase
        .from('announcement_bar')
        .update({ text, is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', announcement.id));
    } else {
      // Insert
      ({ error } = await supabase
        .from('announcement_bar')
        .insert([{ text, is_active: isActive }]));
    }
    if (error) {
      toast.error('Erreur lors de la sauvegarde');
    } else {
      toast.success('Annonce sauvegardée');
      fetchAnnouncement();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de la barre d'annonce</h1>
        <button
          onClick={fetchAnnouncement}
          className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          title="Rafraîchir"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <form
          onSubmit={e => { e.preventDefault(); handleSave(); }}
          className="space-y-4 bg-white p-6 rounded-lg shadow-md"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texte de l'annonce</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              placeholder="Saisissez le texte de l'annonce à afficher sur la boutique..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              id="is_active"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Activer la barre d'annonce</label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </form>
      )}
    </div>
  );
}; 