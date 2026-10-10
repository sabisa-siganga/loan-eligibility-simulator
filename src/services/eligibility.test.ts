import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  checkEligibility,
  ELIGIBILITY_CHECK_FAILED_MESSAGE,
  getEligibilityCheckUrl,
} from './eligibility';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('checkEligibility', () => {
  it('posts to the configured API URL and returns a successful result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, requestId: 7 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await checkEligibility({ requestId: 7 });

    expect(fetchMock).toHaveBeenCalledWith(
      getEligibilityCheckUrl(),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ requestId: 7 }),
      }),
    );
    expect(result).toEqual({ ok: true, requestId: 7 });
  });

  it('returns a structured failure when the API responds with ok false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: false,
          requestId: 3,
          message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
        }),
      }),
    );

    const result = await checkEligibility({ requestId: 3 });

    expect(result).toEqual({
      ok: false,
      requestId: 3,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('maps non-OK HTTP responses to the failed eligibility message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server' }),
      }),
    );

    const result = await checkEligibility({ requestId: 2 });

    expect(result).toEqual({
      ok: false,
      requestId: 2,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('rethrows AbortError when the request is aborted', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));

    await expect(checkEligibility({ requestId: 1 })).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('maps network failures to the failed eligibility message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const result = await checkEligibility({ requestId: 9 });

    expect(result).toEqual({
      ok: false,
      requestId: 9,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('maps invalid JSON bodies to the failed eligibility message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      }),
    );

    const result = await checkEligibility({ requestId: 4 });

    expect(result).toEqual({
      ok: false,
      requestId: 4,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('returns the API failure body when a non-OK response includes ok false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          ok: false,
          requestId: 5,
          message: 'Eligibility unavailable for this request.',
        }),
      }),
    );

    const result = await checkEligibility({ requestId: 5 });

    expect(result).toEqual({
      ok: false,
      requestId: 5,
      message: 'Eligibility unavailable for this request.',
    });
  });

  it('maps a successful HTTP response with an invalid body to the failed message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ requestId: 6 }),
      }),
    );

    const result = await checkEligibility({ requestId: 6 });

    expect(result).toEqual({
      ok: false,
      requestId: 6,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('maps a null JSON body to the failed eligibility message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => null,
      }),
    );

    const result = await checkEligibility({ requestId: 8 });

    expect(result).toEqual({
      ok: false,
      requestId: 8,
      message: ELIGIBILITY_CHECK_FAILED_MESSAGE,
    });
  });

  it('strips a trailing slash from VITE_API_BASE_URL when building the check URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');

    expect(getEligibilityCheckUrl()).toBe('https://api.example.com/eligibility-check');

    vi.unstubAllEnvs();
  });
});
