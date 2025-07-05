'use client';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
            <span className={`
              px-2 py-1 rounded-full text-xs font-bold
              ${selectedCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {category.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}