declare module 'npminstall' {
  interface Pkg {
    name: string
    version: string
  }
  interface InstallOptions {
    // install root dir
    root?: string
    // optional packages need to install, default is package.json's dependencies and devDependencies
    pkgs?: Pkg[]
    // install to specific directory, default to root
    targetDir?: string
    // link bin to specific directory (for global install)
    binDir?: string
    // registry, default is https://registry.npmjs.org
    registry?: string
    debug?: boolean
    storeDir?: string
    ignoreScripts?: boolean // ignore pre/post install scripts, default is `false`
    // forbiddenLicenses: forbit install packages which used these licenses
  }

type NpminstallFunction = (options: InstallOptions, context?: any) => Promise<void>

const npminstall: NpminstallFunction

export default npminstall
}
