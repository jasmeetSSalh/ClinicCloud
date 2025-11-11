'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

interface Table {
  name: string;
}

export default function Home() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tables');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tables');
      }
      
      setTables(data.tables);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <Image
            className="mx-auto mb-4 dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={120}
            height={24}
            priority
          />
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Oracle Database Tables
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connected to Oracle Database - Showing all available tables
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Database Tables
            </h2>
            <button
              onClick={fetchTables}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">
                Please check your Oracle database connection settings in .env.local
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading tables...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tables.length > 0 ? (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="font-medium text-black dark:text-white">
                      Found {tables.length} table{tables.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tables.map((table, index) => (
                        <div
                          key={index}
                          className="p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600"
                        >
                          <p className="font-mono text-sm text-black dark:text-white">
                            {table}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      No tables found in the connected Oracle database.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
