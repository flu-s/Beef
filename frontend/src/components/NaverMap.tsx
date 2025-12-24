import React, { useEffect, useRef } from "react";
import type { Coordinates, ButcherShop } from "../types";

interface NaverMapProps {
  center: Coordinates;
  shops: ButcherShop[];
  selectedShopId: number | null;
  onShopClick: (shop: ButcherShop) => void;
}

const NaverMap: React.FC<NaverMapProps> = ({ center, shops, selectedShopId, onShopClick }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapElement.current || !window.naver || !window.naver.maps) return;

    try {
      const location = new window.naver.maps.LatLng(center.lat, center.lng);
      const mapOptions = {
        center: location,
        zoom: 15,
        zoomControl: true,
      };

      mapRef.current = new window.naver.maps.Map(mapElement.current, mapOptions);

      // 내 위치 마커
      new window.naver.maps.Marker({
        position: location,
        map: mapRef.current,
        icon: {
          content: '<div style="background:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>',
          anchor: new window.naver.maps.Point(6, 6),
        }
      });
    } catch (e) {
      console.error("Map initialization error", e);
    }
  }, [center]);

  useEffect(() => {
    if (!mapRef.current || !window.naver || !window.naver.maps) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    shops.forEach(shop => {
      const isSelected = shop.id === selectedShopId;
      const pos = new window.naver.maps.LatLng(shop.location.lat, shop.location.lng);
      
      const marker = new window.naver.maps.Marker({
        position: pos,
        map: mapRef.current,
        icon: {
          content: `<div style="padding:5px 10px; background:${isSelected ? '#2563eb' : 'white'}; color:${isSelected ? 'white' : 'black'}; border:1px solid #ddd; border-radius:15px; font-size:12px; font-weight:bold;">🥩 ${shop.name}</div>`,
          anchor: new window.naver.maps.Point(50, 20),
        }
      });

      window.naver.maps.Event.addListener(marker, "click", () => onShopClick(shop));
      markersRef.current.push(marker);
    });
  }, [shops, selectedShopId]);

  return (
    <div className="w-full h-full relative bg-stone-100 rounded-xl overflow-hidden">
      <div ref={mapElement} className="w-full h-full" />
      {(!window.naver || !window.naver.maps) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10 text-center p-4">
          <p className="text-gray-400 text-sm">지도 서비스를 이용할 수 없습니다.<br/>(네이버 API 인증 확인 필요)</p>
        </div>
      )}
    </div>
  );
};

export default NaverMap;
