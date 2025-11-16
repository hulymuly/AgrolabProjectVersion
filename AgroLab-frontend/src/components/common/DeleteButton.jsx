// src/components/common/DeleteButton.jsx
import React, { useState } from 'react';

const DeleteButton = ({ onDelete, itemName = 'item', isAdmin = false }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isAdmin) return null;

    return (
        <>
            {!showConfirm ? (
                <button
                    onClick={() => setShowConfirm(true)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100"
                    title={`Удалить ${itemName}`}
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
            ) : (
                <div className="min-w-8">
                    <button
                        onClick={() => {
                            onDelete();
                            setShowConfirm(false);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 text-xs"
                    >
                        Да
                    </button>
                    <span className="mx-1">|</span>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="text-gray-600 hover:text-gray-800 p-1 text-xs"
                    >
                        Нет
                    </button>
                </div>
            )}
        </>
    );
};

export default DeleteButton;