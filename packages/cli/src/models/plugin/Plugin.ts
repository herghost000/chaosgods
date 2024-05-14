// export default class Plugin {
//   public static isEnabled() {
//     return true
//   }

//   public static disablePlugin() {
//     return null
//   }

//   constructor({ namespace, options = {}, container = {} } = {}) {
//     this.namespace = namespace
//     this.options = Object.freeze(this.getInitialOptions(options, namespace))
//     this.context = {}
//     this.config = container.config
//     this.log = container.log
//     this.shell = container.shell
//     this.spinner = container.spinner
//     this.prompt = container.prompt
//     this.debug = debug(`release-it:${namespace}`)
//   }

//   public getInitialOptions(options, namespace) {
//     return options[namespace] || {}
//   }

//   public init() {}
//   public getName() {}
//   public getLatestVersion() {}
//   public getChangelog() {}
//   public getIncrement() {}
//   public getIncrementedVersionCI() {}
//   public getIncrementedVersion() {}
//   public beforeBump() {}
//   public bump() {}
//   public beforeRelease() {}
//   public release() {}
//   public afterRelease() {}

//   public getContext(path) {
//     const context = _.merge({}, this.options, this.context)
//     return path ? _.get(context, path) : context
//   }

//   public setContext(context) {
//     _.merge(this.context, context)
//   }

//   public exec(command, { options, context = {} } = {}) {
//     const ctx = Object.assign(context, this.config.getContext(), { [this.namespace]: this.getContext() })
//     return this.shell.exec(command, options, ctx)
//   }

//   public registerPrompts(prompts) {
//     this.prompt.register(prompts, this.namespace)
//   }

//   async showPrompt(options) {
//     options.namespace = this.namespace
//     return this.prompt.show(options)
//   }

//   public step(options) {
//     const context = Object.assign({}, this.config.getContext(), { [this.namespace]: this.getContext() })
//     const opts = Object.assign({}, options, { context })
//     const isException = this.config.isPromptOnlyVersion && ['incrementList', 'publish', 'otp'].includes(opts.prompt)
//     return this.config.isCI && !isException ? this.spinner.show(opts) : this.showPrompt(opts)
//   }
// }
