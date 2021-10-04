blocks = ['yaoi', 'dickgirl', 'futanari', 'scat']
async function DataQuery(query) {
    let res = await fetch('http://choim.in:3001/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            query: query
        })
    });
    return await res.json();
}
async function FilesQuery(query) {
    let res = await fetch('http://choim.in:3001/files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            query: query
        })
    });
    return await res.json();
}
async function RandomGallery() {
    return (await DataQuery("SELECT * FROM galleries ORDER BY random() LIMIT 1"))[0];
}
async function OrderedGallery(offset = 0, limit = 25) {
    return await DataQuery(`SELECT * FROM galleries ORDER BY id DESC LIMIT ${offset},${limit}`);
}
async function OrderedSearch(search, offset = 0, limit = 25) {
    return await OrderedSearchWithTag(search, null, offset, limit);
}
async function OrderedSearchWithTag(search, tagQuery, offset = 0, limit = 25) {
    if (!(search || tagQuery)) return;
    let searchQuery = search ? ` (title LIKE "%${search}%" ${SearchQuery(search)}) OR` : "";
    return await DataQuery(`SELECT * FROM galleries WHERE${searchQuery}${tagQuery}ORDER BY id DESC LIMIT ${offset},${limit}`);
}
function SearchQuery(search) {
    return search.split().map(x => ` OR artist LIKE '%${x}%' `).join('');
}
function TagSearchQuery(tags) {
    if (tags[0].rowid)
        tags = tags.map(x => x.rowid);
    return tags.map(x => ` (tag_ids LIKE '%,${x},%' OR tag_ids LIKE '${x},%' OR tag_ids LIKE '%,${x}') `).join('AND');
}
async function CreateTagAutocomplete(tag) {
    let datalist = document.getElementById("tag-recommend");
    if (!datalist){
        datalist = document.createElement("datalist");
        datalist.id = "tag-recommend"
        document.body.appendChild(datalist);
    }
    tags = await SearchTags(tag);
    [...datalist.childNodes].map(x => x.remove());
    for (let tag of tags){
        let option = document.createElement("option");
        option.value = tag.full;
        datalist.appendChild(option);
    }
}
async function SearchTags(tag, offset = 0, limit = 25) {
    return await DataQuery(`SELECT oid, * FROM tags WHERE full LIKE "%${tag}%" LIMIT ${offset},${limit}`);
}
async function GetGallery(id) {
    return (await DataQuery(`SELECT * FROM galleries WHERE id=${id}`))[0];
}
async function GetTag(id) {
    return (await DataQuery(`SELECT * FROM tags WHERE oid=${id}`))[0];
}
async function GetTagByFull(full) {
    return (await DataQuery(`SELECT oid, * FROM tags WHERE full='${full}'`))[0];
}
async function GetFile(id) {
    return (await FilesQuery(`SELECT * FROM files WHERE oid=${id}`))[0];
}
async function GetFullData(id) {
    let gallery = await GetGallery(id);
    if (gallery == undefined)
        return undefined;
    //let tags = gallery.tag_ids.split(',').map(x => parseInt(x));
    let tags = await DataQuery(`SELECT * FROM tags WHERE oid in (${gallery.tag_ids})`);
    let files = await FilesQuery(`SELECT * FROM files WHERE oid in (${gallery.file_ids})`);
    return {
        info: gallery,
        tags: tags,
        files: files
    }
}
async function GetFullDataFromGallery(gallery) {
    let tags = await DataQuery(`SELECT * FROM tags WHERE oid in (${gallery.tag_ids})`);
    let files = await FilesQuery(`SELECT * FROM files WHERE oid in (${gallery.file_ids})`);
    return {
        info: gallery,
        tags: tags,
        files: files
    }
}
async function GetImage(file) {
    let res = await fetch('http://choim.in:3001/image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(file)
    }).then(response => response.blob());
    console.log(res);
    return URL.createObjectURL(res);
}