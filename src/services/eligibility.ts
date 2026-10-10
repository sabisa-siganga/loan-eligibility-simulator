export type EligibilityCheckRequest = {
  requestId: number;
};

export type EligibilityCheckResult =
  { ok: true; requestId: number } | { ok: false; requestId: number; message: string };

type CheckEligibilityOptions = {
  signal?: AbortSignal;
};

export const ELIGIBILITY_CHECK_FAILED_MESSAGE = 'We could not check eligibility. Please try again.';

export const ELIGIBILITY_CHECK_PATH = '/eligibility-check';

const getApiBaseUrl = (): string => {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (typeof base === 'string' && base.length > 0) {
    return base.replace(/\/$/, '');
  }
  return '/api';
};

export const getEligibilityCheckUrl = (): string => `${getApiBaseUrl()}${ELIGIBILITY_CHECK_PATH}`;

const isEligibilityCheckResult = (value: unknown): value is EligibilityCheckResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.requestId !== 'number') {
    return false;
  }

  if (record.ok === true) {
    return true;
  }

  if (record.ok === false && typeof record.message === 'string') {
    return true;
  }

  return false;
};

export const checkEligibility = async (
  request: EligibilityCheckRequest,
  options: CheckEligibilityOptions = {},
): Promise<EligibilityCheckResult> => {
  let response: Response;

  try {
    response = await fetch(getEligibilityCheckUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId: request.requestId }),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    return {
      ok: false,
      requestId: request.requestId,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      requestId: request.requestId,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    };
  }

  if (!response.ok) {
    if (isEligibilityCheckResult(body) && body.ok === false) {
      return body;
    }

    return {
      ok: false,
      requestId: request.requestId,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    };
  }

  if (!isEligibilityCheckResult(body)) {
    return {
      ok: false,
      requestId: request.requestId,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    };
  }

  return body;
};
