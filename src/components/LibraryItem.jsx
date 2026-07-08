import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRemove } from '@fortawesome/free-solid-svg-icons';

const LibraryItem = ({ item, apiUrl, trainerId, token, onDeleteSuccess, onUploadSuccess }) => {
    const [status, setStatus] = useState(item?.new ? 'pending' : 'uploaded');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const uploadStartedRef = useRef(false);

    useEffect(() => {
        if (!item?.file || !apiUrl || !trainerId || !token) {
            if (!item?.new) {
                setStatus('uploaded');
            }
            return;
        }

        if (!item.new) {
            setStatus('uploaded');
            return;
        }

        if (uploadStartedRef.current) {
            return;
        }

        uploadStartedRef.current = true;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('trainerId', trainerId);
        formData.append('file', item.file);

        axios
            .post(`${apiUrl}/library/add`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total || item.size || 1;
                        const percent = Math.min(100, Math.round((progressEvent.loaded / total) * 100));
                        setProgress(percent);
                    },
                })
            .then((res) => {
                const serverItemId = res?.data?.itemId;
                if (serverItemId !== undefined && serverItemId !== null && typeof onUploadSuccess === 'function') {
                    onUploadSuccess(item.id, serverItemId);
                }
                setStatus('uploaded');
            })
            .catch((uploadError) => {
                const message = uploadError?.response?.data?.message || uploadError.message || 'Error al subir el archivo';
                setError(message);
                setStatus('error');
                toast.error(`Error subiendo ${item.filename || item.name}: ${message}`);
            });
    }, [apiUrl, item?.file, item?.id, item?.new, item?.size, item?.filename, onUploadSuccess, token, trainerId]);

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

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: 'Bearer ' + token };
        try {
            await axios.delete(apiUrl + "/library/delete/" + id, { headers });
            toast.success('Elemento eliminado correctamente.');
            if (typeof onDeleteSuccess === 'function') {
                onDeleteSuccess(id);
            }
        } catch (error) {
            console.error('Error eliminando elemento:', error);
            toast.error('No se pudo eliminar el elemento. Intenta de nuevo.');
            return;
        }
    };

    const removeItem = (item) => {
        triggerYesNoToast(handleDelete, item.id)
    }

    return (
        <div className="relative overflow-hidden rounded bg-gray-800 p-2">
            <Toaster
                toastOptions={{
                    style: {
                        color: 'white',
                        background: 'green'
                    },
                    success: {
                        icon: '👍',
                    },
                    error: {
                        icon: '👎',
                        background: 'red',
                    }
                }
                } />
            <div className="mb-2">
                {/* <span className="text-xs text-slate-400">{item.id}</span> */}
                {item.file_type === 'image' ? (
                    <img src={item.file_path} alt={item.filename} className="w-full h-48 object-cover rounded" />
                ) : (
                    <video src={item.file_path} controls className="w-full h-48 object-cover rounded" />
                )}
            </div>
            <div className="flex items-center justify-between">
                {/* <div className="text-sm truncate mr-2">{item.filename}</div> */}
                <div className="text-xs font-semibold uppercase text-slate-400">
                    {status === 'uploading' && 'Subiendo...'}
                    {status === 'uploaded' && 'Listo'}
                    {status === 'error' && 'Error'}
                    {status === 'pending' && 'Pendiente'}
                </div>
                <button title='Eliminar' onClick={() => removeItem(item)}>
                    <FontAwesomeIcon icon={faRemove} color='red' />
                </button>
            </div>

            {status === 'uploading' && (
                <div className="absolute inset-x-0 bottom-0 left-0 right-0 bg-black/70 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-200">
                        <span>Cargando</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-customYellow transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {status === 'uploaded' && item.new && (
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold uppercase text-slate-950">
                    Nuevo
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-x-0 bottom-0 left-0 right-0 bg-red-500/90 p-3 text-sm text-white">
                    {error || 'No se pudo subir el archivo.'}
                </div>
            )}
        </div>
    );
};

export default LibraryItem;
