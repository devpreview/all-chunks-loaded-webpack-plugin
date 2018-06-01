import { AllChunksLoadedWebpackPluginOptions } from "./plugin";

export class Callback {

    protected chunksFiles = new Map<string, string[]>();
    protected chunks = new Map<string, string[]>();

    public constructor(
        protected options: AllChunksLoadedWebpackPluginOptions,
        protected publicPath: string
    ) {
    }

    public makeLoadedCallback(data: any): any {
        for (let chunk of data.chunks) {
            for (let name of chunk.names) {
                if (this.options.chunks && this.options.chunks.indexOf(name) == -1) {
                    continue;
                }
                if (this.options.excludeChunks && this.options.excludeChunks.indexOf(name) > -1) {
                    continue;
                }
                if (!this.chunks.has(name)) {
                    this.chunks.set(name, []);
                }
                this.chunks.set(name, this.chunks.get(name).concat(chunk.files));
            }
        }
        for (let tag of [].concat(data.head, data.body)) {
            let chunk = this.getChunk(data.chunks, tag);
            if (chunk == null) {
                continue;
            }
            if (this.options.chunks && this.options.chunks.indexOf(chunk) == -1) {
                continue;
            }
            if (this.options.excludeChunks && this.options.excludeChunks.indexOf(chunk) > -1) {
                continue;
            }
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

    protected getChunk(chunks: any[], tag: any): string | null {
        let src: string = null;
        if (tag.tagName === 'script' && tag.attributes && tag.attributes.src) {
            src = tag.attributes.src;
        }
        if (tag.tagName === 'link' && tag.attributes && tag.attributes.href) {
            src = tag.attributes.href;
        }
        if (!src) {
            return null;
        }
        for (let chunk of chunks) {
            for (let file of chunk.files) {
                if (src.endsWith(file)) {
                    return chunk.id;
                }
            }
        }
        return null;
    }

}
