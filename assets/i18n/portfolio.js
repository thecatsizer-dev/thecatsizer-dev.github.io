import {installLocalization} from './runtime.js';
installLocalization();
import('../analytics/analytics.js').catch(() => {});
