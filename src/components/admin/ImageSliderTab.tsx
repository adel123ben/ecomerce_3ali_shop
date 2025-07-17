import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ImageUpload } from './ImageUpload';
import { Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface CarouselImage {
  id: string;
  image_url: string;
  text: string | null;
  show_button: boolean;
  button_url: string | null;
  order: number;
}

export const ImageSliderTab: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CarouselImage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('carousel_images')
      .select('*')
      .order('order');
    if (error) {
      toast.error('Erreur lors du chargement des images');
      setLoading(false);
      return;
    }
    setImages(data || []);
    setLoading(false);
  };

  const handleAdd = () => {
    setEditing({
      id: '',
      image_url: '',
      text: '',
      show_button: false,
      button_url: '',
      order: images.length,
    });
  };

  const handleEdit = (img: CarouselImage) => {
    setEditing({ ...img });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette image du carousel ?')) return;
    const { error } = await supabase.from('carousel_images').delete().eq('id', id);
    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Image supprimée');
      fetchImages();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    // Met à jour l'ordre localement
    newImages.forEach((img, i) => (img.order = i));
    setImages(newImages);
    // Met à jour l'ordre dans la base
    await Promise.all(
      newImages.map(img =>
        supabase.from('carousel_images').update({ order: img.order }).eq('id', img.id)
      )
    );
    fetchImages();
  };

  const handleSave = async () => {
    if (!editing) return;
    setIsSaving(true);
    if (!editing.image_url) {
      toast.error('Image obligatoire');
      setIsSaving(false);
      return;
    }
    if (editing.id) {
      // Update
      const { error } = await supabase
        .from('carousel_images')
        .update({
          image_url: editing.image_url,
          text: editing.text,
          show_button: editing.show_button,
          button_url: editing.button_url,
        })
        .eq('id', editing.id);
      if (error) toast.error('Erreur lors de la mise à jour');
      else toast.success('Image modifiée');
    } else {
      // Insert
      const { error } = await supabase
        .from('carousel_images')
        .insert([
          {
            image_url: editing.image_url,
            text: editing.text,
            show_button: editing.show_button,
            button_url: editing.button_url,
            order: images.length,
          },
        ]);
      if (error) toast.error('Erreur lors de l\'ajout');
      else toast.success('Image ajoutée');
    }
    setIsSaving(false);
    setEditing(null);
    fetchImages();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Carousel d'Accueil</h1>
        <div>
          <button
            onClick={handleAdd}
            className="hidden sm:flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une image</span>
          </button>
          <button
            onClick={handleAdd}
            className="sm:hidden flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Ajouter une image"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div key={img.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col space-y-2 relative">
              <img src={img.image_url} alt="carousel" className="w-full h-40 object-cover rounded-lg" />
              {img.text && <div className="text-lg font-semibold text-gray-800 mt-2">{img.text}</div>}
              {img.show_button && img.button_url && (
                <a
                  href={img.button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Voir le lien
                </a>
              )}
              <div className="flex space-x-2 mt-2">
                <button onClick={() => handleEdit(img)} className="text-blue-600 hover:underline text-sm">Éditer</button>
                <button onClick={() => handleDelete(img.id)} className="text-red-600 hover:underline text-sm flex items-center"><Trash2 className="h-4 w-4 mr-1" />Supprimer</button>
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="text-gray-500 hover:text-blue-600"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === images.length - 1} className="text-gray-500 hover:text-blue-600"><ArrowDown className="h-4 w-4" /></button>
              </div>
              <div className="absolute top-2 right-2 bg-gray-100 text-xs px-2 py-1 rounded">#{img.order + 1}</div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Drawer d'édition/ajout */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto space-y-4 relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-2">{editing.id ? 'Modifier' : 'Ajouter'} une image</h2>
            <ImageUpload
              currentImages={editing.image_url ? [editing.image_url] : []}
              onImagesChange={(urls) => {
                setEditing((prev) => prev ? { ...prev, image_url: urls[0] || '' } : null);
              }}
              maxImages={1}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte (optionnel)</label>
              <input
                type="text"
                value={editing.text || ''}
                onChange={e => setEditing({ ...editing, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Texte à afficher sur l'image (optionnel)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editing.show_button}
                onChange={e => setEditing({ ...editing, show_button: e.target.checked })}
                id="show_button"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="show_button" className="text-sm font-medium text-gray-700">Afficher un bouton</label>
            </div>
            {editing.show_button && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL du bouton</label>
                <input
                  type="text"
                  value={editing.button_url || ''}
                  onChange={e => setEditing({ ...editing, button_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 