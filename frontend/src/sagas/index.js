import { put, debounce, spawn, retry, takeLatest, cancel, fork, call, cancelled } from 'redux-saga/effects';
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

function* handleSearchRequestSaga(search) {
  console.log('handleSearchRequestSaga() ', search);
  try {
    //yield call(searchSkillsRequest, search);
    yield put(searchSkillsRequest(search));
  } finally {
    console.log('handleSearchRequestSaga finally');
    if (yield cancelled()) {
      console.log('handleSearchRequestSaga cancelled');
    }
  }

}

let task = null;
function* handleChangeSearchSaga(action) {

  console.log('handleChangeSearchSaga() ', action);
  if (action.payload.search.trim() === '') {
    if (task) {
      console.log('cancel task isrunning? ', task.isRunning());
      yield cancel(task);
    }

    console.log('put resetSkills');
    yield put(resetSkills());
  } else {
    console.log('put searchSkillsRequest');
    task = yield fork(handleSearchRequestSaga, action.payload.search);
  }
}

function* watchChangeSearchSaga() {
  yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

/*
const searchSkills = async (search) => {
  const params = new URLSearchParams({ q: search });
  const response = await fetch(`${process.env.REACT_APP_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await response.json();
};
*/

const searchSkills = (search) => {
  const params = new URLSearchParams({ q: search });
  const responsePromise = fetch(`${process.env.REACT_APP_SEARCH_URL}?${params}`);

  return responsePromise.then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  });

};

// worker
function* handleSearchSkillsSaga(action) {
  try {
    const retryCount = 3;
    const retryDelay = 1 * 1000; // ms
    const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
    yield put(searchSkillsSuccess(data));
  } catch (e) {
    console.log('handleSearchSkillsSaga() catch');
    yield put(searchSkillsFailure(e.message));
  } finally {
    console.log('handleSearchSkillsSaga() finally');
    if (yield cancelled()) {
      console.log('handleSearchSkillsSaga() cancelled');
    }
  }
}

// watcher
function* watchSearchSkillsSaga() {
  try {
    yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
  } catch (e) {
    console.log('CATCH');
  } finally {
    console.log('FINNALY');
    if (yield cancelled()) {
      console.log('CANCELLED');
    }
  }
}

export default function* saga() {
  yield spawn(watchChangeSearchSaga);
  yield spawn(watchSearchSkillsSaga);
}
