import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, ChevronDown, Newspaper } from 'lucide-react';
import ArticleCard, { GENRE_COLORS, timeAgo } from './ArticleCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GENRES = [
  'All', 'Hip-Hop', 'Pop', 'Rock', 'Classical', 'Jazz', 'Latin', 'Country', 'World', 'Industry'
];

const MOCK_ARTICLES = [
  {
    _id: 'mock-1',
    generated_headline: 'Taylor Swift Announces New Album "The Anthology" with Surprise Midnight Drop',
    body_standard: 'Pop superstar Taylor Swift stunned fans worldwide with a surprise announcement of her latest album "The Anthology," released at midnight. The 18-track collection features collaborations with several acclaimed producers and marks a return to her country roots while maintaining the indie-folk sound that defined her recent work. Critics are already calling it her most ambitious project to date.',
    body_simplified: 'Taylor Swift surprised fans by dropping a new album called "The Anthology" at midnight. It has 18 songs and mixes country and indie-folk styles.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['Taylor Swift'],
    topics: ['album release', 'new music'],
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why do you think surprise album drops have become so popular among major artists?',
    view_count: 1247
  },
  {
    _id: 'mock-2',
    generated_headline: 'Kendrick Lamar Wins Album of the Year at Grammy Awards for Third Time',
    body_standard: 'Kendrick Lamar made Grammy history by winning Album of the Year for the third time, cementing his legacy as one of hip-hop\'s greatest artists. His latest album, which explores themes of identity and community, was praised by the Recording Academy for its innovative production and powerful storytelling. The win ties him with Stevie Wonder and Frank Sinatra for the most Album of the Year awards.',
    body_simplified: 'Kendrick Lamar won Album of the Year at the Grammys for the third time. This ties him with Stevie Wonder and Frank Sinatra for the most wins.',
    source_name: 'Grammy.com',
    image_url: null,
    image_attribution: null,
    genres: ['hip-hop'],
    artists: ['Kendrick Lamar'],
    topics: ['Grammy Awards', 'awards', 'hip-hop'],
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'What does it mean for hip-hop when artists like Kendrick Lamar win Album of the Year?',
    view_count: 3891
  },
  {
    _id: 'mock-3',
    generated_headline: 'BTS Members Reunite for World Tour After Military Service',
    body_standard: 'Global sensation BTS announced their highly anticipated reunion world tour, marking the first time all seven members will perform together since completing their mandatory military service in South Korea. The 50-date tour will span five continents and tickets are expected to sell out within minutes. The group\'s label HYBE reported that over 40 million fans registered for ticket presales.',
    body_simplified: 'BTS announced a world tour now that all seven members are done with military service in South Korea. Over 40 million fans signed up for ticket presales.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['BTS'],
    topics: ['world tour', 'K-pop', 'reunion'],
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How does K-pop connect fans across different countries and cultures?',
    view_count: 5623
  },
  {
    _id: 'mock-4',
    generated_headline: 'Billie Eilish Launches Free Music Production Course for Teens',
    body_standard: 'Grammy-winning artist Billie Eilish has partnered with a major education nonprofit to launch a free online music production course aimed at teenagers. The 8-week program covers songwriting, beat-making, and home recording using free software. Eilish, who famously created her debut album in her brother Finneas\'s bedroom, said she wants to show young people that they don\'t need expensive equipment to make great music.',
    body_simplified: 'Billie Eilish created a free online music course for teens. It teaches songwriting, beat-making, and recording at home using free software.',
    source_name: 'Pitchfork',
    image_url: null,
    image_attribution: null,
    genres: ['pop', 'industry'],
    artists: ['Billie Eilish'],
    topics: ['music education', 'music production', 'youth'],
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Do you think you need expensive equipment to make good music? Why or why not?',
    view_count: 2104
  },
  {
    _id: 'mock-5',
    generated_headline: 'Bad Bunny Breaks Spotify Record with Most-Streamed Album in a Single Day',
    body_standard: 'Puerto Rican superstar Bad Bunny has shattered Spotify\'s record for the most-streamed album in a single day with his latest release. The album, which blends reggaeton, trap, and traditional Latin music styles, accumulated over 280 million streams in its first 24 hours. Music industry analysts say the record reflects the growing global influence of Latin music and Spanish-language artists in mainstream pop culture.',
    body_simplified: 'Bad Bunny broke a Spotify record with the most album streams in one day — over 280 million. His music mixes reggaeton, trap, and traditional Latin styles.',
    source_name: 'Rolling Stone',
    image_url: null,
    image_attribution: null,
    genres: ['latin'],
    artists: ['Bad Bunny'],
    topics: ['streaming records', 'Latin music', 'Spotify'],
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why do you think Latin music has become so popular worldwide in recent years?',
    view_count: 1876
  },
  {
    _id: 'mock-6',
    generated_headline: 'Olivia Rodrigo Partners with School Districts to Bring Music Programs Back',
    body_standard: 'Singer-songwriter Olivia Rodrigo announced a new initiative to fund music programs in underfunded school districts across the country. The "Sound Check" program will provide instruments, equipment, and teacher training to 200 schools over the next three years. Rodrigo, who credits her own school music program with launching her career, said that every student deserves access to music education regardless of their zip code.',
    body_simplified: 'Olivia Rodrigo is helping bring music programs back to 200 schools that lost funding. Her "Sound Check" program provides instruments and teacher training.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['pop', 'industry'],
    artists: ['Olivia Rodrigo'],
    topics: ['music education', 'school funding', 'advocacy'],
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why is it important for schools to have music programs? What would your school be like without one?',
    view_count: 3412
  }
];

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
    <div className="w-full aspect-[16/9] bg-white/5" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/10 rounded w-full" />
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-5 bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-white/10 rounded-full w-14" />
      </div>
      <div className="h-3 bg-white/5 rounded w-20" />
    </div>
  </div>
);

