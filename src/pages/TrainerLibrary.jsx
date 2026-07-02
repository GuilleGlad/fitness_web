import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import LibraryItem from '../components/LibraryItem';

const TrainerLibrary = ({ isModal = false, onSelectMedia, onClose }) => {
    const [media, setMedia] = useState([]);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

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

    const fileInputRef = useRef(null);

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

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeItem = (id) => {
        setMedia((m) => m.filter((it) => it.id !== id));
    };

    return (
        <div className={isModal ? 'w-full h-full' : 'min-h-screen bg-gray-900 text-white'}>
            <Toaster />
            <div className={isModal ? 'mx-auto flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-[#141820] p-4 shadow-2xl sm:p-6' : 'mx-auto flex min-h-screen max-w-5xl flex-col p-4 sm:p-6'}>
                <div className="flex flex-col gap-4 rounded-[32px] border border-slate-800 bg-[#141820] p-4 shadow-2xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Biblioteca de Fotos/Videos</h1>
                        <p className="text-sm text-gray-300">Sube fotos y videos que los entrenadores podrán usar en otras secciones.</p>
                    </div>
                    {isModal ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Cerrar
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center justify-center rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
                        >
                            Volver al dashboard
                        </button>
                    )}
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden sm:mt-6">
                    <label className="inline-block mb-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleFiles}
                            className="hidden"
                            id="media-input"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-customYellow text-black font-semibold rounded"
                        >
                            Subir Fotos/Videos
                        </button>
                    </label>

                    <div className="flex-1 overflow-y-auto pr-1">
                        <div className="min-h-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {media.length === 0 && (
                            <div className="text-gray-400">No hay archivos subidos aún.</div>
                        )}
                        {media.map((item) => (
                            <div key={item.id} className="flex flex-col gap-2">
                                <LibraryItem
                                    item={item}
                                    apiUrl={apiUrl}
                                    trainerId={localStorage.getItem('client_id')}
                                    token={localStorage.getItem('token')}
                                    onDeleteSuccess={removeItem}
                                />
                                {onSelectMedia && (
                                    <button
                                        type="button"
                                        onClick={() => onSelectMedia(item.file_path, item.file_type)}
                                        className="rounded-2xl bg-[#f1b80c] px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
                                    >
                                        Usar {item.file_type === 'video' ? 'video' : 'foto'}
                                    </button>
                                )}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerLibrary;
