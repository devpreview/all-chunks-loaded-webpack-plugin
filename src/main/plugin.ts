import { Compiler as WebpackCompiler } from "webpack";

export interface AllChunksLoadedWebpackPluginOptions {
    callback: string;
}

export default class AllChunksLoadedWebpackPlugin {

    public constructor(protected options: AllChunksLoadedWebpackPluginOptions) {
        if (!options.callback) {
            throw new Error('Missing required callback option');
        }
    }

    public apply(compiler: WebpackCompiler): void {
        compiler.plugin('compilation', (compilation) => {
            compilation.plugin('html-webpack-plugin-alter-asset-tags', (data: any, next: (err: Error | null, data: any) => void) => {
                next(null, this.makeLoadedCallback(compilation, data));
            });
        });
    }

    public makeLoadedCallback(compilation: any, data: any): any {
        let chunksFiles = new Map<string, string[]>();
        let chunks = new Map<string, string[]>();
        for (let chunk of data.chunks) {
            for (let name of chunk.names) {
                if (!chunks.has(name)) {
                    chunks.set(name, []);
                }
                chunks.set(name, chunks.get(name).concat(chunk.files));
            }
        }
        const publicPath = compilation.options.output.publicPath || '';
        const addOnload = function (filename: string, tag: any) {
            let fname = filename.substring(publicPath.length);
            if (fname.startsWith('/')) {
                fname = fname.substring(1);
            }
            for (let [chunk, files] of chunks) {
                if (files.indexOf(fname) > -1) {
                    if (!chunksFiles.has(chunk)) {
                        chunksFiles.set(chunk, []);
                    }
                    if (chunksFiles.get(chunk).indexOf(filename) === -1) {
                        let _chunksFiles = chunksFiles.get(chunk);
                        _chunksFiles.push(filename);
                        chunksFiles.set(chunk, _chunksFiles);
                    }
                    tag.attributes.onload = tag.attributes.onload ? tag.attributes.onload : '';
                    tag.attributes.onload += "this.onload=null;allChunksLoadedWebpackPlugin('" + chunk + "', '" + filename + "');";
                    break;
                }
            }
        };
        for (let tag of [].concat(data.head, data.body)) {
            if (tag.tagName === 'script' && tag.attributes && tag.attributes.src) {
                addOnload(tag.attributes.src, tag);
            }
            if (tag.tagName === 'link' && tag.attributes && tag.attributes.href) {
                if (tag.attributes.rel === 'stylesheet' || tag.attributes.as === 'style') {
                    addOnload(tag.attributes.href, tag);
                }
            }
        }
        let allFiles: string[] = [];
        for (let files of chunksFiles.values()) {
            allFiles = allFiles.concat(files);
        }
        let loadedScript = 'var allChunksLoadedWebpackPluginLoadedFiles = [];\n' +
            'function allChunksLoadedWebpackPlugin(chunk, file) {\n' +
            '    var allFiles = [' + allFiles.map(val => '\'' + val + '\'').join(',') + '];\n' +
            '    if (allChunksLoadedWebpackPluginLoadedFiles.indexOf(file) === -1) {\n' +
            '        allChunksLoadedWebpackPluginLoadedFiles.push(file);\n' +
            '    if (allChunksLoadedWebpackPluginLoadedFiles.length === allFiles.length) {\n' +
            '    setTimeout(function(){' + this.options.callback + '},0);' +
            '    }\n' +
            '    }\n' +
            '}';
        data.head = [{
            tagName: 'script',
            attributes: {type: 'text/javascript'},
            closeTag: true,
            innerHTML: loadedScript
        }].concat(data.head);
        return data;
    }

}
