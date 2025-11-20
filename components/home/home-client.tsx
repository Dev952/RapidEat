"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState, useRef } from "react";
import {
  Clock,
  Filter,
  Moon,
  Search,
  Star,
  SunMedium,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";
import { sampleRestaurants } from "@/data/restaurants";
import { Restaurant, SortKey } from "@/types/restaurant";

const PAGE_SIZE = 12;

type HomeClientProps = {
  currentUser: { name: string; role: string };
};

export default function HomeClient({ currentUser }: HomeClientProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(sampleRestaurants);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxCost, setMaxCost] = useState(0); // 0 means no limit
  const [sortKey, setSortKey] = useState<SortKey>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<"database" | "static" | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load restaurants from API
  useEffect(() => {
    let isMounted = true;

    const loadRestaurants = async () => {
      try {
        const response = await fetch("/api/restaurants");

        if (!response.ok) {
          throw new Error("Failed to load restaurants");
        }

        const payload = await response.json();

        if (!isMounted) return;
        setRestaurants(payload.data);
        setSource(payload.source);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          // Keep sample data as fallback
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadRestaurants();

    return () => {
      isMounted = false;
    };
  }, []);

  const allCuisines = useMemo(() => {
    const cuisineSet = new Set<string>();
    restaurants.forEach((r) => r.cuisines.forEach((c) => cuisineSet.add(c)));
    return Array.from(cuisineSet).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    let data = restaurants;

    // Search filter - matches name, description, locality, or cuisines
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      data = data.filter((r) =>
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.locality?.toLowerCase().includes(query) ||
        r.cuisines.some((c) => c.toLowerCase().includes(query))
      );
    }

    // Cuisine filter - must match at least one selected cuisine
    if (selectedCuisines.length > 0) {
      data = data.filter((r) => r.cuisines.some((c) => selectedCuisines.includes(c)));
    }

    // Rating filter - must be greater than or equal to minimum rating
    if (minRating > 0) {
      data = data.filter((r) => r.rating >= minRating);
    }

    // Cost filter - cost for two must be less than or equal to max cost
    if (maxCost > 0) {
      data = data.filter((r) => r.costForTwo <= maxCost);
    }

    return data;
  }, [restaurants, searchTerm, selectedCuisines, minRating, maxCost]);

  const sortedRestaurants = useMemo(() => {
    const data = [...filteredRestaurants];

    switch (sortKey) {
      case "rating":
        return data.sort((a, b) => b.rating - a.rating);
      case "delivery":
        return data.sort((a, b) => a.deliveryTime - b.deliveryTime);
      case "cost":
        return data.sort((a, b) => a.costForTwo - b.costForTwo);
      default:
        return data;
    }
  }, [filteredRestaurants, sortKey]);

  const paginatedRestaurants = useMemo(
    () => sortedRestaurants.slice(0, page * PAGE_SIZE),
    [sortedRestaurants, page]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCuisines, minRating, maxCost, sortKey]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && paginatedRestaurants.length < sortedRestaurants.length) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [paginatedRestaurants.length, sortedRestaurants.length]);

  // Stats based on ALL restaurants (not filtered) - shows total available
  const totalRestaurants = restaurants.length;
  const topRatedCount = restaurants.filter((r) => r.rating >= 4.5).length;
  const vegCount = restaurants.filter((r) => r.isPureVeg).length;
  const hasFilters = selectedCuisines.length > 0 || minRating > 0 || maxCost > 0 || !!searchTerm;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCuisines([]);
    setMinRating(0);
    setMaxCost(0);
    setPage(1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 text-gray-900"}`}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-amber-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Top Nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white font-black flex items-center justify-center text-2xl shadow-xl shadow-red-500/40">
                R
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">RapidEat</h1>
                <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                  Fast food, faster delivery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl border transition ${
                  darkMode
                    ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                {darkMode ? <SunMedium size={20} /> : <Moon size={20} />}
              </button>

              <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border ${
                darkMode ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"
              }`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {currentUser.name[0]}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className={darkMode ? "text-slate-400" : "text-gray-500"}>{currentUser.role}</p>
                </div>
              </div>

              <Link
                href="/auth/logout"
                className={`px-4 py-2 rounded-xl border font-semibold transition ${
                  darkMode
                    ? "border-slate-700 hover:bg-slate-900"
                    : "border-gray-200 hover:bg-white"
                }`}
              >
                Logout
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 mb-6">
              <Sparkles className="text-red-500" size={16} />
              <span className="text-sm font-semibold text-red-500">Discover amazing restaurants</span>
            </div>

            <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-4">
              Cravings delivered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                ultra fast
              </span>
            </h2>

            <p className={`text-lg sm:text-xl mb-8 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
              Find your favorite food from {restaurants.length}+ restaurants
            </p>

            {/* Search Bar */}
            <div className={`max-w-2xl mx-auto rounded-2xl border shadow-2xl overflow-hidden ${
              darkMode ? "border-slate-800 bg-slate-900" : "border-white bg-white"
            }`}>
              <div className="flex items-center gap-3 px-6 py-4">
                <Search className={darkMode ? "text-slate-400" : "text-gray-400"} size={24} />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines, or dishes..."
                  className="flex-1 bg-transparent outline-none text-lg"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className={`flex items-center gap-2 px-6 py-3 border-t ${
                darkMode ? "border-slate-800" : "border-gray-100"
              }`}>
                <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  Quick:
                </span>
                {["Pizza", "Burger", "Biryani", "Pure Veg"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className={`px-3 py-1 text-sm rounded-full transition ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <StatCard
              label="Total"
              value={totalRestaurants}
              icon={<Sparkles size={20} />}
              darkMode={darkMode}
            />
            <StatCard
              label="Top Rated"
              value={topRatedCount}
              icon={<Star size={20} />}
              darkMode={darkMode}
            />
            <StatCard
              label="Pure Veg"
              value={vegCount}
              icon={<TrendingUp size={20} />}
              darkMode={darkMode}
            />
            <StatCard
              label="Cuisines"
              value={allCuisines.length}
              icon={<Filter size={20} />}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className={`rounded-2xl border p-4 mb-8 ${
          darkMode ? "border-slate-800 bg-slate-900" : "border-white bg-white shadow-lg"
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                showFilters
                  ? "bg-red-500 text-white"
                  : darkMode
                  ? "bg-slate-800 hover:bg-slate-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Filter size={18} />
              Filters
            </button>

            {/* Active Filters */}
            {selectedCuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine))}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                {cuisine}
                <X size={14} />
              </button>
            ))}

            {minRating > 0 && (
              <button
                onClick={() => setMinRating(0)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                Rating ≥ {minRating}
                <X size={14} />
              </button>
            )}

            {maxCost > 0 && (
              <button
                onClick={() => setMaxCost(0)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
              >
                Max ₹{maxCost}
                <X size={14} />
              </button>
            )}

            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-sm font-semibold text-red-500 hover:text-red-600"
              >
                Clear all
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                Sort:
              </span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
                className={`px-4 py-2 rounded-xl border font-semibold outline-none ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Top Rated</option>
                <option value="delivery">Fastest</option>
                <option value="cost">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-3">Minimum Rating</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-lg min-w-[60px]">{minRating.toFixed(1)}★</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Maximum Cost for Two</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={maxCost}
                    onChange={(e) => setMaxCost(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold text-lg min-w-[80px]">
                    {maxCost === 0 ? "No limit" : `₹${maxCost}`}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[300, 600, 1000, 1500].map((cost) => (
                    <button
                      key={cost}
                      onClick={() => setMaxCost(maxCost === cost ? 0 : cost)}
                      className={`px-3 py-1 text-xs rounded-lg transition ${
                        maxCost === cost
                          ? "bg-red-500 text-white"
                          : darkMode
                          ? "bg-slate-800 hover:bg-slate-700"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      ₹{cost}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Cuisines</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allCuisines.map((cuisine) => {
                    const isActive = selectedCuisines.includes(cuisine);
                    return (
                      <button
                        key={cuisine}
                        onClick={() => {
                          setSelectedCuisines(
                            isActive
                              ? selectedCuisines.filter((c) => c !== cuisine)
                              : [...selectedCuisines, cuisine]
                          );
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                          isActive
                            ? "bg-red-500 text-white"
                            : darkMode
                            ? "bg-slate-800 hover:bg-slate-700"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden ${
                  darkMode ? "border-slate-800 bg-slate-900" : "border-gray-100 bg-white"
                }`}
              >
                <div className={`h-56 ${darkMode ? "bg-slate-800" : "bg-gray-200"} animate-pulse`} />
                <div className="p-5 space-y-3">
                  <div className={`h-6 w-3/4 ${darkMode ? "bg-slate-800" : "bg-gray-200"} rounded animate-pulse`} />
                  <div className={`h-4 w-1/2 ${darkMode ? "bg-slate-800" : "bg-gray-200"} rounded animate-pulse`} />
                  <div className={`h-4 w-full ${darkMode ? "bg-slate-800" : "bg-gray-200"} rounded animate-pulse`} />
                </div>
              </div>
            ))
          ) : (
            paginatedRestaurants.map((restaurant) => (
            <article
              key={restaurant.slug}
              className={`rounded-2xl border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                darkMode ? "border-slate-800 bg-slate-900" : "border-gray-100 bg-white"
              }`}
            >
              <div className="relative h-56 overflow-hidden group">
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
                  <Star className="text-amber-500 fill-amber-500" size={16} />
                  <span className="font-bold text-sm text-gray-900">
                    {restaurant.rating}
                  </span>
                </div>
                {restaurant.offer && (
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    {restaurant.offer.title}
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
                  <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                    {restaurant.cuisines.join(" • ")}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock size={16} className="text-red-500" />
                    {restaurant.deliveryTime} mins
                  </span>
                  <span>₹{restaurant.costForTwo} for two</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {restaurant.isPureVeg && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      Pure Veg
                    </span>
                  )}
                  {restaurant.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        darkMode ? "bg-slate-800 text-slate-200" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
            ))
          )}
        </div>

        {/* Empty State */}
        {paginatedRestaurants.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold mb-2">No restaurants found</h3>
            <p className={darkMode ? "text-slate-400" : "text-gray-600"}>
              Try adjusting your filters or search term
            </p>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {paginatedRestaurants.length < sortedRestaurants.length && (
          <div ref={loadMoreRef} className="text-center mt-12 py-8">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              Loading more restaurants...
            </div>
          </div>
        )}

        {/* End of List */}
        {paginatedRestaurants.length >= sortedRestaurants.length && paginatedRestaurants.length > 0 && (
          <div className="text-center mt-12 py-8">
            <p className="text-sm font-semibold text-gray-500">
              🎉 You've seen all {sortedRestaurants.length} restaurants!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`mt-20 border-t py-8 ${darkMode ? "border-slate-800" : "border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-semibold mb-2">© 2025 RapidEat</p>
          <p className={darkMode ? "text-slate-400" : "text-gray-600"}>
            Built with Next.js & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon, darkMode }: { label: string; value: number; icon: ReactNode; darkMode: boolean }) {
  return (
    <div className={`rounded-2xl p-4 border ${
      darkMode ? "border-slate-800 bg-slate-900" : "border-white bg-white shadow-lg"
    }`}>
      <div className="flex items-center gap-2 text-sm font-semibold mb-2 text-red-500">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}