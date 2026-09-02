import { useEffect, useReducer } from 'react';

interface ObjectUrlState {
  blob: Blob;
  url: string;
}

export function useObjectUrl(blob: Blob | null): string | null {
  const [state, dispatch] = useReducer(
    (_state: ObjectUrlState | null, next: ObjectUrlState) => next,
    null,
  );
  useEffect(() => {
    if (!blob) {
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    dispatch({ blob, url: objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return state !== null && state.blob === blob ? state.url : null;
}
