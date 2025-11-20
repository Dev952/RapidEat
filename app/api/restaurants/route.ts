import { NextResponse } from 'next/server';
import { sampleRestaurants } from '@/data/restaurants';
import { getMongoCollection, hasMongoConfig } from '@/lib/mongodb';
import { Restaurant } from '@/types/restaurant';

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'restaurants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q') ?? '';
  const cuisines = searchParams.getAll('cuisine').filter(Boolean);
  const minRating = Number(searchParams.get('minRating') ?? '0');
  const maxCost = Number(searchParams.get('maxCost') ?? '0');

  let data: Restaurant[] = sampleRestaurants;
  let source: 'database' | 'static' = 'static';

  if (hasMongoConfig) {
    try {
      const collection = await getMongoCollection<Restaurant>(COLLECTION);
      const mongoFilters: Record<string, unknown> = {};

      if (searchQuery) {
        const regex = new RegExp(searchQuery, 'i');
        mongoFilters.$or = [
          { name: regex },
          { description: regex },
          { cuisines: regex },
          { locality: regex },
        ];
      }

      if (cuisines.length) {
        mongoFilters.cuisines = { $in: cuisines };
      }

      if (!Number.isNaN(minRating) && minRating > 0) {
        mongoFilters.rating = { $gte: minRating };
      }

      if (!Number.isNaN(maxCost) && maxCost > 0) {
        mongoFilters.costForTwo = { $lte: maxCost };
      }

      const cursor = collection.find(mongoFilters).limit(60);
      const docs = await cursor.toArray();

      if (docs.length) {
        data = docs;
        source = 'database';
      }
    } catch (error) {
      console.error('[restaurants][GET]', error);
    }
  }

  const filtered = data.filter((restaurant) => {
    const matchesSearch = searchQuery
      ? [
          restaurant.name,
          restaurant.description,
          restaurant.locality,
          ...restaurant.cuisines,
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesCuisine = cuisines.length
      ? restaurant.cuisines.some((cuisine) => cuisines.includes(cuisine))
      : true;

    const matchesRating =
      !Number.isNaN(minRating) && minRating > 0
        ? restaurant.rating >= minRating
        : true;

    const matchesCost =
      !Number.isNaN(maxCost) && maxCost > 0
        ? restaurant.costForTwo <= maxCost
        : true;

    return matchesSearch && matchesCuisine && matchesRating && matchesCost;
  });

  return NextResponse.json({ data: filtered, source });
}

