const SANDBOX_CONFIG = {
  clientId: 'TEST1117080166d89bfae4ebf77c4c8e10807111',
  clientSecret: 'cfsk_ma_test_ad630725a1784cc6e35ba2f5efa4b572_d99f4246',
  apiVersion: '2022-01-01',
  baseUrl: 'https://sandbox.cashfree.com/pg'
};

const PROD_CONFIG = {
  clientId: '1363038ba65597729a5b9dce3ef8303631',
  clientSecret: 'cfsk_ma_prod_d3814c2969ab0a58e9b851b0e0f80223_48a4797d',
  apiVersion: '2022-01-01',
  baseUrl: 'https://api.cashfree.com/pg'
};

// Set to PROD_CONFIG when deploying to production
export const CASHFREE_CONFIG = PROD_CONFIG;
