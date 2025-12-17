import React from "react";
import type { ButcherShop } from "../types";

interface ShopDetailModalProps {
  shop: ButcherShop;
  onClose: () => void;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({ shop, onClose }) => {
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Open Naver Map Search for this shop
  const handleOpenMap = () => {
      if (!shop.mapUrl) {
          alert("지도 정보가 없습니다.");
          return;
        }
        window.open(shop.mapUrl, "_blank");

  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100"
        onClick={handleModalClick}
      >
        {/* Header Image Placeholder or Map Preview could go here */}
        <div className="h-24 bg-red-600 flex items-center justify-center relative">
          <h2 className="text-white text-3xl opacity-20 font-bold tracking-widest uppercase">Butcher</h2>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black bg-opacity-20 text-white rounded-full p-1 hover:bg-opacity-40 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{shop.name}</h3>
            <span className="flex items-center text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-1 rounded-lg">
              ★ {shop.rating}
            </span>
          </div>

          <p className="text-gray-500 text-sm mb-4">{shop.address}</p>

          <div className="flex items-center gap-2 mb-6">
            {shop.isOpen ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                영업중 (Open)
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded">
                영업종료 (Closed)
              </span>
            )}
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-600 text-xs font-medium">{shop.distance}m away</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => alert("Phone number integration coming soon!")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              전화 걸기
            </button>
            <button
              onClick={handleOpenMap}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-100 transition-all transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              네이버 지도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;