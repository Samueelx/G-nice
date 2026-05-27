import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Share, ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import CommentSection from './CommentSection';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  fetchJokeOfTheDay,
  likeJoke,
  setLocalJokeLikes,
} from '@/features/jumbotron/jokesSlice';
import { dummyJoke } from '@/data/dummyJoke';

const JokeJumbotron: React.FC = () => {
  const dispatch = useAppDispatch();
  const [commentSectionOpen, setCommentSectionOpen] = useState(false);

  const { currentJoke, loading, error } = useAppSelector((state) => state.jokes);

  // Fall back to dummy joke while the backend isn't connected yet
  const joke = currentJoke || dummyJoke;

  useEffect(() => {
    dispatch(fetchJokeOfTheDay());
  }, [dispatch]);

  const handleLikeClick = async () => {
    if (!joke) return;

    // Optimistic update — store previous count so we can revert on failure
    const previousLikes = joke.likes;
    dispatch(setLocalJokeLikes({ likes: previousLikes + 1 }));

    try {
      const resultAction = await dispatch(likeJoke(joke.id));
      if (likeJoke.rejected.match(resultAction)) {
        // Revert to the count before the optimistic update
        dispatch(setLocalJokeLikes({ likes: previousLikes }));
        console.error('Failed to like joke:', resultAction.payload);
      }
      // On success, likeJoke.fulfilled sets the authoritative likes_count from the server
    } catch (err) {
      dispatch(setLocalJokeLikes({ likes: previousLikes }));
      console.error('Failed to like joke:', err);
    }
  };

  const handleCommentClick = () => {
    setCommentSectionOpen((prev) => !prev);
  };

  const handleShareClick = () => {
    if (!joke) return;
    const jokeText = joke.joke;

    if (navigator.share) {
      navigator
        .share({
          title: 'Joke of the Day — G-nice',
          text: jokeText,
          url: window.location.href,
        })
        .catch((err) => console.error('Error sharing:', err));
    } else {
      navigator.clipboard
        .writeText(jokeText)
        .then(() => alert('Joke copied to clipboard!'))
        .catch(() => alert('Failed to copy joke to clipboard.'));
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg animate-pulse">
        <CardHeader className="space-y-1 pb-2">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-full" />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // ── Error state (non-blocking banner — dummy joke still renders below) ──────
  const showError = error && !currentJoke;

  // ── Main card ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Non-blocking error banner — shows only when API failed and no real joke is available */}
      {showError && (
        <div className="w-full max-w-xl mb-2 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
            onClick={() => dispatch(fetchJokeOfTheDay())}
          >
            Retry
          </Button>
        </div>
      )}
      <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow duration-300">

        {/* ── Header: label + date ── */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
              🎉 Joke of the Day
            </span>
            <span className="text-xs text-gray-400">
              {new Date(joke.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </CardHeader>

        {/* ── Joke text ── */}
        <CardContent className="pt-0 pb-4">
          <p className="text-xl font-semibold text-gray-900 whitespace-pre-wrap leading-snug">
            {joke.joke}
          </p>
        </CardContent>

        {/* ── Footer: actions + sponsor ── */}
        <CardFooter className="flex flex-col gap-3 border-t border-gray-200 pt-4">

          {/* Action row */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                className="flex items-center gap-1.5 text-gray-600 hover:text-purple-700"
                aria-label="Like joke"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{joke.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentClick}
                className="flex items-center gap-1.5 text-gray-600 hover:text-purple-700"
                aria-label={commentSectionOpen ? 'Close comments' : 'View comments'}
              >
                <MessageCircle className="w-4 h-4" />
                <span>{joke.comments?.length ?? 0}</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClick}
              className="flex items-center gap-1.5"
              aria-label="Share joke"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Sponsor row — only rendered when a sponsor exists */}
          {joke.sponsor && (
            <div className="flex items-center gap-2 w-full pt-1 border-t border-gray-100">
              {joke.sponsor.logo_url && (
                <img
                  src={joke.sponsor.logo_url}
                  alt={`${joke.sponsor.name} logo`}
                  className="h-6 w-auto object-contain rounded"
                />
              )}
              <span className="text-xs text-gray-500">
                Powered by{' '}
                {joke.sponsor.website_url ? (
                  <a
                    href={joke.sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    {joke.sponsor.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="font-medium text-gray-700">{joke.sponsor.name}</span>
                )}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Comment Section Dialog */}
      <CommentSection
        jokeId={joke.id}
        open={commentSectionOpen}
        onClose={() => setCommentSectionOpen(false)}
      />
    </>
  );
};

export default JokeJumbotron;