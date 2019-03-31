import React, { useEffect, useState } from 'react';
import { useHoux } from 'houx';
import Heading from '../../common/Heading';
import TextInput from '../../common/textInput/TextInput';
import SearchInputForm from './SearchInputForm';
import MoviesList from '../../common/moviesList/MoviesList';
import { findSetPagination, findSetSearchText } from '../../flux/actions/find';
import { requestApi, requestError } from '../../flux/actions/requests';
import { requestsIds } from '../../flux/reducers/requests';
import config from '../../config';

const Find = () => {
  const { state, dispatch } = useHoux();
  const { searchText, pagination } = state.find;
  const { responseData, hadError } = state.requests.search;
  const [isLoading, setIsLoading] = useState(false);
  const isSearchBoxEmpty = searchText.length <= 0;
  let timeout;

  useEffect(() => {
    if (!isSearchBoxEmpty) {
      timeout = setTimeout(() => {
        setIsLoading(true);
        const request = {
          endpoint: '/search/movie',
          queryParameters: {
            query: searchText,
            page: pagination.current,
          },
        };
        dispatch(requestApi(requestsIds.search, request, (responsedData) => {
          setIsLoading(false);
          // eslint-disable-next-line camelcase
          const { errors, total_pages } = responsedData;
          if (errors) {
            return dispatch(requestError(requestsIds.search, errors));
          }
          return dispatch(findSetPagination({ total: total_pages }));
        }));
      }, config.find.fetchDelayMs);
    }
  }, [searchText, pagination.current]);

  const onPageChange = (pageNumber) => {
    setIsLoading(true);
    dispatch(findSetPagination({ current: pageNumber }));
  };

  const onSearchInputChange = (event) => {
    clearTimeout(timeout);
    const newValue = event.target.value;
    if (newValue.length > 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    dispatch(findSetPagination({ current: 1 }));
    dispatch(findSetSearchText(newValue));
  };

  return (
    <>
      <Heading>
        {'Find movies'}
      </Heading>
      <SearchInputForm>
        <TextInput
          onChange={onSearchInputChange}
          placeholder="Search for a movie..."
          label="Search"
          value={searchText}
        />
      </SearchInputForm>
      <MoviesList
        totalPages={pagination.total}
        onPageChange={onPageChange}
        currentPage={pagination.current}
        isLoading={isLoading}
        isError={hadError}
        movies={responseData.results}
      />
    </>
  );
};

export default Find;
