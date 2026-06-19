import axios from 'axios';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import LibraryItem from '../components/LibraryItem';

const TrainerLibrary = () => {
    const [media, setMedia] = useState([]);
    const [payload, setPayload] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    
    useEffect(() => {
        const trainerId = localStorage.getItem('client_id');
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const fetchLibrary = async () => {
            try {
                await axios.get(`${apiUrl}/library/list/${trainerId}`, config)
                .then((data) => {
                    const lib = data.data.library;
                    lib.map((f) => f.new = false)
                    console.log(lib);
                    setMedia((m) => [...lib, ...m])
                })

            } catch (err) {
                console.log(err.message);
            }
        };
        fetchLibrary();
    }, []);

    const handleFiles = async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Token no disponible. Inicia sesión nuevamente.');
            return;
        }

        const trainerId = localStorage.getItem('client_id');
        if (!trainerId) {
            toast.error('Id del Entrenador no disponible. Inicia sesión nuevamente.');
            return;
        }


        const files = Array.from(e.target.files || []);
        const newItems = files.map((file) => ({
            id: Math.random().toString(36).slice(2, 9),
            file,
            file_path: URL.createObjectURL(file),
            file_type: file.type.startsWith('video') ? 'video' : 'image',
            file_size: file.size,
            filename: file.name,
            new: true
        }));
        setMedia((m) => [...newItems, ...m]);
        console.log(media);

    };

    const removeItem = (id) => {
        setMedia((m) => m.filter((it) => it.id !== id));
    };

    return (
        <div className="min-h-screen p-6 bg-gray-900 text-white">
            <Toaster />
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Biblioteca de Fotos/Videos</h1>
                <p className="text-sm text-gray-300 mb-6">Sube fotos y videos que los entrenadores podrán usar en otras secciones.</p>

                <label className="inline-block mb-4">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFiles}
                        className="hidden"
                        id="media-input"
                    />
                    <button
                        onClick={() => document.getElementById('media-input').click()}
                        className="px-4 py-2 bg-customYellow text-black font-semibold rounded"
                    >
                        Subir Fotos/Videos
                    </button>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {media.length === 0 && (
                        <div className="text-gray-400">No hay archivos subidos aún.</div>
                    )}
                    {media.map((item) => (
                        <LibraryItem
                            key={item.id}
                            item={item}
                            apiUrl={apiUrl}
                            trainerId={localStorage.getItem('client_id')}
                            token={localStorage.getItem('token')}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrainerLibrary;
