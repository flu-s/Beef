import React from "react";
import { Star, Navigation } from "lucide-react";
import type { ButcherShop } from "../types";

interface ShopListProps {
  shops: ButcherShop[];
  selectedShopId: number | null;
  onShopClick: (shop: ButcherShop) => void;
}

const ShopList: React.FC<ShopListProps> = ({ shops, selectedShopId, onShopClick }) => {
  // 상위 5개만 표시
  const displayedShops = shops.slice(0, 5);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-stone-400 ml-1 uppercase tracking-wider">가까운 정육점 목록</h4>
      {displayedShops.map((shop) => (
        <div
          key={shop.id}
          onClick={() => onShopClick(shop)}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
            ${
              shop.id === selectedShopId
                ? "border-blue-500 bg-blue-50/50 shadow-sm"
                : "border-stone-100 bg-stone-50/30 hover:border-blue-200 hover:bg-blue-50/20"
            }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-stone-900 truncate">{shop.name}</span>
              {shop.isOpen && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">영업중</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="flex items-center text-yellow-500 font-bold">
                <Star className="h-3 w-3 fill-current mr-0.5" />
                {shop.rating}
              </span>
              <span className="text-stone-300">|</span>
              <span className="font-medium text-stone-600">{shop.distance}m</span>
              <span className="text-stone-300">|</span>
              <span className="truncate">{shop.address}</span>
            </div>
          </div>

          <div className="flex items-center ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `https://map.naver.com/v5/search/${encodeURIComponent(shop.name)}?c=${shop.location.lng},${shop.location.lat},15,0,0,0,dh`;
                window.open(url, "_blank");
              }}
              className="p-2.5 bg-white border border-stone-200 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              title="길찾기"
            >
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {shops.length === 0 && (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-400 text-sm font-medium">현재 위치 주변에 정육점 정보가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ShopList;
