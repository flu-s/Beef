import React from "react";
import { MapPin, Star, Navigation } from "lucide-react";
import type { ButcherShop } from "../types";

interface ShopListProps {
  shops: ButcherShop[];
  selectedShopId: number | null;
  onShopClick: (shop: ButcherShop) => void;
}

const ShopList: React.FC<ShopListProps> = ({
  shops,
  selectedShopId,
  onShopClick,
}) => {
  // ✅ 상위 5개만 노출
  const displayedShops = shops.slice(0, 5);

  return (
    <div className="space-y-3">
      {displayedShops.length === 0 ? (
        <p className="text-center text-stone-400 py-10">주변 3km 이내에 정육점이 없습니다.</p>
      ) : (
        displayedShops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onShopClick(shop)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer
              ${shop.id === selectedShopId ? "border-blue-500 bg-blue-50 shadow-sm" : "border-stone-100 hover:bg-stone-50"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-900 truncate mb-1">{shop.name}</div>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="flex items-center text-yellow-500 font-bold">
                  <Star className="h-3 w-3 fill-current mr-0.5" /> {shop.rating}
                </span>
                <span>|</span>
                <span className="text-blue-600 font-medium">{shop.distance}m</span>
                <span>|</span>
                <span className="truncate">{shop.address}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(shop.mapUrl || `https://map.naver.com/v5/search/${encodeURIComponent(shop.name)}`, "_blank");
              }}
              className="p-2.5 bg-blue-600 rounded-full text-white shadow-sm hover:bg-blue-700"
            >
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ShopList;
