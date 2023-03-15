import {createElement as r, Fragment} from 'react';
import {useRouteError} from 'rrd';

export function Loading() {
	return (
		r('p',{},'Loading...')
	);
}

export function Router_Error() {
	const error = useRouteError();
	console.error(error);
	return (
		r('p',{},error.statusText || error.message)
	);
}

export function GQL_Error(p) {
	console.error(p.message);
	return (
		r(Fragment, {},
			r('p', {}, 'GQL Error'),
			r('p',{}, p.message)
		)
	);
}