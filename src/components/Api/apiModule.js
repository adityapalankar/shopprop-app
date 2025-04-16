// api.js
let apiModule;

if (process.env.NODE_ENV === 'production') {
  apiModule = import('../Api/prodApi');
} else {
  apiModule = import('../Api/betaApi');
}

export default apiModule;
