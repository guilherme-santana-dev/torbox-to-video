async function execute() {
    const apiKeyObj = await chrome.storage.local.get({ apiKey: '' });
    let apiKey = apiKeyObj.apiKey;
    console.log('apiKey =', apiKeyObj.apiKey);
    // if (apiKeyObj.apiKey) {
    //     let apiKey = apiKeyObj.apiKey
    //     console.log('apiKey = ', apiKeyObj.apiKey);
    // } 
    // console.log('apiKey = ', apiKey);
    ///
    const elements = document.querySelectorAll('*');
    const hashToElement = {};
    for (const element of elements) {
        for (const attribute of element.attributes) {
            const hash = attribute.value.match(/(?<=magnet:\?xt=urn:btih:)[^&]*/)?.[0].toLowerCase();
            if (hash) {
            element.magnetLink = attribute.value;
                hashToElement[hash] = element;
                //
                if (!apiKey) {
                    const button = document.createElement('button');
                    button.textContent = '⚠';
                    button.addEventListener('click', () => {
                        const input = prompt('Please insert your Torbox api key(you can find it at Settings> API Key in order to use the extension');
                        apiKey = input.trim();
                        // console.log('new api key ', apiKey)
                        chrome.storage.local.set({ apiKey });
                        window.location.reload();
                    })
                    element.insertAdjacentElement('afterend', button);
                }
                //
            }
        }
    }
    if (!apiKey || hashToElement.length === 0) return;

        const responseCheckCached = await chrome.runtime.sendMessage({
            acao: 'checkCached',
            // extract the hashes and sendMessaged it as a single string,as required by checkcached endpoint
            hashes: Object.keys(hashToElement).join(','),
            apiKey
        });
        //
        if (responseCheckCached.isWrongApi) {
            alert('You api key is wrong or expired,please reload the page and insert a valid api key');
            await chrome.storage.local.remove('apiKey');
            return;
        };
        //
        //
        if (responseCheckCached.hasError) {
            alert(responseCheckCached.response);
            return
        }
        //
        // console.log('checkCached = ', responseCheckCachedJson);
        let cachedElements = [];
        // console.log(cachedElements);
        for (const torrent of responseCheckCached.response.data ?? []) {
            let biggestFile = torrent.files[0];
            for (const file of torrent.files) {
                if (file.size > biggestFile.size) {
                    biggestFile = file;
                }
}
                hashToElement[torrent.hash].biggestFileId = biggestFile.id;
                cachedElements.push(hashToElement[torrent.hash]);
        }
        for (const element of cachedElements) {
            const button = document.createElement('button');
            button.textContent = '🎬';
            button.addEventListener('click', async () => {
            // const responseJson = chrome.runtime.sendMessage({
            //     acao: 'createTorrent',
            //     apiKey,
            //     magnetLink: element.magnetLink
            // })
            const responseCreate = await chrome.runtime.sendMessage({
                acao: 'createTorrent',
                apiKey,
                magnetLink: element.magnetLink
            })
            // console.log('responseCreate = ', responseCreate.response.data.torrent_id);
            if (responseCreate.hasError) {
                alert(responseCreate.response);
                return;
            }
            const responseRequestDlJson = await chrome.runtime.sendMessage({
                acao: 'requestDl',
                apiKey,
                torrentId: responseCreate.response.data.torrent_id,
                fileId: element.biggestFileId
            })
            const downloadLink = responseRequestDlJson.response.data;

        const responseOpenVideo = await chrome.runtime.sendMessage({
            acao: 'openVideo',
            downloadLink
        })
            })
        element.insertAdjacentElement('afterend', button);
        };
}
execute();

