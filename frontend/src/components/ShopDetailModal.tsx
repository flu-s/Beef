import React from "react";
import { Navigation, X } from "lucide-react";
import type { ButcherShop } from "../types";

interface ShopDetailModalProps {
  shop: ButcherShop;
  onClose: () => void;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({ shop, onClose }) => {
  const handleOpenMap = () => {
    if (!shop.mapUrl) {
      alert("지도 정보가 없습니다.");
      return;
    }
    window.open(shop.mapUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-24 bg-red-600 flex items-center justify-center relative">
          <h2 className="text-white text-3xl opacity-20 font-bold uppercase tracking-widest">Butcher</h2>
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/20 text-white rounded-full p-1 hover:bg-black/40">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
            <span className="text-yellow-500 font-bold text-sm bg-yellow-50 px-2 py-1 rounded-lg">★ {shop.rating}</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">{shop.address}</p>

          <div className="flex items-center gap-2 mb-6 text-xs">
            <span className={`px-2 py-1 rounded font-bold ${shop.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {shop.isOpen ? "영업중" : "영업종료"}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 font-medium">{shop.distance}m 거리</span>
          </div>

          <button
            onClick={handleOpenMap}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg transition-transform active:scale-95"
          >
            <Navigation className="h-5 w-5" />
            네이버 지도로 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;