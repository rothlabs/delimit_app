import {createRoot} from 'rdc';
import {createElement as r} from 'react';
import {Main_Navbar} from 'core/navbar.js';

createRoot(document.getElementById('app')).render(r(Main_Navbar));