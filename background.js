async function checkCached(apiKey, listaHashes) {
    const params = new URLSearchParams()
    params.set('hash', listaHashes);
    params.set('format', 'list')
    params.set('list_files', 'true')
    try{
    const response = await fetch(`https://api.torbox.app/v1/api/torrents/checkcached?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })
    // 403 status code means the api key is invalid
    if (response.status == 403) {
        return {hasError: true, isWrongApi: true}
    }
    const responseJson = await response.json();
    if (responseJson.success) {
        return {hasError: false, response: responseJson, isWrongApi: false};
    } else {
        return {hasError: true, response: responseJson.detail, isWrongApi: false}
    }
} catch(error) {
    console.log(error.cause.message);
    return {hasError: true, response: error.message, isWrongApi: false}
}
}

async function createTorrent(apiKey, magnetLink) {
    const form = new FormData();
    form.append('magnet', magnetLink);
    form.append('add_only_if_cached', 'true');
    try {
        const response = await fetch('https://api.torbox.app/v1/api/torrents/createtorrent', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            body: form
        })
        const responseJson = await response.json();
        if (responseJson.success) {
            return {hasError: false, response: responseJson};
        } else {
            return {hasError: true, response: responseJson.detail};
        }
    } catch (error) {
        return {hasError:true, response: error.message};
    }
}

async function requestDl(apiKey, torrentId, fileId) {
    const params = new URLSearchParams();
    params.append('token', apiKey);
    params.append('torrent_id', torrentId);
    params.append('file_id', fileId);
    try {
    const response = await fetch(`https://api.torbox.app/v1/api/torrents/requestdl?${params}`, {
        method: 'GET'
    })
    const responseJson = await response.json();
    if (responseJson.success) {
        return {hasError: false, response: responseJson};
    } else {
        return {hasError: true, response: responseJson.detail};
    }
} catch(error) {
    console.error(error.cause.message);
    return {hasError: true, response:error.message}

}
}
// baa65d7c-3020-4e5e-b8c5-637e6f2fb211 100911468 0
// const res = await requestDl('baa65d7c-3020-4e5e-b8c5-637e6f2fb211', '100911468', '0' );
// console.log(res);

async function openVideo(downloadLink) {
    const myWindow = await browser.windows.create({
        url: browser.runtime.getURL(`video.html?downloadLink=${encodeURIComponent(downloadLink)}`),
        type: 'popup',
    })
}

browser.runtime.onMessage.addListener(async (message) => {
    if (message.acao === 'checkCached') {
        if (message.hashes) {
            return await checkCached(message.apiKey, message.hashes);
        }
        else {
            return;
        }
    }
    if (message.acao === 'createTorrent') {
        return await createTorrent(message.apiKey, message.magnetLink);
    }
    if (message.acao === 'requestDl') {
        return await requestDl(message.apiKey, message.torrentId, message.fileId);
    }
    if (message.acao === 'openVideo') {
        return await openVideo(message.downloadLink)
    }
})

