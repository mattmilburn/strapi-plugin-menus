import { useState, useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';

import { axiosInstance } from '../../utils'; // CUSTOM MOD [2].

import { normalizeRelations } from './utils'; // CUSTOM MOD [6].

export const useRelation = (cacheKey, { name, relation, search, hasLoaded }) => { // CUSTOM MOD [18].
  const [searchParams, setSearchParams] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  /**
   * This runs in `useInfiniteQuery` to actually fetch the data
   */
  const fetchRelations = async ({ pageParam = 1 }) => {
    try {
      const { data } = await axiosInstance.get(relation?.endpoint, {
        params: {
          ...(relation.pageParams ?? {}),
          page: pageParam,
        },
      });

      setCurrentPage(pageParam);

      return data;
    } catch (err) {
      return null;
    }
  };

  const fetchSearch = async ({ pageParam = 1 }) => {
    try {
      const { data } = await axiosInstance.get(search.endpoint, {
        params: {
          ...(search.pageParams ?? {}),
          ...searchParams,
          page: pageParam,
        },
      });

      return data;
    } catch (err) {
      return null;
    }
  };

  const { onLoad: onLoadRelationsCallback, normalizeArguments = {} } = relation;

  const relationsRes = useInfiniteQuery(['relation', cacheKey], fetchRelations, {
    cacheTime: 0,
    enabled: relation.enabled && ! hasLoaded, // CUSTOM MOD [18].
    /**
     * @type {(lastPage:
     * | { data: null }
     * | { results: any[],
     *     pagination: {
     *      page: number,
     *      pageCount: number,
     *      pageSize: number,
     *      total: number
     *     }
     *   }
     * ) => number}
     */
    getNextPageParam(lastPage) {
      const isXToOneRelation = !lastPage?.pagination;

      if (
        !lastPage || // the API may send an empty 204 response
        isXToOneRelation || // xToOne relations do not have a pagination
        lastPage?.pagination.page >= lastPage?.pagination.pageCount
      ) {
        return undefined;
      }

      // eslint-disable-next-line consistent-return
      return lastPage.pagination.page + 1;
    },
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => {
        if (!page) {
          return page;
        }

        const { data, results, pagination } = page;
        const isXToOneRelation = !!data;
        let normalizedResults = [];

        // xToOne relations return an object, which we normalize so that relations
        // always have the same shape
        if (isXToOneRelation) {
          normalizedResults = [data];
        } else if (results) {
          normalizedResults = [...results].reverse();
        }

        return {
          pagination,
          results: normalizedResults,
        };
      }),
    }),
  });

  const { pageGoal } = relation;

  const { status, data, fetchNextPage, hasNextPage } = relationsRes;

  useEffect(() => {
    /**
     * This ensures the infiniteQuery hook fetching has caught-up with the modifiedData
     * state i.e. in circumstances where you add 10 relations, the browserState knows this,
     * but the hook would think it could fetch more, when in reality, it can't.
     */
    if (pageGoal > currentPage && hasNextPage && status === 'success') {
      fetchNextPage({
        pageParam: currentPage + 1,
      });
    }
  }, [pageGoal, currentPage, fetchNextPage, hasNextPage, status]);

  useEffect(() => {
    if (status === 'success' && data && data.pages?.at(-1)?.results && onLoadRelationsCallback) {
      // everytime we fetch, we normalize prior to adding to redux
      const normalizedResults = normalizeRelations(data.pages.at(-1).results, normalizeArguments);

      // this is loadRelation from EditViewDataManagerProvider
      onLoadRelationsCallback({
        target: { name, value: normalizedResults },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, name, data]); // CUSTOM MOD [13].

  const searchRes = useInfiniteQuery(
    ['relation', cacheKey, 'search', JSON.stringify(searchParams)],
    fetchSearch,
    {
      enabled: Object.keys(searchParams).length > 0,
      /**
       * @type {(lastPage:
       * | { data: null }
       * | { results: any[],
       *     pagination: {
       *      page: number,
       *      pageCount: number,
       *      pageSize: number,
       *      total: number
       *     }
       *   }
       * ) => number}
       */
      getNextPageParam(lastPage) {
        if (!lastPage?.pagination || lastPage.pagination.page >= lastPage.pagination.pageCount) {
          return undefined;
        }

        // eslint-disable-next-line consistent-return
        return lastPage.pagination.page + 1;
      },
    }
  );

  const searchFor = (term, options = {}) => {
    setSearchParams({
      ...options,
      _q: term,
    });
  };

  return { relations: relationsRes, search: searchRes, searchFor };
};
