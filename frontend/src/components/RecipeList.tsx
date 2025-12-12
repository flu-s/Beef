import React from 'react';
import { ChefHat, Clock, Youtube, Search } from 'lucide-react';
import type { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
  cut: string;
}

// 레시피 카드의 아이콘과 배경색을 결정하는 함수
const getLinkInfo = (index: number) => {
    switch (index % 3) {
        case 0: // 첫 번째 -> 네이버
            return {
                icon: <Search className="h-6 w-6" />,
                name: '네이버',
                color: 'text-green-600/70 bg-green-500/10',
                searchUrl: 'https://search.naver.com/search.naver?query='
            };
        case 1: // 두 번째 -> 유튜브
            return {
                icon: <Youtube className="h-6 w-6" />,
                name: '유튜브',
                color: 'text-red-600/70 bg-red-500/10',
                searchUrl: 'https://www.youtube.com/results?search_query='
            };
        case 2: // 세 번째 -> 구글
            return {
                icon: <Search className="h-6 w-6" />,
                name: '구글',
                color: 'text-blue-600/70 bg-blue-500/10',
                searchUrl: 'https://www.google.com/search?q='
            };
        default:
             return { icon: <Search className="h-6 w-6" />, name: '검색', color: 'text-stone-600/70 bg-stone-500/10', searchUrl: 'https://www.google.com/search?q=' };
    }
}

const RecipeList: React.FC<Props> = ({ recipes, cut }) => {
  const safeRecipes = Array.isArray(recipes) ? recipes : [];

  if (safeRecipes.length === 0) {
    // ... (오류 메시지 부분 생략)
    return (
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
        <div className="flex items-center gap-2 mb-4">
           <div className="bg-red-100 p-2 rounded-full">
             <ChefHat className="h-6 w-6 text-red-600" />
           </div>
           <h3 className="text-xl font-bold text-stone-900">
             <span className="text-red-600">{cut}</span> 추천 조리법
           </h3>
        </div>
        <p className="text-stone-500 text-center py-4 bg-stone-50 rounded-xl">
          현재 추천 가능한 조리법 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-red-100 p-2 rounded-full">
          <ChefHat className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          <span className="text-red-600">{cut}</span> 추천 조리법
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {safeRecipes.map((recipe, index) => {
          const info = getLinkInfo(index);

          // ⭐⭐⭐ 최종 수정: 검색어를 '소고기 부위 레시피'로 구성 ⭐⭐⭐
          const searchTerm = `소고기 ${cut} 레시피`;

          return (
            <a
              key={index}
              href={`${info.searchUrl}${searchTerm}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
            >

              {/* 상단 검색 엔진 영역 */}
              <div className={`h-32 relative overflow-hidden flex flex-col items-center justify-center ${info.color}`}>
                 <div className="flex items-center gap-2">
                   {info.icon}
                   <span className="font-bold text-xl">{info.name}</span>
                 </div>
              </div>

              {/* 하단 UI: 부위와 검색어만 강조 */}
              <div className="p-4 flex flex-col items-center justify-center h-20">
                <h4 className="font-bold text-lg text-stone-900 mb-1 group-hover:text-red-600 transition-colors uppercase">
                   {/* 부위만 크게 표시 */}
                   {cut}
                </h4>
                <p className="text-sm text-stone-500">
                   레시피 검색
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;