import React from 'react';
import { ChefHat, Clock } from 'lucide-react';
import type { Recipe } from '../types';

interface Props {
  recipes: Recipe[];
  cut: string;
}

const RecipeList: React.FC<Props> = ({ recipes, cut }) => {
  // 방어 코드: recipes가 undefined이거나 null일 경우 빈 배열로 처리
  const safeRecipes = Array.isArray(recipes) ? recipes : [];

  if (safeRecipes.length === 0) {
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
        {safeRecipes.map((recipe, index) => (
          <a
            key={index}
            href={`https://www.youtube.com/results?search_query=소고기+${recipe.title}+만드는법`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
          >
            {/* Thumbnail Placeholder */}
            <div className="h-32 bg-stone-200 relative overflow-hidden">
               <img
                 src={`https://placehold.co/600x400/e7e5e4/a8a29e?text=${recipe.title}`}
                 alt={recipe.title}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
               <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                 <Clock className="h-3 w-3" /> {recipe.cookingTime}
               </div>
            </div>

            <div className="p-4">
              <h4 className="font-bold text-lg text-stone-900 mb-1 group-hover:text-red-600 transition-colors">
                {recipe.title}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mb-3 h-8">
                {recipe.description}
              </p>

              <div className="flex justify-between items-center text-xs text-stone-400 border-t border-stone-200 pt-3">
                 <span className="flex items-center gap-1">
                   난이도: <span className="text-stone-700 font-medium">{recipe.difficulty}</span>
                 </span>
                 <span className="group-hover:translate-x-1 transition-transform text-red-500 font-medium">
                   레시피 보기 &rarr;
                 </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;