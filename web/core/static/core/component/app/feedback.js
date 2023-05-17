import {createElement as r, Fragment} from 'react';
import {useRouteError} from 'react-router-dom';

// export function Loading() {
// 	return (
// 		r('p',{},'Loading...')
// 	);
// }

export function Router_Error() {
	const error = useRouteError();
	console.error(error);
	return (
		r('p',{}, error.statusText || error.message)
	);
}

// export function GQL_Error(p) {
// 	console.error(p.message);
// 	return (
// 		r(Fragment, {},
// 			r('p', {}, 'GQL Error'),
// 			r('p',{}, p.message)
// 		)
// 	);
// }

export function Query_Status({message}) {
	//console.error(message);
	return (
		r('p',{}, message)
	);
}