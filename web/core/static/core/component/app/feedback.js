import {createElement as r} from 'react';
import {useRouteError} from 'react-router-dom';

export function Router_Error() {
	const error = useRouteError();
	console.error(error);
	return (
		r('p',{}, error.statusText || error.message)
	);
}