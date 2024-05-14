import { pathToFileURL } from 'node:url'
import path from 'node:path'
import process from 'node:process'
import { createRequire } from 'node:module'

/**
 * @zh 根据提供的插件名称异步加载插件模块。
 * @en Asynchronously loads a plugin module based on the provided plugin name.
 *
 * @param {string} pluginName - 要加载的插件的名称。
 * @return {Promise<[string, T]>} 解析为包含插件名称和加载的插件的元组的 promise。
 */
export async function load<T = any>(pluginName: string): Promise<[string, T]> {
  let plugin = null
  try {
    const module = await import(pluginName)
    plugin = module.default
  }
  catch (err) {
    try {
      const module = await import(path.join(process.cwd(), pluginName))
      plugin = module.default
    }
    catch (err) {
      // NOTE 在某些情况下或测试中，我们可能需要支持旧版“require.resolve”
      const require = createRequire(process.cwd())
      const module = await import(
        pathToFileURL(
          require.resolve(pluginName, { paths: [process.cwd()] }),
        ).toString()
      )
      plugin = module.default
    }
  }
  return [getPluginName(pluginName), plugin]
}

/**
 * @zh 根据提供的插件名称进行修正。
 * @en Fixed according to the plugin name provided.
 *
 * @param {string} pluginName - 插件的名称。
 * @return {string} 修正后的插件名称
 */
export function getPluginName(pluginName: string): string {
  if (pluginName.startsWith('.'))
    return path.parse(pluginName).name

  return pluginName
}
