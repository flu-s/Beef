import React from 'react';
import { ChefHat, Search, Youtube } from 'lucide-react';

interface Props {
  recipes: any[];
  cut: string;
  meatType: 'beef' | 'chicken';
}

const getLinkInfo = (index: number) => {
  switch (index % 3) {
    case 0:
      return {
        icon: <Search className="h-6 w-6" />,
        name: '네이버',
        color: 'text-green-600/70 bg-green-500/10',
        searchUrl: 'https://search.naver.com/search.naver?query='
      };
    case 1:
      return {
        icon: <Youtube className="h-6 w-6" />,
        name: '유튜브',
        color: 'text-red-600/70 bg-red-500/10',
        searchUrl: 'https://www.youtube.com/results?search_query='
      };
    case 2:
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

const RecipeList: React.FC<Props> = ({ recipes, cut, meatType }) => {
  // ✅ 서버 데이터(recipes)가 비어있어도 [0, 1, 2] 인덱스를 사용해 3개 버튼 생성
  const displayItems = (recipes && recipes.length > 0) ? recipes : [0, 1, 2];

  if (!cut || cut === '판정 불가') return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-red-100 p-2 rounded-full">
          <ChefHat className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          <span className={meatType === 'beef' ? 'text-red-600' : 'text-orange-500'}>{cut}</span> 추천 조리법
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayItems.map((_, index) => {
          const info = getLinkInfo(index);
          const prefix = (cut.includes('닭') || cut.includes('소')) ? "" : (meatType === 'beef' ? '소고기 ' : '닭고기 ');
          const searchTerm = `${prefix}${cut} 레시피`;

          return (
            <a
              key={index}
              href={`${info.searchUrl}${encodeURIComponent(searchTerm)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 transition-all cursor-pointer ${
                meatType === 'beef' ? 'hover:border-red-300' : 'hover:border-orange-300'
              } hover:shadow-md shadow-sm`}
            >
              <div className={`h-32 relative overflow-hidden flex flex-col items-center justify-center ${info.color}`}>
                 <div className="flex items-center gap-2">
                   {info.icon}
                   <span className="font-bold text-xl">{info.name}</span>
                 </div>
              </div>

              <div className="p-4 flex flex-col items-center justify-center h-20">
                <h4 className={`font-black text-lg text-stone-900 mb-1 transition-colors uppercase ${
                  meatType === 'beef' ? 'group-hover:text-red-600' : 'group-hover:text-orange-500'
                }`}>
                   {cut}
                </h4>
                <p className="text-sm text-stone-500 font-medium">레시피 검색</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;
