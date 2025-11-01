
import React from 'react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonVariant?: 'danger' | 'primary';
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmButtonText = 'Confirmar',
    confirmButtonVariant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: {
      iconBg: 'bg-red-900/50',
      iconColor: 'text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    primary: {
      iconBg: 'bg-blue-900/50',
      iconColor: 'text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    }
  }

  const selectedVariant = variantClasses[confirmButtonVariant];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700">
        <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${selectedVariant.iconBg} mb-4`}>
                <svg className={`h-6 w-6 ${selectedVariant.iconColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            </div>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`w-full px-4 py-2 text-white rounded-md font-semibold transition ${selectedVariant.buttonBg}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
