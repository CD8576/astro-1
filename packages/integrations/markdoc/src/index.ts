import type { AstroIntegration } from 'astro';
import type { InlineConfig } from 'vite';
import _Markdoc from '@markdoc/markdoc';

const contentEntryType = {
	extensions: ['.mdoc'],
	parser: '@astrojs/markdoc/content-type-parser',
};

export default function markdoc(partialOptions: {} = {}): AstroIntegration {
	return {
		name: '@astrojs/markdoc',
		hooks: {
			'astro:config:setup': async ({ updateConfig, config, addContentEntryType, command }: any) => {
				addContentEntryType(contentEntryType);

				console.log('Markdoc working!');
				const markdocConfigUrl = new URL('./markdoc.config.ts', config.srcDir);

				const viteConfig: InlineConfig = {
					plugins: [
						{
							name: '@astrojs/markdoc',
							async transform(code, id) {
								if (!id.endsWith('.mdoc')) return;
								return `import { jsx as h } from 'astro/jsx-runtime';\nimport { Markdoc } from '@astrojs/markdoc';\nimport { Renderer } from '@astrojs/markdoc/components';\nexport const body = ${JSON.stringify(
									code
								)};\nexport function getParsed() { return Markdoc.parse(body); }\nexport async function getTransformed(inlineConfig) {
let config = inlineConfig ?? {};
if (!config) {
	try {
		const importedConfig = await import(${JSON.stringify(markdocConfigUrl.pathname)});
		console.log({ importedConfig })
		config = importedConfig.default.transform;
	} catch {}
}
return Markdoc.transform(getParsed(), config) }\nexport async function Content ({ transformConfig, components }) { return h(Renderer, { content: await getTransformed(transformConfig), components }); }\nContent[Symbol.for('astro.needsHeadRendering')] = true;`;
							},
						},
					],
				};
				updateConfig({ vite: viteConfig });
			},
		},
	};
}

export const Markdoc = _Markdoc;
