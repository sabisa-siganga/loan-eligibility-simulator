import { delay, http, HttpResponse } from 'msw';
import { ELIGIBILITY_CHECK_FAILED_MESSAGE, ELIGIBILITY_CHECK_PATH } from '../services/eligibility';
import { MOCK_ELIGIBILITY_FAIL_STORAGE_KEY } from './constants';

const DEFAULT_MOCK_DELAY_MS = 500;

type EligibilityCheckBody = {
  requestId?: unknown;
};

export const handlers = [
  http.post(`*${ELIGIBILITY_CHECK_PATH}`, async ({ request }) => {
    await delay(DEFAULT_MOCK_DELAY_MS);

    let body: EligibilityCheckBody = {};
    try {
      body = (await request.json()) as EligibilityCheckBody;
    } catch {
      body = {};
    }

    const requestId = typeof body.requestId === 'number' ? body.requestId : 0;
    const shouldFail =
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem(MOCK_ELIGIBILITY_FAIL_STORAGE_KEY) === '1';

    if (shouldFail) {
      return HttpResponse.json(
        {
          ok: false,
          requestId,
          message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
        },
        { status: 500 },
      );
    }

    return HttpResponse.json({ ok: true, requestId });
  }),
];
