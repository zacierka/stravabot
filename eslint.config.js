const js = require('@eslint/js');

modules.exports = [
	js.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 'latest',
		},
		rules: {
            semi: ['error', 'always'],
            indent: ['error', 'tab'],
		},
	},
];