const NewsHub = ({ onArticleClick, embedded = false }) => {
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [useMock, setUseMock] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Fetch featured article
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/featured`);
        const json = await res.json();
        if (json.success && json.data) {
          setFeaturedArticle(json.data);
        } else {
          setFeaturedArticle(MOCK_ARTICLES[0]);
          setUseMock(true);
        }
      } catch {
        setFeaturedArticle(MOCK_ARTICLES[0]);
        setUseMock(true);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch feed articles
  const fetchArticles = useCallback(async (genre, pageNum, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const genreParam = genre === 'All' ? '' : genre.toLowerCase();
      const res = await fetch(`${API_BASE}/api/news/feed?genre=${encodeURIComponent(genreParam)}&page=${pageNum}&limit=20`);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        if (append) {
          setArticles(prev => [...prev, ...json.data]);
        } else {
          setArticles(json.data);
        }
        setHasMore(json.pagination ? pageNum < json.pagination.totalPages : json.data.length === 20);
        setUseMock(false);
      } else {
        if (!append) {
          // Use mock data as fallback
          const filtered = genre === 'All'
            ? MOCK_ARTICLES
            : MOCK_ARTICLES.filter(a => a.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
          setArticles(filtered);
          setUseMock(true);
          setHasMore(false);
        }
      }
    } catch {
      if (!append) {
        const filtered = genre === 'All'
          ? MOCK_ARTICLES
          : MOCK_ARTICLES.filter(a => a.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
        setArticles(filtered);
        setUseMock(true);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setSearchQuery('');
    setSearchResults(null);
    fetchArticles(activeGenre, 1);
  }, [activeGenre, fetchArticles]);

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(activeGenre, nextPage, true);
  };

  // Search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/search?q=${encodeURIComponent(value.trim())}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSearchResults(json.data);
        } else {
          // Fallback: filter mock data
          const query = value.toLowerCase();
          const filtered = MOCK_ARTICLES.filter(a =>
            a.generated_headline.toLowerCase().includes(query) ||
            a.artists?.some(ar => ar.toLowerCase().includes(query)) ||
            a.topics?.some(t => t.toLowerCase().includes(query))
          );
          setSearchResults(filtered);
        }
      } catch {
        const query = value.toLowerCase();
        const filtered = MOCK_ARTICLES.filter(a =>
          a.generated_headline.toLowerCase().includes(query) ||
          a.artists?.some(ar => ar.toLowerCase().includes(query)) ||
          a.topics?.some(t => t.toLowerCase().includes(query))
        );
        setSearchResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  const displayArticles = searchResults !== null ? searchResults : articles;
  const isSearchMode = searchResults !== null;

  const featuredGenre = featuredArticle?.genres?.[0] || '';
  const featuredGenreColor = GENRE_COLORS[featuredGenre.toLowerCase()] || '#6b7280';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-[#1a2744] to-gray-900 ${embedded ? '' : 'pb-12'}`}>
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header — only when not embedded */}
        {!embedded && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Newspaper className="w-8 h-8 text-[#f0b429]" />
              <h1 className="text-3xl font-black text-white">MMA News Feed</h1>
            </div>
            <p className="text-white/50 text-sm">Real music news, updated daily</p>
          </div>
        )}

        {/* Featured Article */}
        {featuredArticle && !isSearchMode && (
          <button
            onClick={() => handleArticleClick(featuredArticle)}
            className="group w-full text-left mb-8 relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#f0b429]/30 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-[#f0b429]/50"
          >
            {/* Background */}
            <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] bg-gray-800">
              {featuredArticle.image_url ? (
                <img
                  src={featuredArticle.image_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: `${featuredGenreColor}15` }}
                >
                  <span className="text-8xl opacity-20">&#x1F4F0;</span>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-bold bg-[#f0b429] text-[#1a2744] rounded-full uppercase tracking-wider">
                  Featured
                </span>
                {featuredArticle.source_name && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-white/15 text-white/80 rounded-full">
                    {featuredArticle.source_name}
                  </span>
                )}
                {featuredGenre && (
                  <span
                    className="px-2.5 py-1 text-xs font-bold rounded-full capitalize"
                    style={{ backgroundColor: `${featuredGenreColor}30`, color: featuredGenreColor }}
                  >
                    {featuredGenre}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white mb-2 leading-tight group-hover:text-[#f0b429] transition-colors">
                {featuredArticle.generated_headline}
              </h2>

              <p className="text-white/60 text-sm sm:text-base mb-4 line-clamp-2">
                {(featuredArticle.body_standard || '').slice(0, 150)}
                {(featuredArticle.body_standard || '').length > 150 ? '...' : ''}
              </p>

              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0b429] text-[#1a2744] text-sm font-bold rounded-lg group-hover:bg-[#f0b429]/90 transition-colors">
                Read Article
              </span>
            </div>
          </button>
        )}

        {/* Genre Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {GENRES.map(genre => {
            const isActive = activeGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#f0b429] text-[#1a2744]'
                    : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search articles, artists, or topics..."
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#f0b429]/50 focus:border-[#f0b429]/30 transition-all"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f0b429] animate-spin" />
          )}
        </div>

        {/* Search mode indicator */}
        {isSearchMode && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="text-[#f0b429] text-sm font-semibold hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayArticles.map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onClick={handleArticleClick}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !isSearchMode && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/15 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Articles
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-40">&#x1F4F0;</div>
            <h3 className="text-white/60 text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-white/40 text-sm">
              {isSearchMode
                ? 'Try a different search term or check your spelling.'
                : 'Try a different genre filter or check back later for new articles.'}
            </p>
          </div>
        )}

        {/* Mock data notice */}
        {useMock && (
          <div className="mt-6 text-center">
            <span className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/30 text-xs">
              Showing sample articles — live feed will load when the news API is connected
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsHub;
