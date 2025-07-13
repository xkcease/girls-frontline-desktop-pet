export default class SkeletonLoader {
	constructor(path) {
		this.path = path;
		this.loader = new PIXI.loaders.Loader();
	}

	async load (doll) {
		return new Promise((res) => {
			const doll_file_record = doll.file_record;

			this.loader.add(doll_file_record.skel.name, doll_file_record.skel.path, { 'xhrType': 'arraybuffer' });
			this.loader.add(doll_file_record.atlas.name, doll_file_record.atlas.path, { 'xhrTypr': 'text' });
			this.loader.add(doll_file_record.png.name, doll_file_record.png.path, { 'xhrTypr': 'png' });

			this.loader.load((loader, resources) => {
				let rawSkeletonData, rawAtlasData, rawPngData;

				const skel_bin = new SkeletonBinary();
				skel_bin.data = new Uint8Array(resources[doll_file_record.skel.name].data);
				skel_bin.initJson();
				rawSkeletonData = skel_bin.json;

				rawAtlasData = resources[doll_file_record.atlas.name].data;
				rawPngData = resources[doll_file_record.png.name].data;

				const spineAtlas = new PIXI.spine.SpineRuntime.Atlas(rawAtlasData, function (line, callback, pngData = rawPngData) {
					callback(new PIXI.BaseTexture(pngData));
				});

				const spineAtlasParser = new PIXI.spine.SpineRuntime.AtlasAttachmentParser(spineAtlas);
				const spineJsonParser = new PIXI.spine.SpineRuntime.SkeletonJsonParser(spineAtlasParser);
				const skeletonData = spineJsonParser.readSkeletonData(rawSkeletonData, name);

				res(skeletonData);
			});
		})
	}
}
