import {createElement as r} from 'react';
import { useRouteError } from 'rrd';

export function Loading() {
  return (
    r('p',{},'Loading...')
  );
}

export function Error_Page() {
  const error = useRouteError();
  console.error(error);
  return (
    r('p',{},error.statusText || error.message)
  );
}