import { Compiler as WebpackCompiler } from "webpack";
import { Callback } from "./callback";

export interface AllChunksLoadedWebpackPluginOptions {
    callback: string;
    errorCallback?: string;
    chunks?: string[];
    excludeChunks?: string[];
}

export default class AllChunksLoadedWebpackPlugin {

    public constructor(protected options: AllChunksLoadedWebpackPluginOptions) {
        if (!options.callback) {
            throw new Error('Missing required callback option');
        }
    }

    public apply(compiler: WebpackCompiler): void {
        if (compiler.hooks == undefined) {
            // Webpack 3
            compiler.plugin('compilation', (compilation) => {
                compilation.plugin('html-webpack-plugin-alter-asset-tags', (data: any, next: (err: Error | null, data: any) => void) => {
                    let cb = new Callback(this.options, compilation.options.output.publicPath || '');
                    next(null, cb.makeLoadedCallback(data));
                });
            });
        } else {
            // Webpack 4
            compiler.hooks.compilation.tap("AsyncStylesheetWebpackPlugin", (compilation: any) => {
                compilation.hooks.htmlWebpackPluginAlterAssetTags.tap("AsyncStylesheetWebpackPlugin", (data: any) => {
                    let cb = new Callback(this.options, compilation.options.output.publicPath || '');
                    return cb.makeLoadedCallback(data);
                });
            });
        }
    }

}
