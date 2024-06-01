import { put, debounce, spawn, retry, takeLatest, cancel, fork } from 'redux-saga/effects';
import {
  resetSkills,
  searchSkillsRequest,
  searchSkillsSuccess,
  searchSkillsFailure,
} from '../actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../actions/actionTypes';

function filterChangeSearchAction({ type }) {
  return type === CHANGE_SEARCH_FIELD;
}

function* handleChangeSearchSaga(action) {
  yield put(searchSkillsRequest(action.payload.search));
}

function* watchChangeSearchSaga() {
  yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

const searchSkills = async (search) => {
  const params = new URLSearchParams({ q: search });
  const response = await fetch(`${process.env.REACT_APP_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

// worker
function* handleSearchSkillsSaga(action) {
  try {
    const retryCount = 3;
    const retryDelay = 1000;
    const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
    yield put(searchSkillsSuccess(data));
  } catch (e) {
    yield put(searchSkillsFailure(e.message));
  }
}

/**
 * Check request string and send search request if it's not empty
 * Reset skill list if request string is empty
 * NOTE: It's possible to cancel task only inside the same detached task(spawn)
 * So check of search string must be performed on the same level:
 * at watchSearchSkillsSaga() instead of watchChangeSearchSaga()
 */
function* handleSearchSkillsRequest(action) {
  let task = null;

  if (action.payload.search.trim() === '') {
    if (task) {
      yield cancel(task);
    }

    yield put(resetSkills());
  } else {
    task = yield fork(handleSearchSkillsSaga, action);
  }
}

// watcher
function* watchSearchSkillsSaga() {
  yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsRequest);
}

export default function* saga() {
  yield spawn(watchChangeSearchSaga);
  yield spawn(watchSearchSkillsSaga);
}
