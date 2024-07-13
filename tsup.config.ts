import clerkJsPackage from '@clerk/clerk-js/package.json' with { type: 'json' };
import { defineConfig } from 'tsup';
import * as preset from 'tsup-preset-solid';
import thisPackage from './package.json' with { type: 'json' };

export default defineConfig((config) => {
  const watching = !!config.watch;
  const shouldPublish = !!config.env?.publish;

  const parsed = preset.parsePresetOptions(
    {
      entries: [
        {
          entry: 'src/index.tsx',
          server_entry: true
        },
        {
          name: 'errors',
          entry: 'src/errors.ts'
        },
        {
          name: 'server',
          entry: 'src/server/index.ts'
        }
      ],
      modify_esbuild_options: (options) => ({
        ...options,
        define: {
          ...options.define,
          PACKAGE_NAME: `"${thisPackage.name}"`,
          PACKAGE_VERSION: `"${thisPackage.version}"`,
          JS_PACKAGE_VERSION: `"${clerkJsPackage.version}"`,
          __DEV__: `${watching}`
        }
      }),
      drop_console: !watching,
      cjs: true
    },
    watching
  );

  if (!watching) {
    const packageFields = preset.generatePackageExports(parsed);
    preset.writePackageJson(packageFields);
  }

  const options = preset.generateTsupOptions(parsed);
  if (shouldPublish && options.at(-1)) {
    options[options.length - 1].onSuccess = 'bun run publish:local';
  }

  return options;
});
