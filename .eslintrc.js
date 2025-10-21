module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Disable all unused variable warnings
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-anonymous-default-export': 'off',
    'react/jsx-no-unused-vars': 'off',
    
    // Disable other common warnings
    'no-console': 'off',
    'no-debugger': 'off',
    'prefer-const': 'off',
    'no-var': 'off'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  }
};
