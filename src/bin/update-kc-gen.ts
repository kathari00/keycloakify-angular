import type { BuildContext } from './core';
import * as fs from 'fs';
import { join as pathJoin } from 'path';

export function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;

    const filePath = pathJoin(buildContext.themeSrcDirPath, 'kc.gen.ts');

    const currentContent = fs.existsSync(filePath)
        ? fs.readFileSync(filePath)
        : undefined;

    const implementedThemeTypes = (['login', 'account'] as const).filter(
        themeType => buildContext.implementedThemeTypes[themeType].isImplemented
    );

    const newContent = Buffer.from(
        [
            `/* prettier-ignore-start */`,
            ``,
            `/* eslint-disable */`,
            ``,
            `// noinspection JSUnusedGlobalSymbols`,
            ``,
            `// This file is auto-generated by Keycloakify`,
            ``,
            `import type { ComponentRef, EnvironmentProviders, Type } from "@angular/core";`,
            ``,
            `export type ThemeName = ${buildContext.themeNames.map(themeName => `"${themeName}"`).join(' | ')};`,
            ``,
            `export const themeNames: ThemeName[] = [${buildContext.themeNames.map(themeName => `"${themeName}"`).join(', ')}];`,
            ``,
            `export type KcEnvName = ${buildContext.environmentVariables.length === 0 ? 'never' : buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(' | ')};`,
            ``,
            `export const kcEnvNames: KcEnvName[] = [${buildContext.environmentVariables.map(({ name }) => `"${name}"`).join(', ')}];`,
            ``,
            `export const kcEnvDefaults: Record<KcEnvName, string> = ${JSON.stringify(
                Object.fromEntries(
                    buildContext.environmentVariables.map(
                        ({ name, default: defaultValue }) => [name, defaultValue]
                    )
                ),
                null,
                2
            )};`,
            ``,
            `export type KcContext =`,
            ...implementedThemeTypes.map(
                themeType => `    | import("./${themeType}/KcContext").KcContext`
            ),
            `    ;`,
            ``,
            `declare global {`,
            `    interface Window {`,
            `        kcContext?: KcContext;`,
            `    }`,
            `}`,
            ``,
            `type ApplicationRefLike = {`,
            `    components: ComponentRef<any>[];`,
            `};`,
            ``,
            `export async function bootstrapKcApplication(params: {`,
            `    kcContext: KcContext;`,
            `    bootstrapApplication: (params: {`,
            `        KcRootComponent: Type<unknown>;`,
            `        kcProvider: EnvironmentProviders;`,
            `    }) => Promise<ApplicationRefLike>;`,
            `}) {`,
            `    const { kcContext, bootstrapApplication } = params;`,
            ``,
            `    switch (kcContext.themeType) {`,
            ...(['login', 'account'] as const)
                .filter(
                    themeType =>
                        buildContext.implementedThemeTypes[themeType].isImplemented
                )
                .map(themeType => [
                    `        case "${themeType}":`,
                    `            {`,
                    `                const [`,
                    `                    { provideKeycloakifyAngular },`,
                    `                    { getI18n },`,
                    `                    {`,
                    `                        PageComponent,`,
                    `                        TemplateComponent,`,
                    `                        doUseDefaultCss,`,
                    `                        classes,`,
                    ...(themeType === 'login'
                        ? [
                              `                        UserProfileFormFieldsComponent,`,
                              `                        doMakeUserConfirmPassword,`
                          ]
                        : []),
                    `                    },`,
                    `                ] = await Promise.all([`,
                    `                    import('@keycloakify/angular/login/providers/keycloakify-angular'),`,
                    `                    import('./${themeType}/i18n'),`,
                    `                    import('./${themeType}/KcPage').then(({ getKcPage }) => getKcPage(kcContext.pageId)),`,
                    `                ] as const);`,
                    ``,
                    `                const appRef = await bootstrapApplication({`,
                    `                    KcRootComponent: TemplateComponent,`,
                    `                    kcProvider: provideKeycloakifyAngular({`,
                    `                        kcContext,`,
                    `                        classes,`,
                    `                        getI18n,`,
                    `                        doUseDefaultCss,`,
                    ...(themeType === 'login'
                        ? [`                        doMakeUserConfirmPassword,`]
                        : []),
                    `                    })`,
                    `                });`,
                    ``,
                    `                appRef.components.forEach(componentRef => {`,
                    `                    if ("page" in componentRef.instance) {`,
                    `                        componentRef.setInput("page", PageComponent);`,
                    `                    }`,
                    ...(themeType === 'login'
                        ? [
                              `                    if ("userProfileFormFields" in componentRef.instance) {`,
                              `                        componentRef.setInput(`,
                              `                            "userProfileFormFields",`,
                              `                            UserProfileFormFieldsComponent`,
                              `                        );`,
                              `                    }`
                          ]
                        : []),
                    `                });`,
                    `            }`,
                    `            break;`
                ])
                .flat(),
            `    }`,
            `}`,
            ``,
            `/* prettier-ignore-end */`,
            ``
        ].join('\n'),
        'utf8'
    );

    if (currentContent !== undefined && currentContent.equals(newContent)) {
        return;
    }

    fs.writeFileSync(filePath, newContent);
}
