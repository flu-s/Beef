import React from 'react';
import { MapPin, Star, Phone, Navigation } from 'lucide-react';
import type { Shop } from '../types';

// Mock data for display purposes
const MOCK_SHOPS: Shop[] = [
  { id: 1, name: "청담 명품 한우", address: "서울 강남구 청담동 123-45", distance: "350m", rating: 4.8, isOpen: true },
  { id: 2, name: "바른 정육점", address: "서울 강남구 삼성동 55-1", distance: "800m", rating: 4.5, isOpen: true },
  { id: 3, name: "마장동 직영 축산", address: "서울 강남구 역삼동 99", distance: "1.2km", rating: 4.2, isOpen: false },
];

const ShopList: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">
            내 주변 우수 정육점
          </h3>
        </div>
        <button className="text-sm text-stone-500 hover:text-blue-600 underline">
          지도 크게 보기
        </button>
      </div>

      {/* Mock Map View Area */}
      <div className="w-full h-48 bg-stone-100 rounded-2xl mb-6 relative overflow-hidden group cursor-pointer">
        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
            <p className="flex flex-col items-center gap-2">
               <MapPin className="h-8 w-8" />
               <span>지도 API 연동 영역</span>
            </p>
        </div>
        <div className="absolute bottom-3 right-3 bg-white px-3 py-1 rounded-full shadow text-xs font-bold text-stone-600">
           현재 위치: 서울시 강남구
        </div>
      </div>

      {/* Shop List */}
      <div className="space-y-3">
        {MOCK_SHOPS.map((shop) => (
          <div key={shop.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <span className="font-bold text-stone-900">{shop.name}</span>
                 {shop.isOpen ? (
                   <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">영업중</span>
                 ) : (
                   <span className="text-[10px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded-full font-medium">영업종료</span>
                 )}
               </div>
               <div className="flex items-center gap-2 text-xs text-stone-500">
                 <span className="flex items-center text-yellow-500">
                    <Star className="h-3 w-3 fill-current mr-0.5" /> {shop.rating}
                 </span>
                 <span>|</span>
                 <span>{shop.distance}</span>
                 <span>|</span>
                 <span className="truncate max-w-[150px]">{shop.address}</span>
               </div>
             </div>
             
             <div className="flex gap-2">
               <button className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors">
                 <Phone className="h-4 w-4" />
               </button>
               <button className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-sm">
                 <Navigation className="h-4 w-4" />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopList;