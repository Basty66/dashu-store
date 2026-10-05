import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules', '.vercel'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Inyección SQL: solo SQL con plantillas de Prisma ($queryRaw`...`), que manda los valores como parámetros.
      'no-restricted-properties': [
        'error',
        { property: '$queryRawUnsafe', message: 'Usa $queryRaw`...` (con parámetros) para evitar inyección SQL.' },
        { property: '$executeRawUnsafe', message: 'Usa $executeRaw`...` (con parámetros) para evitar inyección SQL.' },
      ],
    },
  },
]
