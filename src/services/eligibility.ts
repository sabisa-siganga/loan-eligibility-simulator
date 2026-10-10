export type EligibilityCheckRequest = {
  requestId: number;
};

export type EligibilityCheckResult =
  { ok: true; requestId: number } | { ok: false; requestId: number; message: string };

type CheckEligibilityOptions = {
  delayMs?: number;
  shouldFail?: boolean;
  signal?: AbortSignal;
};

const DEFAULT_DELAY_MS = 500;

export const checkEligibility = async (
  request: EligibilityCheckRequest,
  options: CheckEligibilityOptions = {},
): Promise<EligibilityCheckResult> => {
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;

  await new Promise<void>((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => resolve(), delayMs);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    options.signal?.addEventListener('abort', onAbort, { once: true });
  });

  if (options.shouldFail) {
    return {
      ok: false,
      requestId: request.requestId,
      message: 'We could not check eligibility. Please try again.',
    };
  }

  return { ok: true, requestId: request.requestId };
};
