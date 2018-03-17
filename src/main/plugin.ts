import { Compiler as WebpackCompiler } from "webpack";

export interface AllChunksLoadedWebpackPluginOptions {
    callback: string;
}

export default class AllChunksLoadedWebpackPlugin {

    protected publicPath: string = '';
    protected chunksFiles = new Map<string, string[]>();
    protected chunks = new Map<string, string[]>();

    public constructor(protected options: AllChunksLoadedWebpackPluginOptions) {
        if (!options.callback) {
            throw new Error('Missing required callback option');
        }
    }

    public apply(compiler: WebpackCompiler): void {
        compiler.plugin('compilation', (compilation) => {
            this.publicPath = compilation.options.output.publicPath || '';
            compilation.plugin('html-webpack-plugin-alter-asset-tags', (data: any, next: (err: Error | null, data: any) => void) => {
                next(null, this.makeLoadedCallback(data));
            });
        });
    }

    public makeLoadedCallback(data: any): any {
        for (let chunk of data.chunks) {
            for (let name of chunk.names) {
                if (!this.chunks.has(name)) {
                    this.chunks.set(name, []);
                }
                this.chunks.set(name, this.chunks.get(name).concat(chunk.files));
            }
        }
        for (let tag of [].concat(data.head, data.body)) {
            if (tag.tagName === 'script' && tag.attributes && tag.attributes.src) {
                this.addOnload(tag.attributes.src, tag);
            }
            if (tag.tagName === 'link' && tag.attributes && tag.attributes.href) {
                if (tag.attributes.rel === 'stylesheet' || tag.attributes.as === 'style') {
                    this.addOnload(tag.attributes.href, tag);
                }
            }
        }
        data.head = [{
            tagName: 'script',
            attributes: {type: 'text/javascript'},
            closeTag: true,
            innerHTML: this.getLoadedScript()
        }].concat(data.head);
        return data;
    }

    protected addOnload(filename: string, tag: any): void {
        let fname = filename.substring(this.publicPath.length);
        if (fname.startsWith('/')) {
            fname = fname.substring(1);
        }
        for (let [chunk, files] of this.chunks) {
            if (files.indexOf(fname) > -1) {
                if (!this.chunksFiles.has(chunk)) {
                    this.chunksFiles.set(chunk, []);
                }
                if (this.chunksFiles.get(chunk).indexOf(filename) === -1) {
                    let _chunksFiles = this.chunksFiles.get(chunk);
                    _chunksFiles.push(filename);
                    this.chunksFiles.set(chunk, _chunksFiles);
                }
                tag.attributes.onload = tag.attributes.onload ? tag.attributes.onload : '';
                tag.attributes.onload += "this.onload=null;allChunksLoadedWebpackPlugin('" + chunk + "', '" + filename + "');";
                break;
            }
        }
    }

    protected getLoadedScript(): string {
        let allFiles: string[] = [];
        for (let files of this.chunksFiles.values()) {
            allFiles = allFiles.concat(files);
        }
        let loadedScript = 'var allChunksLoadedWebpackPluginLoadedFiles = [];' +
            'function allChunksLoadedWebpackPlugin(chunk, file) {' +
            'var allFiles = [' + allFiles.map(val => '\'' + val + '\'').join(',') + '];' +
            'if(allChunksLoadedWebpackPluginLoadedFiles.indexOf(file) === -1){' +
            'allChunksLoadedWebpackPluginLoadedFiles.push(file);' +
            'if(allChunksLoadedWebpackPluginLoadedFiles.length === allFiles.length){' +
            'setTimeout(function(){' + this.options.callback + '},0);' +
            '}' +
            '}' +
            '}';
        return loadedScript;
    }

}
