import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LibraryItem = ({ item, apiUrl, trainerId, token }) => {
    const [status, setStatus] = useState('pending');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!item.new){
            setStatus('uploaded')
        }
        if (!item.file || !apiUrl || !trainerId || !token || status !== 'pending') {
            return;
        }

        const formData = new FormData();
        formData.append('trainerId', trainerId);
        formData.append('file', item.file);
        
        setStatus('uploading');

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
            .then(() => {
                setStatus('uploaded');
            })
            .catch((uploadError) => {
                const message = uploadError?.response?.data?.message || uploadError.message || 'Error al subir el archivo';
                setError(message);
                setStatus('error');
                toast.error(`Error subiendo ${item.name}: ${message}`);
            });
    }, []);

    return (
        <div className="relative overflow-hidden rounded bg-gray-800 p-2">
            <div className="mb-2">
                <span className="text-xs text-slate-400">{item.id}</span>
                {item.file_type === 'image' ? (
                    <img src={item.file_path} alt={item.filename} className="w-full h-48 object-cover rounded" />
                ) : (
                    <video src={item.file_path} controls className="w-full h-48 object-cover rounded" />
                )}
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm truncate mr-2">{item.filename}</div>
                <div className="text-xs font-semibold uppercase text-slate-400">
                    {status === 'uploading' && 'Subiendo...'}
                    {status === 'uploaded' && 'Listo'}
                    {status === 'error' && 'Error'}
                    {status === 'pending' && 'Pendiente'}
                </div>
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
                    Subido
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
