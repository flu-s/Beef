import React from "react";
import { Star, Navigation, MapPin } from "lucide-react";
import type { ButcherShop } from "../types";

interface ShopListProps {
  shops: ButcherShop[];
  onShopClick: (shop: ButcherShop) => void;
}

const ShopList: React.FC<ShopListProps> = ({ shops, onShopClick }) => {
  return (
    <div className="space-y-4">
      {shops.length === 0 ? (
        <div className="py-12 text-center">
          <MapPin className="h-12 w-12 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">주변 3km 이내에 검색된 매장이 없습니다.</p>
        </div>
      ) : (
        shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => onShopClick(shop)}
            className="group flex items-center justify-between p-4 rounded-2xl border border-stone-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all duration-300"
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-900 text-lg truncate mb-1 group-hover:text-blue-700 transition-colors">
                {shop.name}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current mr-0.5" /> {shop.rating || "4.5"}
                </span>
                <span className="text-stone-300">|</span>
                <span className="text-blue-600 font-bold">{shop.distance}m</span>
                <span className="text-stone-300">|</span>
                <span className="truncate">{shop.address}</span>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(shop.name)}`;
                window.open(searchUrl, "_blank");
              }}
              className="ml-4 p-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all"
            >
              <Navigation className="h-5 w-5" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ShopList;
