import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import LibraryItem from '../components/LibraryItem';

const TrainerLibrary = ({ isModal = false, onSelectMedia, onClose, selectionMode = 'single' }) => {
    const [media, setMedia] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const isMultipleSelection = selectionMode === 'multiple';

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
                        const lib = data.data.library.map((f) => ({ ...f, new: false }));
                        // console.log(lib);
                        setMedia(lib)
                    })

            } catch (err) {
                console.log(err.message);
            }
        };
        fetchLibrary();
    }, []);

    const fileInputRef = useRef(null);

    const onPreClose = () => {
        if(isUploading)
            toast.success("En cualquier momento el archivo aparecera en la libreria y podra ser utilizado.",{
        duration: 30000})
        onClose();
    }

    const handleFiles = async (e) => {
        setIsUploading(true);
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
            uploadId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            file_path: URL.createObjectURL(file),
            file_type: file.type.startsWith('video') ? 'video' : 'image',
            file_size: file.size,
            filename: file.name,
            new: true
        }));
        console.log(newItems);
        setMedia((m) => [...newItems, ...m]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeItem = (id) => {
        setMedia((m) => m.filter((it) => it.id !== id && (it.uploadId || it.id) !== id));
        setSelectedItems((items) => items.filter((it) => it.id !== id && (it.uploadId || it.id) !== id));
    };

    const handleUploadSuccess = (tempId, serverId, serverUrl) => {
        setMedia((items) =>
            items.map((item) => (item.id === tempId ? { ...item, id: serverId, new: false, file_path: serverUrl } : item))
        );
        setIsUploading(false);
        setSelectedItems((items) =>
            items.map((item) => (item.id === tempId ? { ...item, id: serverId, new: false } : item))
        );
    };

    const toggleSelection = (item) => {
        setSelectedItems((items) => {
            const alreadySelected = items.some((selected) => selected.id === item.id);
            if (alreadySelected) {
                return items.filter((selected) => selected.id !== item.id);
            }
            return [...items, item];
        });
    };

    const handleUseSelection = () => {
        if (!onSelectMedia || selectedItems.length === 0) return;

        const payload = selectedItems.map((item) => ({
            url: item.file_path,
            mediaType: item.file_type,
        }));

        onSelectMedia(payload);
        if (isModal) {
            onClose?.();
        }
    };

    const triggerYesNoToast = (handle, ...params) => {
        toast((t) => (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span>¿Está seguro que desea eliminar el elemento?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id); // Closes the toast
                            handle(...params);
                        }}
                        style={{ background: '#9a1314', color: 'white', marginRight: '8px', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        Si
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id); // Closes the toast
                        }}
                        style={{ background: '#c8cfd5', color: '#242526', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        No
                    </button>
                </div>
            </div>
        ), {
            style: {
                background: '#323',

            },
            duration: Infinity, // Prevents the toast from auto-closing before selection
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Token no disponible. Inicia sesión nuevamente.');
            return;
        }

        const ids = selectedItems.map((item) => item.id).filter(Boolean);
        if (ids.length === 0) return;

        toast((t) => (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span>¿Está seguro que desea eliminar los elementos?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id); // Closes the toast
                            try {
                                ids.map((id) =>
                                    axios.delete(`${apiUrl}/library/delete/${id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                    })
                                )

                                setMedia((items) => items.filter((item) => !ids.includes(item.id)));
                                setSelectedItems([]);
                                toast.success('Elementos eliminados correctamente.');
                            } catch (error) {
                                console.error('Error eliminando elementos:', error);
                                toast.error('No se pudieron eliminar los elementos seleccionados.');
                            }
                        }}
                        style={{ background: '#9a1314', color: 'white', marginRight: '8px', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        Si
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id); // Closes the toast
                        }}
                        style={{ background: '#c8cfd5', color: '#242526', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                    >
                        No
                    </button>
                </div>
            </div>
        ), {
            style: {
                background: '#323',

            },
            duration: Infinity, // Prevents the toast from auto-closing before selection
        });

    };

    return (
        <div className={isModal ? 'w-full h-full' : 'min-h-screen bg-gray-900 text-white'}>
            <div className={isModal ? 'mx-auto flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-[#141820] p-4 shadow-2xl sm:p-6' : 'mx-auto flex min-h-screen max-w-5xl flex-col p-4 sm:p-6'}>
                <div className="flex flex-col gap-4 rounded-[32px] border border-slate-800 bg-[#141820] p-4 shadow-2xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Biblioteca de Fotos/Videos</h1>
                        <p className="text-sm text-gray-300">Sube fotos y videos que los entrenadores podrán usar en otras secciones.</p>
                    </div>
                    {isModal ? (
                        <button
                            type="button"
                            onClick={onPreClose}
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
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <label className="inline-block">
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

                        {isModal && isMultipleSelection && !isUploading && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleUseSelection}
                                    disabled={selectedItems.length === 0}
                                    className={`rounded-2xl bg-[#f1b80c] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-50 `}
                                >
                                    Usar seleccionados ({selectedItems.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    disabled={selectedItems.length === 0}
                                    className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Eliminar seleccionados ({selectedItems.length})
                                </button>
                            </>
                        )}
                        {isUploading && (
                         <>
                         <span>Se estan cargando los archivos...</span>
                         </>   
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                        <div className="min-h-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {media.length === 0 && (
                            <div className="text-gray-400">No hay archivos subidos aún.</div>
                        )}
                        {media.map((item) => {
                            const isSelected = selectedItems.some((selected) => selected.id === item.id);
                            const itemStatus = item.new ? 'pending' : 'uploaded';
                            return (
                                <div key={item.uploadId || item.id} className="flex flex-col gap-2">
                                    <LibraryItem
                                        item={item}
                                        apiUrl={apiUrl}
                                        trainerId={localStorage.getItem('client_id')}
                                        token={localStorage.getItem('token')}
                                        onDeleteSuccess={removeItem}
                                        onUploadSuccess={handleUploadSuccess}
                                        status={itemStatus}
                                    />
                                    {onSelectMedia && (
                                        <div className="flex items-center justify-between gap-2">
                                            {isMultipleSelection ? (
                                                <label className="flex items-center gap-2 text-sm text-slate-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelection(item)}
                                                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                                                    />
                                                    <span>Seleccionar</span>
                                                </label>
                                            ) : (
                                                <span className="text-sm text-slate-400">Selección simple</span>
                                            )}
                                            {(!isModal || !isMultipleSelection) && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSelectMedia({ url: item.file_path, mediaType: item.file_type })}
                                                    className={`rounded-2xl bg-[#f1b80c] px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] ${itemStatus !== 'uploaded' && itemStatus !== 'error' ? "hidden" : ""}`}
                                                    disabled={itemStatus !== 'uploaded' && itemStatus !== 'error'}
                                                >
                                                    Usar {item.file_type === 'video' ? 'video' : 'foto'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerLibrary;
