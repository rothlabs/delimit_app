import {createElement as c, Fragment} from 'react';
import {Container, Form, Row, Col} from 'react-bootstrap';
import {useS, ss, readable} from '../../app.js'

export function Modules(){
    //const repos = useS(d=> d.repo.);
    return(
        c(Col, {},
            'modules'
        )
    )
}