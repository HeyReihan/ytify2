import '../stylesheets/style.css';
import './router';
import './theme';
import './search';
import './superModal';
import './queue';
import './list';
import './library';
import './audioEvents';
import { render } from 'solid-js/web';
import Settings from '../components/Settings';

render(Settings, document.getElementById('settings')!);
