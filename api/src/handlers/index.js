import * as auth from './auth.js';
import * as ddns from './ddns.js';
import * as pageViews from './pageViews.js'
import * as stream from './stream.js';

export default {
  ...auth,
  ...ddns,
  ...pageViews,
  ...stream
}
